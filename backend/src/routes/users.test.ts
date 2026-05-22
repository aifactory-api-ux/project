import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express, { Express } from 'express';
import request from 'supertest';
import usersRoutes from './users';
import { getMe } from '../controllers/userController';
import { authenticateJWT } from '../middleware/auth';

jest.mock('../controllers/userController');
jest.mock('../middleware/auth');

const mockGetMe = getMe as jest.MockedFunction<typeof getMe>;
const mockAuthenticateJWT = authenticateJWT as jest.MockedFunction<typeof authenticateJWT>;

describe('Users Routes', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    
    mockAuthenticateJWT.mockImplementation((req, res, next) => {
      req.user = { userId: 1, email: 'test@example.com', isAdmin: false };
      next();
    });
    
    app.use('/api/users', usersRoutes);
  });

  describe('GET /api/users/me', () => {
    it('should call getMe controller with authentication', async () => {
      mockGetMe.mockImplementationOnce((req, res) => {
        res.status(200).json({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          address: '123 Test St',
          isAdmin: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        });
        return Promise.resolve();
      });

      const response = await request(app).get('/api/users/me');

      expect(mockAuthenticateJWT).toHaveBeenCalled();
      expect(mockGetMe).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      mockAuthenticateJWT.mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Authorization header is required' });
      });

      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(401);
    });

    it('should return 404 when user not found', async () => {
      mockGetMe.mockImplementationOnce((req, res) => {
        res.status(404).json({ error: 'User not found' });
        return Promise.resolve();
      });

      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should handle expired token', async () => {
      mockAuthenticateJWT.mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Token has expired' });
      });

      const response = await request(app).get('/api/users/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token has expired');
    });
  });
});
