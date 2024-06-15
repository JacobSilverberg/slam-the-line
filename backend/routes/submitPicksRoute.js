import express from 'express';
import { submitPicks } from '../controllers/submitPicksController.js';

const router = express.Router();

router.post('/', [], submitPicks);

export default router;
