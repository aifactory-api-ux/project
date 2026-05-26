import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus, UnauthorizedException } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/app.module';
import { User, UserRole } from '../../shared/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    getUserById: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
          username: process.env.POSTGRES_USER || 'project_user',
          password: process.env.POSTGRES_PASSWORD || 'supersecret',
          database: process.env.POSTGRES_DB || 'project_db',
          entities: [User],
          synchronize: true,
        }),
        AuthModule,
      ],
    })
      .overrideProvider('AuthService')
      .useValue(mockAuthService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user', async () => {
      const registerResponse = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'test',
          role: 'customer' as const,
        },
      };

      mockAuthService.register.mockResolvedValue(registerResponse);

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(HttpStatus.CREATED)
        .expect(registerResponse);
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 when email is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ password: 'password123' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should login user and return tokens', async () => {
      const loginResponse = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'test',
          role: 'customer' as const,
        },
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(HttpStatus.CREATED)
        .expect(loginResponse);
    });

    it('should return 401 for invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    it('should refresh tokens', async () => {
      const refreshResponse = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          name: 'test',
          role: 'customer' as const,
        },
      };

      mockAuthService.refresh.mockResolvedValue(refreshResponse);

      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid_refresh_token' })
        .expect(HttpStatus.CREATED)
        .expect(refreshResponse);
    });

    it('should return 400 when refresh token is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({})
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/api/auth/me (GET)', () => {
    it('should return current user info', async () => {
      const userResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        name: 'test',
        role: 'customer' as const,
      };

      mockAuthService.getUserById.mockResolvedValue(userResponse);

      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid_token')
        .expect(HttpStatus.OK)
        .expect(userResponse);
    });

    it('should return 401 when no token provided', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('/health (GET)', () => {
    it('should return health status', async () => {
      await request(app.getHttpServer())
        .get('/health')
        .expect(HttpStatus.OK)
        .expect({ status: 'ok', service: 'auth-service', version: '1.0.0' });
    });
  });
});