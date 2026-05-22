import { Router, Request, Response } from 'express';
import { validationResult, query } from 'express-validator';
import { getKPIs, getTrends, getVolumeByPlant, validateDateRange } from '../controllers/metricsController';

const router = Router();

const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array()[0].msg });
  }
  next();
};

router.get(
  '/kpis',
  [
    query('fromDate').optional().isISO8601().withMessage('fromDate must be a valid ISO8601 date'),
    query('toDate').optional().isISO8601().withMessage('toDate must be a valid ISO8601 date'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { fromDate, toDate } = req.query;
      validateDateRange(fromDate as string | undefined, toDate as string | undefined);
      const kpis = await getKPIs(fromDate as string | undefined, toDate as string | undefined);
      res.status(200).json({ success: true, data: kpis });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ success: false, error: errorMessage });
    }
  }
);

router.get(
  '/trends',
  [
    query('fromDate').optional().isISO8601().withMessage('fromDate must be a valid ISO8601 date'),
    query('toDate').optional().isISO8601().withMessage('toDate must be a valid ISO8601 date'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { fromDate, toDate } = req.query;
      validateDateRange(fromDate as string | undefined, toDate as string | undefined);
      const trends = await getTrends(fromDate as string | undefined, toDate as string | undefined);
      res.status(200).json({ success: true, data: trends });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ success: false, error: errorMessage });
    }
  }
);

router.get(
  '/volume-by-plant',
  [
    query('plantId').optional().isInt({ min: 1 }).withMessage('plantId must be a positive integer'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const plantId = req.query.plantId ? parseInt(req.query.plantId as string, 10) : undefined;
      const volume = await getVolumeByPlant(plantId);
      res.status(200).json({ success: true, data: volume });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ success: false, error: errorMessage });
    }
  }
);

export default router;