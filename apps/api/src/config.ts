import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

export const config = {
  nodeEnv,
  isDevelopment: nodeEnv === 'development',
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',

  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  port: parseInt(process.env.PORT || '3001', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  whatsappApiKey: process.env.WHATSAPP_API_KEY || 'mock',
  whatsappApiUrl: process.env.WHATSAPP_API_URL || '',

  // Rate limiting (can be adjusted per environment)
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
