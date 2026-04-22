import { Router } from 'express';
import { getLeagueStandings } from '../controllers/getLeagueStandingsController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:leagueId', auth, getLeagueStandings);

export default router;
