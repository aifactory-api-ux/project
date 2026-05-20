import { Injectable } from '@nestjs/common';
import { Opportunity } from '../../shared/models/Opportunity';

interface OpportunityRecord extends Opportunity {}

@Injectable()
export class OpportunityRepository {
  private opportunities: Map<string, OpportunityRecord> = new Map();

  async findAll(): Promise<OpportunityRecord[]> {
    return Array.from(this.opportunities.values());
  }

  async findById(id: string): Promise<OpportunityRecord | null> {
    return this.opportunities.get(id) || null;
  }

  async create(data: { title: string; description: string; ownerId: string }): Promise<OpportunityRecord> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const opportunity: OpportunityRecord = {
      id,
      title: data.title,
      description: data.description,
      ownerId: data.ownerId,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async update(
    id: string,
    data: { title?: string; description?: string; status?: 'open' | 'closed' },
  ): Promise<OpportunityRecord | null> {
    const opportunity = this.opportunities.get(id);
    if (!opportunity) return null;

    const updated: OpportunityRecord = {
      ...opportunity,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.opportunities.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.opportunities.delete(id);
  }
}