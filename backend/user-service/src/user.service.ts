import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../shared/entities/user.entity';
import { UpdateUserDto } from '../shared/dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    this.logger.log(`Finding user by id: ${id}`);
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`);
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    this.logger.log(`Updating user: ${id}`);

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.name !== undefined) {
      user.name = updateUserDto.name;
    }
    if (updateUserDto.passwordHash !== undefined) {
      user.passwordHash = updateUserDto.passwordHash;
    }

    await this.userRepository.save(user);
    this.logger.log(`User updated successfully: ${id}`);

    return user;
  }

  async findAll(): Promise<User[]> {
    this.logger.log('Finding all users');
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
