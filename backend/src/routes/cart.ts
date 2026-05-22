import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import * as cartController from '../controllers/cartController';
import { authenticateJWT } from '../middleware/auth';
import { AddCartItemInput, UpdateCartItemInput } from '../types/cart';

const router = Router();

router.use(authenticateJWT);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const cart = await cartController.getCart(userId);
    res.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

router.post(
  '/items',
  body('productId').isInt({ min: 1 }).toInt(),
  body('quantity').isInt({ min: 1 }).toInt(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const userId = req.user!.userId;
      const input: AddCartItemInput = {
        productId: req.body.productId,
        quantity: req.body.quantity,
      };
      const cart = await cartController.addItemToCart(userId, input);
      res.status(201).json(cart);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Product not found' || message === 'Not enough stock available') {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }
);

router.put(
  '/items/:productId',
  param('productId').isInt({ min: 1 }).toInt(),
  body('quantity').isInt({ min: 1 }).toInt(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const userId = req.user!.userId;
      const productId = req.params.productId as unknown as number;
      const input: UpdateCartItemInput = {
        quantity: req.body.quantity,
      };
      const cart = await cartController.updateCartItem(userId, productId, input);
      res.json(cart);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Product not found' || message === 'Cart item not found' || message === 'Not enough stock available') {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }
);

router.delete(
  '/items/:productId',
  param('productId').isInt({ min: 1 }).toInt(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      const userId = req.user!.userId;
      const productId = req.params.productId as unknown as number;
      await cartController.removeCartItem(userId, productId);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Product not found' || message === 'Cart item not found') {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }
);

export default router;