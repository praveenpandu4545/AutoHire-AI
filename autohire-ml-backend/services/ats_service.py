# services/ats_service.py
# PREMIUM AI RESUME ANALYZER (Option B)

import re
from functools import lru_cache
from typing import Dict, List

from sentence_transformers import SentenceTransformer
from transformers import pipeline


# ==========================================================
# LOAD MODELS ONCE
# ==========================================================

@lru_cache(maxsize=1)
def get_embedding_model():
    print("Loading semantic resume model...")
    return SentenceTransformer("all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def get_summarizer():
    print("Loading summarizer...")
    return pipeline(
        "summarization",
        model="sshleifer/distilbart-cnn-12-6",
        tokenizer="sshleifer/distilbart-cnn-12-6"
    )


# ==========================================================
# HELPERS
# ==========================================================

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def contains_any(text: str, words: List[str]) -> bool:
    text = text.lower()
    return any(word.lower() in text for word in words)


def count_hits(text: str, words: List[str]) -> int:
    text = text.lower()
    return sum(1 for word in words if word.lower() in text)


# ==========================================================
# ANALYZE CORE CONTENT
# ==========================================================

def analyze_resume(resume: str):

    score = 0
    strengths = []
    weaknesses = []
    suggestions = []

    lower = resume.lower()

    # ------------------------------------------------------
    # SECTION CHECK
    # ------------------------------------------------------
    sections = {
        "Education": ["education", "b.tech", "bachelor", "degree", "cgpa"],
        "Skills": ["skills", "java", "python", "react", "mysql"],
        "Projects": ["projects", "developed", "built", "created"],
        "Experience": ["experience", "internship", "worked"],
        "Certifications": ["certification", "certificate", "coursera", "udemy"]
    }

    for name, words in sections.items():
        if contains_any(lower, words):
            score += 8
            strengths.append(f"{name} section is present")
        else:
            weaknesses.append(f"{name} section is missing")
            suggestions.append(f"Add a strong {name.lower()} section")

    # ------------------------------------------------------
    # TECH STACK CHECK
    # ------------------------------------------------------
    tech_skills = [
        "java", "python", "spring boot", "react",
        "mysql", "mongodb", "docker", "aws",
        "git", "linux", "javascript", "node"
    ]

    found_skills = [s for s in tech_skills if s in lower]

    if len(found_skills) >= 6:
        score += 13
        strengths.append("Strong technical stack detected")
    elif len(found_skills) >= 3:
        score += 7
        strengths.append("Moderate technical skillset")
        weaknesses.append("Technical stack can be stronger")
        suggestions.append("Add tools like Docker, AWS, CI/CD")
    else:
        score += 3
        weaknesses.append("Limited technical stack")
        suggestions.append("Improve technical skills section")

    # ------------------------------------------------------
    # PROJECT QUALITY
    # ------------------------------------------------------
    if count_hits(lower, ["project", "developed", "built", "created"]) >= 4:
        score += 15
        strengths.append("Projects are well represented")
    else:
        weaknesses.append("Projects section lacks impact")
        suggestions.append("Add real projects with technologies and outcomes")

    # ------------------------------------------------------
    # CONTACT QUALITY
    # ------------------------------------------------------
    if "@" in resume:
        score += 5
    else:
        weaknesses.append("Professional email missing")
        suggestions.append("Add professional email")

    if re.search(r"\d{10}", resume):
        score += 5
    else:
        weaknesses.append("Phone number missing")
        suggestions.append("Add mobile number")

    if "github" in lower:
        score += 5
        strengths.append("GitHub profile linked")
    else:
        weaknesses.append("GitHub profile missing")
        suggestions.append("Add GitHub profile link")

    if "linkedin" in lower:
        score += 5
        strengths.append("LinkedIn profile linked")
    else:
        weaknesses.append("LinkedIn profile missing")
        suggestions.append("Add LinkedIn profile link")

    # ------------------------------------------------------
    # LENGTH CHECK
    # ------------------------------------------------------
    word_count = len(resume.split())

    if word_count < 250:
        weaknesses.append("Resume is too short")
        suggestions.append("Add more project and skill details")
    elif word_count > 900:
        weaknesses.append("Resume is too lengthy")
        suggestions.append("Keep resume concise and recruiter friendly")
    else:
        score += 10
        strengths.append("Good resume length")

    # ------------------------------------------------------
    # ACHIEVEMENTS CHECK
    # ------------------------------------------------------
    if contains_any(lower, ["award", "winner", "rank", "achievement"]):
        score += 8
        strengths.append("Achievements included")
    else:
        weaknesses.append("No achievements highlighted")
        suggestions.append("Add achievements / coding contest ranks")

    # FINAL SCORE
    score = min(score, 100)

    return score, strengths, weaknesses, suggestions, found_skills


# ==========================================================
# SMART SUMMARY
# ==========================================================

def generate_summary(resume: str, score: int, found_skills: List[str]):

    try:
        summarizer = get_summarizer()

        text = resume[:1200]

        result = summarizer(
            text,
            max_length=60,
            min_length=20,
            do_sample=False
        )

        summary = result[0]["summary_text"]

    except Exception:
        summary = "Resume analyzed successfully."

    if score >= 85:
        grade = "Excellent"
    elif score >= 70:
        grade = "Strong"
    elif score >= 55:
        grade = "Average"
    else:
        grade = "Needs Improvement"

    skill_text = ", ".join(found_skills[:5]) if found_skills else "basic skills"

    return f"{grade} resume. Candidate shows experience with {skill_text}. {summary}"


# ==========================================================
# MAIN SERVICE
# ==========================================================

def check_ats_service(resume_text: str) -> Dict:

    resume = clean_text(resume_text)

    if not resume:
        return {
            "resume_score": 0,
            "summary": "No resume text provided.",
            "strengths": [],
            "weaknesses": ["Resume content missing"],
            "suggestions": ["Upload valid resume"]
        }

    score, strengths, weaknesses, suggestions, found_skills = analyze_resume(resume)

    summary = generate_summary(resume, score, found_skills)

    # remove duplicates
    strengths = list(dict.fromkeys(strengths))[:8]
    weaknesses = list(dict.fromkeys(weaknesses))[:8]
    suggestions = list(dict.fromkeys(suggestions))[:8]

    return {
        "resume_score": score,
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions
    }