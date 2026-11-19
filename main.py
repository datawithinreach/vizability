"""VizAbility backend API.

Runs as a single Vercel Function (FastAPI) in production, or locally with
`uvicorn main:app --reload`. The API is stateless: every request carries the
data it needs, so it works on serverless hosts where the disk is not shared
between requests.
"""

# Standard Library Imports
import csv
import gzip
import io
import math
import os
import time
from pathlib import Path

# Third-Party Imports
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import APITimeoutError, AsyncOpenAI, BadRequestError, OpenAIError
from pydantic import BaseModel

load_dotenv()

ROOT = Path(__file__).resolve().parent
ON_VERCEL = bool(os.getenv("VERCEL"))

# --------------------------------------------------------------------------
# Models (override any of these with environment variables, no code change)
# --------------------------------------------------------------------------
MODEL_FAST = os.getenv("OPENAI_MODEL_FAST", "gpt-6-luna")
MODEL_SMART = os.getenv("OPENAI_MODEL_SMART", "gpt-6.2-sol")
MODEL_AGENT = os.getenv("OPENAI_MODEL_AGENT", MODEL_SMART)
MODEL_EMBEDDING = os.getenv("OPENAI_MODEL_EMBEDDING", "text-embedding-3-small")
MODEL_TRANSCRIBE = os.getenv("OPENAI_MODEL_TRANSCRIBE", "gpt-transcribe")
# Lower reasoning effort makes answers much faster; these tasks don't need deep reasoning.
# Set to an empty string to use each model's default.
REASONING_EFFORT = os.getenv("OPENAI_REASONING_EFFORT", "low")

# The frontend asks for a tier, not a model name, so models can be swapped
# here without touching the client. Legacy names are mapped for old clients.
MODEL_TIERS = {"fast": MODEL_FAST, "smart": MODEL_SMART}
LEGACY_MODEL_PREFIXES = (("gpt-3.5", "fast"), ("gpt-4", "smart"))

# --------------------------------------------------------------------------
# Limits
# --------------------------------------------------------------------------
MAX_PROMPT_CHARS = 100_000
MAX_DATA_BYTES = 50 * 1024 * 1024       # decompressed CSV sent to the agent
MAX_AUDIO_BYTES = 25 * 1024 * 1024      # OpenAI transcription limit
AGENT_TIMEOUT_SECONDS = 100             # keep below maxDuration in vercel.json
AGENT_STOPPED_MESSAGE = "Agent stopped due to iteration limit or time limit."

# Files the frontend may read through /api/get-backend-file
READABLE_DIRS = (ROOT / "gptPrompts", ROOT / "test" / "testVegaLiteSpecs")

# Few-shot examples for query classification
VALIDATION_SHEET_URL = os.getenv(
    "VALIDATION_SHEET_URL",
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAinuEfWlGu_1Qam46ZAPQ3oHM3t8aNOIXNWCfZu6sV18SqUh1-I4ehIJmBiBfzOFD9VWbSXL64uPT/pub?gid=289729987&single=true&output=csv",
)
VALIDATION_FALLBACK_CSV = ROOT / "test" / "validationAndTraining" / "validationSet.csv"
EXAMPLES_TTL_SECONDS = 6 * 60 * 60
EXAMPLES_PER_CATEGORY = 4
# Each category's examples are inserted right after this text in the prompt.
CATEGORY_ANCHORS = {
    "Analytical Query": "analysis involving data.",
    "Visual Query": "graph shape/characteristics.",
    "Contextual Query": "questions like: \"Why?\".",
    "Navigation Query": "What is my current position?",
}

AGENT_INSTRUCTIONS = """You answer questions about the dataset behind a chart, for a blind or low-vision user
whose screen reader will read your answer aloud.
The dataset is a CSV file that has been uploaded to /mnt/data/. Load it with pandas and use Python
to look up values or compute the answer; do not guess numbers. Missing values appear as the text "None".
Keep the answer to two or three sentences. Never list more than five values: when a question covers
many values, summarize them (range, overall trend, highest and lowest) and say the user can ask about
specific ones. Write plain text only, with no Markdown, bullet points, bold text, or headings.
Do not mention code, Python, pandas, files, or dataframes in your answer."""

# --------------------------------------------------------------------------
# App
# --------------------------------------------------------------------------
app = FastAPI(title="VizAbility API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=os.getenv(
        "CORS_ORIGIN_REGEX",
        r"https://(dwr\.bc\.edu|datawithinreach\.github\.io|vizability[a-z0-9-]*\.vercel\.app)"
        r"|http://(localhost|127\.0\.0\.1)(:\d+)?",
    ),
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

_client: AsyncOpenAI | None = None


def openai_client() -> AsyncOpenAI:
    """Create the OpenAI client on first use so the app can start without a key."""
    global _client
    if _client is None:
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(500, "OPENAI_API_KEY is not configured on the server.")
        _client = AsyncOpenAI()
    return _client


