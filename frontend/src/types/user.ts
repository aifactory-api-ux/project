export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  address: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  address: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  address: string;
}