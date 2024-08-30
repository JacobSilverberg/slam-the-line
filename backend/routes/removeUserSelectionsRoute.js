import express from 'express';
import { removeUserSelections } from '../controllers/removeUserSelectionsController.js';

const router = express.Router();

// Change from 'router.get' to 'router.delete' to handle DELETE requests
router.delete('/:leagueId/:userId', removeUserSelections);

export default router;
