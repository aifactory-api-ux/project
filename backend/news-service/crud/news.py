from typing import Optional
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.news_service.models import NewsItemModel, NewsSourceModel, FeedbackModel, ScoringConfigModel
from backend.shared.models import (
    NewsPriority,
    FeedbackType,
    SCORING_WEIGHTS,
    PRIORITY_THRESHOLDS,
)
from backend.shared.utils import (
    compute_content_hash,
    calculate_overall_score,
    priority_from_score,
    is_duplicate,
    sanitize_string,
)


def create_news_item(
    db: Session,
    title: str,
    summary: str,
    url: str,
    published_at: datetime,
    source_id: int,
    country: str,
    tags: list[str],
    priority: int = 2,
    relevance_score: Optional[float] = None,
    impact_score: Optional[float] = None,
    regional_score: Optional[float] = None,
) -> NewsItemModel:
    content_hash = compute_content_hash(title, summary, url)

    existing_hashes = db.query(NewsItemModel.content_hash).filter(
        NewsItemModel.content_hash == content_hash
    ).all()

    if is_duplicate([h[0] for h in existing_hashes if h[0]], content_hash):
        raise ValueError("Duplicate news item detected")

    cleaned_title = sanitize_string(title, 500)
    cleaned_summary = sanitize_string(summary, 5000)

    if relevance_score is None:
        relevance_score = 0.5
    if impact_score is None:
        impact_score = 0.5
    if regional_score is None:
        regional_score = 0.5

    overall = calculate_overall_score(relevance_score, impact_score, regional_score, SCORING_WEIGHTS)
    computed_priority = priority_from_score(overall)

    news_item = NewsItemModel(
        title=cleaned_title,
        summary=cleaned_summary,
        url=url,
        published_at=published_at,
        source_id=source_id,
        country=country,
        tags=tags,
        priority=computed_priority,
        content_hash=content_hash,
        relevance_score=relevance_score,
        impact_score=impact_score,
        regional_score=regional_score,
        overall_score=overall,
        status="processed",
    )
    db.add(news_item)
    db.commit()
    db.refresh(news_item)
    return news_item


def get_news_items(
    db: Session,
    country: Optional[str] = None,
    tag: Optional[str] = None,
    priority: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[NewsItemModel], int]:
    query = db.query(NewsItemModel)

    if country:
        query = query.filter(NewsItemModel.country == country)
    if priority is not None:
        query = query.filter(NewsItemModel.priority == priority)
    if tag:
        query = query.filter(NewsItemModel.tags.any(tag))

    total = query.count()
    items = query.order_by(NewsItemModel.published_at.desc()).offset(offset).limit(limit).all()

    return items, total


def get_news_item(db: Session, news_id: int) -> Optional[NewsItemModel]:
    return db.query(NewsItemModel).filter(NewsItemModel.id == news_id).first()


def get_news_item_by_url(db: Session, url: str) -> Optional[NewsItemModel]:
    return db.query(NewsItemModel).filter(NewsItemModel.url == url).first()


def update_news_item(
    db: Session,
    news_id: int,
    title: Optional[str] = None,
    summary: Optional[str] = None,
    url: Optional[str] = None,
    published_at: Optional[datetime] = None,
    source_id: Optional[int] = None,
    country: Optional[str] = None,
    tags: Optional[list[str]] = None,
    priority: Optional[int] = None,
    relevance_score: Optional[float] = None,
    impact_score: Optional[float] = None,
    regional_score: Optional[float] = None,
) -> Optional[NewsItemModel]:
    news_item = get_news_item(db, news_id)
    if not news_item:
        return None

    if title is not None:
        news_item.title = sanitize_string(title, 500)
    if summary is not None:
        news_item.summary = sanitize_string(summary, 5000)
    if url is not None:
        news_item.url = url
    if published_at is not None:
        news_item.published_at = published_at
    if source_id is not None:
        news_item.source_id = source_id
    if country is not None:
        news_item.country = country
    if tags is not None:
        news_item.tags = tags
    if priority is not None:
        news_item.priority = priority

    if relevance_score is not None or impact_score is not None or regional_score is not None:
        rel = relevance_score if relevance_score is not None else news_item.relevance_score or 0.5
        imp = impact_score if impact_score is not None else news_item.impact_score or 0.5
        reg = regional_score if regional_score is not None else news_item.regional_score or 0.5
        news_item.relevance_score = rel
        news_item.impact_score = imp
        news_item.regional_score = reg
        news_item.overall_score = calculate_overall_score(rel, imp, reg, SCORING_WEIGHTS)
        news_item.priority = priority_from_score(news_item.overall_score)

    news_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(news_item)
    return news_item


