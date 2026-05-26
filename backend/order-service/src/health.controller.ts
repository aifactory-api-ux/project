import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  healthCheck(): { status: string; service: string; version: string } {
    return {
      status: 'ok',
      service: 'order-service',
      version: '1.0.0',
    };
  }
}