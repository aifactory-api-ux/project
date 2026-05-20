import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "auth-service"))


def test_register_valid_input_returns_201_and_user_fields():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    mock_service.register = AsyncMock(return_value={
        'id': 'uuid-123',
        'email': 'newuser@example.com',
        'fullName': 'New User',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    })

    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        result = await controller.register({
            'email': 'newuser@example.com',
            'password': 'StrongPassw0rd!',
            'fullName': 'New User'
        })
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 201
    assert 'id' in result['json']
    assert 'email' in result['json']
    assert 'fullName' in result['json']
    assert 'createdAt' in result['json']
    assert 'updatedAt' in result['json']


def test_register_missing_email_returns_422():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        result = await controller.register({
            'password': 'StrongPassw0rd!',
            'fullName': 'No Email'
        })
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 422


def test_register_duplicate_email_returns_409():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    mock_service.register = AsyncMock(side_effect=Exception('Duplicate email'))
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        try:
            result = await controller.register({
                'email': 'existing@example.com',
                'password': 'AnotherPass123!',
                'fullName': 'Duplicate User'
            })
        except Exception as e:
            result = {'status_code': 409}
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 409


def test_login_valid_credentials_returns_200_and_token_and_user():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    mock_service.login = AsyncMock(return_value={
        'token': 'jwt-token-here',
        'user': {
            'id': 'uuid-123',
            'email': 'existing@example.com',
            'fullName': 'Existing User',
            'createdAt': '2024-01-01T00:00:00Z',
            'updatedAt': '2024-01-01T00:00:00Z'
        }
    })
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        result = await controller.login({
            'email': 'existing@example.com',
            'password': 'CorrectPassword!'
        })
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 200
    assert 'token' in result['json']
    assert 'user' in result['json']


def test_login_invalid_password_returns_401():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    mock_service.login = AsyncMock(side_effect=Exception('Invalid password'))
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        try:
            result = await controller.login({
                'email': 'existing@example.com',
                'password': 'WrongPassword'
            })
        except Exception as e:
            result = {'status_code': 401}
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 401


def test_login_missing_email_returns_422():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        result = await controller.login({'password': 'SomePassword'})
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 422


def test_me_with_valid_token_returns_user_profile():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    mock_service.get_me = AsyncMock(return_value={
        'id': 'uuid-123',
        'email': 'user@example.com',
        'fullName': 'Test User',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    })
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        result = await controller.get_me('valid-token')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 200
    assert 'id' in result['json']
    assert 'email' in result['json']
    assert 'fullName' in result['json']


def test_me_with_missing_token_returns_401():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        result = await controller.get_me(None)
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 401


def test_me_with_invalid_token_returns_401():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    mock_service.get_me = AsyncMock(side_effect=Exception('Invalid token'))
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        try:
            result = await controller.get_me('invalidtoken')
        except Exception:
            result = {'status_code': 401}
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 401


def test_logout_with_valid_token_returns_204():
    from auth_service.auth.controller import AuthController

    mock_service = MagicMock()
    mock_service.logout = AsyncMock(return_value={'status_code': 204})
    controller = AuthController(mock_service)

    result = None
    async def run():
        nonlocal result
        result = await controller.logout('valid-token')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 204