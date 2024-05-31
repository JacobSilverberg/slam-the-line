import express from 'express';
import { leagueRegistration } from '../controllers/leagueRegistrationController.js';

const router = express.Router();

router.post('/:leagueId/users/:userId', [], leagueRegistration);

export default router;
