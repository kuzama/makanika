import { Request, Response, NextFunction } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'test-secret';

// Mock the config
jest.mock('../config', () => ({
  config: { jwtSecret: 'test-secret' },
}));

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    ...overrides,
  } as Request;
}

function mockRes(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('Auth Middleware', () => {
  describe('requireAuth', () => {
    it('passes request through with valid JWT', () => {
      const token = jwt.sign(
        { userId: 'user-1', role: 'CUSTOMER' },
        JWT_SECRET
      );
      const req = mockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).user).toEqual(
        expect.objectContaining({ userId: 'user-1', role: 'CUSTOMER' })
      );
    });

    it('returns 401 with missing JWT', () => {
      const req = mockReq();
      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 with invalid JWT', () => {
      const req = mockReq({
        headers: { authorization: 'Bearer invalid-token' },
      });
      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('passes for ADMIN role', () => {
      const token = jwt.sign(
        { userId: 'admin-1', role: 'ADMIN' },
        JWT_SECRET
      );
      const req = mockReq({
        headers: { authorization: `Bearer ${token}` },
      });
      // Simulate requireAuth having already run
      (req as any).user = { userId: 'admin-1', role: 'ADMIN' };

      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('returns 403 for non-ADMIN role', () => {
      const req = mockReq();
      (req as any).user = { userId: 'user-1', role: 'CUSTOMER' };

      const res = mockRes();
      const next: NextFunction = jest.fn();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.any(String) })
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
