import { Router } from 'express';
import { userSelections } from '../controllers/userSelectionsController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:leagueId/:userId/:week', auth, userSelections);

export default router;
