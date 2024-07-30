import express from 'express';
import { removeUserSelections } from '../controllers/removeUserSelectionsController.js';

const router = express.Router();

router.get('/:leagueId/:userId', [], removeUserSelections);

export default router;
