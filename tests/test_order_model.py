import pytest
from unittest.mock import Mock, MagicMock, patch, AsyncMock, call
from decimal import Decimal
from datetime import datetime
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.src.models.order import (
    createOrder,
    findByUserId,
    findById,
    getOrderItems
)


class TestCreateOrder:
    """Tests for createOrder function"""

    @pytest.fixture
    def mock_client(self):
        """"Create a mock database client"""
        client = MagicMock()
        client.query = AsyncMock()
        return client

    @pytest.fixture
    def sample_cart_items(self):
        """"Sample cart items for testing"""
        return [
            {'productId': 1, 'quantity': 2},
            {'productId': 2, 'quantity': 1}
        ]

    @pytest.fixture
    def sample_products_result(self):
        """Sample products query result"""
        result = MagicMock()
        result.rows = [
            {'id': 1, 'price': '10.50', 'stock': 100},
            {'id': 2, 'price': '25.00', 'stock': 50}
        ]
        return result

    @pytest.fixture
    def sample_order_insert_result(self):
        """Sample order insert query result"""
        result = MagicMock()
        result.rows = [{
            'id': 1,
            'userId': 1,
            'total': '46.00',
            'status': 'pending',
            'createdAt': datetime(2024, 1, 15, 10, 30, 0),
            'updatedAt': datetime(2024, 1, 15, 10, 30, 0)
        }]
        return result

    @patch('backend.src.models.order.transaction')
    async def test_create_order_success(self, mock_transaction, mock_client, sample_cart_items, sample_products_result, sample_order_insert_result):
        """Test successful order creation"""
        mock_transaction.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_transaction.return_value.__aexit__ = AsyncMock(return_value=None)

        mock_client.query.side_effect = [
            sample_products_result,
            sample_order_insert_result,
            MagicMock(),
            MagicMock(),
            MagicMock()
        ]

        result = await createOrder(1, sample_cart_items)

        assert result['id'] == 1
        assert result['userId'] == 1
        assert result['status'] == 'pending'
        assert result['total'] == 46.00
        assert len(result['items']) == 2
        assert result['items'][0]['productId'] == 1
        assert result['items'][0]['quantity'] == 2
        assert 'createdAt' in result
        assert 'updatedAt' in result

    @patch('backend.src.models.order.transaction')
    async def test_create_order_with_insufficient_stock(self, mock_transaction, mock_client, sample_products_result):
        """Test order creation fails when stock is insufficient"""
        mock_transaction.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_transaction.return_value.__aexit__ = AsyncMock(return_value=None)

        result_low_stock = MagicMock()
        result_low_stock.rows = [
            {'id': 1, 'price': '10.50', 'stock': 1},
            {'id': 2, 'price': '25.00', 'stock': 50}
        ]
        mock_client.query.return_value = result_low_stock

        with pytest.raises(Error, match='Not enough stock for product 1'):
            await createOrder(1, sample_cart_items)

    @patch('backend.src.models.order.transaction')
    async def test_create_order_product_not_found(self, mock_transaction, mock_client):
        """Test order creation fails when product doesn't exist"""
        mock_transaction.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_transaction.return_value.__aexit__ = AsyncMock(return_value=None)

        result_empty = MagicMock()
        result_empty.rows = []
        mock_client.query.return_value = result_empty

        with pytest.raises(Error, match='Product 999 not found'):
            await createOrder(1, [{'productId': 999, 'quantity': 1}])

    @patch('backend.src.models.order.transaction')
    async def test_create_order_calculates_total_correctly(self, mock_transaction, mock_client, sample_order_insert_result):
        """Test that total is calculated correctly"""
        mock_transaction.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_transaction.return_value.__aexit__ = AsyncMock(return_value=None)

        products_result = MagicMock()
        products_result.rows = [
            {'id': 1, 'price': '10.00', 'stock': 100},
            {'id': 2, 'price': '20.00', 'stock': 50}
        ]
        order_result = MagicMock()
        order_result.rows = [{
            'id': 1,
            'userId': 1,
            'total': '40.00',
            'status': 'pending',
            'createdAt': datetime.now(),
            'updatedAt': datetime.now()
        }]

        mock_client.query.side_effect = [
            products_result,
            order_result,
            MagicMock(),
            MagicMock(),
            MagicMock()
        ]

        items = [{'productId': 1, 'quantity': 2}, {'productId': 2, 'quantity': 1}]
        result = await createOrder(1, items)

        assert result['total'] == 40.00

    @patch('backend.src.models.order.transaction')
    async def test_create_order_updates_product_stock(self, mock_transaction, mock_client, sample_products_result, sample_order_insert_result):
        """Test that product stock is decremented after order creation"""
        mock_transaction.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_transaction.return_value.__aexit__ = AsyncMock(return_value=None)

        mock_client.query.side_effect = [
            sample_products_result,
            sample_order_insert_result,
            MagicMock(),
            MagicMock(),
            MagicMock()
        ]

        items = [{'productId': 1, 'quantity': 2}]
        await createOrder(1, items)

        update_calls = [c for c in mock_client.query.call_args_list if 'UPDATE' in str(c)]
        assert len(update_calls) == 1

    @patch('backend.src.models.order.transaction')
    async def test_create_order_with_empty_items(self, mock_transaction, mock_client):
        """Test order creation with empty items array"""
        mock_transaction.return_value.__aenter__ = AsyncMock(return_value=mock_client)
        mock_transaction.return_value.__aexit__ = AsyncMock(return_value=None)

        result_empty = MagicMock()
        result_empty.rows = []
        mock_client.query.return_value = result_empty

        with pytest.raises(Error, match='Product .* not found'):
            await createOrder(1, [])


