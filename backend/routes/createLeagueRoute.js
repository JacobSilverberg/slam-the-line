import express from 'express';
import { createLeague } from '../controllers/createLeagueController.js';

const router = express.Router();

router.post('/', [], createLeague);

export default router;
