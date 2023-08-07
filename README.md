# Multimodal Accvis

## Development
* Create `.env` and add `OPENAI_API_KEY = [api key]`
* Create a virtual environment to manage dependencies
  ```
  python -m venv venv
  source venv/bin/activate 
  ```
  For Windows use `venv\Scripts\activate`
* Run the following commands on the terminal
  ```
  pip install -r requirements.txt
  uvicorn main:app --reload
  ```
* Client is in the `public` folder
* Backend API routes are in `main.py`

## Deployment

The live website is available: https://multimodal-accvis-6lvi554ivq-uc.a.run.app/

The website & api service is currently deployed through Google Cloud Build that is triggered upon a new commit. The trigger will generate and add a docker image to Container Registery and deploy the image through Cloud Run.

TODO: Investigate the cause of the significant delay to get the response from OpenAI. 



