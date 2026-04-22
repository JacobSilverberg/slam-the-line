import { Router } from 'express';
import { getUsersInLeague } from '../controllers/getUsersInLeagueController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:leagueId', auth, getUsersInLeague);

export default router;
