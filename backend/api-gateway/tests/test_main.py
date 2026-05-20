import pytest
from unittest.mock import MagicMock, AsyncMock, patch
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "api-gateway"))


def test_health_endpoint_returns_200_and_status_ok():
    from api_gateway.main import Gateway

    gateway = Gateway()
    result = None
    async def run():
        nonlocal result
        result = await gateway.health_check()
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 200
    assert result['json'] == {'status': 'ok'}


def test_health_endpoint_returns_503_when_downstream_unavailable():
    from api_gateway.main import Gateway

    gateway = Gateway()
    gateway.auth_service_url = 'http://unavailable:9999'

    result = None
    async def run():
        nonlocal result
        result = await gateway.health_check()
    import asyncio
    asyncio.get_event_loop().run_until_complete(run())

    assert result['status_code'] == 503


def test_structured_logging_on_request():
    from api_gateway.main import Gateway

    gateway = Gateway()
    gateway.request_id = 'test-request-id'

    log_entry = gateway.format_log('GET', '/health', 200, 'test-request-id')

    assert 'method' in log_entry
    assert 'path' in log_entry
    assert 'status_code' in log_entry
    assert 'request_id' in log_entry