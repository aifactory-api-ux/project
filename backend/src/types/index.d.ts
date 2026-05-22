export interface Branch {
  id: number;
  name: string;
  address: string;
  managerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dispatch {
  id: number;
  branchId: number;
  productId: number;
  quantity: number;
  dispatchedAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  passwordHash: string;
  role: 'admin' | 'branch_manager';
  branchId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Plant {
  id: number;
  name: string;
  location: string;
  managerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributionCenter {
  id: number;
  name: string;
  address: string;
  region: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface DateRangeQuery {
  fromDate?: string;
  toDate?: string;
}