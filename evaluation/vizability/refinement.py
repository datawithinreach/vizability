
import json
from importlib.resources import files
from vizability.prompt import send_prompt
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    PromptTemplate
)
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

class RefinedQuery(BaseModel):
    question: str = Field(description="put original question here")
    refined_question: str = Field(description="put refined question here")
    rationale: str = Field(description="put rationale for the refinement here")
parser = JsonOutputParser(pydantic_object=RefinedQuery)

# load the prompt file using resource manger to avoid hardcoding the path
prompt_file_path = files('vizability.prompt_templates').joinpath('refinement_prompt_template.txt')
with open(prompt_file_path, "r") as file_object:
    base_prompt = file_object.read()

def extract_alt_text(treeview_text):
    alt_text = ""
    start_pattern = "1 //"
    end_pattern = "1.1 //"

    start_index = treeview_text.find(start_pattern) + len(start_pattern)
    end_index = treeview_text.find(end_pattern)

    if start_index != -1 and end_index != -1 and start_index < end_index:
        alt_text = treeview_text[start_index:end_index]
    return alt_text


def refine(query, treeview_text, active_element=""):
    # print("query", query)

    # construct a prompt
    chart_context = extract_alt_text(treeview_text) + active_element
    human_message_prompt = HumanMessagePromptTemplate.from_template(base_prompt)
    
    chat_prompt = ChatPromptTemplate(
        messages = [human_message_prompt],
        input_variables=["chart_context", "question"],
        partial_variables={"format_instructions": parser.get_format_instructions()})


    messages = chat_prompt.format_messages(question=query, chart_context=chart_context)
    output = send_prompt(messages)
    refined_question = json.loads(output.content)["refined_question"]
    return refined_question


import pandas as pd
# from tabulate import tabulate

if __name__ == '__main__':

    testset_link = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTDwtO5qoHM1RmugyVcxeXa-uLit2TAF0fKsPiSDxi6GtoNYXIV6EdiZ6-oGEzBg-7L-dICHJiB4Vis/pub?gid=914137684&single=true&output=csv"
    testset = pd.read_csv(testset_link)
    sample_df = testset.sample(n=2, random_state=42)
    
    def apply_refine(row):
        with open(f"treeview_text/{row['Chart Type']}_treeview.txt", "r") as file_object:
            treeview_text = file_object.read()
        return refine(row['Questions'], treeview_text)

    sample_df['Refined_Questions'] = sample_df.apply(apply_refine, axis=1)
    
    sample_df.apply(lambda d: print(d["Questions"], " >>> ", d["Refined_Questions"]),axis = 1)


