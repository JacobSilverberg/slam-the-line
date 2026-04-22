import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const getGamesByWeek = async (req: Request, res: Response): Promise<void> => {
  const { week } = req.params;
  const query = `
    SELECT g.*,
           ht.name AS home_team_name,
           ht.abbr AS home_team_abbr,
           at.name AS away_team_name,
           at.abbr AS away_team_abbr
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    WHERE g.week = ?
  `;

  try {
    const [rows] = await pool.query(query, [week]);
    res.json(rows);
  } catch (err: any) {
    logger.error('getGamesByWeek error', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};
