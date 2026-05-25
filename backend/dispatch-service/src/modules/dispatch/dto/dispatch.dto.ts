export class ProductDispatchDto {
  productId: string;
  quantity: number;
  unit: string;
}

export class ProductDispatchCreateDto {
  productId: string;
  quantity: number;
  unit: string;
}

export class DispatchDto {
  id: string;
  plantId: string;
  distributionCenterId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  scheduledDate: string;
  actualDeliveryDate: string | null;
  vehicleId: string;
  driverId: string;
  products: ProductDispatchDto[];
}

export class DispatchCreateDto {
  plantId: string;
  distributionCenterId: string;
  scheduledDate: string;
  vehicleId: string;
  driverId: string;
  products: ProductDispatchCreateDto[];
}