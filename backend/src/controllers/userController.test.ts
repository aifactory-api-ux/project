import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { getMe } from './userController';
import { findUserById } from '../models/user';
import { TokenPayload } from '../utils/jwt';

jest.mock('../models/user');

const mockFindUserById = findUserById as jest.MockedFunction<typeof findUserById>;

describe('UserController', () => {
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
      user: undefined,
    };
  });

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    name: 'Test User',
    address: '123 Test St',
    isAdmin: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('should return current user profile', async () => {
    const tokenPayload: TokenPayload = { userId: 1, email: 'test@example.com', isAdmin: false };
    mockReq.user = tokenPayload;
    mockFindUserById.mockResolvedValueOnce(mockUser);

    await getMe(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(200);
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

  it('should return 401 when user is not in request', async () => {
    mockReq.user = undefined;

    await getMe(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should return 401 when userId is missing', async () => {
    mockReq.user = { userId: 0, email: 'test@example.com', isAdmin: false };

    await getMe(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should return 404 when user not found in database', async () => {
    const tokenPayload: TokenPayload = { userId: 999, email: 'notfound@example.com', isAdmin: false };
    mockReq.user = tokenPayload;
    mockFindUserById.mockResolvedValueOnce(null);

    await getMe(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'User not found' });
  });

  it('should return 500 on database error', async () => {
    const tokenPayload: TokenPayload = { userId: 1, email: 'test@example.com', isAdmin: false };
    mockReq.user = tokenPayload;
    mockFindUserById.mockRejectedValueOnce(new Error('Database error'));

    await getMe(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
  });

  it('should fetch user with correct id', async () => {
    const tokenPayload: TokenPayload = { userId: 42, email: 'test@example.com', isAdmin: true };
    mockReq.user = tokenPayload;
    mockFindUserById.mockResolvedValueOnce({ ...mockUser, id: 42, isAdmin: true });

    await getMe(mockReq as Request, mockRes as Response);

    expect(mockFindUserById).toHaveBeenCalledWith(42);
  });
});
