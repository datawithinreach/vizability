from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from dotenv import load_dotenv
import os

from langchain.llms import OpenAI
from langchain.agents import create_csv_agent
from langchain.agents.agent_types import AgentType
from langchain.llms.openai import OpenAI

import json
import csv
import pandas as pd

from starlette.responses import JSONResponse
from io import BytesIO
import soundfile as sf
import openai

import torch
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('all-MiniLM-L6-v2')

# Helper Function to Delete Data and VegaLite Spec from Previous Rendering
def clear_data_dir(folder_path):
    # Get a list of all files in the directory
    file_list = os.listdir(folder_path)

    # Iterate over the files and delete each one
    for file_name in file_list:
        file_path = os.path.join(folder_path, file_name)
        if os.path.isfile(file_path):
            os.remove(file_path)

#  Load the OpenAI API key from the .env file
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
openai.api_key = os.environ["OPENAI_API_KEY"]

#  Create an instance of the OpenAI class
llm = OpenAI(model_name="text-davinci-003", temperature=0.9)


# Create the FastAPI app
app = FastAPI()

#  Add CORS middleware to allow requests from any domain
#  This is needed to allow the frontend to make requests to the backend
#  See https://fastapi.tiangolo.com/tutorial/cors/ for more info
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/process-eval-sets")
async def process_eval_sets(request: Request):
    data = await request.json()
    csv_data = data.get("csvData", "")
    # Process csv_data to remove line breaks
    csv_data = csv_data.replace("\r\n", "\n")
    type = data.get("type", "")

    # Define the directory where you want to save the file
    file_directory = "./test/validationAndTraining/"

    # Ensure the directory exists
    if not os.path.exists(file_directory):
        os.makedirs(file_directory)

    # Define the file path based on the provided "type"
    file_path = os.path.join(file_directory, f"{type}.csv")

    # Write the csvData to the file
    with open(file_path, "w") as file:
        file.write(csv_data)

    return {"message": "CSV data has been successfully saved."}


@app.post("/api/process-vega-lite-spec")
async def process_vega_lite_spec(request: Request):
    # Read the vega lite spec from the request body
    vega_lite_spec_content = await request.body()

    data = json.loads(vega_lite_spec_content.decode('utf-8'))

    # Retrieve the Vega Lite Spec content
    vega_lite_spec_content = data["vgSpec"]

    # Convert to Str
    if type(vega_lite_spec_content) is str:
        # Process vega_lite_spec_content_data to remove line breaks
        vega_lite_spec_content = vega_lite_spec_content.replace("\r\n", "\n")

    elif type(vega_lite_spec_content) is dict:
        vega_lite_spec_content = json.dumps(vega_lite_spec_content, indent=4) 

    # Specify the file path and name to save the VG file
    directory = 'spec/'
    if not os.path.exists(directory):
        os.makedirs(directory)

    file_path = "spec/vega-lite-spec.vg"

    # Save the VG content as a file in the specified file path
    with open(file_path, "w") as vg_file:
        vg_file.write(vega_lite_spec_content)
    
    return {"message": "VG spec saved successfully!"}

@app.post("/api/process-json")
async def process_json(request: Request):
    # Read the JSON content from the request body
    json_content = await request.body()

    # Parse the JSON string
    data = json.loads(json_content)

    # Required Conversion if JSON file is derived from a URL
    data = data['content']

    # Extract header
    header = list(data[0].keys())

    # Create a CSV string
    csv_string = ','.join(header) + '\n'

    # Extract values and append to the CSV string
    # for item in data:
    #     values = [str(item[key]) if item.get(key) is not None and item.get(key) != "" else "None" for key in header]
    #     csv_string += ','.join(values) + '\n'

    for item in data:
        values = []
        for key in header:
            if not isinstance(item[key], dict):
                # If the value is a string, include it as is
                values.append(str(item[key]) if item.get(key) is not None and item.get(key) != "" else "None")
            else:
                # If the value is not a string, use the else statement
                values.append("Non-String")
        csv_string += ','.join(values) + '\n'
    
    directory = 'data/'
    if not os.path.exists(directory):
        os.makedirs(directory)

    clear_data_dir(directory)
    
    file_path = "data/file.csv"

    # Save the CSV content as a file in the specified file path
    with open(file_path, "w") as csv_file:
        csv_file.write(csv_string)

    return {"message": "CSV file saved successfully!"}

