# Standard Library Imports
import os
import json
import csv

# Third-Party Imports
from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import JSONResponse

from dotenv import load_dotenv

import pandas as pd
import openai
import torch
from sentence_transformers import SentenceTransformer, util

# Langchain Imports
from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI
from langchain.agents import create_csv_agent
from langchain.agents.agent_types import AgentType
from langchain.llms.openai import OpenAI


# Load pre-trained SentenceTransformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

def clear_data_dir(folder_path):
    """Helper function to delete all files in a specified directory."""
    for file_name in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file_name)
        if os.path.isfile(file_path):
            os.remove(file_path)

# Load the OpenAI API key from the .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Create an instance of the OpenAI class
llm = OpenAI(model_name="text-davinci-003", temperature=0.9)

# Create the FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from any domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/process-eval-sets")
async def process_eval_sets(request: Request):
    """Endpoint to process evaluation sets and save CSV data to a file."""
    data = await request.json()
    csv_data = data.get("csvData", "").replace("\r\n", "\n")
    file_type = data.get("type", "")
    
    # Define and create the directory if it doesn't exist
    file_directory = "./test/validationAndTraining/"
    os.makedirs(file_directory, exist_ok=True)
    
    # Define the file path based on the provided type
    file_path = os.path.join(file_directory, f"{file_type}.csv")
    
    # Write the CSV data to the file
    with open(file_path, "w") as file:
        file.write(csv_data)
    
    return {"message": "CSV data has been successfully saved."}

@app.post("/api/process-vega-lite-spec")
async def process_vega_lite_spec(request: Request):
    """Endpoint to process and save Vega-Lite specification."""
    data = json.loads((await request.body()).decode('utf-8'))
    vega_lite_spec_content = data["vgSpec"]
    
    # Convert dict to JSON string if needed
    if isinstance(vega_lite_spec_content, dict):
        vega_lite_spec_content = json.dumps(vega_lite_spec_content, indent=4)
    else:
        vega_lite_spec_content = vega_lite_spec_content.replace("\r\n", "\n")
    
    # Specify the directory and file path
    directory = 'spec/'
    os.makedirs(directory, exist_ok=True)
    file_path = os.path.join(directory, "vega-lite-spec.vg")
    
    # Save the Vega-Lite specification to a file
    with open(file_path, "w") as vg_file:
        vg_file.write(vega_lite_spec_content)
    
    return {"message": "VG spec saved successfully!"}

@app.post("/api/process-json")
async def process_json(request: Request):
    """Endpoint to process JSON content and save as CSV file."""
    json_content = await request.body()
    data = json.loads(json_content)['content']

    # Extract header and create CSV string
    header = list(data[0].keys())
    csv_string = ','.join(header) + '\n'
    
    # Extract values and append to the CSV string
    for item in data:
        values = []
        for key in header:
            if not isinstance(item[key], dict):
                values.append(str(item[key]) if item.get(key) is not None and item.get(key) != "" else "None")
            else:
                values.append("Non-String")
        csv_string += ','.join(values) + '\n'
    
    # Save CSV content to file
    directory = 'data/'
    os.makedirs(directory, exist_ok=True)
    clear_data_dir(directory)
    file_path = "data/file.csv"
    
    with open(file_path, "w") as csv_file:
        csv_file.write(csv_string)

    return {"message": "CSV file saved successfully!"}

@app.get("/api/get-validation-few-shot-prompting")
async def get_validation_few_shot_prompting(user_query: str):
    """Endpoint to get validation few-shot prompting based on user query."""
    try:
        user_query_processed = [user_query]
        prompt_file_path = "gptPrompts/queryClassification.txt"
        validation_set_sample_file_path = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAinuEfWlGu_1Qam46ZAPQ3oHM3t8aNOIXNWCfZu6sV18SqUh1-I4ehIJmBiBfzOFD9VWbSXL64uPT/pub?gid=289729987&single=true&output=csv"
        df = pd.read_csv(validation_set_sample_file_path)
        
        # Define validation set sample dictionary
        validation_set_sample_dict = {
            "Analytical Query": [],
            "Visual Query": [],
            "Contextual Query": [],
            "Navigation Query": []
        }
        substring_to_find = {
            "Analytical Query": "analysis involving data.",
            "Visual Query": "graph shape/characteristics.",
            "Contextual Query": "questions like: \"Why?\".",
            "Navigation Query": "What is my current position?"
        }

        # Read prompt file content
        with open(prompt_file_path, "r") as file_object:
            contents = file_object.read()

        # Categorize questions based on ground truth
        for index, row in df.iterrows():
            question = row['Questions']
            ground_truth = row['Classification_Ground_Truth']
            if ground_truth != "I am sorry but I cannot understand the question":
                validation_set_sample_dict[ground_truth].append(question)

        # Process and embed user query and validation set samples
        for ground_truth, questions in validation_set_sample_dict.items():
            validation_processed_string = ""
            validation_set_sample_processed = questions
            embeddings_user_query = model.encode(user_query_processed, convert_to_tensor=True)
            embeddings_validation_set_sample = model.encode(validation_set_sample_processed, convert_to_tensor=True)
            cosine_scores = util.cos_sim(embeddings_user_query, embeddings_validation_set_sample)

            # Get top scores and indices
            num_top_scores = min(4, len(questions))
            top_scores, top_indices = torch.topk(cosine_scores, k=num_top_scores, dim=1)
            for i in range(num_top_scores):
                index = top_indices[0][i].item()
                validation_processed_string += f"{ground_truth} // {questions[index]}\n"

            # Insert processed string into prompt content
            index = contents.find(substring_to_find[ground_truth])
            if index != -1:
                contents = contents[:index + len(substring_to_find[ground_truth])] + "\n" + validation_processed_string + contents[index + len(substring_to_find[ground_truth]):]
                print(contents)

        return {"contents": contents}
    except Exception as e:
        return {"contents": str(e)}

