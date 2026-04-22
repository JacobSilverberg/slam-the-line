import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

interface Pick {
  gameId: number;
  teamId: number;
  points: number;
  createdAt: string;
  updatedAt: string;
  week: number;
}

export const submitPicks = async (req: Request, res: Response): Promise<void> => {
  const { userId, leagueId, picks } = req.body as { userId: number; leagueId: number; picks: Pick[] };

  try {
    for (const pick of picks) {
      const { gameId, teamId, points, createdAt, updatedAt, week } = pick;
      await pool.query(
        'INSERT INTO users_select_games (user_id, league_id, game_id, team_id, created_at, updated_at, points, week) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, leagueId, gameId, teamId, createdAt, updatedAt, points, week]
      );
    }
    res.status(200).json({ msg: 'Picks submitted successfully' });
  } catch (err: any) {
    logger.error('submitPicks error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
