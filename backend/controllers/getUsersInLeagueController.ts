import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const getUsersInLeague = async (req: Request, res: Response): Promise<void> => {
  const { leagueId } = req.params;
  const query = `
    SELECT lhu.user_id, lhu.team_name
    FROM leagues_have_users lhu
    WHERE lhu.league_id = ?
  `;

  try {
    const [rows] = await pool.query(query, [leagueId]);
    res.json(rows);
  } catch (err: any) {
    logger.error('getUsersInLeague error', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch league users' });
  }
};
