import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 3600000, // 1 hour
};

function signToken(payload: object): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' }, (err, token) => {
      if (err || !token) return reject(err);
      resolve(token);
    });
  });
}

export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password, role, created_at, updated_at } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]) as any[];
    if (existing.length > 0) {
      res.status(400).json({ msg: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, role, created_at, updated_at]
    ) as any[];

    const insertId = result.insertId;
    const token = await signToken({ user: { id: insertId, email } });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({ userId: insertId, email });
  } catch (err: any) {
    logger.error('Register error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]) as any[];
    if (users.length === 0) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, users[0].password);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid credentials' });
      return;
    }

    const { id } = users[0];
    const token = await signToken({ user: { id, email } });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.json({ userId: id, email });
  } catch (err: any) {
    logger.error('Login error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  res.json({ msg: 'Logged out' });
};

export const verify = (req: Request, res: Response): void => {
  // authMiddleware already validated the token and set req.user
  res.json({ userId: req.user!.id, email: req.user!.email });
};
