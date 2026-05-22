#!/bin/bash
set -e
pip install pytest pytest-cov httpx -q 2>/dev/null || true
# Add common source directories to PYTHONPATH so tests can import src modules
for d in src app backend; do
    [ -d "$d" ] && export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}$(pwd)/$d"
done
python -m pytest tests/ --tb=short -q --cov=. --cov-report=term-missing --no-header
