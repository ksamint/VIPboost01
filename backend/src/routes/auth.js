import { Router } from 'express';
import { login, register, refresh, getMe, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, loginSchema, registerSchema, updateProfileSchema } from '../middleware/validation.js';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.put('/me/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;
