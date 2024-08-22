import { Router } from 'express';
import { evaluateUserScores } from '../tasks/evaluateUserScores.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
  try {
    await evaluateUserScores();
    res.status(200).send('User scores evaluated successfully.');
  } catch (error) {
    console.error('Error in evaluateUserScores route:', error);
    res.status(500).send('Error evaluating user scores.');
  }
});

export default router;
