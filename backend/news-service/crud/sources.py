from typing import Optional

from sqlalchemy.orm import Session

from backend.news_service.models import NewsSourceModel


def create_source(db: Session, name: str, url: str, country: str = "CL") -> NewsSourceModel:
    source = NewsSourceModel(
        name=name,
        url=url,
        country=country,
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return source


def get_sources(db: Session, skip: int = 0, limit: int = 100) -> list[NewsSourceModel]:
    return db.query(NewsSourceModel).offset(skip).limit(limit).all()


def get_source_by_id(db: Session, source_id: int) -> Optional[NewsSourceModel]:
    return db.query(NewsSourceModel).filter(NewsSourceModel.id == source_id).first()


def get_source_by_url(db: Session, url: str) -> Optional[NewsSourceModel]:
    return db.query(NewsSourceModel).filter(NewsSourceModel.url == url).first()


def delete_source(db: Session, source_id: int) -> bool:
    source = get_source_by_id(db, source_id)
    if not source:
        return False
    db.delete(source)
    db.commit()
    return True
