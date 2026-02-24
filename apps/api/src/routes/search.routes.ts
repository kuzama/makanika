import { Router, Request, Response } from 'express';
import { SearchService } from '../services/search.service';
import prisma from '../models/prisma';

const router = Router();
const searchService = new SearchService(prisma as any);

// GET /api/search — text search + filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string | undefined;
    const vehicleType = req.query.vehicleType as string | undefined;
    const priceRange = req.query.priceRange as string | undefined;
    const verifiedOnly = req.query.verifiedOnly === 'true';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await searchService.search({
      query,
      vehicleType,
      priceRange,
      verifiedOnly,
      page,
      limit,
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/search/nearby — location-based search
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: 'lat and lng query params are required' });
      return;
    }

    const radius = parseFloat(req.query.radius as string) || 10;

    const results = await searchService.findNearby(lat, lng, radius);
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
