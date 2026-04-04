import { Router } from 'express';
import { login, register, refresh, getMe, updateProfile, logout } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, loginSchema, registerSchema, updateProfileSchema } from '../middleware/validation.js';
import { LogtoClient } from '../services/logtoService.js';

const router = Router();

const logtoClient = new LogtoClient();

router.post('/login', validateBody(loginSchema), login);
router.post('/register', validateBody(registerSchema), register);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);
router.put('/me/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

// Logto Social Login
router.post('/auth/logto/signin', async (req, res, next) => {
  try {
    const { code, redirectUri } = req.body;

    const response = await fetch(`${process.env.LOGTO_ENDPOINT}/oidc/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.LOGTO_APP_ID,
        client_secret: process.env.LOGTO_APP_SECRET,
      }),
    });

    const tokens = await response.json();
    res.json(tokens);
  } catch (error) {
    next(error);
  }
});

router.post('/auth/logto/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const response = await fetch(`${process.env.LOGTO_ENDPOINT}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await logtoClient.getAccessToken()}`,
      },
      body: JSON.stringify({
        primaryEmail: email,
        password,
        name,
      }),
    });

    const user = await response.json();
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
