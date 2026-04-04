import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  materialSchema,
  aiInsightSchema,
  simulationStartSchema,
  simulationMessageSchema,
} from '../middleware/validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const valid = { username: 'testuser', password: 'password123' };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject short username', () => {
      const invalid = { username: 'ab', password: 'password123' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalid = { username: 'testuser', password: '12345' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const invalid = { username: 'testuser' };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const valid = {
        username: 'newuser',
        password: 'password123',
        nickname: 'New User',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should accept valid role', () => {
      const valid = {
        username: 'admin',
        password: 'password123',
        role: 'SYSTEM_ADMIN',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalid = {
        username: 'user',
        password: 'password123',
        role: 'INVALID_ROLE',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should allow missing optional fields', () => {
      const valid = { username: 'testuser', password: 'password123' };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate complete profile update', () => {
      const valid = {
        nickname: 'Updated Name',
        avatar: 'https://example.com/avatar.jpg',
        personalityType: 'TYPE_A',
        preferences: { theme: 'dark' },
        onboardingComplete: true,
      };
      const result = updateProfileSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const valid = { nickname: 'New Nickname' };
      const result = updateProfileSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid avatar URL', () => {
      const invalid = { avatar: 'not-a-url' };
      const result = updateProfileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('materialSchema', () => {
    it('should validate IMAGE material', () => {
      const valid = {
        type: 'IMAGE',
        title: 'Test Image',
        mediaUrl: 'https://example.com/image.jpg',
        publishDate: '2024-01-15T10:00:00Z',
      };
      const result = materialSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate TEXT material', () => {
      const valid = {
        type: 'TEXT',
        title: 'Daily Greeting',
        content: 'Hello VIP guests!',
        publishDate: new Date().toISOString(),
      };
      const result = materialSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate VIDEO material', () => {
      const valid = {
        type: 'VIDEO',
        title: 'Promo Video',
        mediaUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        publishDate: '2024-01-15T10:00:00Z',
        targetUsers: ['user-1', 'user-2'],
      };
      const result = materialSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid material type', () => {
      const invalid = {
        type: 'AUDIO',
        title: 'Invalid',
        publishDate: '2024-01-15T10:00:00Z',
      };
      const result = materialSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject missing title', () => {
      const invalid = {
        type: 'IMAGE',
        publishDate: '2024-01-15T10:00:00Z',
      };
      const result = materialSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('aiInsightSchema', () => {
    it('should validate complete customer profile', () => {
      const valid = {
        customerProfile: {
          age: 45,
          gender: 'male',
          gamePreferences: ['baccarat'],
          spendingLevel: 'HIGH',
          riskTolerance: 'MEDIUM',
          personalityNotes: 'Prefers private rooms',
        },
        query: 'What marketing approach would work best?',
      };
      const result = aiInsightSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should allow minimal profile', () => {
      const valid = {
        query: 'Give me insights about this customer',
      };
      const result = aiInsightSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing query', () => {
      const invalid = {
        customerProfile: { age: 30 },
      };
      const result = aiInsightSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty query', () => {
      const invalid = {
        query: '',
      };
      const result = aiInsightSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('simulationStartSchema', () => {
    it('should validate VIP_COMPLAINT scenario', () => {
      const valid = {
        scenario: 'VIP_COMPLAINT',
        customerProfile: { age: 50, spendingLevel: 'ULTRA' },
      };
      const result = simulationStartSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should validate all scenarios', () => {
      const scenarios = [
        'VIP_COMPLAINT',
        'HIGH_ROLLER_CONVERSION',
        'LOYALTY_RECOVERY',
        'EMOTIONAL_SUPPORT',
        'CROSS_SELL',
      ];

      scenarios.forEach((scenario) => {
        const valid = { scenario };
        const result = simulationStartSchema.safeParse(valid);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid scenario', () => {
      const invalid = { scenario: 'INVALID_SCENARIO' };
      const result = simulationStartSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('simulationMessageSchema', () => {
    it('should validate message', () => {
      const valid = { message: 'Thank you for your understanding.' };
      const result = simulationMessageSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject empty message', () => {
      const invalid = { message: '' };
      const result = simulationMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject too long message', () => {
      const invalid = { message: 'a'.repeat(2001) };
      const result = simulationMessageSchema.safeParse(invalid);
      expect(result.success).toBe(false;
    });
  });
});
