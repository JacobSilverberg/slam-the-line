import { Router } from 'express';
import { evaluateSpreads } from '../tasks/evaluateSpreads.js';

const router = Router();

// Define routes
router.get('/', evaluateSpreads);

export default router;
