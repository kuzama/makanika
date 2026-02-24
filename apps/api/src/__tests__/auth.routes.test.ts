import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

// We'll need to mock the auth service at the route level
jest.mock('../models/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const JWT_SECRET = 'test-secret';

jest.mock('../config', () => ({
  config: { jwtSecret: 'test-secret' },
}));

describe('Auth Routes', () => {
  describe('POST /api/auth/send-code', () => {
    it('returns 200 with valid phone', async () => {
      const res = await request(app)
        .post('/api/auth/send-code')
        .send({ phone: '+263771234567' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 with invalid phone', async () => {
      const res = await request(app)
        .post('/api/auth/send-code')
        .send({ phone: '12345' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/auth/verify', () => {
    it('returns 200 with correct code, returns JWT', async () => {
      // First send a code
      await request(app)
        .post('/api/auth/send-code')
        .send({ phone: '+263771234567' });

      // We need to get the code from the mock service
      // The route handler stores it internally, so we'll test the integration
      const prisma = require('../models/prisma').default;
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        phone: '+263771234567',
        name: null,
        role: 'CUSTOMER',
        isPhoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Since we're using in-memory code store, get it from the service
      // We'll use the mock whatsapp service which logs the code
      const { getAuthService } = require('../routes/auth.routes');
      const authService = getAuthService();
      const storedCode = authService.getStoredCode('+263771234567');

      const res = await request(app)
        .post('/api/auth/verify')
        .send({ phone: '+263771234567', code: storedCode?.code });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('returns 401 with wrong code', async () => {
      await request(app)
        .post('/api/auth/send-code')
        .send({ phone: '+263771234567' });

      const res = await request(app)
        .post('/api/auth/verify')
        .send({ phone: '+263771234567', code: '000000' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 200 with valid JWT and user data', async () => {
      const prisma = require('../models/prisma').default;
      const user = {
        id: 'user-1',
        phone: '+263771234567',
        name: 'Test User',
        role: 'CUSTOMER',
        isPhoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.findUnique.mockResolvedValue(user);

      const token = jwt.sign(
        { userId: 'user-1', role: 'CUSTOMER' },
        JWT_SECRET
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('user-1');
      expect(res.body.phone).toBe('+263771234567');
    });

    it('returns 401 without JWT', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });
});
