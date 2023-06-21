from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from dotenv import load_dotenv
import os
from pathlib import Path

from langchain.llms import OpenAI
from langchain.agents import create_csv_agent
from langchain.agents.agent_types import AgentType
from langchain.agents import create_json_agent, AgentExecutor
from langchain.agents.agent_toolkits import JsonToolkit
from langchain.chains import LLMChain
from langchain.llms.openai import OpenAI
from langchain.requests import TextRequestsWrapper
from langchain.tools.json.tool import JsonSpec

import json

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

@app.post("/api/process-vega-lite-spec")
async def process_vega_lite_spec(request: Request):
    # Step 1: Read the vega lite spec from the request body
    vega_lite_spec_content = await request.body()

    data = json.loads(vega_lite_spec_content.decode('utf-8'))

    # Retrieve the Vega Lite Spec content
    vega_lite_spec_content = data["vgSpec"]

    # Process vega_lite_spec_content_data to remove line breaks
    vega_lite_spec_content = vega_lite_spec_content.replace("\r\n", "\n")   

    # Step 2: Specify the file path and name to save the VG file
    directory = 'spec/'
    if not os.path.exists(directory):
        os.makedirs(directory)

    file_path = "spec/vega-lite-spec.vg"

    # Step 3: Save the VG content as a file in the specified file path
    with open(file_path, "w") as vg_file:
        vg_file.write(vega_lite_spec_content)
    
    return {"message": "VG spec saved successfully!"}

@app.post("/api/process-json")
async def process_json(request: Request):
    # Step 1: Read the JSON content from the request body
    json_content = await request.body()

    # Parse the JSON string
    data = json.loads(json_content.decode('utf-8'))

    if type(data) is dict :
        json_content = data['content']
    else:
        # Using string concatenation
        string_concatenation_json_content = '[' + ', '.join(str(item) for item in data) + ']'
        json_content = string_concatenation_json_content.replace("'", "\"")

    # Load the string as JSON
    data = json.loads(json_content)

    # Convert list to a dict
    dict_data = {"values": data}

    # Dump the JSON data with indentation and newlines
    json_content = json.dumps(dict_data, indent=4)

    # Step 2: Specify the file path and name to save the CSV file
    directory = 'data/'
    if not os.path.exists(directory):
        os.makedirs(directory)

    clear_data_dir(directory)
    
    file_path = "data/file.json"

    # Step 3: Save the CSV content as a file in the specified file path
    with open(file_path, "w") as json_file:
        json_file.write(json_content)

    return {"message": "JSON file saved successfully!"}

@app.post("/api/process-csv")
async def process_csv(request: Request):
    # Step 1: Read the CSV content from the request body
    csv_content = await request.body()

    # Parse the JSON string
    data = json.loads(csv_content.decode('utf-8'))

    # Retrieve the CSV content
    csv_content = data['content']

    # Process csv_content to remove line breaks
    csv_content = csv_content.replace("\r\n", "\n")

    # Step 2: Specify the file path and name to save the CSV file
    directory = 'data/'
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    clear_data_dir(directory)

    file_path = "data/file.csv"

    # Step 3: Save the CSV content as a file in the specified file path
    with open(file_path, "w") as csv_file:
        csv_file.write(csv_content)

    return {"message": "CSV file saved successfully!"}

@app.get("/api/get-backend-file")
async def get_backend_file(file_path: str):
    with open(file_path, "r") as file_object:
        contents = file_object.read()
    return {"contents": contents}

@app.get("/api/apply-agent")
async def apply_agent(question: str):
    # Step 1: Get the absolute path of the file
    directory = 'data'
    if os.path.isfile("data/file.csv"):
        file_name = 'file.csv'
    elif os.path.isfile("data/file.json"):
        file_name = 'file.json'
    file_path = os.path.join(directory, file_name)

    # Step 2: Call the create_csv_agent function and obtain the CSV data
    if file_name == 'file.csv':
        agent = create_csv_agent(OpenAI(temperature=0), file_path, verbose=True, agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
        response = agent.run(question)

        # Step 3: Return the CSV data as a response
        return {"response": response}
    
    elif file_name == 'file.json':
        data = json.loads(Path(file_path).read_text())
        json_spec = JsonSpec(dict_=data, max_value_length=4000)
        json_toolkit = JsonToolkit(spec=json_spec)

        json_agent_executor = create_json_agent(
            llm=OpenAI(temperature=0), toolkit=json_toolkit, verbose=True
        )

        response = json_agent_executor.run(question)

        return {"response": response}

# Create a route to the api root endpoint
@app.get("/api")
async def root():
    return {"message": "Multimodal Accessible Visulization Backend API"} 
    

# Create a route to the /api/prompt endpoint with a query param called prompt
@app.get("/api/prompt")
async def prompt(question: str):
    response = llm(question)
    print("hey")
    return {"prompt": question, "response": response}


# Mount the "public" directory as a static file directory
# This is needed to serve the frontend
# The order of the routes matters, so this should be the last route
# Otherwise, it will conflict with the api routes above
# See FastAPI documentation for more info: https://fastapi.tiangolo.com/tutorial/path-params/#order-matters
# See StackOverflow for more info: https://stackoverflow.com/questions/73110208/how-to-load-a-different-file-than-index-html-in-fastapi-root-path
app.mount("/", StaticFiles(directory="public", html=True), name="public")
