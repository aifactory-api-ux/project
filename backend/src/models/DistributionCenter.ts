export interface DistributionCenter {
  id: number;
  name: string;
  address: string;
  region: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDistributionCenterInput {
  name: string;
  address: string;
  region: string;
  capacity: number;
}

export interface UpdateDistributionCenterInput {
  name?: string;
  address?: string;
  region?: string;
  capacity?: number;
}