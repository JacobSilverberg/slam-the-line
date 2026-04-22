import { Router } from 'express';
import { getUserIdByEmail } from '../controllers/getUserIdByEmailController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/:email', auth, getUserIdByEmail);

export default router;
