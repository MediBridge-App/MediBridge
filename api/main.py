from fastapi import FastAPI
from routes import documents

app = FastAPI()

app.include_router(documents.router)

@app.get("/")
def root():
    return {"message": "MediBridge API is running"}