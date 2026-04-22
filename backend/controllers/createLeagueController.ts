import { Request, Response } from 'express';
import pool from '../config/db.js';
import logger from '../utils/logger.js';

export const createLeague = async (req: Request, res: Response): Promise<void> => {
  const { gamesSelectMax, gamesSelectMin, name, sport, type, weeklyPoints, year } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM leagues WHERE name = ?', [name]) as any[];
    if (existing.length > 0) {
      res.status(400).json({ msg: 'League with that name already exists' });
      return;
    }

    await pool.query(
      'INSERT INTO leagues (games_select_max, games_select_min, name, sport, type, weekly_points, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [gamesSelectMax, gamesSelectMin, name, sport, type, weeklyPoints, year]
    );

    const [rows] = await pool.query('SELECT LAST_INSERT_ID() as id') as any[];
    res.json({ message: 'League created successfully', id: rows[0].id });
  } catch (err: any) {
    logger.error('createLeague error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
