import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const removeUserSelections = async (req: Request, res: Response): Promise<void> => {
  const { leagueId, userId, week } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM users_select_games WHERE league_id = ? AND user_id = ? AND week = ?',
      [leagueId, userId, week]
    ) as any[];

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'User selections deleted successfully.' });
    } else {
      res.status(404).json({ message: 'No selections found for the given user and league.' });
    }
  } catch (err: any) {
    logger.error('removeUserSelections error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
