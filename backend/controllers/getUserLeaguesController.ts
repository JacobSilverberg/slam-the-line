import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const getUserLeagues = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const query = `
    SELECT lhu.team_name, l.name AS league_name, l.id AS league_id, l.year
    FROM leagues_have_users lhu
    JOIN leagues l ON lhu.league_id = l.id
    WHERE lhu.user_id = ?
  `;

  try {
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err: any) {
    logger.error('getUserLeagues error', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch user leagues' });
  }
};
