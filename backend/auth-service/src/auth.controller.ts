import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRequest, AuthResponse, RefreshTokenRequest } from '../shared/dto/auth.dto';
import { verifyJwt } from '../shared/utils/jwt';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() authRequest: AuthRequest): Promise<AuthResponse> {
    return this.authService.register(authRequest);
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(@Body() authRequest: AuthRequest): Promise<AuthResponse> {
    return this.authService.login(authRequest);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.CREATED)
  async refresh(@Body() refreshRequest: RefreshTokenRequest): Promise<AuthResponse> {
    if (!refreshRequest.refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return this.authService.refresh(refreshRequest.refreshToken);
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Headers('authorization') authHeader: string): Promise<AuthResponse['user']> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    let payload;
    try {
      payload = verifyJwt(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.authService.getUserById(payload.sub);
  }
}