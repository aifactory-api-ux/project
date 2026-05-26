import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRole } from '../shared/entities/user.entity';
import { verifyJwt, JwtPayload } from '../shared/utils/jwt';

jest.mock('../shared/utils/jwt');

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    name: 'Test User',
    role: UserRole.CUSTOMER,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockAdminUser = {
    ...mockUser,
    id: '223e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
  };

  const validToken = 'valid.jwt.token';
  const validPayload: JwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    role: UserRole.CUSTOMER,
    iat: 1704067200,
    exp: 1704153600,
  };

  const adminPayload: JwtPayload = {
    sub: mockAdminUser.id,
    email: mockAdminUser.email,
    role: UserRole.ADMIN,
    iat: 1704067200,
    exp: 1704153600,
  };

  beforeEach(async () => {
    const mockUserService = {
      findById: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);

    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    const authHeader = `Bearer ${validToken}`;

    it('should return current user when valid token is provided', async () => {
      (verifyJwt as jest.Mock).mockReturnValue(validPayload);
      userService.findById.mockResolvedValue(mockUser as any);

      const result = await controller.getCurrentUser(authHeader);

      expect(verifyJwt).toHaveBeenCalledWith(validToken);
      expect(userService.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      });
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      await expect(controller.getCurrentUser('')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.getCurrentUser('')).rejects.toThrow(
        'Missing or invalid authorization header',
      );
    });

    it('should throw UnauthorizedException when authorization header does not start with Bearer', async () => {
      await expect(controller.getCurrentUser('Basic token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (verifyJwt as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(controller.getCurrentUser(authHeader)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(controller.getCurrentUser(authHeader)).rejects.toThrow(
        'Invalid or expired token',
      );
    });

    it('should throw NotFoundException when user is not found', async () => {
      (verifyJwt as jest.Mock).mockReturnValue(validPayload);
      userService.findById.mockResolvedValue(null);

      await expect(controller.getCurrentUser(authHeader)).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getCurrentUser(authHeader)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('getUserById', () => {
    const targetUserId = '323e4567-e89b-12d3-a456-426614174002';
    const authHeader = `Bearer ${validToken}`;

    it('should return user when admin requests another user', async () => {
      (verifyJwt as jest.Mock).mockReturnValue(adminPayload);
      userService.findById.mockResolvedValue(mockUser as any);

      const result = await controller.getUserById(targetUserId, authHeader);

      expect(verifyJwt).toHaveBeenCalledWith(validToken);
      expect(userService.findById).toHaveBeenCalledWith(targetUserId);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      });
    });

    it('should throw ForbiddenException when non-admin tries to get user', async () => {
      (verifyJwt as jest.Mock).mockReturnValue(validPayload);

      await expect(
        controller.getUserById(targetUserId, authHeader),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getUserById(targetUserId, authHeader),
      ).rejects.toThrow('Admin access required');
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      await expect(controller.getUserById(targetUserId, '')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (verifyJwt as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        controller.getUserById(targetUserId, authHeader),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when target user is not found', async () => {
      (verifyJwt as jest.Mock).mockReturnValue(adminPayload);
      userService.findById.mockResolvedValue(null);

      await expect(
        controller.getUserById(targetUserId, authHeader),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCurrentUser', () => {
    const authHeader = `Bearer ${validToken}`;
    const updateDto = { name: 'Updated Name', email: 'updated@example.com' };

    it('should update and return current user when valid token is provided', async () => {
      const updatedUser = {
        ...mockUser,
        name: updateDto.name,
        email: updateDto.email,
      };
      (verifyJwt as jest.Mock).mockReturnValue(validPayload);
      userService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.updateCurrentUser(authHeader, updateDto);

      expect(verifyJwt).toHaveBeenCalledWith(validToken);
      expect(userService.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result).toEqual({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString(),
      });
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      await expect(
        controller.updateCurrentUser('', updateDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      (verifyJwt as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        controller.updateCurrentUser(authHeader, updateDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when user update returns null', async () => {
      (verifyJwt as jest.Mock).mockReturnValue(validPayload);
      userService.update.mockResolvedValue(null);

      await expect(
        controller.updateCurrentUser(authHeader, updateDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        controller.updateCurrentUser(authHeader, updateDto),
      ).rejects.toThrow('User not found');
    });

    it('should update user with only name when email is not provided', async () => {
      const nameOnlyDto = { name: 'New Name Only' };
      const updatedUser = {
        ...mockUser,
        name: nameOnlyDto.name,
      };
      (verifyJwt as jest.Mock).mockReturnValue(validPayload);
      userService.update.mockResolvedValue(updatedUser as any);

      const result = await controller.updateCurrentUser(authHeader, nameOnlyDto);

      expect(userService.update).toHaveBeenCalledWith(mockUser.id, nameOnlyDto);
      expect(result.name).toBe(nameOnlyDto.name);
    });
  });

  describe('HealthController', () => {
    let healthController: any;

    beforeEach(() => {
      healthController = controller;
    });

    it('should return health status', () => {
      const result = healthController.healthCheck();

      expect(result).toEqual({
        status: 'ok',
        service: 'user-service',
        version: '1.0.0',
      });
    });
  });
});
