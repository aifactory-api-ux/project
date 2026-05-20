import re
from pathlib import Path

VALID_STATUSES = ['open', 'closed']

def validate_opportunity(data: dict) -> tuple[bool, str | None]:
    required_fields = ['id', 'title', 'description', 'ownerId', 'status', 'createdAt', 'updatedAt']
    for field in required_fields:
        if field not in data:
            return False, field

    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    if not uuid_pattern.match(data.get('id', '')):
        return False, 'id'

    if not uuid_pattern.match(data.get('ownerId', '')):
        return False, 'ownerId'

    if data.get('status') not in VALID_STATUSES:
        return False, 'status'

    return True, None


def test_opportunity_interface_accepts_valid_fields():
    opp_data = {
        'id': 'uuid-string',
        'title': 'Opportunity Title',
        'description': 'Opportunity Description',
        'ownerId': 'uuid-string',
        'status': 'open',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    }
    valid, error_field = validate_opportunity(opp_data)
    assert valid is True
    assert error_field is None


def test_opportunity_interface_invalid_status_enum():
    opp_data = {
        'id': 'uuid-string',
        'title': 'Opportunity Title',
        'description': 'Opportunity Description',
        'ownerId': 'uuid-string',
        'status': 'pending',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    }
    valid, error_field = validate_opportunity(opp_data)
    assert valid is False
    assert error_field == 'status'


def test_opportunity_interface_missing_title_raises_error():
    opp_data = {
        'id': 'uuid-string',
        'description': 'Opportunity Description',
        'ownerId': 'uuid-string',
        'status': 'open',
        'createdAt': '2024-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    }
    valid, error_field = validate_opportunity(opp_data)
    assert valid is False
    assert error_field == 'title'
