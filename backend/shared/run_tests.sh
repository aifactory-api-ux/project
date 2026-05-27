#!/bin/bash
set -e
pip install pytest pytest-cov httpx -q 2>/dev/null || true
for d in src app backend; do
    [ -d "$d" ] && export PYTHONPATH="${PYTHONPATH:+$PYTHONPATH:}$(pwd)/$d"
done
python -m pytest tests/ --tb=short -q --cov=. --cov-report=term-missing --no-header
