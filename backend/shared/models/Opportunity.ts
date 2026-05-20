export interface Opportunity {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  status: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
}