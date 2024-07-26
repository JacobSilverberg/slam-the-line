import { Router } from 'express';
import { getScoresFromAPI } from '../tasks/getScores.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
    try {
      const odds = await getScoresFromAPI();
      res.json(odds);
    } catch (error) {
      console.error('Error fetching odds:', error);
      res.status(500).send('Error fetching odds');
    }
  });

export default router;
