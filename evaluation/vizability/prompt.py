from langchain.agents.agent_types import AgentType
from langchain_experimental.agents.agent_toolkits import create_pandas_dataframe_agent
from langchain_openai import ChatOpenAI
from .utils import load_config
config = load_config()
from dotenv import load_dotenv
import os
load_dotenv()

from openai import OpenAI
client = OpenAI()
from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    ChatMessage,
    AIMessage,
    SystemMessage,
    FunctionMessage,
    ToolMessage
)
from typing import (
    Any,   
    Dict
)
def _convert_message_to_dict(message: BaseMessage) -> dict:
    """Convert a LangChain message to a dictionary.

    Args:
        message: The LangChain message.

    Returns:
        The dictionary.
    """
    message_dict: Dict[str, Any] = {
        "content": message.content,
    }
    if (name := message.name or message.additional_kwargs.get("name")) is not None:
        message_dict["name"] = name

    # populate role and additional message data
    if isinstance(message, ChatMessage):
        message_dict["role"] = message.role
    elif isinstance(message, HumanMessage):
        message_dict["role"] = "user"
    elif isinstance(message, AIMessage):
        message_dict["role"] = "assistant"
        if "function_call" in message.additional_kwargs:
            message_dict["function_call"] = message.additional_kwargs["function_call"]
            # If function call only, content is None not empty string
            if message_dict["content"] == "":
                message_dict["content"] = None
        if "tool_calls" in message.additional_kwargs:
            message_dict["tool_calls"] = message.additional_kwargs["tool_calls"]
            # If tool calls only, content is None not empty string
            if message_dict["content"] == "":
                message_dict["content"] = None
    elif isinstance(message, SystemMessage):
        message_dict["role"] = "system"
    elif isinstance(message, FunctionMessage):
        message_dict["role"] = "function"
    elif isinstance(message, ToolMessage):
        message_dict["role"] = "tool"
        message_dict["tool_call_id"] = message.tool_call_id

        supported_props = {"content", "role", "tool_call_id"}
        message_dict = {k: v for k, v in message_dict.items() if k in supported_props}
    else:
        raise TypeError(f"Got unknown type {message}")
    return message_dict




def check_config():
    return config

def send_prompt(messages, model_name = config["default_model"], temperature = config["default_temperature"]):
    
    # message_dicts = [_convert_message_to_dict(m) for m in messages]
    chat_model = ChatOpenAI(temperature=temperature, model_name=model_name)
    # print("message_dicts", message_dicts)
    # response = client.chat.completions.create(
    #     model=model_name,temperature = temperature,  messages=message_dicts
    # )
    
    # return response.choices[0].message
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