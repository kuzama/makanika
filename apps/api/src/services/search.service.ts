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

interface CombinedSearchParams {
  query?: string;
  vehicleTypes?: string[];
  services?: string[];
  priceRange?: string;
  verifiedOnly?: boolean;
  lat?: number;
  lng?: number;
  page: number;
  limit: number;
}

interface SearchResult {
  mechanics: any[];
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

  async combinedSearch(params: CombinedSearchParams): Promise<SearchResult> {
    const { query, vehicleTypes, services, priceRange, verifiedOnly, lat, lng, page, limit } = params;

    // Fetch all mechanics with reviews for in-memory filtering + ranking
    const all = await this.prisma.mechanic.findMany({
      include: { reviews: true },
    });

    // Filter
    let filtered = all.filter((m: any) => {
      // Vehicle type filter
      if (vehicleTypes && vehicleTypes.length > 0) {
        if (!vehicleTypes.some((vt: string) => m.vehicleTypes.includes(vt))) return false;
      }

      // Services filter
      if (services && services.length > 0) {
        if (!services.some((s: string) => m.services.includes(s))) return false;
      }

      // Price range filter
      if (priceRange && m.priceRange !== priceRange) return false;

      // Verified only
      if (verifiedOnly && m.verificationStatus !== 'VERIFIED') return false;

      return true;
    });

    // Text search scoring
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered
        .map((m: any) => {
          let relevance = 0;
          // Name match is strongest signal
          if (m.businessName.toLowerCase().includes(q)) relevance += 10;
          // Services match
          if (m.services.some((s: string) => s.toLowerCase().includes(q))) relevance += 5;
          // Specialties match
          if (m.specialties.some((s: string) => s.toLowerCase().includes(q))) relevance += 5;
          // Description match
          if (m.description?.toLowerCase().includes(q)) relevance += 3;
          // Address match
          if (m.address?.toLowerCase().includes(q)) relevance += 1;

          return { ...m, relevance };
        })
        .filter((m: any) => m.relevance > 0);
    }

    // Add distance if location provided
    if (lat !== undefined && lng !== undefined) {
      filtered = filtered.map((m: any) => ({
        ...m,
        distance: haversineDistance(lat, lng, m.latitude, m.longitude),
      }));
    }

    // Sort: by relevance (if query), then by distance (if location), then by creation date
    filtered.sort((a: any, b: any) => {
      if (query) {
        const relDiff = (b.relevance || 0) - (a.relevance || 0);
        if (relDiff !== 0) return relDiff;
      }
      if (lat !== undefined && lng !== undefined) {
        return (a.distance || 0) - (b.distance || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return { mechanics: paginated, total, page, limit };
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
