import { PrismaClient, Mechanic } from '@prisma/client';
import { haversineDistance, sortByDistance } from '../utils/geo';

interface SearchParams {
  query?: string;
  vehicleType?: string;
  priceRange?: string;
  verifiedOnly?: boolean;
  page: number;
  limit: number;
}

interface SearchResult {
  mechanics: Mechanic[];
  total: number;
  page: number;
  limit: number;
}

export class SearchService {
  constructor(private prisma: PrismaClient) {}

  async search(params: SearchParams): Promise<SearchResult> {
    const { query, vehicleType, priceRange, verifiedOnly, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query) {
      where.OR = [
        { businessName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (vehicleType) {
      where.vehicleTypes = { has: vehicleType };
    }

    if (priceRange) {
      where.priceRange = priceRange;
    }

    if (verifiedOnly) {
      where.verificationStatus = 'VERIFIED';
    }

    const [mechanics, total] = await Promise.all([
      this.prisma.mechanic.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { reviews: true },
      }),
      this.prisma.mechanic.count({ where }),
    ]);

    return { mechanics, total, page, limit };
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number
  ): Promise<(Mechanic & { distance: number })[]> {
    // Fetch all mechanics — for production, use PostGIS bounding box first
    const all = await this.prisma.mechanic.findMany({
      include: { reviews: true },
    });

    const withDistance = sortByDistance(all, lat, lng);
    return withDistance.filter((m) => m.distance <= radiusKm);
  }
}
