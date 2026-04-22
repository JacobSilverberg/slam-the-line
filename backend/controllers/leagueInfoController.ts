import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const leagueInfo = async (req: Request, res: Response): Promise<void> => {
  const { leagueId } = req.params;

  try {
    const [league] = await pool.query('SELECT * FROM leagues WHERE id = ?', [leagueId]);
    res.status(200).json({ league });
  } catch (err: any) {
    logger.error('leagueInfo error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
