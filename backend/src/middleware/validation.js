import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  nickname: z.string().min(1).max(100).optional(),
  role: z.enum(['VIP_HOST', 'TEAM_MANAGER', 'SYSTEM_ADMIN']).optional(),
});

export const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  personalityType: z.string().max(50).optional(),
  preferences: z.object({}).passthrough().optional(),
  onboardingComplete: z.boolean().optional(),
});

export const materialSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO', 'TEXT']),
  title: z.string().min(1).max(255),
  content: z.string().max(5000).optional().nullable(),
  mediaUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  publishDate: z.string().datetime().or(z.date()),
  targetUsers: z.array(z.string()).optional(),
});

export const aiInsightSchema = z.object({
  customerProfile: z.object({
    age: z.number().int().min(18).max(100).optional(),
    gender: z.string().optional(),
    gamePreferences: z.array(z.string()).optional(),
    spendingLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ULTRA']).optional(),
    riskTolerance: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    personalityNotes: z.string().max(500).optional(),
  }).passthrough(),
  query: z.string().min(1).max(1000),
});

export const simulationStartSchema = z.object({
  scenario: z.enum([
    'VIP_COMPLAINT',
    'HIGH_ROLLER_CONVERSION',
    'LOYALTY_RECOVERY',
    'EMOTIONAL_SUPPORT',
    'CROSS_SELL',
  ]),
  customerProfile: z.object({
    age: z.number().int().min(18).max(100).optional(),
    gender: z.string().optional(),
    spendingLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'ULTRA']).optional(),
    personalityNotes: z.string().max(500).optional(),
  }).passthrough().optional(),
});

export const simulationMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
