import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../shared/entities/user.entity';
import { UserRole } from '../shared/entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'hashed_password',
    name: 'Test User',
    role: UserRole.CUSTOMER,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockAdminUser: User = {
    id: '223e4567-e89b-12d3-a456-426614174001',
    email: 'admin@example.com',
    passwordHash: 'hashed_admin_password',
    name: 'Admin User',
    role: UserRole.ADMIN,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when user exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(result).toBeNull();
    });

    it('should call findOne with correct parameters for admin user', async () => {
      userRepository.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.findById(mockAdminUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockAdminUser.id },
      });
      expect(result).toEqual(mockAdminUser);
      expect(result?.role).toBe(UserRole.ADMIN);
    });
  });

  describe('findByEmail', () => {
    it('should return user when user with email exists', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(mockUser.email);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user with email does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(result).toBeNull();
    });

    it('should find admin user by email', async () => {
      userRepository.findOne.mockResolvedValue(mockAdminUser);

      const result = await service.findByEmail(mockAdminUser.email);

      expect(result).toEqual(mockAdminUser);
      expect(result?.role).toBe(UserRole.ADMIN);
    });
  });

  describe('update', () => {
    it('should update user name when name is provided', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: updateDto.name };
      userRepository.findOne.mockResolvedValue({ ...mockUser });
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result?.name).toBe(updateDto.name);
    });

    it('should update user email when email is provided', async () => {
      const updateDto = { email: 'updated@example.com' };
      const updatedUser = { ...mockUser, email: updateDto.email };
      userRepository.findOne.mockResolvedValue({ ...mockUser });
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(result?.email).toBe(updateDto.email);
    });

    it('should update user passwordHash when passwordHash is provided', async () => {
      const updateDto = { passwordHash: 'new_hashed_password' };
      const updatedUser = { ...mockUser, passwordHash: updateDto.passwordHash };
      userRepository.findOne.mockResolvedValue({ ...mockUser });
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(result?.passwordHash).toBe(updateDto.passwordHash);
    });

    it('should update multiple fields at once', async () => {
      const updateDto = {
        name: 'New Name',
        email: 'newemail@example.com',
        passwordHash: 'new_hash',
      };
      const updatedUser = { ...mockUser, ...updateDto };
      userRepository.findOne.mockResolvedValue({ ...mockUser });
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updateDto);

      expect(result?.name).toBe(updateDto.name);
      expect(result?.email).toBe(updateDto.email);
      expect(result?.passwordHash).toBe(updateDto.passwordHash);
    });

    it('should return null when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent-id', { name: 'New Name' });

      expect(result).toBeNull();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should not update any fields when empty dto is provided', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser });
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.update(mockUser.id, {});

      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should only update provided fields and preserve others', async () => {
      const originalUser = { ...mockUser };
      const updateDto = { name: 'Only Name Changed' };
      userRepository.findOne.mockResolvedValue({ ...mockUser });
      userRepository.save.mockImplementation((user) => Promise.resolve(user as User));

      const result = await service.update(mockUser.id, updateDto);

      expect(result?.name).toBe(updateDto.name);
      expect(result?.email).toBe(originalUser.email);
      expect(result?.role).toBe(originalUser.role);
    });
  });

  describe('findAll', () => {
    const mockUsers = [mockUser, mockAdminUser];

    it('should return all users ordered by createdAt DESC', async () => {
      userRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(userRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no users exist', async () => {
      userRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('should return multiple users with different roles', async () => {
      userRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result[0].role).toBe(UserRole.CUSTOMER);
      expect(result[1].role).toBe(UserRole.ADMIN);
    });
  });
});
