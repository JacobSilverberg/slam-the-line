import { Router } from 'express';
import { getOddsFromAPI } from '../tasks/getOdds.js';

const router = Router();

// Define routes
router.get('/', getOddsFromAPI);

export default router;
