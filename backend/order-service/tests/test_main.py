import pytest
from unittest.mock import MagicMock, AsyncMock, patch
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "order-service"))


def test_create_order_with_valid_items_and_stock_returns_201():
    from order_service.main import OrderService

    service = OrderService(MagicMock())
    service.check_stock = AsyncMock(return_value=True)

    result = None
    async def run():
        nonlocal result
        result = await service.create_order({
            'items': [{'productId': 'prod-1', 'quantity': 2}]
        }, 'user-uuid')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status'] == 'creado'
    assert 'id' in result


def test_create_order_with_insufficient_stock_returns_400():
    from order_service.main import OrderService

    service = OrderService(MagicMock())
    service.check_stock = AsyncMock(return_value=False)

    with pytest.raises(Exception) as exc_info:
        async def run():
            await service.create_order({
                'items': [{'productId': 'prod-1', 'quantity': 9999}]
            }, 'user-uuid')
        import asyncio
        asyncio.get_event_loop().run_until_complete(run())

    assert 'Insufficient stock' in str(exc_info.value)


def test_create_order_missing_items_field_returns_422():
    from order_service.main import OrderService

    service = OrderService(MagicMock())

    with pytest.raises(Exception) as exc_info:
        async def run():
            await service.create_order({}, 'user-uuid')
        import asyncio
        asyncio.get_event_loop().run_until_complete(run())

    assert exc_info.value.__class__.__name__ == 'ValidationError'


def test_get_order_by_id_returns_order_details():
    from order_service.main import OrderService

    mock_db = MagicMock()
    mock_db.find_order = AsyncMock(return_value={
        'id': 'order-uuid',
        'userId': 'user-uuid',
        'items': [],
        'status': 'creado',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    })

    service = OrderService(mock_db)
    result = None
    async def run():
        nonlocal result
        result = await service.get_order('order-uuid')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['id'] == 'order-uuid'


def test_get_order_by_invalid_id_returns_404():
    from order_service.main import OrderService

    mock_db = MagicMock()
    mock_db.find_order = AsyncMock(return_value=None)

    service = OrderService(mock_db)
    result = None
    async def run():
        nonlocal result
        result = await service.get_order('nonexistent-id')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result is None


def test_update_order_status_to_pagado_returns_200_and_status_updated():
    from order_service.main import OrderService

    mock_db = MagicMock()
    mock_db.update_status = AsyncMock(return_value={
        'id': 'order-uuid',
        'status': 'pagado'
    })

    service = OrderService(mock_db)
    result = None
    async def run():
        nonlocal result
        result = await service.update_status('order-uuid', 'pagado')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status'] == 'pagado'


def test_update_order_status_invalid_transition_returns_400():
    from order_service.main import OrderService

    service = OrderService(MagicMock())

    with pytest.raises(Exception) as exc_info:
        async def run():
            await service.update_status('order-uuid', 'creado')
        import asyncio
        asyncio.get_event_loop().run_until_complete(run())

    assert 'Invalid status transition' in str(exc_info.value)


def test_add_item_to_existing_order_returns_201_and_item_added():
    from order_service.main import OrderService

    mock_db = MagicMock()
    mock_db.add_item = AsyncMock(return_value={
        'id': 'item-uuid',
        'orderId': 'order-uuid',
        'productId': 'prod-3',
        'quantity': 1,
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    })

    service = OrderService(mock_db)
    service.check_stock = AsyncMock(return_value=True)

    result = None
    async def run():
        nonlocal result
        result = await service.add_item('order-uuid', {'productId': 'prod-3', 'quantity': 1})
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert 'id' in result
    assert result['productId'] == 'prod-3'


def test_add_item_to_order_with_insufficient_stock_returns_400():
    from order_service.main import OrderService

    mock_db = MagicMock()
    service = OrderService(mock_db)
    service.check_stock = AsyncMock(return_value=False)

    with pytest.raises(Exception) as exc_info:
        async def run():
            await service.add_item('order-uuid', {'productId': 'prod-3', 'quantity': 9999})
        import asyncio
        asyncio.get_event_loop().run_until_complete(run())

    assert 'Insufficient stock' in str(exc_info.value)


def test_get_order_history_by_user_returns_list_of_orders():
    from order_service.main import OrderService

    mock_db = MagicMock()
    mock_db.find_orders_by_user = AsyncMock(return_value=[])

    service = OrderService(mock_db)
    result = None
    async def run():
        nonlocal result
        result = await service.get_user_orders('user-uuid')
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert isinstance(result, list)