from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from database import get_db

from models.task import Task

from schemas.task import (
    TaskResponse,
    TaskStatusUpdate
)


router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"]
)



# ==================================================
# GET ALL TASKS
# GET /tasks
# ==================================================

@router.get(
    "",
    response_model=list[TaskResponse]
)
def get_tasks(
    db: Session = Depends(get_db)
):

    # Temporary until authentication/JWT
    current_user_id = UUID(
        "33333333-3333-3333-3333-333333333333"
    )


    tasks = (
        db.query(Task)
        .filter(
            Task.assigned_to_user_id == current_user_id
        )
        .all()
    )


    return tasks




# ==================================================
# GET SINGLE TASK
# GET /tasks/{id}
# ==================================================

@router.get(
    "/{task_id}",
    response_model=TaskResponse
)
def get_task(
    task_id: UUID,
    db: Session = Depends(get_db)
):

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id
        )
        .first()
    )


    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    return task




# ==================================================
# UPDATE TASK STATUS
# PUT /tasks/{id}/status
# ==================================================

@router.put(
    "/{task_id}/status",
    response_model=TaskResponse
)
def update_task_status(
    task_id: UUID,
    body: TaskStatusUpdate,
    db: Session = Depends(get_db)
):

    task = (
        db.query(Task)
        .filter(
            Task.id == task_id
        )
        .first()
    )


    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    allowed_statuses = [
        "open",
        "in_progress",
        "completed"
    ]


    if body.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid task status"
        )


    task.status = body.status


    db.commit()

    db.refresh(task)


    return task