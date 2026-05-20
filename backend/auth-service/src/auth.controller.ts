import { Controller, Post, Get, Body, Param, Headers, HttpCode, HttpStatus, UnauthorizedException, ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: { email: string; password: string; fullName: string }) {
    if (!body.email || !body.password || !body.fullName) {
      throw new UnprocessableEntityException('Missing required fields');
    }

    const existingUser = await this.authService.findUserByEmail(body.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.authService.register(body.email, body.password, body.fullName);
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new UnprocessableEntityException('Missing required fields');
    }

    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.sessionService.createSession(user);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Get('me')
  async getMe(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    const payload = await this.sessionService.validateToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.authService.findUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    await this.sessionService.invalidateSession(token);
  }
}