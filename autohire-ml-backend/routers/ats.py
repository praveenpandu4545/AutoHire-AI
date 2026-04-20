from fastapi import APIRouter
from services.ats_service import check_ats_service

router = APIRouter()

@router.post("/check-ats")
def check_ats(data: dict):
    resume_text = data.get("resume_text", "")

    return check_ats_service(resume_text)