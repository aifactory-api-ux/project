export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export type CreateOrderDto = {
  items: Array<{ productId: string; quantity: number }>;
};

export type UpdateOrderStatusDto = {
  status: Order['status'];
};