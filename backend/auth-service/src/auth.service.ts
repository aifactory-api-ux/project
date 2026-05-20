import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { hashPassword, comparePassword } from '../../shared/utils/hash';
import * as jwt from 'jsonwebtoken';

export interface UserPayload {
  id: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(email: string, password: string, fullName: string) {
    const passwordHash = hashPassword(password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      fullName,
    });
    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async findUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findUserById(id: string) {
    return this.userRepository.findById(id);
  }

  checkPermission(user: { roles?: string[] }, action: string): boolean {
    if (user.roles && user.roles.includes('admin')) {
      return true;
    }
    return false;
  }
}