class TestFindByUserId:
    """Tests for findByUserId function"""

    @pytest.fixture
    def sample_orders_result(self):
        """Sample orders query result"""
        result = MagicMock()
        result.rows = [
            {
                'id': 1,
                'userId': 1,
                'total': '100.00',
                'status': 'paid',
                'createdAt': datetime(2024, 1, 15, 10, 30, 0),
                'updatedAt': datetime(2024, 1, 15, 10, 30, 0)
            },
            {
                'id': 2,
                'userId': 1,
                'total': '50.00',
                'status': 'pending',
                'createdAt': datetime(2024, 1, 14, 10, 30, 0),
                'updatedAt': datetime(2024, 1, 14, 10, 30, 0)
            }
        ]
        return result

    @patch('backend.src.models.order.query')
    @patch('backend.src.models.order.getOrderItems')
    async def test_find_by_user_id_returns_orders(self, mock_get_items, mock_query, sample_orders_result):
        """Test retrieving orders for a user"""
        mock_query.return_value = sample_orders_result
        mock_get_items.side_effect = [
            [{'productId': 1, 'quantity': 2}],
            [{'productId': 2, 'quantity': 1}]
        ]

        result = await findByUserId(1)

        assert len(result) == 2
        assert result[0]['id'] == 1
        assert result[1]['id'] == 2
        assert result[0]['total'] == 100.00
        assert result[1]['total'] == 50.00

    @patch('backend.src.models.order.query')
    @patch('backend.src.models.order.getOrderItems')
    async def test_find_by_user_id_returns_empty_when_no_orders(self, mock_get_items, mock_query):
        """Test retrieving orders when user has no orders"""
        result_empty = MagicMock()
        result_empty.rows = []
        mock_query.return_value = result_empty

        result = await findByUserId(999)

        assert len(result) == 0
        assert isinstance(result, list)

    @patch('backend.src.models.order.query')
    @patch('backend.src.models.order.getOrderItems')
    async def test_find_by_user_id_orders_ordered_by_created_at_desc(self, mock_get_items, mock_query, sample_orders_result):
        """Test that orders are returned in descending order by created_at"""
        mock_query.return_value = sample_orders_result
        mock_get_items.return_value = []

        result = await findByUserId(1)

        assert result[0]['id'] == 1
        assert result[1]['id'] == 2

    @patch('backend.src.models.order.query')
    @patch('backend.src.models.order.getOrderItems')
    async def test_find_by_user_id_parses_total_as_float(self, mock_get_items, mock_query, sample_orders_result):
        """Test that total is parsed as float from string"""
        mock_query.return_value = sample_orders_result
        mock_get_items.return_value = []

        result = await findByUserId(1)

        assert isinstance(result[0]['total'], float)
        assert result[0]['total'] == 100.00



