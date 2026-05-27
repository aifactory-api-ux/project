from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.news_service.crud.news import (
    create_news_item,
    get_news_items,
    get_news_item,
    update_news_item,
    delete_news_item,
    add_feedback,
    classify_and_score,
)
from backend.news_service.crud.sources import get_source_by_id
from backend.news_service.dependencies import get_current_user, require_admin, require_analyst_or_admin
from backend.auth_service.models import User
from backend.shared.db import get_db_session
from backend.shared.models import (
    NewsItemPydantic,
    NewsItemCreatePydantic,
    NewsItemUpdatePydantic,
    NewsSourcePydantic,
    NewsItemResponse,
    DeleteResponse,
    FeedbackType,
)


router = APIRouter(prefix="/api/news", tags=["news"])


class FeedbackCreateRequest(BaseModel):
    feedback_type: str
    comment: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    article_id: int
    feedback_type: str
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ScoringConfigRequest(BaseModel):
    relevance_score: Optional[float] = None
    impact_score: Optional[float] = None
    regional_score: Optional[float] = None
    classification_tags: Optional[list[str]] = None


class ScoringConfigResponse(BaseModel):
    id: int
    config_key: str
    config_value: str
    description: Optional[str]
    country: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


def _build_news_item_response(news_item) -> NewsItemPydantic:
    return NewsItemPydantic(
        id=news_item.id,
        title=news_item.title,
        summary=news_item.summary,
        url=news_item.url,
        published_at=news_item.published_at,
        source=NewsSourcePydantic(
            id=news_item.source.id,
            name=news_item.source.name,
            url=news_item.source.url,
        ),
        country=news_item.country,
        tags=news_item.tags or [],
        priority=news_item.priority,
    )


@router.get("", response_model=NewsItemResponse)
async def list_news(
    country: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    priority: Optional[int] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db_session),
):
    items, total = get_news_items(db, country=country, tag=tag, priority=priority, limit=limit, offset=offset)
    return NewsItemResponse(
        items=[_build_news_item_response(item) for item in items],
        total=total,
    )


@router.get("/{news_id}", response_model=NewsItemPydantic)
async def get_news_by_id(
    news_id: int,
    db: Session = Depends(get_db_session),
):
    news_item = get_news_item(db, news_id)
    if not news_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    return _build_news_item_response(news_item)


@router.post("", response_model=NewsItemPydantic, status_code=status.HTTP_201_CREATED)
async def create_news(
    news_data: NewsItemCreatePydantic,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    source = get_source_by_id(db, news_data.source_id)
    if not source:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid source_id")

    try:
        news_item = create_news_item(
            db,
            title=news_data.title,
            summary=news_data.summary,
            url=news_data.url,
            published_at=news_data.published_at,
            source_id=news_data.source_id,
            country=news_data.country,
            tags=news_data.tags,
            priority=news_data.priority,
        )
        return _build_news_item_response(news_item)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{news_id}", response_model=NewsItemPydantic)
async def update_news(
    news_id: int,
    news_data: NewsItemUpdatePydantic,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    existing = get_news_item(db, news_id)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")

    if news_data.source_id is not None:
        source = get_source_by_id(db, news_data.source_id)
        if not source:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid source_id")

    updated = update_news_item(
        db,
        news_id,
        title=news_data.title,
        summary=news_data.summary,
        url=news_data.url,
        published_at=news_data.published_at,
        source_id=news_data.source_id,
        country=news_data.country,
        tags=news_data.tags,
        priority=news_data.priority,
    )
    return _build_news_item_response(updated)


@router.delete("/{news_id}", response_model=DeleteResponse)
async def delete_news(
    news_id: int,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_admin),
):
    success = delete_news_item(db, news_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    return DeleteResponse(ok=True)


@router.post("/{news_id}/feedback", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    news_id: int,
    feedback_data: FeedbackCreateRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    news_item = get_news_item(db, news_id)
    if not news_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")

    valid_types = [ft.value for ft in FeedbackType]
    if feedback_data.feedback_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid feedback_type. Must be one of: {valid_types}",
        )

    feedback = add_feedback(
        db,
        user_id=current_user.id,
        article_id=news_id,
        feedback_type=feedback_data.feedback_type,
        comment=feedback_data.comment,
    )
    return FeedbackResponse(
        id=feedback.id,
        user_id=feedback.user_id,
        article_id=feedback.article_id,
        feedback_type=feedback.feedback_type,
        comment=feedback.comment,
        created_at=feedback.created_at,
    )


@router.post("/{news_id}/classify", response_model=NewsItemPydantic)
async def classify_news(
    news_id: int,
    scoring_data: ScoringConfigRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(require_analyst_or_admin),
):
    news_item = classify_and_score(
        db,
        news_id,
        relevance_score=scoring_data.relevance_score,
        impact_score=scoring_data.impact_score,
        regional_score=scoring_data.regional_score,
        classification_tags=scoring_data.classification_tags,
    )
    if not news_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="News item not found")
    return _build_news_item_response(news_item)
