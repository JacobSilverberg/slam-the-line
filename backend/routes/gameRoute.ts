import { Router } from 'express';
import { getGamesByWeek, getGamesBySeason } from '../controllers/gameController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/season/:year', auth, getGamesBySeason);
router.get('/:week', auth, getGamesByWeek);

export default router;
