import { Router, Request, Response } from 'express';
import { getScoresFromAPI } from '../tasks/getScores.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await getScoresFromAPI();
    res.status(200).json(data);
  } catch (error) {
    logger.error('getScores route error', { error });
    res.status(500).json({ msg: 'Error fetching scores' });
  }
});

export default router;
