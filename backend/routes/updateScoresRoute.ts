import { Router, Request, Response } from 'express';
import { fetchAndSaveScores } from '../tasks/updateScores.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await fetchAndSaveScores();
    res.status(200).json({ msg: 'Scores updated successfully' });
  } catch (error) {
    logger.error('updateScores route error', { error });
    res.status(500).json({ msg: 'Error updating scores' });
  }
});

export default router;
