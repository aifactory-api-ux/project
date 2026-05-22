import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express, { Express } from 'express';
import request from 'supertest';
import authRoutes from './auth';
import { register, login } from '../controllers/authController';

jest.mock('../controllers/authController');

const mockRegister = register as jest.MockedFunction<typeof register>;
const mockLogin = login as jest.MockedFunction<typeof login>;

describe('Auth Routes', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/register', () => {
    it('should call register controller', async () => {
      const reqBody = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        address: '123 Test St',
      };
      const mockResponse = {
        status: 201,
        json: { id: 1, email: 'test@example.com', name: 'Test User' },
      };
      mockRegister.mockImplementationOnce((req, res) => {
        res.status(201).json(mockResponse.json);
        return Promise.resolve();
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(reqBody);

      expect(mockRegister).toHaveBeenCalled();
      expect(response.status).toBe(201);
    });

    it('should handle registration with missing fields', async () => {
      mockRegister.mockImplementationOnce((req, res) => {
        res.status(400).json({ error: 'Email, password, name, and address are required' });
        return Promise.resolve();
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email, password, name, and address are required');
    });

    it('should handle email already exists', async () => {
      mockRegister.mockImplementationOnce((req, res) => {
        res.status(409).json({ error: 'Email already registered' });
        return Promise.resolve();
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          name: 'Test',
          address: '123 St',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should call login controller', async () => {
      const reqBody = { email: 'test@example.com', password: 'password123' };
      mockLogin.mockImplementationOnce((req, res) => {
        res.status(200).json({ token: 'jwt_token', user: { id: 1 } });
        return Promise.resolve();
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(reqBody);

      expect(mockLogin).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it('should handle invalid credentials', async () => {
      mockLogin.mockImplementationOnce((req, res) => {
        res.status(401).json({ error: 'Invalid credentials' });
        return Promise.resolve();
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });
});
