import pandas as pd 
import json
import torch
import asyncio
from importlib.resources import files
from vizability.prompt import send_prompt
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('all-MiniLM-L6-v2')
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

class Classification(BaseModel):
    query_type: str = Field(description="Assign the classification result to one of the following categories: 'Analytical Query', 'Visual Query', 'Navigation Query', 'Contextual Query', or 'I am sorry but I cannot understand the question'.")
    rationale: str = Field(description="Describe the rationale for the classification")
parser = JsonOutputParser(pydantic_object=Classification)

# load the prompt file using resource manger to avoid hardcoding the path
prompt_file_path = files('vizability.prompt_templates').joinpath('classification_prompt_template.txt')

with open(prompt_file_path, "r") as file_object:
    base_prompt = file_object.read()

validation_set_sample_file_path = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTAinuEfWlGu_1Qam46ZAPQ3oHM3t8aNOIXNWCfZu6sV18SqUh1-I4ehIJmBiBfzOFD9VWbSXL64uPT/pub?gid=289729987&single=true&output=csv"
df = pd.read_csv(validation_set_sample_file_path)

validation_set_sample_dict = {
    "Analytical Query": [],
    "Visual Query": [],
    "Contextual Query": [],
    "Navigation Query": []
}

# substring_to_find = {
#     "Analytical Query": 'analysis involving data.',
#     "Visual Query":'graph shape/characteristics.',
#     "Contextual Query": 'often involve questions like: "Why?".',
#     "Navigation Query": 'What is my current position?'
# }

template_vars = {
    "Analytical Query": 'analytical_query_examples',
    "Visual Query":'visual_query_examples',
    "Contextual Query": 'contextual_query_examples',
    "Navigation Query": 'navigation_query_examples'
}

def classify(query, num_examples=4, treeview_text=None):
    user_query_processed = [query]
    
    # Iterate through the DataFrame rows and categorize questions
    for index, row in df.iterrows():
        question = row['Questions']
        ground_truth = row['Classification_Ground_Truth']
        if ground_truth != "I am sorry but I cannot understand the question":
            validation_set_sample_dict[ground_truth].append(question)
    
    # initialize the prompt string     
    # TODO: add treeview text to the prompt -> Done (Mar 30)
    # TODO: use a few shot prompting template
    # human_message_prompt = HumanMessagePromptTemplate.from_template(base_prompt)
    # chat_prompt = ChatPromptTemplate.from_messages([human_message_prompt])
    

    human_message_prompt = HumanMessagePromptTemplate.from_template(base_prompt)
    chat_prompt = ChatPromptTemplate(
        messages = [human_message_prompt],
        input_variables=["treeview_text", "analytical_query_examples", "visual_query_examples", "contextual_query_examples", "navigation_query_examples", "question"],
        partial_variables={"format_instructions": parser.get_format_instructions()})

    # Print the resulting categorized questions
    for ground_truth, questions in validation_set_sample_dict.items():
        validation_processed_string = ""
        validation_set_sample_processed = []
        for question in questions:
            validation_set_sample_processed.append(question)
        embeddings_user_query = model.encode(user_query_processed, convert_to_tensor=True)
        embeddings_validation_set_sample = model.encode(validation_set_sample_processed, convert_to_tensor=True)
        cosine_scores = util.cos_sim(embeddings_user_query, embeddings_validation_set_sample)
        
        if (len(questions) >= num_examples):
            # Get the top n scores and their indices
            top_scores, top_indices = torch.topk(cosine_scores, k=num_examples, dim=1)
            for i in range(num_examples):
                index = top_indices[0][i].item()
                validation_processed_string += f"{ground_truth} : {questions[index]}\n"
        else: 
            top_scores, top_indices = torch.topk(cosine_scores, k=len(questions), dim=1)
            for i in range(len(questions)):
                index = top_indices[0][i].item()
                validation_processed_string += f"{ground_truth} : {questions[index]}\n"

        # Find the template variable to replace
        chat_prompt = chat_prompt.partial(**{template_vars[ground_truth]: validation_processed_string})

    # print("prompt", chat_prompt.format_messages(treeview_text=treeview_text, question=query))
    output = send_prompt(chat_prompt.format_messages(treeview_text=treeview_text, question=query))
    # print("output", output)
    query_type = parser.parse(output.content)["query_type"]
    # try:
    #     query_type = json.loads(output.content)["query_type"]
    # except json.JSONDecodeError as e:
    #     try:
    #         # Attempt to clean the string and parse again (GPT4)
    #         cleaned_content = output.content.strip().replace("```json\n", "").replace("\n```", "").strip()
    #         query_type = json.loads(cleaned_content)["query_type"]
    #     except json.JSONDecodeError as e:
    #         print(f"Error parsing JSON after cleaning: {e}", 'output.content:', cleaned_content)
    #         query_type = "Query classification failed."

    return query_type

