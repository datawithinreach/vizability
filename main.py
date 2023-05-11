from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from dotenv import load_dotenv
import os
from langchain.llms import OpenAI
from fastapi.staticfiles import StaticFiles

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



# Create a route to the api root endpoint
@app.get("/api")
async def root():
    return {"message": "Multimodal Accessible Visulization Backend API"} 
    

# Create a route to the /api/prompt endpoint with a query param called prompt
@app.get("/api/prompt")
async def prompt(text: str):
    # check if prompt is not None
    response = llm(text)
    return {"prompt": text, "response": response}


# Mount the "public" directory as a static file directory
# This is needed to serve the frontend
# The order of the routes matters, so this should be the last route
# Otherwise, it will conflict with the api routes above
# See FastAPI documentation for more info: https://fastapi.tiangolo.com/tutorial/path-params/#order-matters
# See StackOverflow for more info: https://stackoverflow.com/questions/73110208/how-to-load-a-different-file-than-index-html-in-fastapi-root-path
app.mount("/", StaticFiles(directory="public", html=True), name="public")
