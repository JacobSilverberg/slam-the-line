import { Router } from 'express';
import { removeUserSelections } from '../controllers/removeUserSelectionsController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.delete('/:leagueId/:userId/:week', auth, removeUserSelections);

export default router;
