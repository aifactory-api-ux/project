import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { db } from '../db/index';
import {
  findUserByEmail,
  findUserById,
  createUser,
  emailExists,
  mapRowToPublicUser,
  UserRow,
} from './user';
import { hashPassword } from '../utils/password';

jest.mock('../db/index');
jest.mock('../utils/password');

const mockDb = db as jest.Mocked<typeof db>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserRow: UserRow = {
    id: 1,
    email: 'test@example.com',
    password_hash: 'hashedpassword123',
    name: 'Test User',
    address: '123 Test St',
    is_admin: false,
    created_at: new Date('2024-01-01T00:00:00.000Z'),
    updated_at: new Date('2024-01-01T00:00:00.000Z'),
  };

  describe('findUserByEmail', () => {
    it('should return user when email exists', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUserRow] } as never);

      const result = await findUserByEmail('test@example.com');

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        name: 'Test User',
        address: '123 Test St',
        isAdmin: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id, email, password_hash, name, address, is_admin, created_at, updated_at FROM users WHERE email = $1',
        ['test@example.com']
      );
    });

    it('should return null when email does not exist', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] } as never);

      const result = await findUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database error') as never);

      await expect(findUserByEmail('test@example.com')).rejects.toThrow('Database error');
    });
  });

  describe('findUserById', () => {
    it('should return user when id exists', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockUserRow] } as never);

      const result = await findUserById(1);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        name: 'Test User',
        address: '123 Test St',
        isAdmin: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT id, email, password_hash, name, address, is_admin, created_at, updated_at FROM users WHERE id = $1',
        [1]
      );
    });

    it('should return null when id does not exist', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] } as never);

      const result = await findUserById(999);

      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create user with hashed password', async () => {
      mockHashPassword.mockResolvedValueOnce('hashedpassword123' as never);
      mockDb.query.mockResolvedValueOnce({ rows: [mockUserRow] } as never);

      const result = await createUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        address: '123 Test St',
      });

      expect(mockHashPassword).toHaveBeenCalledWith('password123');
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        passwordHash: 'hashedpassword123',
        name: 'Test User',
        address: '123 Test St',
        isAdmin: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should set is_admin to false by default', async () => {
      mockHashPassword.mockResolvedValueOnce('hashedpassword123' as never);
      const adminRow = { ...mockUserRow, is_admin: false };
      mockDb.query.mockResolvedValueOnce({ rows: [adminRow] } as never);

      const result = await createUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        address: '123 Test St',
      });

      expect(result.isAdmin).toBe(false);
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ exists: true }] } as never);

      const result = await emailExists('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [{ exists: false }] } as never);

      const result = await emailExists('nonexistent@example.com');

      expect(result).toBe(false);
    });
  });

  describe('mapRowToPublicUser', () => {
    it('should map row to public user without passwordHash', () => {
      const result = mapRowToPublicUser(mockUserRow);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        address: '123 Test St',
        isAdmin: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should handle admin users', () => {
      const adminRow = { ...mockUserRow, is_admin: true };
      const result = mapRowToPublicUser(adminRow);

      expect(result.isAdmin).toBe(true);
    });
  });
});
