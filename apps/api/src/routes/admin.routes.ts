import { Router, Request, Response } from 'express';
import { VerificationService } from '../services/verification.service';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import prisma from '../models/prisma';

const router = Router();
const verificationService = new VerificationService(prisma as any);

// POST /api/mechanics/:id/verify — owner submits for verification
router.post(
  '/mechanics/:id/verify',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const { documents } = req.body;

      const result = await verificationService.submitForVerification(
        id,
        req.user!.userId,
        documents
      );

      res.json(result);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (
        error.message.includes('permission') ||
        error.message.includes('authorized')
      ) {
        res.status(403).json({ error: error.message });
        return;
      }
      if (error.message.includes('document')) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/admin/verification/pending — admin only
router.get(
  '/admin/verification/pending',
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const pending = await verificationService.getPending();
      res.json(pending);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/admin/verification/:id/approve — admin only
router.post(
  '/admin/verification/:id/approve',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const result = await verificationService.approve(id);
      res.json(result);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message.includes('pending')) {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /api/admin/verification/:id/reject — admin only
router.post(
  '/admin/verification/:id/reject',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const result = await verificationService.reject(id);
      res.json(result);
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/admin/stats — admin dashboard stats
router.get(
  '/admin/stats',
  requireAuth,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const [totalMechanics, pendingVerifications, verifiedMechanics, totalUsers, totalReviews] =
        await Promise.all([
          prisma.mechanic.count(),
          prisma.mechanic.count({ where: { verificationStatus: 'PENDING' } }),
          prisma.mechanic.count({ where: { verificationStatus: 'VERIFIED' } }),
          prisma.user.count(),
          prisma.review.count(),
        ]);

      res.json({
        totalMechanics,
        pendingVerifications,
        verifiedMechanics,
        totalUsers,
        totalReviews,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
