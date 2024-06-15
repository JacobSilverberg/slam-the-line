import express from 'express';
import { leagueInfo } from '../controllers/leagueInfoController.js';

const router = express.Router();

router.get('/:leagueId/', [], leagueInfo);

export default router;
