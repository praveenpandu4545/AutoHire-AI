from fastapi import APIRouter

router = APIRouter()

@router.post("/check-ats")
def check_ats(data: dict):
    resume_text = data.get("resumeText", "")

    # 🔥 Dummy response
    return {
        "ats_score": 78,
        "strengths": [
            "Good technical skills",
            "Relevant experience"
        ],
        "improvements": [
            "Add more keywords",
            "Improve formatting"
        ]
    }