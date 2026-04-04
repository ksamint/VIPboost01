import { Router } from 'express';
import authRoutes from './auth.js';
import materialRoutes from './materials.js';
import aiRoutes from './ai.js';
import taskRoutes from './tasks.js';
import adminRoutes from './admin.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/materials', materialRoutes);
router.use('/ai', aiRoutes);
router.use('/tasks', taskRoutes);
router.use('/admin', adminRoutes);

export default router;
