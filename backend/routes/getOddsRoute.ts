import { Router, Request, Response } from 'express';
import { getOddsFromAPI } from '../tasks/getOdds.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await getOddsFromAPI();
    res.status(200).json(data);
  } catch (error) {
    logger.error('getOdds route error', { error });
    res.status(500).json({ msg: 'Error fetching odds' });
  }
});

export default router;
