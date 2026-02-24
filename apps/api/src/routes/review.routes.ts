import { Router, Request, Response } from 'express';
import { ReviewService } from '../services/review.service';
import { requireAuth } from '../middleware/auth.middleware';
import prisma from '../models/prisma';

const router = Router();
const reviewService = new ReviewService(prisma as any);

// POST /api/mechanics/:mechanicId/reviews — auth required
router.post(
  '/mechanics/:mechanicId/reviews',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const mechanicId = req.params.mechanicId as string;
      const review = await reviewService.create({
        rating: req.body.rating,
        comment: req.body.comment,
        authorId: req.user!.userId,
        mechanicId,
      });

      res.status(201).json(review);
    } catch (error: any) {
      if (
        error.message.includes('rating') ||
        error.message.includes('already reviewed')
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /api/mechanics/:mechanicId/reviews — public
router.get(
  '/mechanics/:mechanicId/reviews',
  async (req: Request, res: Response) => {
    try {
      const mechanicId = req.params.mechanicId as string;
      const reviews = await reviewService.getByMechanic(mechanicId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /api/reviews/:id — auth required, author or admin
router.delete(
  '/reviews/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      await reviewService.delete(id, req.user!.userId, req.user!.role);
      res.json({ success: true, message: 'Review deleted' });
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
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
