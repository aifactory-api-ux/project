import pytest
from unittest.mock import MagicMock
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "auth-service"))


def test_hash_password_generates_different_hashes_for_same_password():
    from auth_service.auth.service import AuthService

    service = AuthService(MagicMock())
    password = 'MySecret123!'

    hash1 = service.hash_password(password)
    hash2 = service.hash_password(password)

    assert hash1 != hash2


def test_verify_password_returns_true_for_correct_password():
    from auth_service.auth.service import AuthService

    service = AuthService(MagicMock())
    password = 'MySecret123!'
    hash_value = service.hash_password(password)

    result = service.verify_password(password, hash_value)
    assert result is True


def test_verify_password_returns_false_for_wrong_password():
    from auth_service.auth.service import AuthService

    service = AuthService(MagicMock())
    password = 'MySecret123!'
    hash_value = service.hash_password(password)

    result = service.verify_password('WrongPassword', hash_value)
    assert result is False


def test_generate_jwt_contains_user_id_and_email():
    from auth_service.auth.service import AuthService

    service = AuthService(MagicMock())
    user = {'id': 'uuid-123', 'email': 'user@example.com'}

    token = service.generate_jwt(user)

    assert 'uuid-123' in token
    assert 'user@example.com' in token


def test_validate_jwt_with_valid_token_returns_payload():
    from auth_service.auth.service import AuthService

    service = AuthService(MagicMock())
    user = {'id': 'uuid-123', 'email': 'user@example.com'}
    token = service.generate_jwt(user)

    payload = service.validate_jwt(token)

    assert 'id' in payload
    assert 'email' in payload


def test_validate_jwt_with_invalid_token_raises_exception():
    from auth_service.auth.service import AuthService

    service = AuthService(MagicMock())

    with pytest.raises(Exception):
        service.validate_jwt('invalid.token.value')


def test_rbac_allows_admin_to_manage_users():
    from auth_service.auth.service import AuthService

    service = AuthService(MagicMock())
    user = {'id': 'uuid-admin', 'email': 'admin@example.com', 'roles': ['admin']}

    allowed = service.check_permission(user, 'delete_user')
    assert allowed is True


def test_rbac_denies_non_admin_to_manage_users():
    from auth_service.auth.service import AuthService

    service = AuthService(MagicMock())
    user = {'id': 'uuid-user', 'email': 'user@example.com', 'roles': ['user']}

    allowed = service.check_permission(user, 'delete_user')
    assert allowed is False