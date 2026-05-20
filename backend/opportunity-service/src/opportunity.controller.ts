import { Controller, Get, Post, Body, Param, Patch, Delete, Headers, HttpCode, HttpStatus, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { OpportunityService } from './opportunity.service';

@Controller('opportunities')
export class OpportunityController {
  constructor(private readonly opportunityService: OpportunityService) {}

  @Get()
  async findAll(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    return this.opportunityService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Headers('authorization') authHeader: string,
    @Body() body: { title: string; description: string },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    return this.opportunityService.create(body.title, body.description, 'owner-id');
  }

  @Get(':id')
  async findOne(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    const opportunity = await this.opportunityService.findById(id);
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    return opportunity;
  }

  @Patch(':id')
  async update(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; status?: 'open' | 'closed' },
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    const opportunity = await this.opportunityService.update(id, body);
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    return opportunity;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }
    await this.opportunityService.delete(id);
  }
}