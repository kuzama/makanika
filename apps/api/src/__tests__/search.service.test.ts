import { SearchService } from '../services/search.service';
import { prismaMock } from './helpers/prisma-mock';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    service = new SearchService(prismaMock);
  });

  const mechanics = [
    {
      id: 'mech-1',
      businessName: 'Fix-It Garage',
      phone: '+263771234567',
      latitude: -17.83,
      longitude: 31.05,
      address: '123 Samora Machel Ave',
      description: 'General auto repairs',
      priceRange: 'MODERATE' as const,
      verificationStatus: 'VERIFIED' as const,
      verificationDocs: [],
      verifiedAt: new Date(),
      vehicleTypes: ['CAR' as const],
      services: ['Oil Change', 'Brake Repair'],
      specialties: ['Toyota'],
      photos: [],
      userId: null,
      listedById: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'mech-2',
      businessName: 'Truck Masters',
      phone: '+263772345678',
      latitude: -17.76,
      longitude: 31.09,
      address: '456 Borrowdale Rd',
      description: 'Heavy vehicle specialists',
      priceRange: 'PREMIUM' as const,
      verificationStatus: 'UNVERIFIED' as const,
      verificationDocs: [],
      verifiedAt: null,
      vehicleTypes: ['TRUCK' as const, 'BUS' as const],
      services: ['Engine Overhaul'],
      specialties: ['Mercedes'],
      photos: [],
      userId: null,
      listedById: 'user-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('search()', () => {
    it('searches by text query across businessName, description, address', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([mechanics[0]]);
      prismaMock.mechanic.count.mockResolvedValue(1);

      const result = await service.search({ query: 'Fix-It', page: 1, limit: 10 });

      expect(result.mechanics).toHaveLength(1);
      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ businessName: expect.any(Object) }),
              expect.objectContaining({ description: expect.any(Object) }),
              expect.objectContaining({ address: expect.any(Object) }),
            ]),
          }),
        })
      );
    });

    it('filters by vehicleType', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([mechanics[1]]);
      prismaMock.mechanic.count.mockResolvedValue(1);

      const result = await service.search({
        vehicleType: 'TRUCK',
        page: 1,
        limit: 10,
      });

      expect(result.mechanics).toHaveLength(1);
      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vehicleTypes: { has: 'TRUCK' },
          }),
        })
      );
    });

    it('filters by priceRange', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([]);
      prismaMock.mechanic.count.mockResolvedValue(0);

      await service.search({
        priceRange: 'BUDGET',
        page: 1,
        limit: 10,
      });

      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priceRange: 'BUDGET',
          }),
        })
      );
    });

    it('filters by verifiedOnly', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([mechanics[0]]);
      prismaMock.mechanic.count.mockResolvedValue(1);

      await service.search({
        verifiedOnly: true,
        page: 1,
        limit: 10,
      });

      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            verificationStatus: 'VERIFIED',
          }),
        })
      );
    });

    it('combines multiple filters', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([]);
      prismaMock.mechanic.count.mockResolvedValue(0);

      await service.search({
        query: 'repair',
        vehicleType: 'CAR',
        priceRange: 'MODERATE',
        verifiedOnly: true,
        page: 1,
        limit: 10,
      });

      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vehicleTypes: { has: 'CAR' },
            priceRange: 'MODERATE',
            verificationStatus: 'VERIFIED',
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('paginates results correctly', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([]);
      prismaMock.mechanic.count.mockResolvedValue(50);

      const result = await service.search({ page: 3, limit: 5 });

      expect(result.page).toBe(3);
      expect(result.total).toBe(50);
      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 })
      );
    });
  });

  describe('findNearby()', () => {
    it('returns mechanics sorted by distance from a point', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      const result = await service.findNearby(-17.8292, 31.0522, 20);

      expect(result).toHaveLength(2);
      // First should be closer (Harare CBD)
      expect(result[0].id).toBe('mech-1');
      expect(result[0].distance).toBeDefined();
      expect(result[0].distance).toBeLessThan(result[1].distance);
    });

    it('filters out mechanics beyond radius', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue(mechanics);

      // Use very small radius — only the closest should remain
      const result = await service.findNearby(-17.8292, 31.0522, 1);

      expect(result.length).toBeLessThanOrEqual(mechanics.length);
      result.forEach((m: any) => {
        expect(m.distance).toBeLessThanOrEqual(1);
      });
    });
  });
});
