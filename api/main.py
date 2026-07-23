from fastapi import FastAPI
from routes import documents, auth


app = FastAPI()


app.include_router(documents.router)
app.include_router(auth.router)


@app.get("/")
def root():
    return {
        "message": "MediBridge API is running"
    }