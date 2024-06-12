// controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';

// config
dotenv.config();

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, role, created_at, updated_at } = req.body;

  try {
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    if (user.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, role, created_at, updated_at]
    );

    const insertId = result[0].insertId;

    const payload = {
      user: { id: insertId, email }
    };

    console.log(payload)

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (user.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    try {
      const payload = {
        user: { id: user[0].id, email },
      };

      console.log(payload);
    
      const token = await new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          process.env.JWT_SECRET,
          { expiresIn: '1h' },
          (err, token) => {
            if (err) {
              reject(err);
            } else {
              resolve(token);
            }
          }
        );
      });
    
      res.json({ token });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
