import os
import sys
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.auth_service.api.auth import router as auth_router
from backend.auth_service.security import validate_jwt_secret
from backend.shared.db import engine, check_database_connection, SessionLocal
from backend.shared.models import Base


logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","service":"auth-service","message":"%(message)s"}',
)
logger = logging.getLogger(__name__)


REQUIRED_ENV_VARS = ["JWT_SECRET_KEY"]


def validate_environment() -> None:
    missing = [var for var in REQUIRED_ENV_VARS if not os.getenv(var)]
    if missing:
        logger.error(f"Missing required environment variables: {missing}")
        sys.exit(1)

    try:
        validate_jwt_secret()
    except ValueError as e:
        logger.error(f"JWT configuration error: {e}")
        sys.exit(1)


def create_tables() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting auth-service")
    validate_environment()

    if not check_database_connection():
        logger.error("Cannot connect to database")
        raise RuntimeError("Database connection failed")

    create_tables()
    logger.info("Auth-service startup complete")
    yield
    logger.info("Shutting down auth-service")


app = FastAPI(
    title="Auth Service",
    description="Authentication and user management service for Daily Pulse",
    version="1.0.0",
    lifespan=lifespan,
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


app.include_router(auth_router)


@app.get("/health", tags=["health"])
async def health_check():
    db_ok = check_database_connection()
    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "auth-service",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AUTH_SERVICE_PORT", "23002"))
    uvicorn.run(app, host="0.0.0.0", port=port)