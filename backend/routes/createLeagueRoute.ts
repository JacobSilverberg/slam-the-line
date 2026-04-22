import { Router } from 'express';
import { createLeague } from '../controllers/createLeagueController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', auth, createLeague);

export default router;
