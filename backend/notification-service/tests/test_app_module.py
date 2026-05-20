import pytest
from unittest.mock import MagicMock
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "notification-service"))


def test_app_module_imports_notification_controllers_and_services():
    from notification_service.app.module import AppModule

    module = AppModule()

    assert hasattr(module, 'notification_controller') or 'NotificationController' in str(type(module))


def test_app_module_registers_redis_and_rabbitmq_providers():
    from notification_service.app.module import AppModule

    module = AppModule()

    assert hasattr(module, 'redis_provider') or 'Redis' in str(type(module))
    assert hasattr(module, 'rabbitmq_provider') or 'RabbitMQ' in str(type(module))


def test_app_module_uses_mock_rabbitmq_if_no_credentials():
    from notification_service.app.module import AppModule

    module = AppModule()
    module.rabbitmq_url = ''

    module.configure_rabbitmq()

    assert 'Mock' in type(module.rabbitmq_provider).__name__ or \
           type(module.rabbitmq_provider).__name__ == 'MagicMock'


def test_app_module_fails_on_missing_redis_url():
    from notification_service.app.module import AppModule

    module = AppModule()
    module.redis_url = ''

    with pytest.raises(Exception) as exc_info:
        module.validate()
    assert 'REDIS_URL is required' in str(exc_info.value)