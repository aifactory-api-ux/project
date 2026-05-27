from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, ARRAY, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from backend.shared.models import Base


class NewsSourceModel(Base):
    __tablename__ = "news_sources"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    country: Mapped[str] = mapped_column(String(2), default="CL", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class NewsItemModel(Base):
    __tablename__ = "news_items"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False, unique=True, index=True)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(2), nullable=False, index=True)
    tags: Mapped[list] = mapped_column(ARRAY(String), default=list, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=2, nullable=False, index=True)
    source_id: Mapped[int] = mapped_column(Integer, ForeignKey("news_sources.id"), nullable=False)
    content_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    relevance_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    impact_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    regional_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    overall_score: Mapped[float | None] = mapped_column(Float, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    source: Mapped["NewsSourceModel"] = relationship("NewsSourceModel", backref="news_items")


class FeedbackModel(Base):
    __tablename__ = "feedback"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    article_id: Mapped[int] = mapped_column(Integer, ForeignKey("news_items.id"), nullable=False)
    feedback_type: Mapped[str] = mapped_column(String(50), nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    article: Mapped["NewsItemModel"] = relationship("NewsItemModel", backref="feedbacks")


class ScoringConfigModel(Base):
    __tablename__ = "scoring_config"
    __table_args__ = {"extend_existing": True}

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    config_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    config_value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    country: Mapped[str | None] = mapped_column(String(2), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
