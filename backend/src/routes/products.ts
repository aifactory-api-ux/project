import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import * as productController from '../controllers/productController';
import { CreateProductInput, UpdateProductInput } from '../types/product';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await productController.getProducts();
    res.json(products);
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
      const product = await productController.getProductById(id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
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
  body('price').isFloat({ min: 0 }),
  body('imageUrl').isString().trim().notEmpty(),
  body('stock').isInt({ min: 0 }),
  body('categoryId').isInt({ min: 1 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const input: CreateProductInput = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        stock: req.body.stock,
        categoryId: req.body.categoryId,
      };
      const product = await productController.createProduct(input);
      res.status(201).json(product);
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
  body('price').optional().isFloat({ min: 0 }),
  body('imageUrl').optional().isString().trim().notEmpty(),
  body('stock').optional().isInt({ min: 0 }),
  body('categoryId').optional().isInt({ min: 1 }),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const id = req.params.id as unknown as number;
      const input: UpdateProductInput = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        stock: req.body.stock,
        categoryId: req.body.categoryId,
      };
      const product = await productController.updateProduct(id, input);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
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
      const success = await productController.deleteProduct(id);
      if (!success) {
        res.status(404).json({ error: 'Product not found' });
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