import { Request, Response } from 'express';
import { findUserById } from '../models/user';
import { TokenPayload } from '../utils/jwt';

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = (req.user as TokenPayload);

    if (!user || !user.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const foundUser = await findUserById(user.userId);
    if (!foundUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      address: foundUser.address,
      isAdmin: foundUser.isAdmin,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    });
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      message: 'Get user error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
    res.status(500).json({ error: 'Internal server error' });
  }
}