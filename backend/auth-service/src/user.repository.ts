import { Injectable } from '@nestjs/common';
import { User } from '../../shared/models/User';

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class UserRepository {
  private users: Map<string, UserRecord> = new Map();

  async create(data: { email: string; passwordHash: string; fullName: string }): Promise<UserRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const user: UserRecord = {
      id,
      email: data.email,
      passwordHash: data.passwordHash,
      fullName: data.fullName,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) || null;
  }

  async update(id: string, data: Partial<{ fullName: string }>): Promise<UserRecord | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updated = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}