from fastapi import APIRouter

router = APIRouter()

@router.post("/summarize-review")
def summarize_review(data: dict):
    review = data.get("review", "")
    requirements = data.get("requirements", "")

    return {
        "summary": "Candidate performed well but lacks some advanced skills.",
        "alignment_score": 75,
        "matched_skills": ["Java", "Communication"],
        "missing_skills": ["Docker", "Microservices"]
    }