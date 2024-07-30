import express from 'express';
import { userSelections } from '../controllers/userSelectionsController.js';

const router = express.Router();

router.get('/:leagueId/:userId', [], userSelections);

export default router;
