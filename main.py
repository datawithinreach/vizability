from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from langchain.llms import OpenAI

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

# Create a route to the root endpoint
@app.get("/")
async def root():
    return {"message": "Multimodal Accessible Visulization Backend API"} 
    
# Create a route to the /prompt endpoint with a query param called prompt
@app.get("/prompt")
async def prompt(text: str):
    # check if prompt is not None
    response = llm(text)
    return {"prompt": text, "response": response}