import time
if __name__ == '__main__':
    testset_link = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTDwtO5qoHM1RmugyVcxeXa-uLit2TAF0fKsPiSDxi6GtoNYXIV6EdiZ6-oGEzBg-7L-dICHJiB4Vis/pub?gid=914137684&single=true&output=csv"
    testset = pd.read_csv(testset_link)
    sampled_df = testset.sample(n=2, random_state=42)
    def apply_classify(row):
        with open(f"treeview_text/{row['Chart Type']}_treeview.txt", "r") as file_object:
            treeview_text = file_object.read()
        # chart_data = pd.read_csv(f"chart_data/{row['Chart Type']}_transformed_data.csv")
        # time.sleep(2)
        query_type = classify(row['Questions'])
        print(row.name, "classifying ", row['Questions'], row['Classification_Ground_Truth'], ">>>", query_type)
        return query_type
    
    start_time = time.time()
    sampled_df['System_Classification'] = sampled_df.apply(apply_classify, axis=1)

    # sidx = 400
    # eidx = 450
    # sampled_df = testset.iloc[sidx:eidx]
    
    # print("Asynchonous classification")
    # start_time = time.time()
    # async def apply_classify(row):
    #     with open(f"treeview_text/{row['Chart Type']}_treeview.txt", "r") as file_object:
    #         treeview_text = file_object.read()
    #     # chart_data = pd.read_csv(f"chart_data/{row['Chart Type']}_transformed_data.csv")
    #     query_type = await classify(row['Questions'], 8, treeview_text)
    #     print(row.name, "classifying ", row['Questions'], row['Classification_Ground_Truth'], ">>>", query_type,  flush=True)
    #     return query_type

    # async def classify_all(sampled_df, chunk_size=5):
    #     # Divide the DataFrame into chunks
    #     chunks = [sampled_df.iloc[i:i + chunk_size] for i in range(0, len(sampled_df), chunk_size)]
        
    #     all_results = []
    #     for i, chunk in enumerate(chunks):
    #         tasks = [apply_classify(row) for _, row in chunk.iterrows()]
    #         results = await asyncio.gather(*tasks)
    #         all_results.extend(results)
    #         print(f"Completed classification for chunk {i + 1}/{len(chunks)}")
    #         end_time = time.time()

    #         # Calculate the elapsed time
    #         elapsed_time = end_time - start_time
    #         print(f"Elapsed time: {elapsed_time} seconds")
    #     return all_results
    
    # classification_results = asyncio.run(classify_all(sampled_df))
    # sampled_df.loc[:, 'System_Classification'] = classification_results
   

    # sampled_df.apply(lambda d: print(d["Questions"], d['Classification_Ground_Truth'], " >>> ", d["System_Classification"]), axis=1)
    # sampled_df.to_csv(f'classification_results_{sidx}_{eidx}.csv', index=False)


    #================================================================
    # print("Synchonous classification")
    # def apply_classify(row):
    #     with open(f"treeview_text/{row['Chart Type']}_treeview.txt", "r") as file_object:
    #         treeview_text = file_object.read()
    #     # chart_data = pd.read_csv(f"chart_data/{row['Chart Type']}_transformed_data.csv")
    #     # time.sleep(2)
    #     query_type = classify(row['Questions'], 8, treeview_text)
    #     print(row.name, "classifying ", row['Questions'], row['Classification_Ground_Truth'], ">>>", query_type)
    #     return query_type
    
    # start_time = time.time()
    # sampled_df['System_Classification'] = sampled_df.apply(apply_classify, axis=1)
    # end_time = time.time()
    # # Calculate the elapsed time
    # elapsed_time = end_time - start_time
    # print(f"Elapsed time: {elapsed_time} seconds")

    # # sampled_df.apply(lambda d: print(d["Questions"], d['Classification_Ground_Truth'], " >>> ", d["System_Classification"]), axis=1)
    # # sampled_df.to_csv(f'classification_results_{sidx}_{eidx}.csv', index=False)
    # # # Load the first CSV file into a DataFrame
    # prev_df = pd.read_csv('classification_results.csv')    
  
    # appended_df = pd.concat([prev_df, sampled_df])

    # # Save the merged DataFrame back into the same CSV file
    # appended_df.to_csv('classification_results.csv', index=False)