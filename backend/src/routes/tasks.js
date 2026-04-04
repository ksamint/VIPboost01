import { Router } from 'express';
import { getDailyTasks, completeTask, getTaskHistory } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/daily', authenticate, getDailyTasks);
router.post('/daily/complete', authenticate, completeTask);
router.get('/history', authenticate, getTaskHistory);

export default router;
