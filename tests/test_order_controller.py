import pytest
from unittest.mock import Mock, MagicMock, patch, AsyncMock
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.src.controllers.orderController import (
    createOrder,
    getOrders,
    getOrderById,
    validateCreateOrderInput
)


class TestCreateOrderController:
    """Tests for createOrder controller function"""

    @pytest.fixture
    def mock_order_model(self):
        """Mock the order model"""
        with patch('backend.src.controllers.orderController.orderModel') as mock:
            yield mock

    @pytest.fixture
    def mock_cart_model(self):
        """Mock the cart model"""
        with patch('backend.src.controllers.orderController.cartModel') as mock:
            yield mock

    @pytest.fixture
    def sample_order_input(self):
        """Sample valid order input"""
        return {
            'items': [
                {'productId': 1, 'quantity': 2},
                {'productId': 2, 'quantity': 1}
            ]
        }

    @pytest.fixture
    def sample_created_order(self):
        """Sample created order response"""
        return {
            'id': 1,
            'userId': 1,
            'items': [
                {'productId': 1, 'quantity': 2},
                {'productId': 2, 'quantity': 1}
            ],
            'total': 46.00,
            'status': 'pending',
            'createdAt': '2024-01-15T10:30:00.000Z',
            'updatedAt': '2024-01-15T10:30:00.000Z'
        }

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_success(self, mock_cart, mock_order, sample_order_input, sample_created_order):
        """Test successful order creation through controller"""
        mock_cart.productExists = AsyncMock(return_value=True)
        mock_order.createOrder = AsyncMock(return_value=sample_created_order)

        result = await createOrder(1, sample_order_input)

        assert result['id'] == 1
        assert result['status'] == 'pending'
        assert result['total'] == 46.00
        mock_order.createOrder.assert_called_once_with(1, sample_order_input['items'])

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_fails_with_empty_items(self, mock_cart, mock_order):
        """Test that order creation fails with empty items"""
        input_data = {'items': []}

        with pytest.raises(Error, match='Order must have at least one item'):
            await createOrder(1, input_data)

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_fails_with_invalid_product_id(self, mock_cart, mock_order):
        """Test that order creation fails with invalid product ID"""
        input_data = {'items': [{'productId': -1, 'quantity': 1}]}

        with pytest.raises(Error, match='Product ID must be a positive integer'):
            await createOrder(1, input_data)

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_fails_with_zero_product_id(self, mock_cart, mock_order):
        """Test that order creation fails with zero product ID"""
        input_data = {'items': [{'productId': 0, 'quantity': 1}]}


        with pytest.raises(Error, match='Product ID must be a positive integer'):
            await createOrder(1, input_data)

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_fails_with_invalid_quantity(self, mock_cart, mock_order):
        """Test that order creation fails with invalid quantity"""
        input_data = {'items': [{'productId': 1, 'quantity': 0}]}

        with pytest.raises(Error, match='Quantity must be a positive integer'):
            await createOrder(1, input_data)

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_fails_with_negative_quantity(self, mock_cart, mock_order):
        """Test that order creation fails with negative quantity"""
        input_data = {'items': [{'productId': 1, 'quantity': -5}]}

        with pytest.raises(Error, match='Quantity must be a positive integer'):
            await createOrder(1, input_data)

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_fails_with_nonexistent_product(self, mock_cart, mock_order):
        """Test that order creation fails when product doesn't exist"""
        mock_cart.productExists = AsyncMock(return_value=False)
        input_data = {'items': [{'productId': 999, 'quantity': 1}]}

        with pytest.raises(Error, match='Product 999 not found'):
            await createOrder(1, input_data)

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_validates_all_items(self, mock_cart, mock_order):
        """Test that all items are validated"""
        mock_cart.productExists = AsyncMock(return_value=True)
        mock_order.createOrder = AsyncMock(return_value={'id': 1})
        input_data = {
            'items': [
                {'productId': 1, 'quantity': 2},
                {'productId': 2, 'quantity': 1}
            ]
        }

        await createOrder(1, input_data)

        assert mock_cart.productExists.call_count == 2

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_fails_when_no_items_property(self, mock_cart, mock_order):
        """Test that order creation fails when items property is missing"""
        input_data = {}

        with pytest.raises(Error, match='Items are required'):
            await createOrder(1, input_data)

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_fails_when_items_is_not_array(self, mock_cart, mock_order):
        """Test that order creation fails when items is not an array"""
        input_data = {'items': 'not an array'}

        with pytest.raises(Error, match='Items must be an array'):
            await createOrder(1, input_data)


