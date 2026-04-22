import { Router, Request, Response } from 'express';
import { evaluateSpreads } from '../tasks/evaluateSpreads.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await evaluateSpreads();
    res.status(200).json({ msg: 'Spreads evaluated successfully' });
  } catch (error) {
    logger.error('evaluateSpreads route error', { error });
    res.status(500).json({ msg: 'Error evaluating spreads' });
  }
});

export default router;
