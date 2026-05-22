import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import * as categoryController from '../controllers/categoryController';
import { CreateCategoryInput, UpdateCategoryInput } from '../types/category';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await categoryController.getCategories();
    res.json(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

router.get(
  '/:id',
  param('id').isInt({ min: 1 }).toInt(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const id = req.params.id as unknown as number;
      const category = await categoryController.getCategoryById(id);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
);

router.post(
  '/',
  body('name').isString().trim().notEmpty(),
  body('description').isString(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const input: CreateCategoryInput = {
        name: req.body.name,
        description: req.body.description,
      };
      const category = await categoryController.createCategory(input);
      res.status(201).json(category);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

router.put(
  '/:id',
  param('id').isInt({ min: 1 }).toInt(),
  body('name').optional().isString().trim().notEmpty(),
  body('description').optional().isString(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const id = req.params.id as unknown as number;
      const input: UpdateCategoryInput = {
        name: req.body.name,
        description: req.body.description,
      };
      const category = await categoryController.updateCategory(id, input);
      if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json(category);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  }
);

router.delete(
  '/:id',
  param('id').isInt({ min: 1 }).toInt(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const id = req.params.id as unknown as number;
      const success = await categoryController.deleteCategory(id);
      if (!success) {
        res.status(404).json({ error: 'Category not found' });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
);

export default router;