import { Router } from 'express';
import { leagueInfo } from '../controllers/leagueInfoController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:leagueId', auth, leagueInfo);

export default router;
