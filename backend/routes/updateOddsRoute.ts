import { Router, Request, Response } from 'express';
import { fetchAndSaveOdds } from '../tasks/updateOdds.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await fetchAndSaveOdds();
    res.status(200).json({ msg: 'Odds updated successfully' });
  } catch (error) {
    logger.error('updateOdds route error', { error });
    res.status(500).json({ msg: 'Error updating odds' });
  }
});

export default router;
