import { Router } from 'express';
import { fetchAndSaveScores } from '../tasks/updateScores.js';

const router = Router();

// Define routes
router.get('/', async (req, res) => {
  try {
    await fetchAndSaveScores();
    res.status(200).send('Scores updated successfully.');
  } catch (error) {
    console.error('Error in updateScores route:', error);
    res.status(500).send('Error updating scores.');
  }
});

export default router;
