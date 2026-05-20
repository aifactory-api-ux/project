import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SessionService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey';
  }

  async createSession(user: { id: string; email: string }): Promise<string> {
    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
    return token;
  }

  async validateToken(token: string): Promise<{ userId: string; email: string } | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as { userId: string; email: string };
      return { userId: payload.userId, email: payload.email };
    } catch {
      return null;
    }
  }

  async invalidateSession(token: string): Promise<void> {
  }
}