# Multimodal Accvis

## Development
* Create `.env` and add `OPENAI_API_KEY=[api key]`
* Create a virtual environment to manage dependencies
  ```
  python -m venv venv
  source venv/bin/activate 
  ```
  For Windows use `venv\Scripts\activate`
* Run the following commands on the terminal
  ```
  pip install -r requirements.txt
  uvicorn main:app --reload
  ```
* Open http://127.0.0.1:8000/demo.html
* Client is in the `docs` folder; `docs/config.js` sets which backend it calls
* Backend API routes are in `main.py`

## Deployment

The live website is available: https://dwr.bc.edu/vizability

* **Frontend:** GitHub Pages serves the `docs` folder of `main` at https://dwr.bc.edu/vizability.
* **Backend:** Vercel (team *Data Within Reach*, project `vizability`) runs `main.py` as a FastAPI function and redeploys on every push to `main`. Pushes to other branches get preview deployments.

The backend keeps no state: the browser sends the chart's data with each question, and the model analyzes it with OpenAI's code interpreter.

### Configuration (Vercel project environment variables)

| Variable | Default | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | (required) | OpenAI API key |
| `OPENAI_MODEL_FAST` | `gpt-6-luna` | Classification, suggestions, navigation, contextual answers |
| `OPENAI_MODEL_SMART` | `gpt-6.2-sol` | Rewriting the user's question |
| `OPENAI_MODEL_AGENT` | same as smart | Answering data questions with code interpreter |
| `OPENAI_MODEL_EMBEDDING` | `text-embedding-3-small` | Picking few-shot examples for classification |
| `OPENAI_MODEL_TRANSCRIBE` | `gpt-transcribe` | Voice questions |
| `OPENAI_REASONING_EFFORT` | `low` | Lower is faster; set empty to use each model's default |

Models can be changed by editing these variables and redeploying; no code change is needed.