class TestFindById:
    """Tests for findById function"""

    @pytest.fixture
    def sample_order_result(self):
        """Sample order query result"""
        result = MagicMock()
        result.rows = [{
            'id': 1,
            'userId': 1,
            'total': '100.00',
            'status': 'paid',
            'createdAt': datetime(2024, 1, 15, 10, 30, 0),
            'updatedAt': datetime(2024, 1, 15, 10, 30, 0)
        }]
        result.rowCount = 1
        return result

    @patch('backend.src.models.order.query')
    @patch('backend.src.models.order.getOrderItems')
    async def test_find_by_id_returns_order(self, mock_get_items, mock_query, sample_order_result):
        """Test retrieving a single order by ID"""
        mock_query.return_value = sample_order_result
        mock_get_items.return_value = [{'productId': 1, 'quantity': 2}]


        result = await findById(1)


        assert result is not None
        assert result['id'] == 1
        assert result['userId'] == 1
        assert result['total'] == 100.00
        assert result['status'] == 'paid'

    @patch('backend.src.models.order.query')
    async def test_find_by_id_returns_null_when_not_found(self, mock_query):
        """Test that findById returns null for non-existent order"""
        result_empty = MagicMock()
        result_empty.rows = []
        result_empty.rowCount = 0
        mock_query.return_value = result_empty

        result = await findById(999)


        assert result is None

    @patch('backend.src.models.order.query')
    @patch('backend.src.models.order.getOrderItems')
    async def test_find_by_id_includes_items(self, mock_get_items, mock_query, sample_order_result):
        """Test that order includes items"""
        mock_query.return_value = sample_order_result
        expected_items = [{'productId': 1, 'quantity': 2}, {'productId': 2, 'quantity': 1}]
        mock_get_items.return_value = expected_items

        result = await findById(1)

        assert 'items' in result
        assert len(result['items']) == 2


class TestGetOrderItems:
    """Tests for getOrderItems function"""

    @pytest.fixture
    def sample_items_result(self):
        """Sample order items query result"""
        result = MagicMock()
        result.rows = [
            {'productId': 1, 'quantity': 2},
            {'productId': 2, 'quantity': 3}
        ]
        return result

    @patch('backend.src.models.order.query')
    async def test_get_order_items_returns_items(self, mock_query, sample_items_result):
        """Test retrieving order items"""
        mock_query.return_value = sample_items_result

        result = await getOrderItems(1)

        assert len(result) == 2
        assert result[0]['productId'] == 1
        assert result[0]['quantity'] == 2
        assert result[1]['productId'] == 2
        assert result[1]['quantity'] == 3

    @patch('backend.src.models.order.query')
    async def test_get_order_items_returns_empty_for_empty_order(self, mock_query):
        """Test retrieving items for order with no items"""
        result_empty = MagicMock()
        result_empty.rows = []
        mock_query.return_value = result_empty

        result = await getOrderItems(1)

        assert len(result) == 0
        assert isinstance(result, list)

    @patch('backend.src.models.order.query')
    async def test_get_order_items_uses_correct_query(self, mock_query, sample_items_result):
        """Test that correct SQL query is used"""
        mock_query.return_value = sample_items_result

        await getOrderItems(42)

        mock_query.assert_called_once()
        call_args = mock_query.call_args
        assert 'order_items' in str(call_args)
        assert call_args[0][1] == [42]
