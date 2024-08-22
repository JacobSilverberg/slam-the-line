import { Router } from 'express';
import { getScoresFromAPI } from '../tasks/getScores.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
  try {
    await getScoresFromAPI();
    res.status(200).send('Scores fetched and processed successfully.');
  } catch (error) {
    console.error('Error in getScores route:', error);
    res.status(500).send('Error fetching Scores.');
  }
});

export default router;
