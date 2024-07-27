import { Router } from 'express';
import { fetchAndSaveScores } from '../tasks/updateScores.js';

const router = Router();

// Define routes
router.get('/', fetchAndSaveScores);

export default router;
