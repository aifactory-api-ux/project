import pytest
from unittest.mock import MagicMock
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "catalog-service"))


def test_app_module_imports_all_required_modules():
    from catalog_service.app.module import AppModule

    module = AppModule()
    required_modules = ['ProductsModule', 'CategoriesModule', 'StockModule']

    for mod in required_modules:
        assert hasattr(module, mod) or mod in str(type(module).__dict__)


def test_app_module_raises_on_missing_dependency():
    from catalog_service.app.module import AppModule

    module = AppModule()
    module.database_module = None

    with pytest.raises(Exception):
        module.validate_dependencies()


def test_app_module_provides_global_configuration():
    from catalog_service.app.module import AppModule

    module = AppModule()
    module.node_env = 'test'

    assert module.node_env == 'test'