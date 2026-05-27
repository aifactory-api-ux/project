import pytest
from datetime import datetime
from typing import List

from backend.shared.models import (
    UserPydantic,
    UserCreatePydantic,
    NewsSourcePydantic,
    NewsItemPydantic,
    NewsItemCreatePydantic,
    NewsItemUpdatePydantic,
    TokenPydantic,
    LoginRequest,
    SourceCreateRequest,
    NewsItemResponse,
    DeleteResponse,
    UserRole,
    NewsPriority,
    FeedbackType,
    CountryCode,
    SCORING_WEIGHTS,
    PRIORITY_THRESHOLDS,
    SUPPORTED_COUNTRIES,
    COUNTRY_NAMES,
)
from backend.shared.utils import (
    hash_password,
    verify_password,
    compute_content_hash,
    normalize_text,
    normalize_url,
    extract_domain_from_url,
    calculate_overall_score,
    priority_from_score,
    similarity_score,
    parse_tags,
    validate_url,
    sanitize_string,
)


class TestPydanticModels:
    def test_user_pydantic(self):
        user = UserPydantic(
            id=1,
            email="test@example.com",
            full_name="Test User",
            is_active=True
        )
        assert user.id == 1
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.is_active is True

    def test_user_create_pydantic(self):
        user_create = UserCreatePydantic(
            email="test@example.com",
            full_name="Test User",
            password="securepassword123"
        )
        assert user_create.email == "test@example.com"
        assert user_create.password == "securepassword123"

    def test_news_source_pydantic(self):
        source = NewsSourcePydantic(id=1, name="El Mercurio", url="https://www.elmercurio.cl")
        assert source.id == 1
        assert source.name == "El Mercurio"
        assert source.url == "https://www.elmercurio.cl"

    def test_news_item_pydantic(self):
        source = NewsSourcePydantic(id=1, name="El Mercurio", url="https://www.elmercurio.cl")
        news_item = NewsItemPydantic(
            id=1,
            title="Breaking News",
            summary="A major event happened",
            url="https://www.elmercurio.cl/news/123",
            published_at=datetime(2024, 1, 15, 10, 30, 0),
            source=source,
            country="CL",
            tags=["economy", "retail"],
            priority=2
        )
        assert news_item.id == 1
        assert news_item.title == "Breaking News"
        assert news_item.priority == 2
        assert news_item.source.name == "El Mercurio"

    def test_news_item_create_pydantic(self):
        news_create = NewsItemCreatePydantic(
            title="New Article",
            summary="Article summary",
            url="https://example.com/article",
            published_at=datetime(2024, 1, 15, 10, 30, 0),
            source_id=1,
            country="CL",
            tags=["news"],
            priority=1
        )
        assert news_create.title == "New Article"
        assert news_create.source_id == 1

    def test_news_item_update_pydantic(self):
        news_update = NewsItemUpdatePydantic(
            title="Updated Title",
            priority=3
        )
        assert news_update.title == "Updated Title"
        assert news_update.priority == 3
        assert news_update.summary is None

    def test_token_pydantic(self):
        token = TokenPydantic(access_token="abc123", token_type="bearer")
        assert token.access_token == "abc123"
        assert token.token_type == "bearer"

    def test_login_request(self):
        login = LoginRequest(email="user@example.com", password="password123")
        assert login.email == "user@example.com"
        assert login.password == "password123"

    def test_source_create_request(self):
        source_req = SourceCreateRequest(name="CNN", url="https://www.cnn.cl")
        assert source_req.name == "CNN"
        assert source_req.url == "https://www.cnn.cl"

    def test_news_item_response(self):
        source = NewsSourcePydantic(id=1, name="El Mercurio", url="https://www.elmercurio.cl")
        news_item = NewsItemPydantic(
            id=1,
            title="News",
            summary="Summary",
            url="https://example.com",
            published_at=datetime(2024, 1, 15),
            source=source,
            country="CL",
            tags=[],
            priority=1
        )
        response = NewsItemResponse(items=[news_item], total=1)
        assert len(response.items) == 1
        assert response.total == 1

    def test_delete_response(self):
        response = DeleteResponse(ok=True)
        assert response.ok is True


