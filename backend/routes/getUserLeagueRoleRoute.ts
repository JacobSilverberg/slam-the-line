import { Router } from 'express';
import { getUserLeagueRole } from '../controllers/getUserLeagueRoleController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:leagueId/user/:userId', auth, getUserLeagueRole);

export default router;
