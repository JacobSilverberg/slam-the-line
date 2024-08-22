import { Router } from 'express';
import { evaluateSpreads } from '../tasks/evaluateSpreads.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
  try {
    await evaluateSpreads();
    res.status(200).send('Spreads evaluated successfully.');
  } catch (error) {
    console.error('Error in evaluateSpreads route:', error);
    res.status(500).send('Error evaluating spreads.');
  }
});

export default router;
