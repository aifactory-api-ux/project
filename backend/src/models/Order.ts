export interface Order {
  id: number;
  plantId: number;
  distributionCenterId: number;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  quantity: number;
  deliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  plantId: number;
  distributionCenterId: number;
  status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  quantity: number;
  deliveryDate?: string | null;
}

export interface UpdateOrderInput {
  plantId?: number;
  distributionCenterId?: number;
  status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  quantity?: number;
  deliveryDate?: string | null;
}

export const ORDER_STATUSES = ['pending', 'in_transit', 'delivered', 'cancelled'] as const;