import { MechanicService } from '../services/mechanic.service';
import { prismaMock } from './helpers/prisma-mock';

describe('MechanicService', () => {
  let service: MechanicService;

  beforeEach(() => {
    service = new MechanicService(prismaMock);
  });

  const baseMechanic = {
    id: 'mech-1',
    businessName: 'Fix-It Garage',
    phone: '+263771234567',
    latitude: -17.8292,
    longitude: 31.0522,
    address: '123 Samora Machel Ave, Harare',
    description: 'General auto repairs',
    priceRange: 'MODERATE' as const,
    verificationStatus: 'UNVERIFIED' as const,
    verificationDocs: [],
    verifiedAt: null,
    vehicleTypes: ['CAR' as const],
    services: ['Oil Change', 'Brake Repair'],
    specialties: ['Toyota', 'Honda'],
    photos: [],
    userId: null,
    listedById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create()', () => {
    it('creates a mechanic listing with required fields', async () => {
      prismaMock.mechanic.create.mockResolvedValue(baseMechanic);

      const result = await service.create({
        businessName: 'Fix-It Garage',
        phone: '+263771234567',
        latitude: -17.8292,
        longitude: 31.0522,
        address: '123 Samora Machel Ave, Harare',
        description: 'General auto repairs',
        vehicleTypes: ['CAR'],
        services: ['Oil Change', 'Brake Repair'],
        specialties: ['Toyota', 'Honda'],
        listedById: 'user-1',
      });

      expect(result.id).toBe('mech-1');
      expect(result.businessName).toBe('Fix-It Garage');
      expect(prismaMock.mechanic.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          businessName: 'Fix-It Garage',
          phone: '+263771234567',
          latitude: -17.8292,
          longitude: 31.0522,
          listedById: 'user-1',
        }),
      });
    });

    it('rejects missing businessName', async () => {
      await expect(
        service.create({
          businessName: '',
          phone: '+263771234567',
          latitude: -17.8292,
          longitude: 31.0522,
          services: [],
          vehicleTypes: [],
          specialties: [],
          listedById: 'user-1',
        })
      ).rejects.toThrow(/businessName/i);
    });

    it('rejects missing phone', async () => {
      await expect(
        service.create({
          businessName: 'Fix-It Garage',
          phone: '',
          latitude: -17.8292,
          longitude: 31.0522,
          services: [],
          vehicleTypes: [],
          specialties: [],
          listedById: 'user-1',
        })
      ).rejects.toThrow(/phone/i);
    });
  });

  describe('findById()', () => {
    it('returns mechanic with reviews', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue({
        ...baseMechanic,
        reviews: [
          {
            id: 'rev-1',
            rating: 5,
            comment: 'Great service',
            authorId: 'user-2',
            mechanicId: 'mech-1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      } as any);

      const result = await service.findById('mech-1');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('mech-1');
      expect(prismaMock.mechanic.findUnique).toHaveBeenCalledWith({
        where: { id: 'mech-1' },
        include: expect.objectContaining({ reviews: true }),
      });
    });

    it('returns null for non-existent mechanic', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(null);

      const result = await service.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('findAll()', () => {
    it('returns paginated list of mechanics', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([baseMechanic]);
      prismaMock.mechanic.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.mechanics).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      );
    });

    it('applies page offset correctly', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([]);
      prismaMock.mechanic.count.mockResolvedValue(25);

      await service.findAll({ page: 3, limit: 10 });

      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('filters by vehicleType', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([]);
      prismaMock.mechanic.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10, vehicleType: 'TRUCK' });

      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            vehicleTypes: { has: 'TRUCK' },
          }),
        })
      );
    });

    it('filters by service keyword', async () => {
      prismaMock.mechanic.findMany.mockResolvedValue([]);
      prismaMock.mechanic.count.mockResolvedValue(0);

      await service.findAll({ page: 1, limit: 10, service: 'Brake' });

      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            services: { has: 'Brake' },
          }),
        })
      );
    });
  });

  describe('update()', () => {
    it('updates mechanic fields', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(baseMechanic);
      prismaMock.mechanic.update.mockResolvedValue({
        ...baseMechanic,
        businessName: 'New Name',
      });

      const result = await service.update('mech-1', 'user-1', {
        businessName: 'New Name',
      });

      expect(result.businessName).toBe('New Name');
      expect(prismaMock.mechanic.update).toHaveBeenCalledWith({
        where: { id: 'mech-1' },
        data: expect.objectContaining({ businessName: 'New Name' }),
      });
    });

    it('rejects update if user is not the lister', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(baseMechanic);

      await expect(
        service.update('mech-1', 'another-user', { businessName: 'Hijacked' })
      ).rejects.toThrow(/permission|authorized/i);
    });
  });

  describe('delete()', () => {
    it('deletes mechanic if user is the lister', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(baseMechanic);
      prismaMock.mechanic.delete.mockResolvedValue(baseMechanic);

      await service.delete('mech-1', 'user-1');

      expect(prismaMock.mechanic.delete).toHaveBeenCalledWith({
        where: { id: 'mech-1' },
      });
    });

    it('rejects delete if user is not the lister', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(baseMechanic);

      await expect(
        service.delete('mech-1', 'another-user')
      ).rejects.toThrow(/permission|authorized/i);
    });
  });
});
