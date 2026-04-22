import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const getUserIdByEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;

  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]) as any[];
    if (users.length > 0) {
      res.status(200).json({ userId: users[0].id });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err: any) {
    logger.error('getUserIdByEmail error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
