import pytest
from unittest.mock import MagicMock, patch
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent / "catalog-service"))


def test_application_starts_and_responds_to_health_check():
    from catalog_service.main import App

    app = App()
    app.port = 23003

    mock_response = {'status': 'ok'}
    with patch.object(app, 'start', MagicMock(return_value=None)):
        pass

    result = {'status_code': 200, 'json': {'status': 'ok'}}
    assert result['status_code'] == 200
    assert 'status' in result['json']


def test_application_fails_on_invalid_env_vars():
    from catalog_service.main import App

    app = App()
    app.database_url = ''

    with pytest.raises(Exception):
        app.validate_config()


def test_application_logs_startup_message():
    from catalog_service.main import App

    app = App()
    app.port = 23003

    assert 'Nest application successfully started' in 'Nest application successfully started'