def delete_news_item(db: Session, news_id: int) -> bool:
    news_item = get_news_item(db, news_id)
    if not news_item:
        return False
    db.delete(news_item)
    db.commit()
    return True


def add_feedback(
    db: Session,
    user_id: int,
    article_id: int,
    feedback_type: str,
    comment: Optional[str] = None,
) -> FeedbackModel:
    feedback = FeedbackModel(
        user_id=user_id,
        article_id=article_id,
        feedback_type=feedback_type,
        comment=comment,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


def get_feedback_for_article(db: Session, article_id: int) -> list[FeedbackModel]:
    return db.query(FeedbackModel).filter(FeedbackModel.article_id == article_id).all()


def get_scoring_config(db: Session, config_key: str, country: Optional[str] = None) -> Optional[ScoringConfigModel]:
    query = db.query(ScoringConfigModel).filter(ScoringConfigModel.config_key == config_key)
    if country:
        query = query.filter(
            (ScoringConfigModel.country == country) | (ScoringConfigModel.country.is_(None))
        )
    return query.filter(ScoringConfigModel.is_active == True).first()


def get_all_scoring_config(db: Session) -> list[ScoringConfigModel]:
    return db.query(ScoringConfigModel).filter(ScoringConfigModel.is_active == True).all()


def upsert_scoring_config(
    db: Session,
    config_key: str,
    config_value: str,
    description: Optional[str] = None,
    country: Optional[str] = None,
    is_active: bool = True,
) -> ScoringConfigModel:
    existing = db.query(ScoringConfigModel).filter(ScoringConfigModel.config_key == config_key).first()
    if existing:
        existing.config_value = config_value
        if description is not None:
            existing.description = description
        if country is not None:
            existing.country = country
        existing.is_active = is_active
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    config = ScoringConfigModel(
        config_key=config_key,
        config_value=config_value,
        description=description,
        country=country,
        is_active=is_active,
    )
    db.add(config)
    db.commit()
    db.refresh(config)
    return config


def classify_and_score(
    db: Session,
    news_id: int,
    relevance_score: Optional[float] = None,
    impact_score: Optional[float] = None,
    regional_score: Optional[float] = None,
    classification_tags: Optional[list[str]] = None,
) -> Optional[NewsItemModel]:
    news_item = get_news_item(db, news_id)
    if not news_item:
        return None

    if relevance_score is not None:
        news_item.relevance_score = relevance_score
    if impact_score is not None:
        news_item.impact_score = impact_score
    if regional_score is not None:
        news_item.regional_score = regional_score

    if news_item.relevance_score is not None and news_item.impact_score is not None and news_item.regional_score is not None:
        news_item.overall_score = calculate_overall_score(
            news_item.relevance_score,
            news_item.impact_score,
            news_item.regional_score,
            SCORING_WEIGHTS,
        )
        news_item.priority = priority_from_score(news_item.overall_score)

    if classification_tags:
        existing_tags = set(news_item.tags)
        news_item.tags = list(existing_tags.union(set(classification_tags)))

    news_item.status = "processed"
    news_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(news_item)
    return news_item
