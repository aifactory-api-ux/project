import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthRequest {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'admin';
  };
}

export class RefreshTokenRequest {
  @IsString()
  refreshToken: string;
}