@app.get("/api/get-backend-file")
async def get_backend_file(file_path: str):
    """Endpoint to read and return the contents of a specified file."""
    with open(file_path, "r") as file_object:
        contents = file_object.read()
    return {"contents": contents}

@app.get("/api/apply-agent")
async def apply_agent(question: str):
    """Endpoint to apply an agent to a CSV file and return the response."""
    directory = 'data'
    file_name = 'file.csv'
    file_path = os.path.join(directory, file_name)

    # Create an agent to process the CSV file
    agent = create_csv_agent(
        ChatOpenAI(temperature=0, model_name="gpt-3.5-turbo-1106"),
        file_path,
        verbose=True,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        handle_parsing_errors="Check your output and make sure it conforms!"
    )

    try:
        response = agent.run(question)
    except openai.InvalidRequestError as e:
        response = "Agent stopped due to iteration limit or time limit."
        print(e)
    except Exception as e:
        response = str(e)
        if response.startswith("Could not parse LLM output: `"):
            response = response.removeprefix("Could not parse LLM output: `").removesuffix("`")
            print(response)

    return {"response": response}

@app.get("/api")
async def root():
    """Root endpoint returning a welcome message."""
    return {"message": "Multimodal Accessible Visualization Backend API"}

@app.get("/api/prompt")
async def prompt_gpt4(question: str, gpt_model: str):
    """Endpoint to send a prompt to a specified GPT model and return the response."""
    response = openai.ChatCompletion.create(
        model=gpt_model, messages=[{"role": "user", "content": question}]
    )
    print(response)
    return {"prompt": question, "response": response["choices"][0]["message"]["content"]}

@app.get("/api/check_folder")
def check_folder(folder_path: str):
    """Endpoint to check if a specified folder contains any files."""
    def check_folder_has_files(folder_path):
        if not os.path.exists(folder_path):
            return False
        return len(os.listdir(folder_path)) > 0
    
    result = check_folder_has_files(folder_path)
    return {"has_files": result}

# Whisper API functionality: Upload audio, transcribe it, and return output to frontend

@app.post("/api/upload-audio")
async def upload_audio(audioFile: UploadFile = File(...)):
    """Endpoint to upload an audio file and transcribe it using Whisper API."""
    async def transcribe_audio(filename):
        """Helper function to transcribe audio using Whisper API."""
        audio_file = open(filename, "rb")
        response = openai.Audio.transcribe("whisper-1", audio_file, language="en")
        return response

    # Save the audio file to a temporary location
    directory = "./audio"
    os.makedirs(directory, exist_ok=True)
    file_location = f"./audio/{audioFile.filename}"
    
    with open(file_location, "wb") as f:
        f.write(await audioFile.read())

    # Perform transcription
    transcription = await transcribe_audio(file_location)

    return JSONResponse(content={"transcription": transcription})

@app.get("/sort_csv")
async def sort_csv(field: str, order: str):
    """Endpoint to sort a CSV file by a specified field and order."""
    csv_file = "data/file.csv"

    with open(csv_file, mode='r') as file:
        csv_reader = csv.DictReader(file)
        
        def is_numeric(value):
            """Check if a value is numeric."""
            try:
                float(value)
                return True
            except ValueError:
                return False

        sorted_rows = sorted(csv_reader, key=lambda x: (float(x[field]) if is_numeric(x[field]) else x[field]), reverse=(order == 'desc'))

    with open(csv_file, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=csv_reader.fieldnames)
        writer.writeheader()
        writer.writerows(sorted_rows)

    return {"message": f"CSV sorted by {field} in {order} order"}

# Mount the "public" directory as a static file directory to serve the frontend
# Order of routes matters to avoid conflicts with API routes
app.mount("/", StaticFiles(directory="public", html=True), name="public")

