import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'dispatch-service',
      version: '1.0.0',
    };
  }
}