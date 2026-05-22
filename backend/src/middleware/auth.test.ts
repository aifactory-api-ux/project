import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticateJWT, requireAdmin } from './auth';
import { verifyToken, TokenPayload } from '../utils/jwt';

jest.mock('../utils/jwt');

const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnThis();
    mockReq = {
      headers: {},
      user: undefined,
    };
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = jest.fn();
  });

  describe('authenticateJWT', () => {
    const validToken = 'valid.jwt.token';
    const tokenPayload: TokenPayload = { userId: 1, email: 'test@example.com', isAdmin: false };

    it('should authenticate valid token', () => {
      mockReq.headers = { authorization: `Bearer ${validToken}` };
      mockVerifyToken.mockReturnValueOnce(tokenPayload);

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(mockVerifyToken).toHaveBeenCalledWith(validToken);
      expect(mockReq.user).toEqual(tokenPayload);
      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is missing', () => {
      mockReq.headers = {};

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Authorization header is required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header has wrong format', () => {
      mockReq.headers = { authorization: 'InvalidFormat token' };

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Authorization header must be in format: Bearer <token>' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header has more than 2 parts', () => {
      mockReq.headers = { authorization: 'Bearer token extra' };

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Authorization header must be in format: Bearer <token>' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header has wrong scheme', () => {
      mockReq.headers = { authorization: 'Basic token' };

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Authorization header must be in format: Bearer <token>' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      mockReq.headers = { authorization: `Bearer ${validToken}` };
      mockVerifyToken.mockImplementationOnce(() => { throw new Error('Invalid token'); });

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token has expired', () => {
      mockReq.headers = { authorization: `Bearer ${validToken}` };
      mockVerifyToken.mockImplementationOnce(() => { throw new Error('Token has expired'); });

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Token has expired' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 for unknown token errors', () => {
      mockReq.headers = { authorization: `Bearer ${validToken}` };
      mockVerifyToken.mockImplementationOnce(() => { throw new Error('Unknown error'); });

      authenticateJWT(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should call next for admin user', () => {
      const adminPayload: TokenPayload = { userId: 1, email: 'admin@example.com', isAdmin: true };
      mockReq.user = adminPayload;

      requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockReq.user = undefined;

      requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not admin', () => {
      const regularUser: TokenPayload = { userId: 2, email: 'user@example.com', isAdmin: false };
      mockReq.user = regularUser;

      requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Forbidden: Admin access required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
