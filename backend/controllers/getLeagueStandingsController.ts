import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const getLeagueStandings = async (req: Request, res: Response): Promise<void> => {
  const { leagueId } = req.params;
  const query = `
    SELECT
      uhs.user_id,
      uhs.league_id,
      SUM(uhs.points) AS total_points,
      SUM(uhs.perfect) AS perfect_weeks,
      SUM(uhs.overdog_correct) AS overdog_correct,
      SUM(uhs.underdog_correct) AS underdog_correct,
      (SELECT uhs2.curr_streak
       FROM users_have_scores uhs2
       WHERE uhs2.user_id = uhs.user_id
         AND uhs2.league_id = uhs.league_id
       ORDER BY uhs2.week DESC
       LIMIT 1) AS curr_streak,
      MAX(uhs.max_streak) AS max_streak,
      u.email AS user_email,
      l.name AS league_name,
      lhu.team_name AS team_name
    FROM users_have_scores uhs
    JOIN users u ON uhs.user_id = u.id
    JOIN leagues l ON uhs.league_id = l.id
    JOIN leagues_have_users lhu ON uhs.user_id = lhu.user_id AND uhs.league_id = lhu.league_id
    WHERE uhs.league_id = ?
    GROUP BY uhs.user_id, uhs.league_id, u.email, l.name, lhu.team_name
    ORDER BY total_points DESC
  `;

  try {
    const [rows] = await pool.query(query, [leagueId]);
    res.json(rows);
  } catch (err: any) {
    logger.error('getLeagueStandings error', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
};