@app.get("/api/get-validation-few-shot-prompting")
async def get_validation_few_shot_prompting(user_query: str):
    user_query_processed = [user_query]
    prompt_file_path = "gptPrompts/queryClassification.txt"
    validation_set_sample_file_path = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAinuEfWlGu_1Qam46ZAPQ3oHM3t8aNOIXNWCfZu6sV18SqUh1-I4ehIJmBiBfzOFD9VWbSXL64uPT/pub?gid=289729987&single=true&output=csv"
    # validation_set_sample_file_path = "test/validationAndTraining/validationSetSample.csv"
    df = pd.read_csv(validation_set_sample_file_path)
    validation_set_sample_dict = {
        "Analytical Query": [],
        "Visual Query": [],
        "Contextual Query": [],
        "Navigation Query": []
    }
    substring_to_find = {
        "Analytical Query": "analysis involving data.",
        "Visual Query": "graph shape/characteristics.",
        "Contextual Query": "specific data to be answered.",
        "Navigation Query": "'How do I get from () to ().'"
    }

    with open(prompt_file_path, "r") as file_object:
        contents = file_object.read()

    # Iterate through the DataFrame rows and categorize questions
    for index, row in df.iterrows():
        question = row['Questions']
        ground_truth = row['Ground_Truth']
        if ground_truth != "I am sorry but I cannot understand the question":
            validation_set_sample_dict[ground_truth].append(question)

    # Print the resulting categorized questions
    for ground_truth, questions in validation_set_sample_dict.items():
        validation_processed_string = ""
        validation_set_sample_processed = []
        for question in questions:
            validation_set_sample_processed.append(question)
        embeddings_user_query = model.encode(user_query_processed, convert_to_tensor=True)
        embeddings_validation_set_sample = model.encode(validation_set_sample_processed, convert_to_tensor=True)
        cosine_scores = util.cos_sim(embeddings_user_query, embeddings_validation_set_sample)

        if (len(questions) >= 4):
            # Get the top 4 scores and their indices
            top_scores, top_indices = torch.topk(cosine_scores, k=4, dim=1)
            for i in range(4):
                index = top_indices[0][i].item()
                validation_processed_string += f"{ground_truth} // {questions[index]}\n"
        else: 
            top_scores, top_indices = torch.topk(cosine_scores, k=len(questions), dim=1)
            for i in range(len(questions)):
                index = top_indices[0][i].item()
                validation_processed_string += f"{ground_truth} // {questions[index]}\n"

        # Find the index where the substring occurs
        index = contents.find(substring_to_find[ground_truth])

        # Check if the substring is found, and if so, insert the new string after it
        if index != -1:
            contents = contents[:index + len(substring_to_find[ground_truth])] + "\n" + validation_processed_string + contents[index + len(substring_to_find[ground_truth]):]
            print(contents)
    return {"contents": contents}
    

@app.get("/api/get-backend-file")
async def get_backend_file(file_path: str):
    with open(file_path, "r") as file_object:
        contents = file_object.read()
    
    return {"contents": contents}

@app.get("/api/apply-agent")
async def apply_agent(question: str):
    # Get the absolute path of the file
    directory = 'data'
    file_name = 'file.csv'
    file_path = os.path.join(directory, file_name)

    # Call the create_csv_agent function and obtain the CSV data
    agent = create_csv_agent(OpenAI(temperature=0), file_path, verbose=True, agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
    # response = agent.run(question)
    try:
        response = agent.run(question)
    except ValueError as e:
        response = str(e)
        if not response.startswith("Could not parse LLM output: `"):
            raise e 
        response = response.removeprefix("Could not parse LLM output: `").removesuffix("`")
    except openai.InvalidRequestError as e:
        response = "Agent stopped due to iteration limit or time limit."
        print(e)

    # Return the CSV data as a response
    return {"response": response}

# Create a route to the api root endpoint
@app.get("/api")
async def root():
    return {"message": "Multimodal Accessible Visulization Backend API"} 
    

# Create a route to the /api/prompt endpoint with a query param called prompt
@app.get("/api/prompt")
async def prompt(question: str):
    response = llm(question)
    return {"prompt": question, "response": response}


@app.get("/api/check_folder")
def check_folder(folder_path: str):
    def check_folder_has_files(folder_path):
        if not os.path.exists(folder_path):
            return False

        files = os.listdir(folder_path)
        return len(files) > 0
    
    result = check_folder_has_files(folder_path)
    return {"has_files": result}


# Whisper API functionality
# Upload audio and transcribe it
# Return output to frontend

from fastapi import UploadFile, File
from starlette.responses import JSONResponse

@app.post("/api/upload-audio")
async def upload_audio(audioFile: UploadFile = File(...)):
    async def transcribe_audio(filename):
        # with open(filename, "rb") as f:
        #     audio_data = f.read()
        audio_file= open(filename, "rb")


        # response = openai.WhisperApi(api_key=os.environ["OPENAI_API_KEY"]).create_transcription(BytesIO(audio_data), "whisper-1")
        response = openai.Audio.transcribe("whisper-1", audio_file, language="en")
        return response

    # Save the audio file to a temporary location on the server
    directory = "./audio"

    if not os.path.exists(directory):
        os.makedirs(directory)
    file_location = f"./audio/{audioFile.filename}"
    with open(file_location, "wb") as f:
        f.write(await audioFile.read())

    # Perform transcription using the Whisper API (similar to the previous Python code)
    transcription = await transcribe_audio(file_location)

    # Optionally, you can remove the temporary file after processing
    # os.remove(file_location)

    return JSONResponse(content={"transcription": transcription})

@app.get("/sort_csv")
async def sort_csv(field: str, order: str):
    csv_file = "data/file.csv"

    with open(csv_file, mode='r') as file:
        csv_reader = csv.DictReader(file)
        def is_numeric(value):
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


# Mount the "public" directory as a static file directory
# This is needed to serve the frontend
# The order of the routes matters, so this should be the last route
# Otherwise, it will conflict with the api routes above
# See FastAPI documentation for more info: https://fastapi.tiangolo.com/tutorial/path-params/#order-matters
# See StackOverflow for more info: https://stackoverflow.com/questions/73110208/how-to-load-a-different-file-than-index-html-in-fastapi-root-path
app.mount("/", StaticFiles(directory="public", html=True), name="public")
