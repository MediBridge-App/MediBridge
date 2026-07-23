from fastapi import FastAPI
from routes import documents, auth, dashboard, audit


app = FastAPI()


app.include_router(documents.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(audit.router)


@app.get("/")
def root():
    return {
        "message": "MediBridge API is running"
    }