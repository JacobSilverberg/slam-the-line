import { Router, Request, Response } from 'express';
import { evaluateUserScores } from '../tasks/evaluateUserScores.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    await evaluateUserScores();
    res.status(200).json({ msg: 'User scores evaluated successfully' });
  } catch (error) {
    logger.error('evaluateUserScores route error', { error });
    res.status(500).json({ msg: 'Error evaluating user scores' });
  }
});

export default router;
