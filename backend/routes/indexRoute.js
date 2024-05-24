import { Router } from 'express';
import { getIndexMessage } from '../controllers/indexController.js';

const router = Router();

// Define routes
router.get('/', getIndexMessage);

export default router;
