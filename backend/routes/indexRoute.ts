import { Router } from 'express';
import { getIndexMessage } from '../controllers/indexController.js';

const router = Router();

router.get('/', getIndexMessage);

export default router;
