import { Router, Request, Response } from 'express';
import { body, param, validationResult, query } from 'express-validator';
import {
  getAllDistributionCenters,
  getDistributionCenterById,
  createDistributionCenter,
  updateDistributionCenter,
  deleteDistributionCenter,
} from '../controllers/distributionCenterController';

const router = Router();

const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const result = await getAllDistributionCenters(page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const dc = await getDistributionCenterById(id);
      if (!dc) {
        return res.status(404).json({ success: false, error: 'Distribution center not found' });
      }
      res.status(200).json({ success: true, data: dc });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

router.post(
  '/',
  [
    body('name').isString().notEmpty().withMessage('name is required and must be a non-empty string'),
    body('address').isString().notEmpty().withMessage('address is required and must be a non-empty string'),
    body('region').isString().notEmpty().withMessage('region is required and must be a non-empty string'),
    body('capacity').isInt({ min: 0 }).withMessage('capacity is required and must be a non-negative integer'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { name, address, region, capacity } = req.body;
      const dc = await createDistributionCenter({ name, address, region, capacity });
      res.status(201).json({ success: true, data: dc });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

router.put(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
    body('name').optional().isString().notEmpty().withMessage('name must be a non-empty string'),
    body('address').optional().isString().notEmpty().withMessage('address must be a non-empty string'),
    body('region').optional().isString().notEmpty().withMessage('region must be a non-empty string'),
    body('capacity').optional().isInt({ min: 0 }).withMessage('capacity must be a non-negative integer'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, address, region, capacity } = req.body;
      const dc = await updateDistributionCenter(id, { name, address, region, capacity });
      if (!dc) {
        return res.status(404).json({ success: false, error: 'Distribution center not found' });
      }
      res.status(200).json({ success: true, data: dc });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

router.delete(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('id must be a positive integer')],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const deleted = await deleteDistributionCenter(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Distribution center not found' });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

export default router;