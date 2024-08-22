import { Router } from 'express';
import { fetchAndSaveOdds } from '../tasks/updateOdds.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
  try {
    await fetchAndSaveOdds();
    res.status(200).send('Odds updated successfully.');
  } catch (error) {
    console.error('Error in updateOdds route:', error);
    res.status(500).send('Error updating odds.');
  }
});

export default router;
