import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const leagueRegistration = async (req: Request, res: Response): Promise<void> => {
  const { leagueId, userId } = req.params;
  const { league_role, team_name } = req.body;

  try {
    const [existing] = await pool.query(
      'SELECT id FROM leagues_have_users WHERE user_id = ? AND league_id = ?',
      [userId, leagueId]
    ) as any[];
    if (existing.length > 0) {
      res.status(400).json({ msg: 'User is already signed up for the league' });
      return;
    }

    await pool.query(
      'INSERT INTO leagues_have_users (user_id, league_id, league_role, team_name) VALUES (?, ?, ?, ?)',
      [userId, leagueId, league_role, team_name]
    );

    res.json({ msg: 'User successfully signed up for the league' });
  } catch (err: any) {
    logger.error('leagueRegistration error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
