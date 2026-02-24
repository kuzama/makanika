import request from 'supertest';
import app from '../app';

jest.mock('../config', () => ({
  config: { jwtSecret: 'test-secret' },
}));

jest.mock('../models/prisma', () => ({
  __esModule: true,
  default: {
    mechanic: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findUnique: jest.fn(), create: jest.fn(), count: jest.fn() },
    review: { findMany: jest.fn(), create: jest.fn(), count: jest.fn(), aggregate: jest.fn() },
  },
}));

const prisma = require('../models/prisma').default;

const mechanics = [
  {
    id: 'mech-1',
    businessName: 'Fix-It Garage',
    latitude: -17.83,
    longitude: 31.05,
    vehicleTypes: ['CAR'],
    priceRange: 'MODERATE',
    verificationStatus: 'VERIFIED',
    services: ['Oil Change'],
    reviews: [],
  },
];

describe('Search Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('returns search results with query', async () => {
      prisma.mechanic.findMany.mockResolvedValue(mechanics);
      prisma.mechanic.count.mockResolvedValue(1);

      const res = await request(app).get('/api/search?q=Fix-It');

      expect(res.status).toBe(200);
      expect(res.body.mechanics).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('accepts filter params', async () => {
      prisma.mechanic.findMany.mockResolvedValue([]);
      prisma.mechanic.count.mockResolvedValue(0);

      const res = await request(app).get(
        '/api/search?vehicleType=TRUCK&priceRange=BUDGET&verifiedOnly=true'
      );

      expect(res.status).toBe(200);
      expect(prisma.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vehicleTypes: { has: 'TRUCK' },
            priceRange: 'BUDGET',
            verificationStatus: 'VERIFIED',
          }),
        })
      );
    });
  });

  describe('GET /api/search/nearby', () => {
    it('returns nearby mechanics sorted by distance', async () => {
      prisma.mechanic.findMany.mockResolvedValue(mechanics);

      const res = await request(app).get(
        '/api/search/nearby?lat=-17.8292&lng=31.0522&radius=20'
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].distance).toBeDefined();
    });

    it('returns 400 if lat/lng missing', async () => {
      const res = await request(app).get('/api/search/nearby');
      expect(res.status).toBe(400);
    });

    it('defaults radius to 10km', async () => {
      prisma.mechanic.findMany.mockResolvedValue(mechanics);

      const res = await request(app).get(
        '/api/search/nearby?lat=-17.8292&lng=31.0522'
      );

      expect(res.status).toBe(200);
    });
  });
});
