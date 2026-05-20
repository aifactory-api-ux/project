import re
import pytest
from pathlib import Path

def parse_column(column_str: str) -> dict:
    column_str = column_str.strip().rstrip(',').rstrip(';')
    parts = column_str.split()
    name = parts[0]
    col_type = parts[1] if len(parts) > 1 else 'TEXT'
    result = {'name': name, 'type': col_type.upper()}
    if 'PRIMARY KEY' in column_str.upper():
        result['primary_key'] = True
    if 'UNIQUE' in column_str.upper():
        result['unique'] = True
    if 'REFERENCES' in column_str.upper():
        result['foreign_key'] = True
    return result


def parse_create_table(sql: str) -> dict:
    table_name_match = re.search(r'CREATE TABLE (\w+)', sql, re.IGNORECASE)
    if not table_name_match:
        return {}

    table_name = table_name_match.group(1)
    columns = re.findall(r'(\w+)\s+\w+[\s,\)]+[^;]*', sql)

    columns_info = []
    for col_match in re.finditer(r'(\w+)\s+(\w+)', sql):
        col_name = col_match.group(1)
        col_type = col_match.group(2).upper()
        col_info = {'name': col_name, 'type': col_type}

        if f'{col_name} PRIMARY' in sql.upper():
            col_info['primary_key'] = True
        if f'{col_name} UNIQUE' in sql.upper() or f'UNIQUE ({col_name})' in sql.upper():
            col_info['unique'] = True
        if f'FOREIGN KEY' in sql.upper() and col_name.upper() in sql.upper():
            col_info['foreign_key'] = True

        columns_info.append(col_info)

    return {'table': table_name, 'columns': columns_info}


def test_user_table_schema_matches_spec():
    schema = """
    CREATE TABLE users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );
    """

    parsed = parse_create_table(schema)
    assert parsed['table'] == 'users'
    columns = {c['name']: c for c in parsed['columns']}

    assert 'id' in columns and columns['id']['type'] == 'UUID' and columns['id'].get('primary_key') is True
    assert 'email' in columns and columns['email']['type'] == 'TEXT' and columns['email'].get('unique') is True
    assert 'password_hash' in columns and columns['password_hash']['type'] == 'TEXT'
    assert 'full_name' in columns and columns['full_name']['type'] == 'TEXT'
    assert 'created_at' in columns and columns['created_at']['type'] == 'TIMESTAMP'
    assert 'updated_at' in columns and columns['updated_at']['type'] == 'TIMESTAMP'


def test_opportunities_table_schema_and_indexes():
    schema = """
    CREATE TABLE opportunities (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        owner_id UUID REFERENCES users(id),
        status TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    );
    CREATE INDEX idx_owner_id ON opportunities(owner_id);
    """

    parsed = parse_create_table(schema)
    assert parsed['table'] == 'opportunities'
    columns = {c['name']: c for c in parsed['columns']}

    assert 'id' in columns and columns['id']['type'] == 'UUID' and columns['id'].get('primary_key') is True
    assert 'title' in columns and columns['title']['type'] == 'TEXT'
    assert 'description' in columns and columns['description']['type'] == 'TEXT'
    assert 'owner_id' in columns and columns['owner_id']['type'] == 'UUID'
    assert 'status' in columns and columns['status']['type'] == 'TEXT'
    assert 'created_at' in columns and columns['created_at']['type'] == 'TIMESTAMP'
    assert 'updated_at' in columns and columns['updated_at']['type'] == 'TIMESTAMP'


def test_sessions_table_schema_and_expiry_constraint():
    schema = """
    CREATE TABLE sessions (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        token TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        CHECK (expires_at > created_at)
    );
    """

    parsed = parse_create_table(schema)
    assert parsed['table'] == 'sessions'
    columns = {c['name']: c for c in parsed['columns']}

    assert 'id' in columns and columns['id']['type'] == 'UUID' and columns['id'].get('primary_key') is True
    assert 'user_id' in columns and columns['user_id']['type'] == 'UUID'
    assert 'token' in columns and columns['token']['type'] == 'TEXT'
    assert 'created_at' in columns and columns['created_at']['type'] == 'TIMESTAMP'
    assert 'expires_at' in columns and columns['expires_at']['type'] == 'TIMESTAMP'
    assert 'CHECK' in schema.upper() and 'expires_at > created_at' in schema.lower()
