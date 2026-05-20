import re
from datetime import datetime
from pathlib import Path

def validate_session(data: dict) -> tuple[bool, str | None]:
    required_fields = ['id', 'userId', 'token', 'createdAt', 'expiresAt']
    for field in required_fields:
        if field not in data:
            return False, field

    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    if not uuid_pattern.match(data.get('id', '')):
        return False, 'id'

    if not uuid_pattern.match(data.get('userId', '')):
        return False, 'userId'

    try:
        datetime.fromisoformat(data.get('expiresAt', '').replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return False, 'expiresAt'

    return True, None


def test_session_interface_accepts_valid_fields():
    session_data = {
        'id': 'uuid-string',
        'userId': 'uuid-string',
        'token': 'sometoken',
        'createdAt': '2024-01-01T00:00:00Z',
        'expiresAt': '2024-01-02T00:00:00Z'
    }
    valid, error_field = validate_session(session_data)
    assert valid is True
    assert error_field is None


def test_session_interface_missing_token_raises_error():
    session_data = {
        'id': 'uuid-string',
        'userId': 'uuid-string',
        'createdAt': '2024-01-01T00:00:00Z',
        'expiresAt': '2024-01-02T00:00:00Z'
    }
    valid, error_field = validate_session(session_data)
    assert valid is False
    assert error_field == 'token'


def test_session_interface_expired_date_format():
    session_data = {
        'id': 'uuid-string',
        'userId': 'uuid-string',
        'token': 'sometoken',
        'createdAt': '2024-01-01T00:00:00Z',
        'expiresAt': 'not-a-date'
    }
    valid, error_field = validate_session(session_data)
    assert valid is False
    assert error_field == 'expiresAt'
