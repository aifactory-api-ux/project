import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { DispatchDto, DispatchCreateDto } from './dto/dispatch.dto';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createDispatch(@Body() createDispatchDto: DispatchCreateDto): Promise<DispatchDto> {
    return this.dispatchService.create(createDispatchDto);
  }

  @Get()
  async getAllDispatches(
    @Query('status') status?: string,
    @Query('plantId') plantId?: string,
    @Query('distributionCenterId') distributionCenterId?: string,
  ): Promise<DispatchDto[]> {
    return this.dispatchService.findAll({ status, plantId, distributionCenterId });
  }

  @Get(':id')
  async getDispatchById(@Param('id') id: string): Promise<DispatchDto> {
    return this.dispatchService.findById(id);
  }

  @Patch(':id/status')
  async updateDispatchStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'; actualDeliveryDate?: string },
  ): Promise<DispatchDto> {
    return this.dispatchService.updateStatus(id, body.status, body.actualDeliveryDate);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteDispatch(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.dispatchService.delete(id);
  }
}