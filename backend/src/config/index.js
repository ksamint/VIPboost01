import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key-min-32-chars-for-local',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-min-32-chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultModel: process.env.AI_DEFAULT_MODEL || 'anthropic/claude-3-haiku',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4096', 10),
    timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },

  admin: {
    defaultAdminUsername: process.env.ADMIN_USERNAME || 'admin',
    defaultAdminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  },
};

export function validateConfig() {
  // Skip validation in development with SQLite
  if (config.nodeEnv === 'development' && config.database.url.includes('sqlite')) {
    console.log('Running in development mode with SQLite - skipping some validations');
    return;
  }

  const required = ['database.url', 'jwt.secret', 'jwt.refreshSecret'];

  for (const key of required) {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      throw new Error(`Missing required config: ${key}`);
    }
  }
}
