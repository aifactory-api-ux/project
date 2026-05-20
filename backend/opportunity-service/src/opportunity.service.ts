import { Injectable } from '@nestjs/common';
import { OpportunityRepository } from './opportunity.repository';
import { Opportunity } from '../../shared/models/Opportunity';

@Injectable()
export class OpportunityService {
  constructor(private readonly opportunityRepository: OpportunityRepository) {}

  async findAll(): Promise<Opportunity[]> {
    return this.opportunityRepository.findAll();
  }

  async findById(id: string): Promise<Opportunity | null> {
    return this.opportunityRepository.findById(id);
  }

  async create(title: string, description: string, ownerId: string): Promise<Opportunity> {
    return this.opportunityRepository.create({ title, description, ownerId });
  }

  async update(
    id: string,
    data: { title?: string; description?: string; status?: 'open' | 'closed' },
  ): Promise<Opportunity | null> {
    return this.opportunityRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.opportunityRepository.delete(id);
  }
}