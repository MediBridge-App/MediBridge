import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

from exceptions import (
    database_exception_handler,
    general_exception_handler,
    validation_exception_handler,
)
from routes import (
    ai,
    api_keys,
    audit,
    auth,
    dashboard,
    documents,
    internal_ai,
    notifications,
    organizations,
    security_setting,
    tasks,
    user_notification_preferences,
    users,
    webhooks,
)

load_dotenv()

app = FastAPI(
    title="MediBridge API",
    description="Digital Document Exchange Backend API",
    version="1.0.0",
)


# ==================================================
# Exception Handlers
# ==================================================

app.add_exception_handler(SQLAlchemyError, database_exception_handler)

app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.add_exception_handler(Exception, general_exception_handler)


# ==================================================
# CORS Configuration
# ==================================================

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://d17p405i1iil2n.cloudfront.net",
    "https://medibridge.click"
]

frontend_url = os.getenv("FRONTEND_URL")

if frontend_url:
    origins.append(frontend_url)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# API Routes
# ==================================================

app.include_router(documents.router)
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(audit.router)
app.include_router(users.router)
app.include_router(organizations.router)
app.include_router(notifications.router)
app.include_router(ai.router)
app.include_router(tasks.router)
app.include_router(security_setting.router)
app.include_router(user_notification_preferences.router)
app.include_router(api_keys.router)
app.include_router(webhooks.router)
app.include_router(internal_ai.router)


# ==================================================
# Health Check
# ==================================================


@app.get("/")
def root():
    return {"status": "ok", "message": "MediBridge API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
