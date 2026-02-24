import dotenv from 'dotenv';

dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  port: parseInt(process.env.PORT || '3001', 10),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  whatsappApiKey: process.env.WHATSAPP_API_KEY || 'mock',
  whatsappApiUrl: process.env.WHATSAPP_API_URL || '',
};
