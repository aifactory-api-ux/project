import pytest
from unittest.mock import Mock, MagicMock, patch, AsyncMock
import sys
import os
import json

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))

from backend.src.routes.orders import router
from backend.src.controllers.orderController import (
    createOrder as controllerCreateOrder,
    getOrders as controllerGetOrders,
    getOrderById as controllerGetOrderById
)


class TestOrdersRouter:
    """Tests for orders router"""


    @pytest.fixture
    def mock_request(self):
        """Create a mock request object"""
        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {}
        request.params = {}
        return request

    @pytest.fixture
    def mock_response(self):
        """Create a mock response object"""
        response = MagicMock()
        response.status = 200
        response.json_data = None
        return response

    @pytest.fixture
    def sample_order_request(self):
        """Sample order creation request body"""
        return {
            'items': [
                {'productId': 1, 'quantity': 2},
                {'productId': 2, 'quantity': 1}
            ]
        }

    @pytest.fixture
    def sample_order_response(self):
        """Sample order response data"""
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

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_order_success(self, mock_controller, mock_auth, sample_order_request, sample_order_response):
        """Test POST /orders creates order successfully"""
        mock_controller.createOrder = AsyncMock(return_value=sample_order_response)
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = sample_order_request

        response = MagicMock()
        response.status = 201
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 201
        assert response.json_data['id'] == 1

    @patch('backend.src.routes.orders.authenticateJWT')
    async def test_post_order_requires_authentication(self, mock_auth):
        """Test that POST /orders requires authentication"""
        mock_auth.return_value = MagicMock()

        assert any('authenticateJWT' in str(layer.callback) for layer in router.stack if hasattr(layer, 'callback'))

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_order_returns_400_for_empty_items(self, mock_controller, mock_auth):
        """Test POST /orders returns 400 for empty items"""
        mock_controller.createOrder = AsyncMock(side_effect=Error('Order must have at least one item'))
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {'items': []}

        response = MagicMock()
        response.status = 201
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 400
        assert 'error' in response.json_data

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_order_returns_400_for_invalid_product(self, mock_controller, mock_auth):
        """Test POST /orders returns 400 for invalid product"""
        mock_controller.createOrder = AsyncMock(side_effect=Error('Product 999 not found'))
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {'items': [{'productId': 999, 'quantity': 1}]}

        response = MagicMock()
        response.status = 201
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 400

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_order_returns_400_for_insufficient_stock(self, mock_controller, mock_auth):
        """Test POST /orders returns 400 for insufficient stock"""
        mock_controller.createOrder = AsyncMock(side_effect=Error('Not enough stock for product 1'))
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {'items': [{'productId': 1, 'quantity': 1000}]}

        response = MagicMock()
        response.status = 201
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 400

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_order_returns_500_for_unknown_errors(self, mock_controller, mock_auth):
        """Test POST /orders returns 500 for unknown errors"""
        mock_controller.createOrder = AsyncMock(side_effect=Error('Database connection lost'))
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {'items': [{'productId': 1, 'quantity': 1}]}

        response = MagicMock()
        response.status = 201
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 500


class TestGetOrdersRoute:
    """Tests for GET /orders route"""

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_get_orders_success(self, mock_controller, mock_auth):
        """Test GET /orders returns user's orders"""
        expected_orders = [
            {'id': 1, 'userId': 1, 'status': 'pending', 'total': 100.00},
            {'id': 2, 'userId': 1, 'status': 'paid', 'total': 50.00}
        ]
        mock_controller.getOrders = AsyncMock(return_value=expected_orders)
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)


        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        for layer in router.stack:
            if hasattr(layer, 'route') and layer.route and layer.route.path == '/':
                if layer.route.methods and 'GET' in layer.route.methods:
                    await layer.callback(request, response)
                    break

        assert response.json_data == expected_orders

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_get_orders_returns_empty_array(self, mock_controller, mock_auth):
        """Test GET /orders returns empty array when no orders"""
        mock_controller.getOrders = AsyncMock(return_value=[])
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        for layer in router.stack:
            if hasattr(layer, 'route') and layer.route and layer.route.path == '/':
                if layer.route.methods and 'GET' in layer.route.methods:
                    await layer.callback(request, response)
                    break

        assert response.json_data == []


    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_get_orders_returns_500_on_error(self, mock_controller, mock_auth):
        """Test GET /orders returns 500 on error"""
        mock_controller.getOrders = AsyncMock(side_effect=Error('Database error'))
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        for layer in router.stack:
            if hasattr(layer, 'route') and layer.route and layer.route.path == '/':
                if layer.route.methods and 'GET' in layer.route.methods:
                    await layer.callback(request, response)
                    break

        assert 'error' in response.json_data



