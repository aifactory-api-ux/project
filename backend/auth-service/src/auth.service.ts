import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../shared/entities/user.entity';
import {
  signJwt,
  signRefreshToken,
  verifyRefreshToken,
  hashPassword,
  comparePassword,
} from '../shared/utils/jwt';
import { AuthRequest, AuthResponse } from '../shared/dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(authRequest: AuthRequest): Promise<AuthResponse> {
    this.logger.log(`Registering user: ${authRequest.email}`);

    const existingUser = await this.userRepository.findOne({
      where: { email: authRequest.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = hashPassword(authRequest.password);

    const user = this.userRepository.create({
      email: authRequest.email,
      passwordHash,
      name: authRequest.email.split('@')[0],
      role: UserRole.CUSTOMER,
    });

    await this.userRepository.save(user);

    const accessToken = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role as 'customer' | 'admin',
    });

    const refreshToken = signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role as 'customer' | 'admin',
    });

    this.logger.log(`User registered successfully: ${user.id}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'customer' | 'admin',
      },
    };
  }

  async login(authRequest: AuthRequest): Promise<AuthResponse> {
    this.logger.log(`Login attempt for: ${authRequest.email}`);

    const user = await this.userRepository.findOne({
      where: { email: authRequest.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = comparePassword(authRequest.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role as 'customer' | 'admin',
    });

    const refreshToken = signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role as 'customer' | 'admin',
    });

    this.logger.log(`User logged in successfully: ${user.id}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'customer' | 'admin',
      },
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    this.logger.log('Refreshing token');

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const accessToken = signJwt({
      sub: user.id,
      email: user.email,
      role: user.role as 'customer' | 'admin',
    });

    const newRefreshToken = signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role as 'customer' | 'admin',
    });

    this.logger.log(`Token refreshed for user: ${user.id}`);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'customer' | 'admin',
      },
    };
  }

  async getUserById(userId: string): Promise<AuthResponse['user']> {
    this.logger.log(`Getting user info: ${userId}`);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'customer' | 'admin',
    };
  }
}