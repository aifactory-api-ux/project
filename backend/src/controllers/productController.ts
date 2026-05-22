import { Product, CreateProductInput, UpdateProductInput } from '../types/product';
import * as productModel from '../models/product';

export async function getProducts(): Promise<Product[]> {
  return productModel.findAll();
}

export async function getProductById(id: number): Promise<Product | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return productModel.findById(id);
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  validateCreateInput(input);
  return productModel.create(input);
}

export async function updateProduct(id: number, input: UpdateProductInput): Promise<Product | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  validateUpdateInput(input);
  return productModel.update(id, input);
}

export async function deleteProduct(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) {
    return false;
  }
  return productModel.remove(id);
}

function validateCreateInput(input: CreateProductInput): void {
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    throw new Error('Name is required');
  }
  if (input.name.length > 255) {
    throw new Error('Name must be 255 characters or less');
  }
  if (!input.description || typeof input.description !== 'string') {
    throw new Error('Description is required');
  }
  if (typeof input.price !== 'number' || input.price < 0) {
    throw new Error('Price must be a non-negative number');
  }
  if (!input.imageUrl || typeof input.imageUrl !== 'string') {
    throw new Error('Image URL is required');
  }
  if (typeof input.stock !== 'number' || input.stock < 0 || !Number.isInteger(input.stock)) {
    throw new Error('Stock must be a non-negative integer');
  }
  if (!Number.isInteger(input.categoryId) || input.categoryId <= 0) {
    throw new Error('Category ID must be a positive integer');
  }
}

function validateUpdateInput(input: UpdateProductInput): void {
  if (input.name !== undefined) {
    if (typeof input.name !== 'string' || input.name.trim().length === 0) {
      throw new Error('Name must be a non-empty string');
    }
    if (input.name.length > 255) {
      throw new Error('Name must be 255 characters or less');
    }
  }
  if (input.description !== undefined && typeof input.description !== 'string') {
    throw new Error('Description must be a string');
  }
  if (input.price !== undefined) {
    if (typeof input.price !== 'number' || input.price < 0) {
      throw new Error('Price must be a non-negative number');
    }
  }
  if (input.imageUrl !== undefined && typeof input.imageUrl !== 'string') {
    throw new Error('Image URL must be a string');
  }
  if (input.stock !== undefined) {
    if (typeof input.stock !== 'number' || input.stock < 0 || !Number.isInteger(input.stock)) {
      throw new Error('Stock must be a non-negative integer');
    }
  }
  if (input.categoryId !== undefined) {
    if (!Number.isInteger(input.categoryId) || input.categoryId <= 0) {
      throw new Error('Category ID must be a positive integer');
    }
  }
}