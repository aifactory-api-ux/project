import re
import pytest
from pathlib import Path

REQUIRED_ENV_VARS = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET']
OPTIONAL_ENV_VARS = ['PORT']


def validate_env_config(env_vars: dict) -> tuple[bool, str | None]:
    for var in REQUIRED_ENV_VARS:
        if var not in env_vars or not env_vars[var]:
            return False, var

    if 'PORT' in env_vars:
        try:
            port = int(env_vars['PORT'])
            if port < 1 or port > 65535:
                return False, 'PORT'
        except (ValueError, TypeError):
            return False, 'PORT'

    return True, None


def test_env_config_accepts_valid_env_vars():
    env_vars = {
        'PORT': '23001',
        'DATABASE_URL': 'postgresql://user:pass@localhost:5432/db',
        'REDIS_URL': 'redis://localhost:6379/0',
        'JWT_SECRET': 'supersecret'
    }
    valid, error_field = validate_env_config(env_vars)
    assert valid is True
    assert error_field is None


def test_env_config_missing_required_var_raises_error():
    env_vars = {
        'PORT': '23001',
        'REDIS_URL': 'redis://localhost:6379/0',
        'JWT_SECRET': 'supersecret'
    }
    valid, error_field = validate_env_config(env_vars)
    assert valid is False
    assert error_field == 'DATABASE_URL'


def test_env_config_invalid_port_type_raises_error():
    env_vars = {
        'PORT': 'not-a-number',
        'DATABASE_URL': 'postgresql://user:pass@localhost:5432/db',
        'REDIS_URL': 'redis://localhost:6379/0',
        'JWT_SECRET': 'supersecret'
    }
    valid, error_field = validate_env_config(env_vars)
    assert valid is False
    assert error_field == 'PORT'
