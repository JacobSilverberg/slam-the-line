import { Router } from 'express';
import { checkAndUpdateGameStatus } from '../tasks/evaluateGameStart.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
  try {
    await checkAndUpdateGameStatus();
    res.status(200).send('Game starts evaluated successfully.');
  } catch (error) {
    console.error('Error in evaluateGameStart route:', error);
    res.status(500).send('Error evaluating spreads.');
  }
});

export default router;
