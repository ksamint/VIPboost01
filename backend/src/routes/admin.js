import { Router } from 'express';
import {
  getTeamStats,
  getTeamMembers,
  createMaterial,
  getPushLogs,
  getAllUsers,
  assignTeamMember,
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody, materialSchema } from '../middleware/validation.js';

const router = Router();

router.get('/team/stats', authenticate, requireRole('TEAM_MANAGER', 'SYSTEM_ADMIN'), getTeamStats);
router.get('/team/members', authenticate, requireRole('TEAM_MANAGER', 'SYSTEM_ADMIN'), getTeamMembers);
router.post('/team/assign', authenticate, requireRole('TEAM_MANAGER', 'SYSTEM_ADMIN'), assignTeamMember);

router.post('/materials', authenticate, requireRole('SYSTEM_ADMIN'), validateBody(materialSchema), createMaterial);
router.get('/push-logs', authenticate, requireRole('SYSTEM_ADMIN'), getPushLogs);

router.get('/users', authenticate, requireRole('TEAM_MANAGER', 'SYSTEM_ADMIN'), getAllUsers);

export default router;
