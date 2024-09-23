// routes/authRoutes.js
import express from 'express';
import { check } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import { updatePassword } from '../controllers/updatePasswordController.js';

const router = express.Router();

// Register route
router.post(
  '/register',
  [
    check('password', 'Password is required').isLength({ min: 6 }),
    check('email', 'Email is required').isEmail(),
  ],
  register
);

// Login route
router.post(
  '/login',
  [
    check('email', 'Email is required').not().isEmpty(),
    check('password', 'Password is required').exists(),
  ],
  login
);

// Update password (forgot password) route
router.post(
  '/updatepassword',
  [
    check('password', 'Password is required').isLength({ min: 6 }),
    check('email', 'Email is required').isEmail(),
  ],
  updatePassword
);

export default router;
