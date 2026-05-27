from typing import Optional

from sqlalchemy.orm import Session

from backend.auth_service.models import User
from backend.auth_service.security import hash_password, verify_password


def create_user(db: Session, email: str, full_name: str, password: str) -> User:
    hashed = hash_password(password)
    user = User(
        email=email,
        full_name=full_name,
        hashed_password=hashed,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


def update_user_role(db: Session, user_id: int, role: str) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.role = role
    db.commit()
    db.refresh(user)
    return user


def deactivate_user(db: Session, user_id: int) -> Optional[User]:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user