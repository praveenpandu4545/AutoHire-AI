from fastapi import APIRouter
from services.review_service import summarize_review_service

router = APIRouter()

@router.post("/summarize-review")
def summarize_review(data: dict):
    review = data.get("review", "")
    requirements = data.get("requirements", "")

    return summarize_review_service(review, requirements)