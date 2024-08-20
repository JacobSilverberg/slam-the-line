import { Router } from 'express';
import { getOddsFromAPI } from '../tasks/getOdds.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
  try {
    await getOddsFromAPI();
    res.status(200).send('Odds fetched and processed successfully.');
  } catch (error) {
    console.error('Error in getOdds route:', error);
    res.status(500).send('Error fetching odds.');
  }
});

export default router;
