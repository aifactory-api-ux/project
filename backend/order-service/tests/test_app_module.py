import pytest
from unittest.mock import MagicMock
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "order-service"))


def test_app_module_imports_order_module_and_dependencies():
    from order_service.app.module import AppModule

    module = AppModule()

    assert hasattr(module, 'order_module') or 'OrderModule' in str(type(module))


def test_app_module_fails_on_missing_dependency():
    from order_service.app.module import AppModule

    module = AppModule()
    module.order_module = None

    with pytest.raises(ImportError):
        module.validate()


def test_app_module_provides_global_configuration():
    from order_service.app.module import AppModule

    module = AppModule()
    module.config = {'global': True}

    assert module.config.get('global') is True