import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

const getSecret = (name: string): string => {
  const secret = process.env[name];
  if (!secret) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return secret;
};

export interface JwtPayload {
  sub: string;
  email: string;
  role: 'customer' | 'admin';
  iat?: number;
  exp?: number;
}

export const signJwt = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = getSecret('JWT_SECRET');
  const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
  return jwt.sign(payload, secret, { expiresIn });
};

export const signRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  const secret = getSecret('REFRESH_TOKEN_SECRET');
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyJwt = (token: string): JwtPayload => {
  const secret = getSecret('JWT_SECRET');
  return jwt.verify(token, secret) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  const secret = getSecret('REFRESH_TOKEN_SECRET');
  return jwt.verify(token, secret) as JwtPayload;
};

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};

export const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const comparePassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash;
};

export const generateUuid = (): string => {
  return crypto.randomUUID();
};