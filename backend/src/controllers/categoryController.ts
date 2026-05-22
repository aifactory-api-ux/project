import { Category, CreateCategoryInput, UpdateCategoryInput } from '../types/category';
import * as categoryModel from '../models/category';

export async function getCategories(): Promise<Category[]> {
  return categoryModel.findAll();
}

export async function getCategoryById(id: number): Promise<Category | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return categoryModel.findById(id);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  validateCreateInput(input);
  return categoryModel.create(input);
}

export async function updateCategory(id: number, input: UpdateCategoryInput): Promise<Category | null> {
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  validateUpdateInput(input);
  return categoryModel.update(id, input);
}

export async function deleteCategory(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) {
    return false;
  }
  return categoryModel.remove(id);
}

function validateCreateInput(input: CreateCategoryInput): void {
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    throw new Error('Name is required');
  }
  if (input.name.length > 255) {
    throw new Error('Name must be 255 characters or less');
  }
  if (!input.description || typeof input.description !== 'string') {
    throw new Error('Description is required');
  }
}

function validateUpdateInput(input: UpdateCategoryInput): void {
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
}