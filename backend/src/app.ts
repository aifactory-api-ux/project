import express, { Express } from 'express';
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.use((req, _res, next) => {
    console.log(JSON.stringify({
      level: 'info',
      message: 'Incoming request',
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    }));
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'backend',
      version: '1.0.0',
    });
  });

  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', ordersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}