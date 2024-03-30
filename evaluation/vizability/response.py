from importlib.resources import files
from vizability.prompt import send_prompt,send_csvagent_prompt
from langchain.prompts import PromptTemplate
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

class Navigation(BaseModel):
    starting_point: str = Field(description="put starting point here")
    starting_address: str = Field(description="put starting address here")
    ending_point: str = Field(description="put ending point here")
    ending_address: str = Field(description="put ending address here")
parser = JsonOutputParser(pydantic_object=Navigation)


# load the prompt file using resource manger to avoid hardcoding the path
prompt_file_path = files('vizability.prompt_templates').joinpath('data_query_prompt_template.txt')
with open(prompt_file_path, "r") as file_object:
    base_data_prompt = file_object.read()

prompt_file_path = files('vizability.prompt_templates').joinpath('contextual_query_prompt_template.txt')
with open(prompt_file_path, "r") as file_object:
    base_contextual_prompt = file_object.read()

prompt_file_path = files('vizability.prompt_templates').joinpath('navigation_query_prompt_template.txt')
with open(prompt_file_path, "r") as file_object:
    base_navigation_prompt = file_object.read()


def reply(query, query_type, treeview_text, active_element="", chart_data=None):

    chart_context = treeview_text + active_element

    if "Analytical Query" in query_type or "Visual Query" in query_type:

        prompt_template = PromptTemplate.from_template(base_data_prompt)
        prompt = prompt_template.format(chart_context = chart_context, question = query)
        response =  send_csvagent_prompt(prompt, chart_data)
        return response
    elif "Contextual Query" in query_type:
        # TODO browser agent?
        human_message_prompt = HumanMessagePromptTemplate.from_template(base_contextual_prompt)
        chat_prompt = ChatPromptTemplate.from_messages([human_message_prompt])
        messages = chat_prompt.format_messages(treeview_text = treeview_text, question = query)
        response = send_prompt(messages)
        return response.content
    elif "Navigation Query" in query_type:
        # human_message_prompt = HumanMessagePromptTemplate.from_template(base_contextual_prompt)
        # chat_prompt = ChatPromptTemplate.from_messages([human_message_prompt])
        # messages = chat_prompt.format_messages(chart_context = chart_context, question = query)
        #TODO: Use the few shot prompting template
        human_message_prompt = HumanMessagePromptTemplate.from_template(base_navigation_prompt)
        chat_prompt = ChatPromptTemplate(
            messages = [human_message_prompt],
            input_variables=["chart_context, question"],
            partial_variables={"format_instructions": parser.get_format_instructions()})
        messages = chat_prompt.format_messages(question=query, chart_context=chart_context)
        response = send_prompt(messages)
        print("********* navigation response", response.content)
        return response.content
    else:
        return "I am sorry but I cannot understand the question."

import pandas as pd
if __name__ == '__main__':
    testset_link = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTDwtO5qoHM1RmugyVcxeXa-uLit2TAF0fKsPiSDxi6GtoNYXIV6EdiZ6-oGEzBg-7L-dICHJiB4Vis/pub?gid=914137684&single=true&output=csv"
    testset = pd.read_csv(testset_link)

    print("===Contextual Query===")
    sampled_df = testset[testset['Classification_Ground_Truth'] == 'Contextual Query'].sample(n=1, random_state=42)
    def reply_contextual_query(row):
        with open(f"treeview_text/{row['Chart Type']}_treeview.txt", "r") as file_object:
            treeview_text = file_object.read()
        chart_data = pd.read_csv(f"chart_data/{row['Chart Type']}_transformed_data.csv")
        return reply(row['Questions'], row['Classification_Ground_Truth'], treeview_text, chart_data=chart_data)
    sampled_df['VizAbility Response'] = sampled_df.apply(reply_contextual_query, axis=1)
    sampled_df.apply(lambda d: print(d["Questions"], d['Classification_Ground_Truth'], " >>> ", d["VizAbility Response"]),axis = 1)

    print("===Analytical Query===")
    sampled_df = testset[testset['Classification_Ground_Truth'] == 'Analytical Query'].sample(n=1, random_state=42)
    def reply_data_query(row):
        with open(f"treeview_text/{row['Chart Type']}_treeview.txt", "r") as file_object:
            treeview_text = file_object.read()
        chart_data = pd.read_csv(f"chart_data/{row['Chart Type']}_transformed_data.csv")
        return reply(row['Questions'], row['Classification_Ground_Truth'], treeview_text, chart_data=chart_data)
    sampled_df['VizAbility Response'] = sampled_df.apply(reply_data_query, axis=1)

    sampled_df.apply(lambda d: print(d["Questions"], d['Classification_Ground_Truth'], " >>> ", d["VizAbility Response"]),axis = 1)

    print("===Visual Query===")
    sampled_df = testset[testset['Classification_Ground_Truth'] == 'Visual Query'].sample(n=1, random_state=42)
    sampled_df['VizAbility Response'] = sampled_df.apply(reply_data_query, axis=1)
    sampled_df.apply(lambda d: print(d["Questions"], d['Classification_Ground_Truth'], " >>> ", d["VizAbility Response"]),axis = 1)

    print("===Navigation Query===")
    sampled_df = testset[testset['Classification_Ground_Truth'] == 'Navigation Query'].sample(n=1, random_state=42)
    def reply_navigation_query(row):
        with open(f"treeview_text/{row['Chart Type']}_treeview.txt", "r") as file_object:
            treeview_text = file_object.read()
        chart_data = pd.read_csv(f"chart_data/{row['Chart Type']}_transformed_data.csv")
        return reply(row['Questions'], row['Classification_Ground_Truth'], treeview_text, chart_data=chart_data)
    sampled_df['VizAbility Response'] = sampled_df.apply(reply_navigation_query, axis=1)
    sampled_df.apply(lambda d: print(d["Questions"], d['Classification_Ground_Truth'], " >>> ", d["VizAbility Response"]),axis = 1)

