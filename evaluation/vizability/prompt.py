from langchain.agents.agent_types import AgentType
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain_openai import ChatOpenAI
from .utils import load_config

config = load_config()
from dotenv import load_dotenv
load_dotenv()
# assuming we are using chat models
def send_prompt(messages, model_name = config["default_model"], temperature = config["default_temperature"]):
    chat_model = ChatOpenAI(temperature=temperature, model_name=model_name)
    return chat_model.invoke(messages)


def send_csvagent_prompt(prompt, chart_data, model_name = config["default_model"], temperature = config["default_temperature"]):
    chat_model = ChatOpenAI(temperature=temperature, model_name=model_name)
    # chart_data.to_csv('chart_data.csv', index=False)
    # csv agent uses create_pandas_dataframe_agent under the hood
    # deprecated: handle_parsing_errors="Check your output and make sure it conforms!""
    try:
        agent = create_pandas_dataframe_agent(chat_model, chart_data, verbose=True, agent_type=AgentType.OPENAI_FUNCTIONS, handle_parsing_errors=True)
        response = agent.invoke(prompt)
    except Exception as e:
         return str(e)
    return response["output"]