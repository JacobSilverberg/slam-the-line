import { Router } from 'express';
import { fetchAndSaveOdds } from '../tasks/updateOdds.js';

const router = Router();

// Define routes
router.get('/', fetchAndSaveOdds);

export default router;
