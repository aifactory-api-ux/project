import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import plantsRouter from './routes/plants';
import distributionCentersRouter from './routes/distributionCenters';
import ordersRouter from './routes/orders';
import metricsRouter from './routes/metrics';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const createApp = (): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'distroviz-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/plants', plantsRouter);
  app.use('/api/distribution-centers', distributionCentersRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/metrics', metricsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};