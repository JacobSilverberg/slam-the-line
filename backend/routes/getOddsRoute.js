import { Router } from 'express';
import { getOddsFromAPI } from '../tasks/getOdds.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
  try {
    const odds = await getOddsFromAPI();
    res.json(odds);
  } catch (error) {
    console.error('Error fetching odds:', error);
    res.status(500).send('Error fetching odds');
  }
});

export default router;