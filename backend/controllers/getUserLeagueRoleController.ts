import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const getUserLeagueRole = async (req: Request, res: Response): Promise<void> => {
  const { leagueId, userId } = req.params;

  try {
    const [users] = await pool.query(
      'SELECT league_role FROM leagues_have_users WHERE user_id = ? AND league_id = ?',
      [userId, leagueId]
    ) as any[];

    if (users.length > 0) {
      res.status(200).json({ league_role: users[0].league_role });
    } else {
      res.status(404).json({ msg: 'User not found in the league' });
    }
  } catch (err: any) {
    logger.error('getUserLeagueRole error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
