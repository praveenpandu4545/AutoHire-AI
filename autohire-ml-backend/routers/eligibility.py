from fastapi import APIRouter
from pydantic import BaseModel
from services.eligibility_service import evaluate_candidate

router = APIRouter()

class EligibilityRequest(BaseModel):
    resume_text: str
    drive_requirements: str

@router.post("/check-eligibility")
def check_eligibility(request: EligibilityRequest):
    return evaluate_candidate(
        request.resume_text,
        request.drive_requirements
    )