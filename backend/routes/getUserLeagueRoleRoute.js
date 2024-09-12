import { Router } from 'express';
import { getUserLeagueRole } from '../controllers/getUserLeagueRoleController.js';

const router = Router();

// Define routes
router.get('/:leagueId/user/:userId', getUserLeagueRole);

export default router;
