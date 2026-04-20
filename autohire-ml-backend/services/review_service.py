# services/review_service.py

import re
from functools import lru_cache
from typing import List, Dict

from sentence_transformers import SentenceTransformer, util
from transformers import pipeline

# -------------------------------------------------------
# MODEL LOADING (loads once only)
# -------------------------------------------------------

@lru_cache(maxsize=1)
def get_embedding_model():
    print("Loading review semantic model...")
    return SentenceTransformer("all-MiniLM-L6-v2")


@lru_cache(maxsize=1)
def get_summarizer():
    print("Loading summarizer model...")
    return pipeline(
        "summarization",
        model="facebook/bart-large-cnn",
        tokenizer="facebook/bart-large-cnn"
    )


# -------------------------------------------------------
# HELPERS
# -------------------------------------------------------

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def split_requirements(requirements: str) -> List[str]:
    if not requirements:
        return []

    lines = re.split(r"[\n,;|]+", requirements)
    skills = []

    for item in lines:
        item = item.strip()
        if item and len(item) > 1:
            skills.append(item)

    # remove duplicates preserving order
    seen = set()
    unique = []

    for s in skills:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            unique.append(s)

    return unique


def keyword_match(skill: str, review: str) -> bool:
    return skill.lower() in review.lower()


# -------------------------------------------------------
# SEMANTIC MATCHING
# -------------------------------------------------------

def find_skill_matches(review: str, req_skills: List[str]) -> Dict:
    model = get_embedding_model()

    matched = []
    missing = []

    review_embedding = model.encode(review, convert_to_tensor=True)

    for skill in req_skills:

        # Direct keyword match = strongest signal
        if keyword_match(skill, review):
            matched.append(skill)
            continue

        # Semantic similarity
        skill_embedding = model.encode(skill, convert_to_tensor=True)
        score = util.cos_sim(skill_embedding, review_embedding).item()

        if score >= 0.35:
            matched.append(skill)
        else:
            missing.append(skill)

    return {
        "matched": matched,
        "missing": missing
    }


# -------------------------------------------------------
# SUMMARY GENERATION
# -------------------------------------------------------

def generate_summary(review: str, matched: List[str], missing: List[str]) -> str:
    review = clean_text(review)

    try:
        summarizer = get_summarizer()

        result = summarizer(
            review,
            max_length=60,
            min_length=20,
            do_sample=False
        )

        base_summary = result[0]["summary_text"]

    except Exception:
        # fallback summary
        base_summary = review[:250]

    strengths = ""
    gaps = ""

    if matched:
        strengths = f" Strengths include {', '.join(matched[:5])}."

    if missing:
        gaps = f" Improvement needed in {', '.join(missing[:5])}."

    return (base_summary + strengths + gaps).strip()


# -------------------------------------------------------
# MAIN SERVICE
# -------------------------------------------------------

def summarize_review_service(review: str, requirements: str):

    review = clean_text(review)
    req_skills = split_requirements(requirements)

    if not review:
        return {
            "summary": "No review text provided.",
            "alignment_score": 0,
            "matched_skills": [],
            "missing_skills": req_skills
        }

    if not req_skills:
        return {
            "summary": "No drive requirements provided.",
            "alignment_score": 0,
            "matched_skills": [],
            "missing_skills": []
        }

    # Skill analysis
    result = find_skill_matches(review, req_skills)

    matched = result["matched"]
    missing = result["missing"]

    # Score
    alignment_score = round((len(matched) / len(req_skills)) * 100)

    # Smart summary
    summary = generate_summary(review, matched, missing)

    return {
        "summary": summary,
        "alignment_score": alignment_score,
        "matched_skills": matched,
        "missing_skills": missing
    }