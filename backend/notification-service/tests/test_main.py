import pytest
from unittest.mock import MagicMock, patch
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "notification-service"))


def test_bootstrap_nestjs_app_starts_successfully():
    from notification_service.main import App

    app = App()
    app.port = 23004

    assert app.port == 23004
    assert app.start() is None


def test_bootstrap_with_missing_env_vars_fails():
    from notification_service.main import App

    app = App()
    app.redis_url = ''
    app.rabbitmq_url = ''

    with pytest.raises(Exception) as exc_info:
        app.validate_env()
    assert 'Missing required environment variables' in str(exc_info.value)


def test_bootstrap_with_invalid_port_env_var():
    from notification_service.main import App

    app = App()
    app.port = 'not_a_number'

    with pytest.raises(Exception) as exc_info:
        app.validate_env()
    assert 'Invalid PORT value' in str(exc_info.value)