from fastapi import APIRouter

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/")
def get_documents():
    return [
        {"id": 1, "title": "Test Document"},
        {"id": 2, "title": "Another Document"}
    ]

@router.post("/")
def create_document():
    return {"message": "Document created"}

@router.get("/{doc_id}")
def get_document(doc_id: int):
    return {"id": doc_id, "title": "Sample Doc"}

@router.delete("/{doc_id}")
def delete_document(doc_id: int):
    return {"message": f"Deleted {doc_id}"}