_reasoning_unsupported: set[str] = set()


async def create_response(**kwargs):
    """Call the Responses API with the configured reasoning effort.

    If a model does not accept the reasoning setting, retry without it and remember
    that for later requests, so a model swap via env vars can't break the site.
    """
    model = kwargs["model"]
    if REASONING_EFFORT and model not in _reasoning_unsupported:
        try:
            return await openai_client().responses.create(reasoning={"effort": REASONING_EFFORT}, **kwargs)
        except BadRequestError as e:
            if "reasoning" not in str(e).lower():
                raise
            print(f"{model} rejected reasoning effort '{REASONING_EFFORT}'; retrying without it")
            _reasoning_unsupported.add(model)
    return await openai_client().responses.create(**kwargs)


def resolve_model(name: str) -> str:
    if name in MODEL_TIERS:
        return MODEL_TIERS[name]
    for prefix, tier in LEGACY_MODEL_PREFIXES:
        if name.startswith(prefix):
            return MODEL_TIERS[tier]
    raise HTTPException(400, f"Unknown model tier '{name}'. Use one of: {', '.join(MODEL_TIERS)}.")


@app.get("/api")
async def root():
    """Health check."""
    return {"message": "Multimodal Accessible Visualization Backend API"}


# --------------------------------------------------------------------------
# Prompt files and test chart specs
# --------------------------------------------------------------------------
@app.get("/api/get-backend-file")
async def get_backend_file(file_path: str):
    """Return a prompt template or test chart spec. Only files in READABLE_DIRS are served."""
    path = (ROOT / file_path).resolve()
    if not path.is_file() or not any(path.is_relative_to(d) for d in READABLE_DIRS):
        raise HTTPException(404, "File not found.")
    return {"contents": path.read_text(encoding="utf-8")}


# --------------------------------------------------------------------------
# Plain LLM prompt
# --------------------------------------------------------------------------
class PromptRequest(BaseModel):
    question: str
    model: str = "fast"


@app.post("/api/prompt")
async def prompt(req: PromptRequest):
    """Send a prompt to the model for the requested tier and return its text reply."""
    if len(req.question) > MAX_PROMPT_CHARS:
        raise HTTPException(413, "Prompt is too long.")
    model = resolve_model(req.model)
    try:
        response = await create_response(model=model, input=req.question)
    except OpenAIError as e:
        raise HTTPException(502, f"OpenAI request failed: {e}") from e
    return {"prompt": req.question, "response": response.output_text}


# --------------------------------------------------------------------------
# Query classification: few-shot examples picked by embedding similarity
# --------------------------------------------------------------------------
_examples_cache: dict = {"loaded_at": 0.0, "examples": [], "embeddings": []}


def _parse_examples(text: str, question_col: str, label_col: str) -> list[tuple[str, str]]:
    examples = []
    for row in csv.DictReader(io.StringIO(text)):
        label = (row.get(label_col) or "").strip()
        question = (row.get(question_col) or "").strip()
        if label in CATEGORY_ANCHORS and question:
            examples.append((label, question))
    return examples


async def _fetch_examples() -> list[tuple[str, str]]:
    """Labelled questions from the shared Google Sheet, or the copy in the repo if that fails."""
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as http:
            r = await http.get(VALIDATION_SHEET_URL)
            r.raise_for_status()
        examples = _parse_examples(r.text, "Questions", "Classification_Ground_Truth")
        if examples:
            return examples
    except httpx.HTTPError as e:
        print(f"Could not fetch validation sheet, using local copy: {e}")
    return _parse_examples(VALIDATION_FALLBACK_CSV.read_text(encoding="utf-8"), "Questions", "Ground_Truth")


async def _embed(texts: list[str]) -> list[list[float]]:
    result = await openai_client().embeddings.create(model=MODEL_EMBEDDING, input=texts)
    return [item.embedding for item in result.data]


async def _load_examples() -> tuple[list[tuple[str, str]], list[list[float]]]:
    """Examples and their embeddings, cached in memory between requests on a warm instance."""
    cache = _examples_cache
    if cache["examples"] and time.time() - cache["loaded_at"] < EXAMPLES_TTL_SECONDS:
        return cache["examples"], cache["embeddings"]
    try:
        examples = await _fetch_examples()
        embeddings = await _embed([q for _, q in examples])
    except OpenAIError:
        if cache["examples"]:  # keep serving stale examples rather than failing
            return cache["examples"], cache["embeddings"]
        raise
    cache.update(loaded_at=time.time(), examples=examples, embeddings=embeddings)
    return examples, embeddings


def _cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm = math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b))
    return dot / norm if norm else 0.0


