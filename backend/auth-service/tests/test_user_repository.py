import pytest
from unittest.mock import AsyncMock, MagicMock
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "auth-service"))


def test_create_user_persists_user_and_returns_user_object():
    from auth_service.auth.repository import UserRepository

    mock_db = MagicMock()
    mock_db.create = AsyncMock(return_value={
        'id': 'uuid-123',
        'email': 'repo_user@example.com',
        'passwordHash': 'hashedpassword',
        'fullName': 'Repo User',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    })

    repo = UserRepository(mock_db)
    result = None
    async def run():
        nonlocal result
        result = await repo.create_user({
            'email': 'repo_user@example.com',
            'passwordHash': 'hashedpassword',
            'fullName': 'Repo User'
        })
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    expected_fields = ['id', 'email', 'passwordHash', 'fullName', 'createdAt', 'updatedAt']
    for field in expected_fields:
        assert field in result


def test_get_user_by_email_returns_correct_user():
    from auth_service.auth.repository import UserRepository

    mock_db = MagicMock()
    mock_db.find_one = AsyncMock(return_value={
        'id': 'uuid-123',
        'email': 'repo_user@example.com',
        'passwordHash': 'hashedpassword',
        'fullName': 'Repo User',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    })

    repo = UserRepository(mock_db)
    result = None
    async def run():
        nonlocal result
        result = await repo.get_user_by_email('repo_user@example.com')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    expected_fields = ['id', 'email', 'passwordHash', 'fullName', 'createdAt', 'updatedAt']
    for field in expected_fields:
        assert field in result


def test_get_user_by_email_returns_none_for_nonexistent_email():
    from auth_service.auth.repository import UserRepository

    mock_db = MagicMock()
    mock_db.find_one = AsyncMock(return_value=None)

    repo = UserRepository(mock_db)
    result = None
    async def run():
        nonlocal result
        result = await repo.get_user_by_email('nonexistent@example.com')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result is None


def test_update_user_updates_fields_and_returns_updated_user():
    from auth_service.auth.repository import UserRepository

    mock_db = MagicMock()
    mock_db.update = AsyncMock(return_value={
        'id': 'uuid-123',
        'email': 'repo_user@example.com',
        'passwordHash': 'hashedpassword',
        'fullName': 'Updated Name',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-02T00:00:00Z'
    })

    repo = UserRepository(mock_db)
    result = None
    async def run():
        nonlocal result
        result = await repo.update_user('uuid-123', {'fullName': 'Updated Name'})
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    expected_fields = ['id', 'email', 'passwordHash', 'fullName', 'createdAt', 'updatedAt']
    for field in expected_fields:
        assert field in result
    assert result['fullName'] == 'Updated Name'


def test_delete_user_removes_user_from_database():
    from auth_service.auth.repository import UserRepository

    mock_db = MagicMock()
    mock_db.delete = AsyncMock(return_value=True)
    mock_db.find_by_id = AsyncMock(return_value=None)

    repo = UserRepository(mock_db)
    delete_result = None
    get_result = None

    async def run():
        nonlocal delete_result, get_result
        delete_result = await repo.delete_user('uuid-123')
        get_result = await repo.get_user_by_id('uuid-123')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert delete_result is True
    assert get_result is None