from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.auth_service.crud.users import (
    create_user,
    get_user_by_email,
    authenticate_user,
)
from backend.auth_service.dependencies import get_current_user
from backend.auth_service.security import create_access_token, hash_password
from backend.auth_service.models import User
from backend.shared.db import get_db_session
from backend.shared.models import (
    UserPydantic,
    UserCreatePydantic,
    LoginRequest,
    TokenPydantic,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserPydantic, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreatePydantic,
    db: Session = Depends(get_db_session),
):
    existing = get_user_by_email(db, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = create_user(
        db,
        email=user_data.email,
        full_name=user_data.full_name,
        password=user_data.password,
    )

    return UserPydantic.model_validate(user)


@router.post("/login", response_model=TokenPydantic)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db_session),
):
    user = authenticate_user(db, login_data.email, login_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )

    return TokenPydantic(
        access_token=access_token,
        token_type="bearer",
    )


@router.get("/me", response_model=UserPydantic)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    return UserPydantic.model_validate(current_user)