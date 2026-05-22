import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { register, login } from './authController';
import { createUser, findUserByEmail, emailExists } from '../models/user';
import { comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';

jest.mock('../models/user');
jest.mock('../utils/password');
jest.mock('../utils/jwt');

const mockCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockFindUserByEmail = findUserByEmail as jest.MockedFunction<typeof findUserByEmail>;
const mockEmailExists = emailExists as jest.MockedFunction<typeof emailExists>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>;

describe('AuthController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockReq = {
      body: {},
    };
  });

  describe('register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      address: '123 Test St',
    };

    const createdUser = {
      id: 1,
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      name: 'Test User',
      address: '123 Test St',
      isAdmin: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('should register user successfully', async () => {
      mockReq.body = validUserData;
      mockEmailExists.mockResolvedValueOnce(false);
      mockCreateUser.mockResolvedValueOnce(createdUser);

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        address: '123 Test St',
        isAdmin: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    });

    it('should return 400 when email is missing', async () => {
      mockReq.body = { password: 'password123', name: 'Test', address: '123 St' };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email, password, name, and address are required' });
    });

    it('should return 400 when password is missing', async () => {
      mockReq.body = { email: 'test@example.com', name: 'Test', address: '123 St' };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email, password, name, and address are required' });
    });

    it('should return 400 when name is missing', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123', address: '123 St' };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email, password, name, and address are required' });
    });

    it('should return 400 when address is missing', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123', name: 'Test' };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email, password, name, and address are required' });
    });

    it('should return 400 when password is less than 6 characters', async () => {
      mockReq.body = { ...validUserData, password: '12345' };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters long' });
    });

    it('should return 400 for invalid email format', async () => {
      mockReq.body = { ...validUserData, email: 'invalid-email' };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email format' });
    });

    it('should return 400 for email without @', async () => {
      mockReq.body = { ...validUserData, email: 'testexample.com' };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email format' });
    });

    it('should return 400 for email without domain', async () => {
      mockReq.body = { ...validUserData, email: 'test@' };

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid email format' });
    });

    it('should return 409 when email already exists', async () => {
      mockReq.body = validUserData;
      mockEmailExists.mockResolvedValueOnce(true);

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email already registered' });
    });

    it('should return 500 on database error', async () => {
      mockReq.body = validUserData;
      mockEmailExists.mockRejectedValueOnce(new Error('Database error'));

      await register(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('login', () => {
    const validCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const foundUser = {
      id: 1,
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      name: 'Test User',
      address: '123 Test St',
      isAdmin: false,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    it('should login user successfully', async () => {
      mockReq.body = validCredentials;
      mockFindUserByEmail.mockResolvedValueOnce(foundUser);
      mockComparePassword.mockResolvedValueOnce(true);
      mockSignToken.mockReturnValueOnce('jwt_token_here' as never);

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        token: 'jwt_token_here',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          address: '123 Test St',
          isAdmin: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      });
    });

    it('should return 400 when email is missing', async () => {
      mockReq.body = { password: 'password123' };

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });

    it('should return 400 when password is missing', async () => {
      mockReq.body = { email: 'test@example.com' };

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });

    it('should return 401 when user not found', async () => {
      mockReq.body = validCredentials;
      mockFindUserByEmail.mockResolvedValueOnce(null);

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 when password is incorrect', async () => {
      mockReq.body = validCredentials;
      mockFindUserByEmail.mockResolvedValueOnce(foundUser);
      mockComparePassword.mockResolvedValueOnce(false);

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 500 on database error', async () => {
      mockReq.body = validCredentials;
      mockFindUserByEmail.mockRejectedValueOnce(new Error('Database error'));

      await login(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should generate token with correct payload', async () => {
      mockReq.body = validCredentials;
      mockFindUserByEmail.mockResolvedValueOnce(foundUser);
      mockComparePassword.mockResolvedValueOnce(true);
      mockSignToken.mockReturnValueOnce('jwt_token' as never);

      await login(mockReq as Request, mockRes as Response);

      expect(mockSignToken).toHaveBeenCalledWith({
        userId: 1,
        email: 'test@example.com',
        isAdmin: false,
      });
    });
  });
});
