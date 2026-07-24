from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class TaskResponse(BaseModel):

    id: UUID

    document_id: UUID | None

    assigned_to_user_id: UUID | None

    created_by_user_id: UUID | None

    title: str

    status: str

    due_date: datetime | None

    created_at: datetime


    class Config:
        from_attributes = True



class TaskStatusUpdate(BaseModel):

    status: str