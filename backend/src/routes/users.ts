import { Router } from 'express';
import { getMe } from '../controllers/userController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/me', authenticateJWT, getMe);

export default router;