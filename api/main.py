from fastapi import FastAPI
from routes import documents, auth, dashboard, audit, security_setting, user_notification_preferences, users, organizations, notifications, ai, tasks, api_keys, webhooks, uploads


app = FastAPI()


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
app.include_router(uploads.router)


@app.get("/")
def root():
    return {
        "message": "MediBridge API is running"
    }