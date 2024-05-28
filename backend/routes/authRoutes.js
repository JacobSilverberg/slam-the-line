// routes/authRoutes.js
import express from 'express';
import { check } from 'express-validator';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').isLength({ min: 6 }),
    check('email', 'Email is required').isEmail(),
  ],
  register
);

router.post(
  '/login',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').exists(),
  ],
  login
);

export default router;
