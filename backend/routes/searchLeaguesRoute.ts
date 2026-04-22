import { Router } from 'express';
import { searchLeagues } from '../controllers/searchLeaguesController.js';

const router = Router();

router.get('/', searchLeagues);

export default router;
