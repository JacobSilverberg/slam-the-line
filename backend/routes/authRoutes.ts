import { Router } from 'express';
import { check } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { register, login, logout, verify } from '../controllers/authController.js';
import { updatePassword } from '../controllers/updatePasswordController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { msg: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register',
  authLimiter,
  [
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  register
);

router.post(
  '/login',
  authLimiter,
  [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login
);

router.post(
  '/updatepassword',
  authLimiter,
  [
    check('email', 'Valid email is required').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  ],
  updatePassword
);

router.post('/logout', logout);
router.get('/verify', auth, verify);

export default router;