class TestEnums:
    def test_user_roles(self):
        assert UserRole.ADMIN.value == "admin"
        assert UserRole.ANALYST.value == "analyst"
        assert UserRole.VIEWER.value == "viewer"

    def test_news_priority(self):
        assert NewsPriority.LOW.value == 1
        assert NewsPriority.MEDIUM.value == 2
        assert NewsPriority.HIGH.value == 3
        assert NewsPriority.CRITICAL.value == 4

    def test_feedback_type(self):
        assert FeedbackType.CORRECT.value == "correct"
        assert FeedbackType.INCORRECT.value == "incorrect"
        assert FeedbackType.SPAM.value == "spam"
        assert FeedbackType.DUPLICATE.value == "duplicate"

    def test_country_code(self):
        assert CountryCode.CL.value == "CL"
        assert CountryCode.AR.value == "AR"
        assert CountryCode.CO.value == "CO"
        assert CountryCode.BR.value == "BR"
        assert CountryCode.PE.value == "PE"
        assert CountryCode.UY.value == "UY"


class TestConstants:
    def test_scoring_weights(self):
        assert SCORING_WEIGHTS["relevance"] == 0.4
        assert SCORING_WEIGHTS["impact"] == 0.35
        assert SCORING_WEIGHTS["regional"] == 0.25

    def test_priority_thresholds(self):
        assert NewsPriority.LOW in PRIORITY_THRESHOLDS
        assert NewsPriority.CRITICAL in PRIORITY_THRESHOLDS

    def test_supported_countries(self):
        assert "CL" in SUPPORTED_COUNTRIES
        assert "BR" in SUPPORTED_COUNTRIES
        assert len(SUPPORTED_COUNTRIES) == 6

    def test_country_names(self):
        assert COUNTRY_NAMES["CL"] == "Chile"
        assert COUNTRY_NAMES["BR"] == "Brasil"


class TestPasswordUtils:
    def test_hash_password(self):
        password = "mysecurepassword"
        hashed = hash_password(password)
        assert hashed != password
        assert len(hashed) > 0

    def test_verify_password_correct(self):
        password = "mysecurepassword"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        password = "mysecurepassword"
        hashed = hash_password(password)
        assert verify_password("wrongpassword", hashed) is False


class TestUtils:
    def test_compute_content_hash(self):
        hash1 = compute_content_hash("Title", "Summary", "https://example.com")
        hash2 = compute_content_hash("title", "summary", "https://example.com")
        assert hash1 == hash2
        assert len(hash1) == 64

    def test_normalize_text(self):
        text = "  Hello   World  "
        normalized = normalize_text(text)
        assert normalized == "hello world"

    def test_normalize_url(self):
        url = "  HTTPS://WWW.EXAMPLE.COM/  "
        normalized = normalize_url(url)
        assert normalized == "example.com/"

    def test_extract_domain_from_url(self):
        domain = extract_domain_from_url("https://www.elmercurio.cl/news")
        assert domain == "www.elmercurio.cl"

    def test_calculate_overall_score_default_weights(self):
        score = calculate_overall_score(0.8, 0.6, 0.7)
        expected = 0.8 * 0.4 + 0.6 * 0.35 + 0.7 * 0.25
        assert abs(score - expected) < 0.0001

    def test_calculate_overall_score_custom_weights(self):
        score = calculate_overall_score(0.8, 0.6, 0.7, {"relevance": 0.5, "impact": 0.3, "regional": 0.2})
        expected = 0.8 * 0.5 + 0.6 * 0.3 + 0.7 * 0.2
        assert abs(score - expected) < 0.0001

    def test_priority_from_score(self):
        assert priority_from_score(0.1) == 1
        assert priority_from_score(0.4) == 2
        assert priority_from_score(0.7) == 3
        assert priority_from_score(0.9) == 4

    def test_similarity_score(self):
        score = similarity_score("hello world", "hello world")
        assert score == 1.0

        score = similarity_score("hello world", "hello")
        assert 0 < score < 1

        score = similarity_score("abc", "xyz")
        assert score == 0.0

    def test_parse_tags_from_string(self):
        tags = parse_tags("economy, retail, market")
        assert tags == ["economy", "retail", "market"]

    def test_parse_tags_from_list(self):
        tags = parse_tags(["Economy", "RETAIL"])
        assert tags == ["economy", "retail"]

    def test_validate_url_valid(self):
        assert validate_url("https://www.example.com") is True
        assert validate_url("http://example.cl/news") is True

    def test_validate_url_invalid(self):
        assert validate_url("not-a-url") is False
        assert validate_url("") is False

    def test_sanitize_string(self):
        sanitized = sanitize_string("<script>alert('xss')</script>Hello World")
        assert "<script>" not in sanitized
        assert "Hello World" in sanitized

    def test_sanitize_string_max_length(self):
        long_text = "a" * 1000
        sanitized = sanitize_string(long_text, max_length=100)
        assert len(sanitized) == 100
