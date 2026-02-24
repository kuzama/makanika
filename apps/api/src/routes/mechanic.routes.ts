import { Router, Request, Response } from 'express';
import { MechanicService } from '../services/mechanic.service';
import { requireAuth } from '../middleware/auth.middleware';
import prisma from '../models/prisma';

const router = Router();
const mechanicService = new MechanicService(prisma as any);

// GET /api/mechanics — public, paginated list
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const vehicleType = req.query.vehicleType as string | undefined;
    const service = req.query.service as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await mechanicService.findAll({
      page,
      limit,
      vehicleType,
      service,
      search,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/mechanics/:id — public, single mechanic
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const mechanic = await mechanicService.findById(id);

    if (!mechanic) {
      res.status(404).json({ error: 'Mechanic not found' });
      return;
    }

    res.json(mechanic);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/mechanics — auth required
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const mechanic = await mechanicService.create({
      ...req.body,
      listedById: req.user!.userId,
    });

    res.status(201).json(mechanic);
  } catch (error: any) {
    if (error.message.includes('required')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/mechanics/:id — auth required, owner only
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const mechanic = await mechanicService.update(
      id,
      req.user!.userId,
      req.body
    );

    res.json(mechanic);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('permission') || error.message.includes('authorized')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/mechanics/:id — auth required, owner or admin
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await mechanicService.delete(
      id,
      req.user!.userId,
      req.user!.role
    );

    res.json({ success: true, message: 'Mechanic deleted' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('permission') || error.message.includes('authorized')) {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
