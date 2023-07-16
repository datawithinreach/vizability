from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from dotenv import load_dotenv
import os

from langchain.llms import OpenAI
from langchain.agents import create_csv_agent
from langchain.agents.agent_types import AgentType
from langchain.llms.openai import OpenAI

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

    # Convert to Str
    if type(vega_lite_spec_content) is str:
        # Process vega_lite_spec_content_data to remove line breaks
        vega_lite_spec_content = vega_lite_spec_content.replace("\r\n", "\n")

    elif type(vega_lite_spec_content) is dict:
        vega_lite_spec_content = json.dumps(vega_lite_spec_content, indent=4) 

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
    data = json.loads(json_content)

    # Required Conversion if JSON file is derived from a URL
    data = data['content']

    # Extract header
    header = list(data[0].keys())

    # Create a CSV string
    csv_string = ','.join(header) + '\n'

    # Extract values and append to the CSV string
    for item in data:
        values = [str(item[key]) if item.get(key) is not None and item.get(key) != "" else "None" for key in header]
        csv_string += ','.join(values) + '\n'
    
    directory = 'data/'
    if not os.path.exists(directory):
        os.makedirs(directory)

    clear_data_dir(directory)
    
    file_path = "data/file.csv"

    # Step 3: Save the CSV content as a file in the specified file path
    with open(file_path, "w") as csv_file:
        csv_file.write(csv_string)

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
    file_name = 'file.csv'
    file_path = os.path.join(directory, file_name)

    # Step 2: Call the create_csv_agent function and obtain the CSV data
    agent = create_csv_agent(OpenAI(temperature=0), file_path, verbose=True, agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION)
    response = agent.run(question)

    # Step 3: Return the CSV data as a response
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


# Mount the "public" directory as a static file directory
# This is needed to serve the frontend
# The order of the routes matters, so this should be the last route
# Otherwise, it will conflict with the api routes above
# See FastAPI documentation for more info: https://fastapi.tiangolo.com/tutorial/path-params/#order-matters
# See StackOverflow for more info: https://stackoverflow.com/questions/73110208/how-to-load-a-different-file-than-index-html-in-fastapi-root-path
app.mount("/", StaticFiles(directory="public", html=True), name="public")
