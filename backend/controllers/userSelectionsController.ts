import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const userSelections = async (req: Request, res: Response): Promise<void> => {
  const { leagueId, userId, week } = req.params;

  try {
    const [selections] = await pool.query(
      'SELECT * FROM users_select_games WHERE league_id = ? AND user_id = ? AND week = ?',
      [leagueId, userId, week]
    );
    res.status(200).json({ league: selections });
  } catch (err: any) {
    logger.error('userSelections error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
