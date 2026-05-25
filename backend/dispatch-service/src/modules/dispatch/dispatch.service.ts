import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { DispatchEntity } from './entities/dispatch.entity';
import { DispatchDto, DispatchCreateDto, ProductDispatchDto } from './dto/dispatch.dto';

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    @InjectRepository(DispatchEntity)
    private readonly dispatchRepository: Repository<DispatchEntity>,
  ) {}

  async create(createDispatchDto: DispatchCreateDto): Promise<DispatchDto> {
    this.logger.log('Creating new dispatch');
    
    const now = new Date();
    const entity = this.dispatchRepository.create({
      id: uuidv4(),
      plantId: createDispatchDto.plantId,
      distributionCenterId: createDispatchDto.distributionCenterId,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      scheduledDate: new Date(createDispatchDto.scheduledDate),
      actualDeliveryDate: null,
      vehicleId: createDispatchDto.vehicleId,
      driverId: createDispatchDto.driverId,
      products: createDispatchDto.products.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        unit: p.unit,
      })),
    });

    const saved = await this.dispatchRepository.save(entity);
    this.logger.log(`Dispatch created with id: ${saved.id}`);
    
    return this.toDto(saved);
  }

  async findAll(filters: {
    status?: string;
    plantId?: string;
    distributionCenterId?: string;
  }): Promise<DispatchDto[]> {
    this.logger.log(`Finding all dispatches with filters: ${JSON.stringify(filters)}`);
    
    const queryBuilder = this.dispatchRepository.createQueryBuilder('dispatch');

    if (filters.status) {
      queryBuilder.andWhere('dispatch.status = :status', { status: filters.status });
    }
    if (filters.plantId) {
      queryBuilder.andWhere('dispatch.plantId = :plantId', { plantId: filters.plantId });
    }
    if (filters.distributionCenterId) {
      queryBuilder.andWhere('dispatch.distributionCenterId = :distributionCenterId', {
        distributionCenterId: filters.distributionCenterId,
      });
    }

    const entities = await queryBuilder.getMany();
    return entities.map((entity) => this.toDto(entity));
  }

  async findById(id: string): Promise<DispatchDto> {
    this.logger.log(`Finding dispatch by id: ${id}`);
    
    const entity = await this.dispatchRepository.findOne({ where: { id } });
    
    if (!entity) {
      throw new NotFoundException(`Dispatch with id ${id} not found`);
    }
    
    return this.toDto(entity);
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'in_transit' | 'delivered' | 'cancelled',
    actualDeliveryDate?: string,
  ): Promise<DispatchDto> {
    this.logger.log(`Updating dispatch ${id} status to ${status}`);
    
    const entity = await this.dispatchRepository.findOne({ where: { id } });
    
    if (!entity) {
      throw new NotFoundException(`Dispatch with id ${id} not found`);
    }

    if (status === 'delivered' && !actualDeliveryDate) {
      throw new BadRequestException('actualDeliveryDate is required when status is delivered');
    }

    entity.status = status;
    entity.updatedAt = new Date();
    
    if (actualDeliveryDate) {
      entity.actualDeliveryDate = new Date(actualDeliveryDate);
    }

    const updated = await this.dispatchRepository.save(entity);
    this.logger.log(`Dispatch ${id} status updated successfully`);
    
    return this.toDto(updated);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    this.logger.log(`Deleting dispatch ${id}`);
    
    const entity = await this.dispatchRepository.findOne({ where: { id } });
    
    if (!entity) {
      throw new NotFoundException(`Dispatch with id ${id} not found`);
    }

    await this.dispatchRepository.remove(entity);
    this.logger.log(`Dispatch ${id} deleted successfully`);
    
    return { success: true };
  }

  private toDto(entity: DispatchEntity): DispatchDto {
    return {
      id: entity.id,
      plantId: entity.plantId,
      distributionCenterId: entity.distributionCenterId,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      scheduledDate: entity.scheduledDate.toISOString(),
      actualDeliveryDate: entity.actualDeliveryDate ? entity.actualDeliveryDate.toISOString() : null,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      products: entity.products.map(
        (p: ProductDispatchDto | { productId: string; quantity: number; unit: string }) => ({
          productId: p.productId,
          quantity: p.quantity,
          unit: p.unit,
        }),
      ),
    };
  }
}