import { Router } from 'express';
import { submitPicks } from '../controllers/submitPicksController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', auth, submitPicks);

export default router;
