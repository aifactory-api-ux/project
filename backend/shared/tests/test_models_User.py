import re
import uuid
import pytest
from pathlib import Path

SHARED_MODELS_PATH = Path(__file__).parent.parent.parent / "shared" / "models" / "User.ts"

def validate_user(data: dict) -> tuple[bool, str | None]:
    required_fields = ['id', 'email', 'passwordHash', 'fullName', 'createdAt', 'updatedAt']
    for field in required_fields:
        if field not in data:
            return False, field

    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    if not uuid_pattern.match(data.get('id', '')):
        return False, 'id'

    email_pattern = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w+$')
    if not email_pattern.match(data.get('email', '')):
        return False, 'email'

    return True, None


def test_user_interface_accepts_valid_fields():
    user_data = {
        'id': 'uuid-string',
        'email': 'user@example.com',
        'passwordHash': 'hashedpassword',
        'fullName': 'Test User',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    }
    valid, error_field = validate_user(user_data)
    assert valid is True
    assert error_field is None


def test_user_interface_missing_required_field_raises_error():
    user_data = {
        'id': 'uuid-string',
        'passwordHash': 'hashedpassword',
        'fullName': 'Test User',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    }
    valid, error_field = validate_user(user_data)
    assert valid is False
    assert error_field == 'email'


def test_user_interface_invalid_uuid_format():
    user_data = {
        'id': 'not-a-uuid',
        'email': 'user@example.com',
        'passwordHash': 'hashedpassword',
        'fullName': 'Test User',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    }
    valid, error_field = validate_user(user_data)
    assert valid is False
    assert error_field == 'id'
