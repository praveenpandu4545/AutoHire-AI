# ============================================================
# AUTOHIRE AI ELIGIBILITY ENGINE (PRODUCTION VERSION)
# ============================================================

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import numpy as np
import re
import io

app = FastAPI()

print("Loading semantic model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model Loaded ✅")

# ============================================================
# REQUEST MODEL
# ============================================================

class EligibilityRequest(BaseModel):
    resume_text: str
    drive_requirements: str

# ============================================================
# LOAD SKILLS DATABASE
# ============================================================

def load_skills():
    with open("skills.txt", "r") as f:
        return [line.strip() for line in f if line.strip()]

SKILL_DATABASE = load_skills()
print(f"{len(SKILL_DATABASE)} skills loaded ✅")

# ============================================================
# GPA EXTRACTION
# ============================================================

def normalize_to_10_scale(value, scale):
    return (value / scale) * 10

def extract_gpa(text):
    text = text.lower()

    match = re.search(r'([0-9]\.?[0-9]*)\s*/\s*10', text)
    if match:
        return float(match.group(1))

    match = re.search(r'([0-9]{2}\.?[0-9]*)\s*%', text)
    if match:
        return normalize_to_10_scale(float(match.group(1)), 100)

    match = re.search(r'(cgpa|gpa)[^0-9]*([0-9]\.?[0-9]*)', text)
    if match:
        value = float(match.group(2))
        return value if value <= 10 else normalize_to_10_scale(value, 100)

    return None

# ============================================================
# BRANCH EXTRACTION
# ============================================================

BRANCH_MAPPING = {
    "computer science": ["computer science", "cse", "cs"],
    "information technology": ["information technology", "it"],
    "electronics and communication": ["electronics and communication", "ece"],
    "electrical and electronics": ["electrical and electronics", "eee"],
    "mechanical": ["mechanical", "mech"],
    "civil": ["civil"]
}

def extract_branch(text):
    text = text.lower()
    for standard, variations in BRANCH_MAPPING.items():
        for v in variations:
            if re.search(r'\b' + re.escape(v) + r'\b', text):
                return standard
    return None

# ============================================================
# MAIN ELIGIBILITY ENDPOINT
# ============================================================

@app.post("/check-eligibility")
def check_eligibility(request: EligibilityRequest):

    resume_text = request.resume_text
    drive_requirements = request.drive_requirements

    resume_lower = resume_text.lower()

    drive_cleaned = re.sub(r'\b\d+\.\s*', '', drive_requirements)
    drive_lower = drive_cleaned.lower()

    student_gpa = extract_gpa(resume_text)
    required_gpa = extract_gpa(drive_cleaned)

    student_branch = extract_branch(resume_text)
    required_branch = extract_branch(drive_cleaned)

    eligible = True
    reasons = []
    strengths = []
    weaknesses = []
    improvements = []

    # ========================
    # STRICT CHECK
    # ========================

    if required_gpa is not None:
        if student_gpa is None or student_gpa < required_gpa:
            eligible = False
            reasons.append("GPA requirement not satisfied.")
        else:
            strengths.append(f"Meets GPA requirement ({student_gpa} CGPA).")

    if required_branch is not None:
        if student_branch != required_branch:
            eligible = False
            reasons.append("Branch requirement not satisfied.")
        else:
            strengths.append(f"Belongs to required branch ({student_branch}).")

    if not eligible:
        return {
            "eligible": False,
            "percentage": 0,
            "analysis": {
                "reasons": reasons,
                "conclusion": "The candidate does not meet the mandatory eligibility criteria for this drive."
            }
        }

    # ========================
    # SKILL DETECTION
    # ========================

    detected_skills = []

    for skill in SKILL_DATABASE:
        if skill.lower() in drive_lower:
            detected_skills.append(skill)

    detected_skills = list(set(detected_skills))

    if not detected_skills:
        return {
            "eligible": True,
            "percentage": 100,
            "analysis": {
                "strengths": strengths,
                "weaknesses": [],
                "improvements": [],
                "conclusion": "The candidate satisfies all eligibility conditions and matches the drive requirements."
            }
        }

    resume_sentences = re.split(r'[.\n]', resume_text)
    resume_embeddings = model.encode(resume_sentences)

    skill_scores = []
    missing_skills = []
    strong_skills = []

    for skill in detected_skills:

        if skill.lower() in resume_lower:
            skill_scores.append(1.0)
            strong_skills.append(skill)
            continue

        skill_embedding = model.encode(skill)
        similarities = cosine_similarity(resume_embeddings, [skill_embedding])
        max_sim = float(np.max(similarities))

        skill_scores.append(max_sim)

        if max_sim >= 0.75:
            strong_skills.append(skill)
        elif max_sim < 0.40:
            missing_skills.append(skill)

    overall_score = round(np.mean(skill_scores) * 100, 2)

    # Build strengths
    for skill in strong_skills:
        strengths.append(f"Strong match in {skill}.")

    # Build weaknesses
    for skill in missing_skills:
        weaknesses.append(f"Limited exposure to {skill}.")
        improvements.append(f"Improve practical knowledge in {skill} by working on real-world projects.")

    conclusion = (
        f"The candidate demonstrates a suitability score of {overall_score}%. "
        "Based on the analysis of skills and academic eligibility, "
        "the candidate shows a good alignment with the drive requirements."
    )

    return {
        "eligible": True,
        "percentage": overall_score,
        "analysis": {
            "strengths": strengths,
            "weaknesses": weaknesses,
            "improvements": improvements,
            "conclusion": conclusion
        }
    }