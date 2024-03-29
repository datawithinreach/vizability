import json
from importlib.resources import files

def load_config():
    file_path = files('vizability').joinpath('config.json')
    with open(file_path, "r") as file:
        config = json.load(file)
    return config