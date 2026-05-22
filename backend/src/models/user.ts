import { db } from '../db/index';
import { User, CreateUserInput, PublicUser } from '../types/user';
import { hashPassword } from '../utils/password';

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  address: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    address: row.address,
    isAdmin: row.is_admin,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function mapRowToPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    address: row.address,
    isAdmin: row.is_admin,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.query<UserRow>(
    'SELECT id, email, password_hash, name, address, is_admin, created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToUser(result.rows[0]);
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await db.query<UserRow>(
    'SELECT id, email, password_hash, name, address, is_admin, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapRowToUser(result.rows[0]);
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const passwordHash = await hashPassword(input.password);
  const result = await db.query<UserRow>(
    `INSERT INTO users (email, password_hash, name, address, is_admin, created_at, updated_at)
     VALUES ($1, $2, $3, $4, false, NOW(), NOW())
     RETURNING id, email, password_hash, name, address, is_admin, created_at, updated_at`,
    [input.email, passwordHash, input.name, input.address]
  );
  return mapRowToUser(result.rows[0]);
}

export async function emailExists(email: string): Promise<boolean> {
  const result = await db.query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists',
    [email]
  );
  return result.rows[0].exists;
}