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
  maxAge: 3600000,
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]) as any[];
    if (users.length === 0) {
      // Return success to avoid revealing whether the email is registered
      res.status(200).json({ msg: 'Password updated successfully' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

    const { id } = users[0];
    const token = await new Promise<string>((resolve, reject) => {
      jwt.sign({ user: { id, email } }, process.env.JWT_SECRET!, { expiresIn: '1h' }, (err, t) => {
        if (err || !t) return reject(err);
        resolve(t);
      });
    });

    res.cookie('token', token, COOKIE_OPTIONS);
    res.status(200).json({ msg: 'Password updated successfully', userId: id, email });
  } catch (err: any) {
    logger.error('Update password error', { error: err.message });
    res.status(500).json({ msg: 'Server error' });
  }
};
