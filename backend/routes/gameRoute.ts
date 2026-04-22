import { Router } from 'express';
import { getGamesByWeek } from '../controllers/gameController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:week', auth, getGamesByWeek);

export default router;
