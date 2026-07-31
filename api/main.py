import os

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import (
    documents,
    auth,
    dashboard,
    audit,
    security_setting,
    user_notification_preferences,
    users,
    organizations,
    notifications,
    ai,
    tasks,
    api_keys,
    webhooks,
    internal_ai,
)


app = FastAPI(
    title="MediBridge API",
    description="Digital Document Exchange Backend API",
    version="1.0.0"
)


# ==================================================
# CORS Configuration
# ==================================================

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
    return {
        "status": "ok",
        "message": "MediBridge API is running"
    }