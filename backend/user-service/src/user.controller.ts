import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from '../shared/dto/user.dto';
import { verifyJwt, JwtPayload } from '../shared/utils/jwt';
import { UserRole } from '../shared/entities/user.entity';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    let payload: JwtPayload;

    try {
      payload = verifyJwt(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userService.findById(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    let payload: JwtPayload;

    try {
      payload = verifyJwt(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @Headers('authorization') authHeader: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);
    let payload: JwtPayload;

    try {
      payload = verifyJwt(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.userService.update(payload.sub, updateUserDto);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

@Controller('health')
export class HealthController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      service: 'user-service',
      version: '1.0.0',
    };
  }
}