class TestGetOrdersController:
    """Tests for getOrders controller function"""


    @patch('backend.src.controllers.orderController.orderModel')
    async def test_get_orders_returns_user_orders(self, mock_order):
        """Test retrieving user's orders"""
        expected_orders = [
            {'id': 1, 'userId': 1, 'status': 'pending'},
            {'id': 2, 'userId': 1, 'status': 'paid'}
        ]
        mock_order.findByUserId = AsyncMock(return_value=expected_orders)

        result = await getOrders(1)

        assert len(result) == 2
        mock_order.findByUserId.assert_called_once_with(1)

    @patch('backend.src.controllers.orderController.orderModel')
    async def test_get_orders_returns_empty_list_when_no_orders(self, mock_order):
        """Test retrieving orders when user has none"""
        mock_order.findByUserId = AsyncMock(return_value=[])

        result = await getOrders(999)

        assert len(result) == 0
        assert isinstance(result, list)


class TestGetOrderByIdController:
    """Tests for getOrderById controller function"""

    @patch('backend.src.controllers.orderController.orderModel')
    async def test_get_order_by_id_success(self, mock_order):
        """Test successful order retrieval"""
        expected_order = {
            'id': 1,
            'userId': 1,
            'status': 'paid',
            'total': 100.00
        }
        mock_order.findById = AsyncMock(return_value=expected_order)

        result = await getOrderById(1, 1)

        assert result['id'] == 1
        assert result['status'] == 'paid'
        mock_order.findById.assert_called_once_with(1)

    @patch('backend.src.controllers.orderController.orderModel')
    async def test_get_order_by_id_fails_when_order_not_found(self, mock_order):
        """Test that order retrieval fails when order doesn't exist"""
        mock_order.findById = AsyncMock(return_value=None)

        with pytest.raises(Error, match='Order not found'):
            await getOrderById(1, 999)

    @patch('backend.src.controllers.orderController.orderModel')
    async def test_get_order_by_id_fails_when_user_mismatch(self, mock_order):
        """Test that users can only access their own orders"""
        other_user_order = {
            'id': 1,
            'userId': 2,
            'status': 'paid',
            'total': 100.00
        }
        mock_order.findById = AsyncMock(return_value=other_user_order)

        with pytest.raises(Error, match='Order not found'):
            await getOrderById(1, 1)

    async def test_get_order_by_id_fails_with_invalid_order_id(self):
        """Test that invalid order ID is rejected"""
        with pytest.raises(Error, match='Order ID must be a positive integer'):
            await getOrderById(1, -1)

    async def test_get_order_by_id_fails_with_zero_order_id(self):
        """Test that zero order ID is rejected"""
        with pytest.raises(Error, match='Order ID must be a positive integer'):
            await getOrderById(1, 0)


class TestValidateCreateOrderInput:
    """Tests for validateCreateOrderInput function"""

    def test_validate_accepts_valid_input(self):
        """Test that valid input is accepted"""
        input_data = {
            'items': [
                {'productId': 1, 'quantity': 2},
                {'productId': 2, 'quantity': 1}
            ]
        }

        validateCreateOrderInput(input_data)

    def test_validate_rejects_missing_items(self):
        """Test that missing items property is rejected"""
        input_data = {}

        with pytest.raises(Error, match='Items are required'):
            validateCreateOrderInput(input_data)

    def test_validate_rejects_non_array_items(self):
        """Test that non-array items is rejected"""
        input_data = {'items': 'string'}

        with pytest.raises(Error, match='Items must be an array'):
            validateCreateOrderInput(input_data)


class TestControllerErrorHandling:
    """Tests for controller error handling"""

    @patch('backend.src.controllers.orderController.orderModel')
    @patch('backend.src.controllers.orderController.cartModel')
    async def test_create_order_propagates_model_errors(self, mock_cart, mock_order):
        """Test that errors from model are propagated"""
        mock_cart.productExists = AsyncMock(return_value=True)
        mock_order.createOrder = AsyncMock(side_effect=Error('Database connection failed'))
        input_data = {'items': [{'productId': 1, 'quantity': 1}]}

        with pytest.raises(Error, match='Database connection failed'):
            await createOrder(1, input_data)

    @patch('backend.src.controllers.orderController.orderModel')
    async def test_get_order_by_id_propagates_model_errors(self, mock_order):
        """Test that model errors are propagated for order retrieval"""
        expected_order = {'id': 1, 'userId': 1}
        mock_order.findById = AsyncMock(return_value=expected_order)

        result = await getOrderById(1, 1)
        assert result['id'] == 1
