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
    mechanic: { findUnique: jest.fn() },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    user: { findUnique: jest.fn(), create: jest.fn() },
  },
}));

const prisma = require('../models/prisma').default;

function authToken(userId = 'user-1', role = 'CUSTOMER') {
  return jwt.sign({ userId, role }, JWT_SECRET);
}

const baseReview = {
  id: 'rev-1',
  rating: 5,
  comment: 'Excellent!',
  authorId: 'user-1',
  mechanicId: 'mech-1',
  author: { name: 'John', phone: '+263771234567' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Review Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/mechanics/:mechanicId/reviews', () => {
    it('creates review with valid data', async () => {
      prisma.mechanic.findUnique.mockResolvedValue({ id: 'mech-1' });
      prisma.review.create.mockResolvedValue(baseReview);

      const res = await request(app)
        .post('/api/mechanics/mech-1/reviews')
        .set('Authorization', `Bearer ${authToken()}`)
        .send({ rating: 5, comment: 'Excellent!' });

      expect(res.status).toBe(201);
      expect(res.body.rating).toBe(5);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/mechanics/mech-1/reviews')
        .send({ rating: 5 });

      expect(res.status).toBe(401);
    });

    it('returns 400 for invalid rating', async () => {
      const res = await request(app)
        .post('/api/mechanics/mech-1/reviews')
        .set('Authorization', `Bearer ${authToken()}`)
        .send({ rating: 0 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/mechanics/:mechanicId/reviews', () => {
    it('returns reviews for a mechanic', async () => {
      prisma.review.findMany.mockResolvedValue([baseReview]);

      const res = await request(app).get('/api/mechanics/mech-1/reviews');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].rating).toBe(5);
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    it('deletes review by author', async () => {
      prisma.review.findUnique.mockResolvedValue(baseReview);
      prisma.review.delete.mockResolvedValue(baseReview);

      const res = await request(app)
        .delete('/api/reviews/rev-1')
        .set('Authorization', `Bearer ${authToken('user-1')}`);

      expect(res.status).toBe(200);
    });

    it('returns 403 if not the author', async () => {
      prisma.review.findUnique.mockResolvedValue(baseReview);

      const res = await request(app)
        .delete('/api/reviews/rev-1')
        .set('Authorization', `Bearer ${authToken('other-user')}`);

      expect(res.status).toBe(403);
    });

    it('allows admin to delete', async () => {
      prisma.review.findUnique.mockResolvedValue(baseReview);
      prisma.review.delete.mockResolvedValue(baseReview);

      const res = await request(app)
        .delete('/api/reviews/rev-1')
        .set('Authorization', `Bearer ${authToken('admin-1', 'ADMIN')}`);

      expect(res.status).toBe(200);
    });
  });
});
