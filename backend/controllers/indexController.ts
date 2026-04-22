import { Request, Response } from 'express';

export const getIndexMessage = async (_req: Request, res: Response): Promise<void> => {
  res.json({ msg: 'Slam the Line API' });
};
