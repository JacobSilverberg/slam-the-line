import { Router, Request, Response } from 'express';
import { checkAndUpdateGameStatus } from '../tasks/evaluateGameStart.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await checkAndUpdateGameStatus();
    res.status(200).json({ msg: 'Game status evaluated successfully' });
  } catch (error) {
    logger.error('evaluateGameStart route error', { error });
    res.status(500).json({ msg: 'Error evaluating game start' });
  }
});

export default router;
