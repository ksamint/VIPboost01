import { Router } from 'express';
import {
  generateInsights,
  startSimulation,
  sendMessage,
  endSimulation,
  getSessionFeedback,
  getSimulationHistory,
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody, aiInsightSchema, simulationStartSchema, simulationMessageSchema } from '../middleware/validation.js';

const router = Router();

router.post('/insights', authenticate, validateBody(aiInsightSchema), generateInsights);
router.post('/simulate', authenticate, validateBody(simulationStartSchema), startSimulation);
router.post('/simulate/:id/message', authenticate, validateBody(simulationMessageSchema), sendMessage);
router.post('/simulate/:id/end', authenticate, endSimulation);
router.get('/simulate/:id/feedback', authenticate, getSessionFeedback);
router.get('/simulate/history', authenticate, getSimulationHistory);

export default router;
