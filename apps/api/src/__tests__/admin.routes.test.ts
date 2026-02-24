import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';

jest.mock('../config', () => ({
  config: { jwtSecret: 'test-secret' },
}));

jest.mock('../models/prisma', () => ({
  __esModule: true,
  default: {
    mechanic: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    user: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    review: { count: jest.fn() },
  },
}));

const prisma = require('../models/prisma').default;

function authToken(userId = 'admin-1', role = 'ADMIN') {
  return jwt.sign({ userId, role }, JWT_SECRET);
}

function customerToken(userId = 'user-1') {
  return jwt.sign({ userId, role: 'CUSTOMER' }, JWT_SECRET);
}

const pendingMechanic = {
  id: 'mech-1',
  businessName: 'Fix-It Garage',
  phone: '+263771234567',
  latitude: -17.8292,
  longitude: 31.0522,
  address: '123 Samora Machel Ave',
  verificationStatus: 'PENDING',
  verificationDocs: ['doc.pdf'],
  verifiedAt: null,
  vehicleTypes: ['CAR'],
  services: ['Oil Change'],
  specialties: [],
  photos: [],
  userId: null,
  listedById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Admin Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/admin/verification/pending', () => {
    it('returns pending mechanics for admin', async () => {
      prisma.mechanic.findMany.mockResolvedValue([pendingMechanic]);

      const res = await request(app)
        .get('/api/admin/verification/pending')
        .set('Authorization', `Bearer ${authToken()}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].verificationStatus).toBe('PENDING');
    });

    it('returns 403 for non-admin', async () => {
      const res = await request(app)
        .get('/api/admin/verification/pending')
        .set('Authorization', `Bearer ${customerToken()}`);

      expect(res.status).toBe(403);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/admin/verification/pending');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/admin/verification/:id/approve', () => {
    it('approves a pending mechanic', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(pendingMechanic);
      prisma.mechanic.update.mockResolvedValue({
        ...pendingMechanic,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/admin/verification/mech-1/approve')
        .set('Authorization', `Bearer ${authToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.verificationStatus).toBe('VERIFIED');
    });

    it('returns 400 if not in PENDING status', async () => {
      prisma.mechanic.findUnique.mockResolvedValue({
        ...pendingMechanic,
        verificationStatus: 'UNVERIFIED',
      });

      const res = await request(app)
        .post('/api/admin/verification/mech-1/approve')
        .set('Authorization', `Bearer ${authToken()}`);

      expect(res.status).toBe(400);
    });

    it('returns 403 for non-admin', async () => {
      const res = await request(app)
        .post('/api/admin/verification/mech-1/approve')
        .set('Authorization', `Bearer ${customerToken()}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/admin/verification/:id/reject', () => {
    it('rejects a pending mechanic', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(pendingMechanic);
      prisma.mechanic.update.mockResolvedValue({
        ...pendingMechanic,
        verificationStatus: 'REJECTED',
      });

      const res = await request(app)
        .post('/api/admin/verification/mech-1/reject')
        .set('Authorization', `Bearer ${authToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.verificationStatus).toBe('REJECTED');
    });
  });

  describe('POST /api/mechanics/:id/verify', () => {
    it('submits mechanic for verification by owner', async () => {
      const unverifiedMechanic = {
        ...pendingMechanic,
        verificationStatus: 'UNVERIFIED',
        listedById: 'user-1',
      };
      prisma.mechanic.findUnique.mockResolvedValue(unverifiedMechanic);
      prisma.mechanic.update.mockResolvedValue({
        ...unverifiedMechanic,
        verificationStatus: 'PENDING',
        verificationDocs: ['doc.pdf'],
      });

      const res = await request(app)
        .post('/api/mechanics/mech-1/verify')
        .set('Authorization', `Bearer ${customerToken('user-1')}`)
        .send({ documents: ['doc.pdf'] });

      expect(res.status).toBe(200);
      expect(res.body.verificationStatus).toBe('PENDING');
    });

    it('returns 403 if not the owner', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(pendingMechanic);

      const res = await request(app)
        .post('/api/mechanics/mech-1/verify')
        .set('Authorization', `Bearer ${customerToken('other-user')}`)
        .send({ documents: ['doc.pdf'] });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/admin/stats', () => {
    it('returns dashboard stats for admin', async () => {
      prisma.mechanic.count.mockResolvedValueOnce(50); // total
      prisma.mechanic.count.mockResolvedValueOnce(10); // pending
      prisma.mechanic.count.mockResolvedValueOnce(30); // verified
      prisma.user.count.mockResolvedValue(100);
      prisma.review.count.mockResolvedValue(200);

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${authToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.totalMechanics).toBe(50);
      expect(res.body.pendingVerifications).toBe(10);
      expect(res.body.verifiedMechanics).toBe(30);
      expect(res.body.totalUsers).toBe(100);
      expect(res.body.totalReviews).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken()}`);

      expect(res.status).toBe(403);
    });
  });
});
