import { Router } from 'express';
import { getUserLeagues } from '../controllers/getUserLeaguesController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:userId', auth, getUserLeagues);

export default router;
