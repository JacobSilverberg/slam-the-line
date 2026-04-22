import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const searchLeagues = async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query;

  if (!query) {
    res.status(400).json({ msg: 'Query parameter is required' });
    return;
  }

  try {
    const [leagues] = await pool.query(
      'SELECT id, name FROM leagues WHERE name LIKE ? LIMIT 10',
      [`%${query}%`]
    ) as any[];

    if (leagues.length === 0) {
      res.status(404).json({ msg: 'No leagues found' });
      return;
    }

    res.json(leagues);
  } catch (err: any) {
    logger.error('searchLeagues error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
