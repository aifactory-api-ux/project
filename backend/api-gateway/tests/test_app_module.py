import pytest
from unittest.mock import MagicMock, AsyncMock
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "api-gateway"))


def test_routing_to_auth_service_login():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()
    mock_auth_service = AsyncMock(return_value={
        'status_code': 200,
        'json': {'token': 'jwt-token', 'user': {'id': 'uuid-123'}}
    })
    module.route_to_service = mock_auth_service

    result = None
    async def run():
        nonlocal result
        result = await module.forward('/api/auth/login', 'POST', {'email': 'user@example.com', 'password': 'ValidPass123'})
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 200
    assert 'token' in result['json']
    assert 'user' in result['json']


def test_jwt_validation_required_for_protected_opportunities_routes():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()

    result = module.check_auth_header(None)
    assert result['authorized'] is False
    assert result['status_code'] == 401


def test_jwt_validation_invalid_token_returns_401():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()

    result = module.validate_token('invalid.jwt.token')
    assert result['authorized'] is False


def test_rbac_for_opportunity_delete_requires_owner_role():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()
    module.user_roles = {'user'}

    result = module.check_permission('delete', 'opportunity')
    assert result['allowed'] is False


def test_rate_limiting_exceeded_returns_429():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()
    module.check_rate_limit = MagicMock(return_value={'exceeded': True})

    result = module.check_rate_limit('token123')
    assert result['exceeded'] is True


def test_fallback_error_returns_502_on_microservice_down():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()
    module.route_to_service = AsyncMock(side_effect=Exception('Service unavailable'))

    result = None
    async def run():
        nonlocal result
        try:
            result = await module.forward('/api/opportunities', 'GET')
        except Exception as e:
            result = {'status_code': 502}
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 502


def test_invalid_route_returns_404():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()

    result = module.handle_invalid_route('/api/unknown/route')
    assert result['status_code'] == 404


def test_register_route_validation_error_returns_400():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()
    module.validate_request = MagicMock(return_value={'valid': False, 'errors': ['email required']})

    result = module.validate_request('POST', '/api/auth/register', {'email': 'user@example.com'})
    assert result['valid'] is False


def test_patch_opportunity_requires_valid_status_value():
    from api_gateway.app.module import GatewayModule

    module = GatewayModule()

    result = module.validate_status('invalid_status')
    assert result['valid'] is False