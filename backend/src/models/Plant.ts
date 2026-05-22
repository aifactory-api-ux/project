export interface Plant {
  id: number;
  name: string;
  location: string;
  managerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlantInput {
  name: string;
  location: string;
  managerName: string;
}

export interface UpdatePlantInput {
  name?: string;
  location?: string;
  managerName?: string;
}