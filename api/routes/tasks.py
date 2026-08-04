from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db

from models.task import Task
from models.user import User

from schemas.task import TaskResponse, TaskStatusUpdate

from dependencies.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])
DbDep = Annotated[Session, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


# ==================================================
# GET ALL TASKS
# GET /tasks
# ==================================================


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    db: DbDep, current_user: CurrentUserDep
):

    tasks = db.query(Task).filter(Task.assigned_to_user_id == current_user.id).all()

    return tasks


# ==================================================
# GET SINGLE TASK
# GET /tasks/{id}
# ==================================================


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: UUID,
    db: DbDep,
    current_user: CurrentUserDep,
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.assigned_to_user_id == current_user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


# ==================================================
# UPDATE TASK STATUS
# PUT /tasks/{id}/status
# ==================================================


@router.put("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: UUID,
    body: TaskStatusUpdate,
    db: DbDep,
    current_user: CurrentUserDep,
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.assigned_to_user_id == current_user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    allowed_statuses = ["open", "in_progress", "completed"]

    if body.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid task status")

    task.status = body.status

    db.commit()
    db.refresh(task)

    return task
