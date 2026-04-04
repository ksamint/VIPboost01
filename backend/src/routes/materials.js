import { Router } from 'express';
import { getTodayMaterials, getMaterialsByDateRange, getMaterialsByDate, getCalendarMaterials } from '../controllers/materialController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/today', authenticate, getTodayMaterials);
router.get('/calendar', authenticate, getCalendarMaterials);
router.get('/range', authenticate, getMaterialsByDateRange);
router.get('/date/:date', authenticate, getMaterialsByDate);

export default router;
