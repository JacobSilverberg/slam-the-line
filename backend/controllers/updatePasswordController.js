import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';

// config
dotenv.config();

export const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body; // Only need email and new password

  try {
    // Check if the user exists
    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (user.length === 0) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update the user's password
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [
      hashedPassword,
      email,
    ]);

    // Optionally, issue a new token after password update (if needed)
    const payload = {
      user: { id: user[0].id, email },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ msg: 'Password updated successfully', token });
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

    const payload = {
      user: { id: user[0].id, email },
    };

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
};
