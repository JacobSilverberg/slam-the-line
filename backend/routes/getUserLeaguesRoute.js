import { Router } from 'express';
import { getUserLeagues } from '../controllers/getUserLeaguesController.js';

const router = Router();

// Define routes
router.get('/:userId', getUserLeagues);

export default router;
