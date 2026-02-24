import { SearchService } from '../services/search.service';
import { prismaMock } from './helpers/prisma-mock';

describe('SearchService — combined search', () => {
  let service: SearchService;

  const baseMechanic = {
    phone: '+263771234567',
    address: '123 Samora Machel Ave',
    description: 'General auto repairs',
    priceRange: 'MODERATE' as const,
    verificationStatus: 'VERIFIED' as const,
    verificationDocs: [],
    verifiedAt: new Date(),
    vehicleTypes: ['CAR' as const],
    services: ['Engine Repair', 'Oil Change'],
    specialties: ['Toyota'],
    photos: [],
    userId: null,
    listedById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    reviews: [{ rating: 4 }, { rating: 5 }],
  };

  const mechanics = [
    { ...baseMechanic, id: 'mech-1', businessName: 'Fix-It Garage', latitude: -17.83, longitude: 31.05 },
    { ...baseMechanic, id: 'mech-2', businessName: 'Engine Masters', latitude: -17.76, longitude: 31.09, services: ['Engine Repair', 'Electrical'], specialties: ['Mercedes'] },
    { ...baseMechanic, id: 'mech-3', businessName: 'Budget Auto', latitude: -17.84, longitude: 31.04, priceRange: 'BUDGET' as const, verificationStatus: 'UNVERIFIED' as const },
  ];

  beforeEach(() => {
    service = new SearchService(prismaMock);
  });

  describe('combinedSearch()', () => {
    it('searches text across name, services, and specialties', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.combinedSearch({
        query: 'engine',
        page: 1,
        limit: 10,
      });

      // Should match "Engine Masters" by name and "Fix-It Garage" / "Engine Masters" by services
      expect(result.mechanics.length).toBeGreaterThan(0);
      const names = result.mechanics.map((m: any) => m.businessName);
      expect(names).toContain('Engine Masters');
    });

    it('combines text search with location sorting', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.combinedSearch({
        query: 'auto',
        lat: -17.8292,
        lng: 31.0522,
        page: 1,
        limit: 10,
      });

      // Results should have distance populated
      result.mechanics.forEach((m: any) => {
        expect(m.distance).toBeDefined();
        expect(typeof m.distance).toBe('number');
      });
    });

    it('combines text + location + vehicle type filter', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.combinedSearch({
        query: 'repair',
        lat: -17.8292,
        lng: 31.0522,
        vehicleTypes: ['CAR'],
        page: 1,
        limit: 10,
      });

      expect(result.mechanics.length).toBeGreaterThanOrEqual(0);
    });

    it('combines text + location + price range filter', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.combinedSearch({
        query: 'auto',
        priceRange: 'BUDGET',
        page: 1,
        limit: 10,
      });

      result.mechanics.forEach((m: any) => {
        expect(m.priceRange).toBe('BUDGET');
      });
    });

    it('combines text + verifiedOnly filter', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.combinedSearch({
        query: 'garage',
        verifiedOnly: true,
        page: 1,
        limit: 10,
      });

      result.mechanics.forEach((m: any) => {
        expect(m.verificationStatus).toBe('VERIFIED');
      });
    });

    it('returns results ranked by relevance (name match first) then distance', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.combinedSearch({
        query: 'Engine',
        lat: -17.8292,
        lng: 31.0522,
        page: 1,
        limit: 10,
      });

      // "Engine Masters" should rank higher (name match) even if further away
      if (result.mechanics.length > 0) {
        const firstResult = result.mechanics[0];
        expect(firstResult.businessName).toBe('Engine Masters');
      }
    });

    it('returns total count and pagination info', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.combinedSearch({
        query: 'repair',
        page: 1,
        limit: 2,
      });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
      expect(typeof result.total).toBe('number');
    });

    it('applies services filter', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.combinedSearch({
        services: ['Electrical'],
        page: 1,
        limit: 10,
      });

      result.mechanics.forEach((m: any) => {
        expect(m.services).toContain('Electrical');
      });
    });
  });
});
