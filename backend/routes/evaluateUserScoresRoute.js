import { Router } from 'express';
import { evaluateUserScores } from '../tasks/evaluateUserScores.js';

const router = Router();

// Define routes
router.get('/', evaluateUserScores);

export default router;
