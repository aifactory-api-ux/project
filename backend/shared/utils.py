import hashlib
import re
from datetime import datetime
from typing import List, Optional, Tuple

import bcrypt


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


def compute_content_hash(title: str, summary: str, url: str) -> str:
    content = f"{title.lower().strip()}|{summary.lower().strip()}|{url.lower().strip()}"
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def normalize_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text.lower()


def normalize_url(url: str) -> str:
    url = url.strip().lower()
    url = re.sub(r'https?://(www\.)?', '', url)
    url = url.rstrip('/')
    return url


def extract_domain_from_url(url: str) -> str:
    match = re.search(r'https?://([^/]+)', url)
    if match:
        return match.group(1)
    return ""


def calculate_overall_score(
    relevance: float,
    impact: float,
    regional: float,
    weights: Optional[dict] = None
) -> float:
    if weights is None:
        weights = {"relevance": 0.4, "impact": 0.35, "regional": 0.25}

    relevance_weight = weights.get("relevance", 0.4)
    impact_weight = weights.get("impact", 0.35)
    regional_weight = weights.get("regional", 0.25)

    total_weight = relevance_weight + impact_weight + regional_weight
    relevance_weight /= total_weight
    impact_weight /= total_weight
    regional_weight /= total_weight

    score = (
        relevance * relevance_weight +
        impact * impact_weight +
        regional * regional_weight
    )
    return round(score, 4)


def priority_from_score(score: float) -> int:
    if score >= 0.8:
        return 4
    elif score >= 0.6:
        return 3
    elif score >= 0.3:
        return 2
    else:
        return 1


def is_duplicate(
    existing_hashes: List[str],
    content_hash: str,
    threshold: float = 0.85
) -> bool:
    return content_hash in existing_hashes


def similarity_score(text1: str, text2: str) -> float:
    t1_words = set(normalize_text(text1).split())
    t2_words = set(normalize_text(text2).split())

    if not t1_words or not t2_words:
        return 0.0

    intersection = len(t1_words & t2_words)
    union = len(t1_words | t2_words)

    if union == 0:
        return 0.0
    return round(intersection / union, 4)


def parse_tags(tags_input: str) -> List[str]:
    if isinstance(tags_input, list):
        return [tag.strip().lower() for tag in tags_input if tag.strip()]

    tags = re.split(r'[,\s]+', tags_input)
    return [tag.strip().lower() for tag in tags if tag.strip()]


def format_datetime(dt: Optional[datetime]) -> Optional[str]:
    if dt is None:
        return None
    return dt.isoformat()


def validate_url(url: str) -> bool:
    url_pattern = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$',
        re.IGNORECASE
    )
    return bool(url_pattern.match(url))


def sanitize_string(text: str, max_length: int = 500) -> str:
    text = re.sub(r'[<>]', '', text)
    if len(text) > max_length:
        text = text[:max_length]
    return text.strip()
