import pandas as pd 
import torch
from importlib.resources import files
from vizability.prompt import send_prompt
from langchain_core.prompts.chat import (
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
)
from sentence_transformers import SentenceTransformer, util
model = SentenceTransformer('all-MiniLM-L6-v2')

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

def classify(query):
    user_query_processed = [query]
    prompt = base_prompt
    # Iterate through the DataFrame rows and categorize questions
    for index, row in df.iterrows():
        question = row['Questions']
        ground_truth = row['Classification_Ground_Truth']
        if ground_truth != "I am sorry but I cannot understand the question":
            validation_set_sample_dict[ground_truth].append(question)
    
    # initialize the prompt string     
    # TODO: add treeview text to the prompt
    # TODO: use a few shot prompting template
    human_message_prompt = HumanMessagePromptTemplate.from_template(prompt)
    chat_prompt = ChatPromptTemplate.from_messages([human_message_prompt])
    
    # Print the resulting categorized questions
    for ground_truth, questions in validation_set_sample_dict.items():
        validation_processed_string = ""
        validation_set_sample_processed = []
        for question in questions:
            validation_set_sample_processed.append(question)
        embeddings_user_query = model.encode(user_query_processed, convert_to_tensor=True)
        embeddings_validation_set_sample = model.encode(validation_set_sample_processed, convert_to_tensor=True)
        cosine_scores = util.cos_sim(embeddings_user_query, embeddings_validation_set_sample)
        
        if (len(questions) >= 4):
            # Get the top 4 scores and their indices
            top_scores, top_indices = torch.topk(cosine_scores, k=4, dim=1)
            for i in range(4):
                index = top_indices[0][i].item()
                validation_processed_string += f"{ground_truth} // {questions[index]}\n"
        else: 
            top_scores, top_indices = torch.topk(cosine_scores, k=len(questions), dim=1)
            for i in range(len(questions)):
                index = top_indices[0][i].item()
                validation_processed_string += f"{ground_truth} // {questions[index]}\n"

        # Find the template variable to replace
        chat_prompt = chat_prompt.partial(**{template_vars[ground_truth]: validation_processed_string})
        # prompt = prompt.format(**{template_vars[ground_truth]: validation_processed_string})
        
        # Find the index where the substring occurs
        # index = prompt.find(substring_to_find[ground_truth])

        # # Check if the substring is found, and if so, insert the new string after it
        # if index != -1:
        #     prompt = prompt[:index + len(substring_to_find[ground_truth])] + "\n" + validation_processed_string + prompt[index + len(substring_to_find[ground_truth]):]
    output = send_prompt(chat_prompt.format_messages())
    return output.content


if __name__ == '__main__':
    output = classify("Are the ocean level rising?")
    print(output)
