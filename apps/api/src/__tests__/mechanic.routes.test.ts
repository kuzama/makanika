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
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const prisma = require('../models/prisma').default;

function authToken(userId = 'user-1', role = 'CUSTOMER') {
  return jwt.sign({ userId, role }, JWT_SECRET);
}

const baseMechanic = {
  id: 'mech-1',
  businessName: 'Fix-It Garage',
  phone: '+263771234567',
  latitude: -17.8292,
  longitude: 31.0522,
  address: '123 Samora Machel Ave',
  description: 'General auto repairs',
  priceRange: 'MODERATE',
  verificationStatus: 'UNVERIFIED',
  verificationDocs: [],
  verifiedAt: null,
  vehicleTypes: ['CAR'],
  services: ['Oil Change', 'Brake Repair'],
  specialties: ['Toyota'],
  photos: [],
  userId: null,
  listedById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Mechanic Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/mechanics', () => {
    it('creates mechanic with valid data and auth', async () => {
      prisma.mechanic.create.mockResolvedValue(baseMechanic);

      const res = await request(app)
        .post('/api/mechanics')
        .set('Authorization', `Bearer ${authToken()}`)
        .send({
          businessName: 'Fix-It Garage',
          phone: '+263771234567',
          latitude: -17.8292,
          longitude: 31.0522,
          address: '123 Samora Machel Ave',
          description: 'General auto repairs',
          vehicleTypes: ['CAR'],
          services: ['Oil Change', 'Brake Repair'],
          specialties: ['Toyota'],
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('mech-1');
      expect(res.body.businessName).toBe('Fix-It Garage');
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/mechanics')
        .send({ businessName: 'Test' });

      expect(res.status).toBe(401);
    });

    it('returns 400 with missing required fields', async () => {
      const res = await request(app)
        .post('/api/mechanics')
        .set('Authorization', `Bearer ${authToken()}`)
        .send({ businessName: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/mechanics', () => {
    it('returns paginated list', async () => {
      prisma.mechanic.findMany.mockResolvedValue([baseMechanic]);
      prisma.mechanic.count.mockResolvedValue(1);

      const res = await request(app).get('/api/mechanics');

      expect(res.status).toBe(200);
      expect(res.body.mechanics).toHaveLength(1);
      expect(res.body.total).toBe(1);
      expect(res.body.page).toBe(1);
    });

    it('accepts page and limit query params', async () => {
      prisma.mechanic.findMany.mockResolvedValue([]);
      prisma.mechanic.count.mockResolvedValue(25);

      const res = await request(app).get('/api/mechanics?page=2&limit=5');

      expect(res.status).toBe(200);
      expect(prisma.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 })
      );
    });

    it('filters by vehicleType', async () => {
      prisma.mechanic.findMany.mockResolvedValue([]);
      prisma.mechanic.count.mockResolvedValue(0);

      const res = await request(app).get('/api/mechanics?vehicleType=SUV');

      expect(res.status).toBe(200);
      expect(prisma.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vehicleTypes: { has: 'SUV' },
          }),
        })
      );
    });
  });

  describe('GET /api/mechanics/:id', () => {
    it('returns mechanic by id', async () => {
      prisma.mechanic.findUnique.mockResolvedValue({
        ...baseMechanic,
        reviews: [],
      });

      const res = await request(app).get('/api/mechanics/mech-1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('mech-1');
    });

    it('returns 404 for non-existent mechanic', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(null);

      const res = await request(app).get('/api/mechanics/non-existent');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/mechanics/:id', () => {
    it('updates mechanic by owner', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(baseMechanic);
      prisma.mechanic.update.mockResolvedValue({
        ...baseMechanic,
        businessName: 'Updated Garage',
      });

      const res = await request(app)
        .put('/api/mechanics/mech-1')
        .set('Authorization', `Bearer ${authToken('user-1')}`)
        .send({ businessName: 'Updated Garage' });

      expect(res.status).toBe(200);
      expect(res.body.businessName).toBe('Updated Garage');
    });

    it('returns 403 if not the owner', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(baseMechanic);

      const res = await request(app)
        .put('/api/mechanics/mech-1')
        .set('Authorization', `Bearer ${authToken('other-user')}`)
        .send({ businessName: 'Hijacked' });

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/mechanics/:id', () => {
    it('deletes mechanic by owner', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(baseMechanic);
      prisma.mechanic.delete.mockResolvedValue(baseMechanic);

      const res = await request(app)
        .delete('/api/mechanics/mech-1')
        .set('Authorization', `Bearer ${authToken('user-1')}`);

      expect(res.status).toBe(200);
    });

    it('returns 403 if not the owner', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(baseMechanic);

      const res = await request(app)
        .delete('/api/mechanics/mech-1')
        .set('Authorization', `Bearer ${authToken('other-user')}`);

      expect(res.status).toBe(403);
    });

    it('allows ADMIN to delete any mechanic', async () => {
      prisma.mechanic.findUnique.mockResolvedValue(baseMechanic);
      prisma.mechanic.delete.mockResolvedValue(baseMechanic);

      const res = await request(app)
        .delete('/api/mechanics/mech-1')
        .set('Authorization', `Bearer ${authToken('admin-1', 'ADMIN')}`);

      expect(res.status).toBe(200);
    });
  });
});
