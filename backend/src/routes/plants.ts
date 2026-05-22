import { Router, Request, Response } from 'express';
import { body, param, validationResult, query } from 'express-validator';
import { getAllPlants, getPlantById, createPlant, updatePlant, deletePlant } from '../controllers/plantController';

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
      const result = await getAllPlants(page, limit);
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
      const plant = await getPlantById(id);
      if (!plant) {
        return res.status(404).json({ success: false, error: 'Plant not found' });
      }
      res.status(200).json({ success: true, data: plant });
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
    body('location').isString().notEmpty().withMessage('location is required and must be a non-empty string'),
    body('managerName').isString().notEmpty().withMessage('managerName is required and must be a non-empty string'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { name, location, managerName } = req.body;
      const plant = await createPlant({ name, location, managerName });
      res.status(201).json({ success: true, data: plant });
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
    body('location').optional().isString().notEmpty().withMessage('location must be a non-empty string'),
    body('managerName').optional().isString().notEmpty().withMessage('managerName must be a non-empty string'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, location, managerName } = req.body;
      const plant = await updatePlant(id, { name, location, managerName });
      if (!plant) {
        return res.status(404).json({ success: false, error: 'Plant not found' });
      }
      res.status(200).json({ success: true, data: plant });
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
      const deleted = await deletePlant(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Plant not found' });
      }
      res.status(200).json({ success: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

export default router;