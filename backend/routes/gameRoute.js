import { Router } from 'express';
import { getGamesByWeek } from '../controllers/gameController.js';

const router = Router();

// Define routes
router.get('/:week', getGamesByWeek);

export default router;
