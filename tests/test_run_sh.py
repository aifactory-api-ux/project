import pytest
import re
import subprocess
import os
from pathlib import Path

RUN_SH_PATH = Path(__file__).parent.parent.parent / "run.sh"


def check_docker_installed():
    try:
        subprocess.run(['docker', '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def check_docker_compose_installed():
    try:
        subprocess.run(['docker-compose', '--version'], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def read_run_sh():
    if not RUN_SH_PATH.exists():
        pytest.skip("run.sh not found")
    with open(RUN_SH_PATH, 'r') as f:
        return f.read()


def test_run_sh_validates_docker_and_docker_compose_installed():
    content = read_run_sh()

    assert 'docker' in content.lower() or 'docker-compose' in content.lower(), \
        "run.sh should check for Docker installation"

    assert 'not installed' in content.lower() or 'required' in content.lower() or \
           'must be installed' in content.lower(), \
        "run.sh should provide error message when Docker/docker-compose is missing"


def test_run_sh_waits_for_services_to_be_healthy():
    content = read_run_sh()

    assert 'health' in content.lower() or 'ready' in content.lower() or \
           'wait' in content.lower(), \
        "run.sh should wait for services to be healthy"


def test_run_sh_prints_correct_url_on_success():
    content = read_run_sh()

    assert '23001' in content or 'localhost' in content or 'url' in content.lower(), \
        "run.sh should print the application URL"
