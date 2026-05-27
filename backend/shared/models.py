from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from enum import Enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Text, Float, ARRAY
from sqlalchemy.orm import DeclarativeBase, relationship, Mapped, mapped_column
from typing_extensions import Annotated


class UserRole(str, Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class NewsPriority(int, Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class FeedbackType(str, Enum):
    CORRECT = "correct"
    INCORRECT = "incorrect"
    SPAM = "spam"
    DUPLICATE = "duplicate"


class CountryCode(str, Enum):
    CL = "CL"
    AR = "AR"
    CO = "CO"
    BR = "BR"
    PE = "PE"
    UY = "UY"


class Base(DeclarativeBase):
    pass


user_feedback_table = Table(
    "user_feedback",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("feedback_id", Integer, ForeignKey("feedback.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default=UserRole.VIEWER.value, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class NewsSource(Base):
    __tablename__ = "news_sources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    country: Mapped[str] = mapped_column(String(2), default=CountryCode.CL.value, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class NewsItem(Base):
    __tablename__ = "news_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False, unique=True, index=True)
    published_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    country: Mapped[str] = mapped_column(String(2), nullable=False, index=True)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), default=list, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=NewsPriority.MEDIUM.value, nullable=False, index=True)
    source_id: Mapped[int] = mapped_column(Integer, ForeignKey("news_sources.id"), nullable=False)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    relevance_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    impact_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    regional_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    source: Mapped["NewsSource"] = relationship("NewsSource", backref="news_items")


class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    article_id: Mapped[int] = mapped_column(Integer, ForeignKey("news_items.id"), nullable=False)
    feedback_type: Mapped[str] = mapped_column(String(50), nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", backref="feedbacks")
    article: Mapped["NewsItem"] = relationship("NewsItem", backref="feedbacks")


class ScoringConfig(Base):
    __tablename__ = "scoring_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    config_key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    config_value: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    country: Mapped[Optional[str]] = mapped_column(String(2), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class NewsSourcePydantic(BaseModel):
    id: int
    name: str
    url: str

    class Config:
        from_attributes = True


class NewsItemPydantic(BaseModel):
    id: int
    title: str
    summary: str
    url: str
    published_at: datetime
    source: NewsSourcePydantic
    country: str
    tags: List[str]
    priority: int

    class Config:
        from_attributes = True


class NewsItemCreatePydantic(BaseModel):
    title: str
    summary: str
    url: str
    published_at: datetime
    source_id: int
    country: str
    tags: List[str]
    priority: int


class NewsItemUpdatePydantic(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    url: Optional[str] = None
    published_at: Optional[datetime] = None
    source_id: Optional[int] = None
    country: Optional[str] = None
    tags: Optional[List[str]] = None
    priority: Optional[int] = None


class UserPydantic(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool

    class Config:
        from_attributes = True


class UserCreatePydantic(BaseModel):
    email: str
    full_name: str
    password: str


class TokenPydantic(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    email: str
    password: str


class SourceCreateRequest(BaseModel):
    name: str
    url: str


class NewsItemResponse(BaseModel):
    items: List[NewsItemPydantic]
    total: int


class DeleteResponse(BaseModel):
    ok: bool


SCORING_WEIGHTS = {
    "relevance": 0.4,
    "impact": 0.35,
    "regional": 0.25,
}

PRIORITY_THRESHOLDS = {
    NewsPriority.LOW: (0.0, 0.3),
    NewsPriority.MEDIUM: (0.3, 0.6),
    NewsPriority.HIGH: (0.6, 0.8),
    NewsPriority.CRITICAL: (0.8, 1.0),
}

SUPPORTED_COUNTRIES = [c.value for c in CountryCode]

COUNTRY_NAMES = {
    CountryCode.CL.value: "Chile",
    CountryCode.AR.value: "Argentina",
    CountryCode.CO.value: "Colombia",
    CountryCode.BR.value: "Brasil",
    CountryCode.PE.value: "Perú",
    CountryCode.UY.value: "Uruguay",
}
