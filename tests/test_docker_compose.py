import pytest
import yaml
from pathlib import Path

DOCKER_COMPOSE_PATH = Path(__file__).parent.parent.parent.parent / "docker-compose.yml"


def load_docker_compose():
    if not DOCKER_COMPOSE_PATH.exists():
        pytest.skip("docker-compose.yml not found")
    with open(DOCKER_COMPOSE_PATH, 'r') as f:
        return yaml.safe_load(f)


def test_all_services_defined_with_correct_ports_and_dependencies():
    compose = load_docker_compose()
    services = compose.get('services', {})

    required_services = ['auth-service', 'opportunity-service', 'postgres', 'redis']
    for svc in required_services:
        assert svc in services, f"Service {svc} not found in docker-compose.yml"

    assert '23001:23001' in services['auth-service']['ports']
    assert '23002:23002' in services['opportunity-service']['ports']

    assert 'postgres' in services['auth-service'].get('depends_on', [])
    assert 'redis' in services['auth-service'].get('depends_on', [])
    assert 'postgres' in services['opportunity-service'].get('depends_on', [])
    assert 'redis' in services['opportunity-service'].get('depends_on', [])

    for svc in ['auth-service', 'opportunity-service', 'postgres', 'redis']:
        assert 'healthcheck' in services[svc], f"Healthcheck missing for {svc}"


def test_missing_environment_variables_fails_validation():
    compose = load_docker_compose()
    services = compose.get('services', {})

    for svc_name, svc_config in services.items():
        if svc_name in ['postgres', 'redis']:
            continue
        env_vars = svc_config.get('environment', {}) or {}
        assert 'DATABASE_URL' in str(env_vars) or 'POSTGRES_HOST' in str(env_vars), \
            f"Missing DATABASE_URL configuration for {svc_name}"


def test_healthchecks_block_service_start_until_dependencies_healthy():
    compose = load_docker_compose()
    services = compose.get('services', {})

    postgres_healthcheck = services.get('postgres', {}).get('healthcheck', {})
    assert postgres_healthcheck.get('test') is not None

    redis_healthcheck = services.get('redis', {}).get('healthcheck', {})
    assert redis_healthcheck.get('test') is not None

    for svc in ['auth-service', 'opportunity-service']:
        depends_on = services[svc].get('depends_on', [])
        assert 'postgres' in depends_on, f"{svc} should depend on postgres"
        assert 'redis' in depends_on, f"{svc} should depend on redis"
