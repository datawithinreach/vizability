from langchain_openai import ChatOpenAI
from .utils import load_config
config = load_config()
from dotenv import load_dotenv
load_dotenv()
# assuming we are using chat models
def send_prompt(messages, model_name = config["default_model"]):
    chat = ChatOpenAI(temperature=config["default_temperature"], model_name=model_name)
    output = chat.invoke(messages)

    return messages,output
    # return {"prompt": question, "response": response["choices"][0]["message"]["content"]}



