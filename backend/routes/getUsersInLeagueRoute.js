import { Router } from 'express';
import { getUsersInLeague } from '../controllers/getUsersInLeagueController.js';

const router = Router();

// Define routes
router.get('/:leagueId', getUsersInLeague);

export default router;
