import pytest
import re
from pathlib import Path

README_PATH = Path(__file__).parent.parent.parent / "README.md"


def read_readme():
    if not README_PATH.exists():
        pytest.skip("README.md not found")
    with open(README_PATH, 'r') as f:
        return f.read()


def test_readme_contains_prerequisites_and_installation_steps():
    content = read_readme().lower()

    required_sections = ['prerequisites', 'installation', 'usage']
    for section in required_sections:
        assert section in content, f"README.md should contain '{section}' section"


def test_readme_lists_all_api_endpoints_with_methods_and_examples():
    content = read_readme()

    required_endpoints = [
        '/api/auth/register',
        '/api/auth/login',
        '/api/auth/me',
        '/api/opportunities',
        '/api/opportunities/:id'
    ]

    for endpoint in required_endpoints:
        assert endpoint in content, f"README.md should document {endpoint}"


def test_readme_troubleshooting_section_covers_common_errors():
    content = read_readme().lower()

    assert 'troubleshooting' in content, "README.md should contain troubleshooting section"

    common_errors = ['port conflict', 'missing environment', 'docker not running']
    found_errors = [err for err in common_errors if err in content]
    assert len(found_errors) >= 2, \
        f"README.md should cover common errors. Found: {found_errors}"