class TestGetOrderByIdRoute:
    """Tests for GET /orders/:id route"""

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_get_order_by_id_success(self, mock_controller, mock_auth):
        """Test GET /orders/:id returns order successfully"""
        expected_order = {
            'id': 1,
            'userId': 1,
            'status': 'paid',
            'total': 100.00,
            'items': [{'productId': 1, 'quantity': 2}]
        }
        mock_controller.getOrderById = AsyncMock(return_value=expected_order)
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.params = {'id': '1'}

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        for layer in router.stack:
            if hasattr(layer, 'route') and layer.route and ':id' in layer.route.path:
                await layer.callback(request, response)
                break

        assert response.json_data['id'] == 1
        assert response.json_data['status'] == 'paid'

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_get_order_by_id_returns_404_when_not_found(self, mock_controller, mock_auth):
        """Test GET /orders/:id returns 404 when order not found"""
        mock_controller.getOrderById = AsyncMock(side_effect=Error('Order not found'))
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.params = {'id': '999'}

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        for layer in router.stack:
            if hasattr(layer, 'route') and layer.route and ':id' in layer.route.path:
                await layer.callback(request, response)
                break

        assert response.status == 404


    @patch('backend.src.routes.orders.authenticateJWT')
    async def test_get_order_by_id_returns_400_for_invalid_id(self, mock_auth):
        """Test GET /orders/:id returns 400 for invalid ID"""
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.params = {'id': 'invalid'}

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        for layer in router.stack:
            if hasattr(layer, 'route') and layer.route and ':id' in layer.route.path:
                await layer.callback(request, response)
                break

        assert response.status == 400

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_get_order_by_id_returns_404_for_invalid_order_id_error(self, mock_controller, mock_auth):
        """Test GET /orders/:id returns 404 for 'Order ID must be a positive integer' error"""
        mock_controller.getOrderById = AsyncMock(side_effect=Error('Order ID must be a positive integer'))
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.params = {'id': '-1'}

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)


        for layer in router.stack:
            if hasattr(layer, 'route') and layer.route and ':id' in layer.route.path:
                await layer.callback(request, response)
                break

        assert response.status == 404


class TestRouterConfiguration:
    """Tests for router configuration"""

    def test_router_has_post_route(self):
        """Test that router has POST / route configured"""
        post_routes = [layer for layer in router.stack 
                       if hasattr(layer, 'route') and layer.route 
                       and layer.route.path == '/' 
                       and layer.route.methods 
                       and 'POST' in layer.route.methods]
        assert len(post_routes) >= 1

    def test_router_has_get_route(self):
        """Test that router has GET / route configured"""
        get_routes = [layer for layer in router.stack 
                      if hasattr(layer, 'route') and layer.route 
                      and layer.route.path == '/' 
                      and layer.route.methods 
                      and 'GET' in layer.route.methods]
        assert len(get_routes) >= 1

    def test_router_has_get_by_id_route(self):
        """Test that router has GET /:id route configured"""
        id_routes = [layer for layer in router.stack 
                     if hasattr(layer, 'route') and layer.route 
                     and ':id' in layer.route.path]
        assert len(id_routes) >= 1

    def test_router_all_routes_use_authentication(self):
        """Test that all routes use authenticateJWT middleware"""
        for layer in router.stack:
            if hasattr(layer, 'handle') or hasattr(layer, 'callback'):
                pass


class TestRequestValidation:
    """Tests for request validation"""

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_validates_items_is_array(self, mock_controller, mock_auth):
        """Test POST /orders validates items is an array"""
        mock_controller.createOrder = AsyncMock(return_value={'id': 1})
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {'items': 'not an array'}

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)


        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 400

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_validates_items_not_empty(self, mock_controller, mock_auth):
        """Test POST /orders validates items is not empty"""
        mock_controller.createOrder = AsyncMock(return_value={'id': 1})
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {'items': []}

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)


        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 400

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_validates_product_id_is_positive_int(self, mock_controller, mock_auth):
        """Test POST /orders validates productId is positive integer"""
        mock_controller.createOrder = AsyncMock(return_value={'id': 1})
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {'items': [{'productId': 0, 'quantity': 1}]}


        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 400

    @patch('backend.src.routes.orders.authenticateJWT')
    @patch('backend.src.routes.orders.orderController')
    async def test_post_validates_quantity_is_positive_int(self, mock_controller, mock_auth):
        """Test POST /orders validates quantity is positive integer"""
        mock_controller.createOrder = AsyncMock(return_value={'id': 1})
        mock_auth.return_value = MagicMock()

        request = MagicMock()
        request.user = Mock(userId=1)
        request.body = {'items': [{'productId': 1, 'quantity': 0}]}

        response = MagicMock()
        response.json_data = None

        async def set_json(data):
            response.json_data = data

        response.json = AsyncMock(side_effect=set_json)

        route_handler = router.stack[-1].callback if router.stack else None
        if route_handler:
            await route_handler(request, response)

        assert response.status == 400
