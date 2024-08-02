import { Router } from 'express';
import { getLeagueStandings } from '../controllers/getLeagueStandingsController.js';

const router = Router();

// Define routes
router.get('/:leagueId', getLeagueStandings);

export default router;