@app.get("/api/get-validation-few-shot-prompting")
async def get_validation_few_shot_prompting(user_query: str):
    """Return the classification prompt with the most similar labelled examples inserted."""
    contents = (ROOT / "gptPrompts" / "queryClassification.txt").read_text(encoding="utf-8")
    try:
        examples, embeddings = await _load_examples()
        [query_embedding] = await _embed([user_query])
    except OpenAIError as e:
        print(f"Few-shot selection failed, using the prompt without examples: {e}")
        return {"contents": contents}

    scored = sorted(
        ((_cosine(query_embedding, emb), label, question) for (label, question), emb in zip(examples, embeddings)),
        reverse=True,
    )
    for label, anchor in CATEGORY_ANCHORS.items():
        top = [q for _, lbl, q in scored if lbl == label][:EXAMPLES_PER_CATEGORY]
        block = "".join(f"{label} // {q}\n" for q in top)
        index = contents.find(anchor)
        if index != -1 and block:
            cut = index + len(anchor)
            contents = contents[:cut] + "\n" + block + contents[cut:]
    return {"contents": contents}


# --------------------------------------------------------------------------
# Data questions: the model runs Python on the chart's data in OpenAI's sandbox
# --------------------------------------------------------------------------
@app.post("/api/apply-agent")
async def apply_agent(question: str = Form(...), data: UploadFile = File(...)):
    """Answer a question about the chart data (CSV, optionally gzip-compressed)."""
    raw = await data.read()
    if raw[:2] == b"\x1f\x8b":
        with gzip.GzipFile(fileobj=io.BytesIO(raw)) as f:
            raw = f.read(MAX_DATA_BYTES + 1)
    if len(raw) > MAX_DATA_BYTES:
        raise HTTPException(413, "Chart data is too large.")
    if len(question) > MAX_PROMPT_CHARS:
        raise HTTPException(413, "Question is too long.")

    client = openai_client()
    uploaded = None
    try:
        uploaded = await client.files.create(
            file=("chart_data.csv", raw, "text/csv"),
            purpose="user_data",
            expires_after={"anchor": "created_at", "seconds": 3600},  # cleanup backstop
        )
        response = await create_response(
            model=MODEL_AGENT,
            instructions=AGENT_INSTRUCTIONS,
            input=question,
            tools=[{"type": "code_interpreter", "container": {"type": "auto", "file_ids": [uploaded.id]}}],
            max_tool_calls=12,
            timeout=AGENT_TIMEOUT_SECONDS,
        )
        answer = response.output_text.strip() or AGENT_STOPPED_MESSAGE
    except APITimeoutError:
        answer = AGENT_STOPPED_MESSAGE
    except OpenAIError as e:
        print(f"Agent failed: {e}")
        answer = AGENT_STOPPED_MESSAGE
    finally:
        if uploaded is not None:
            try:
                await client.files.delete(uploaded.id)
            except OpenAIError:
                pass  # expires on its own after an hour
    return {"response": answer}


# --------------------------------------------------------------------------
# Speech to text
# --------------------------------------------------------------------------
@app.post("/api/upload-audio")
async def upload_audio(audioFile: UploadFile = File(...)):
    """Transcribe a recorded question. Nothing is written to disk."""
    audio = await audioFile.read()
    if len(audio) > MAX_AUDIO_BYTES:
        raise HTTPException(413, "Recording is too long.")
    try:
        result = await openai_client().audio.transcriptions.create(
            model=MODEL_TRANSCRIBE,
            file=(audioFile.filename or "recording.webm", audio, audioFile.content_type or "audio/webm"),
            language="en",
        )
    except OpenAIError as e:
        raise HTTPException(502, f"Transcription failed: {e}") from e
    return {"transcription": {"text": result.text}}


# --------------------------------------------------------------------------
# Evaluation tooling (docs/eval). Writes into the repo, so local use only.
# --------------------------------------------------------------------------
EVAL_SET_NAMES = {"testingSet", "testingSetSample", "validationSet", "validationSetSample"}


class EvalSetRequest(BaseModel):
    csvData: str
    type: str


@app.post("/api/process-eval-sets")
async def process_eval_sets(req: EvalSetRequest):
    """Save an evaluation CSV into test/validationAndTraining/ (local development only)."""
    if ON_VERCEL:
        raise HTTPException(404, "Not available on the hosted API.")
    if req.type not in EVAL_SET_NAMES:
        raise HTTPException(400, "Unknown evaluation set.")
    path = ROOT / "test" / "validationAndTraining" / f"{req.type}.csv"
    path.write_text(req.csvData.replace("\r\n", "\n"), encoding="utf-8")
    return {"message": "CSV data has been successfully saved."}


# Serve the frontend from docs/ (local development and Vercel previews).
# Mounted last so the API routes above take precedence.
app.mount("/", StaticFiles(directory=ROOT / "docs", html=True), name="docs")
