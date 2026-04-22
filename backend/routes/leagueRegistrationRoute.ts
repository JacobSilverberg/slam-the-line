import { Router } from 'express';
import { leagueRegistration } from '../controllers/leagueRegistrationController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.post('/:leagueId/users/:userId', auth, leagueRegistration);

export default router;
