import { Router } from 'express';
import { getUserIdByEmail } from '../controllers/getUserIdByEmailController.js';

const router = Router();

// Define routes
router.get('/:email', getUserIdByEmail);

export default router;
