from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.news_service.crud.sources import create_source, get_sources, get_source_by_id, get_source_by_url
from backend.news_service.dependencies import get_current_user
from backend.auth_service.models import User
from backend.shared.db import get_db_session
from backend.shared.models import NewsSourcePydantic, SourceCreateRequest


router = APIRouter(prefix="/api/sources", tags=["sources"])


@router.get("", response_model=list[NewsSourcePydantic])
async def list_sources(
    db: Session = Depends(get_db_session),
):
    sources = get_sources(db)
    return [
        NewsSourcePydantic(
            id=s.id,
            name=s.name,
            url=s.url,
        )
        for s in sources
    ]


@router.post("", response_model=NewsSourcePydantic, status_code=status.HTTP_201_CREATED)
async def create_news_source(
    source_data: SourceCreateRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
):
    existing = get_source_by_url(db, source_data.url)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source with this URL already exists",
        )

    source = create_source(
        db,
        name=source_data.name,
        url=source_data.url,
    )
    return NewsSourcePydantic(
        id=source.id,
        name=source.name,
        url=source.url,
    )
