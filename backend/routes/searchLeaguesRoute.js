import express from 'express';
import { searchLeagues } from '../controllers/searchLeaguesController.js';

const router = express.Router();

router.get('/', [], searchLeagues);

export default router;
