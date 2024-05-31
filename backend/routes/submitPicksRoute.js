import express from 'express';
import { submitPicks } from '../controllers/submitPicksController.js';

const router = express.Router();

router.post('/:leagueId/users/:userId', [], submitPicks);

export default router;
