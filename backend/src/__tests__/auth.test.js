import jwt from 'jsonwebtoken';
import { generateTokens, verifyRefreshToken } from '../middleware/auth';

jest.mock('../config', () => ({
  config: {
    jwt: {
      secret: 'test-secret-key-for-jwt-min-32-chars',
      refreshSecret: 'test-refresh-secret-key-min-32-chars',
      expiresIn: '15m',
      refreshExpiresIn: '7d',
    },
  },
}));

describe('Auth Middleware', () => {
  const testUserId = 'test-user-id-123';

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const tokens = generateTokens(testUserId);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate valid JWT for access token', () => {
      const tokens = generateTokens(testUserId);
      const decoded = jwt.verify(tokens.accessToken, 'test-secret-key-for-jwt-min-32-chars');

      expect(decoded.userId).toBe(testUserId);
    });

    it('should generate valid JWT for refresh token', () => {
      const tokens = generateTokens(testUserId);
      const decoded = jwt.verify(tokens.refreshToken, 'test-refresh-secret-key-min-32-chars');

      expect(decoded.userId).toBe(testUserId);
    });

    it('should set expiration for access token', () => {
      const tokens = generateTokens(testUserId);
      const decoded = jwt.decode(tokens.accessToken);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const tokens = generateTokens(testUserId);
      const decoded = await verifyRefreshToken(tokens.refreshToken);

      expect(decoded.userId).toBe(testUserId);
    });

    it('should throw for invalid refresh token', async () => {
      await expect(verifyRefreshToken('invalid-token')).rejects.toThrow();
    });

    it('should throw for expired refresh token', async () => {
      const expiredToken = jwt.sign(
        { userId: testUserId },
        'test-refresh-secret-key-min-32-chars',
        { expiresIn: '-1s' }
      );

      await expect(verifyRefreshToken(expiredToken)).rejects.toThrow();
    });
  });
});
