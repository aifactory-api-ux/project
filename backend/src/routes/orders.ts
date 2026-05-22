import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import * as orderController from '../controllers/orderController';
import { authenticateJWT } from '../middleware/auth';
import { CreateOrderInput } from '../types/order';

const router = Router();

router.use(authenticateJWT);

router.post(
  '/',
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isInt({ min: 1 }).toInt(),
  body('items.*.quantity').isInt({ min: 1 }).toInt(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user!.userId;
      const input: CreateOrderInput = {
        items: req.body.items,
      };

      const order = await orderController.createOrder(userId, input);
      res.status(201).json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (
        message === 'Items are required' ||
        message === 'Items must be an array' ||
        message === 'Order must have at least one item' ||
        message.includes('Product ID must be') ||
        message.includes('Quantity must be') ||
        message.includes('not found') ||
        message.includes('Not enough stock')
      ) {
        res.status(400).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }
);

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const orders = await orderController.getOrders(userId);
    res.json(orders);
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

      const userId = req.user!.userId;
      const orderId = req.params.id as unknown as number;
      const order = await orderController.getOrderById(userId, orderId);
      res.json(order);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Order not found' || message === 'Order ID must be a positive integer') {
        res.status(404).json({ error: message });
        return;
      }
      res.status(500).json({ error: message });
    }
  }
);

export default router;