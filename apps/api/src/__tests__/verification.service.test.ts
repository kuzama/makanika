import { VerificationService } from '../services/verification.service';
import { prismaMock } from './helpers/prisma-mock';

describe('VerificationService', () => {
  let service: VerificationService;

  beforeEach(() => {
    service = new VerificationService(prismaMock);
  });

  const baseMechanic = {
    id: 'mech-1',
    businessName: 'Fix-It Garage',
    phone: '+263771234567',
    latitude: -17.8292,
    longitude: 31.0522,
    address: '123 Samora Machel Ave',
    description: 'General repairs',
    priceRange: 'MODERATE' as const,
    verificationStatus: 'UNVERIFIED' as const,
    verificationDocs: [],
    verifiedAt: null,
    vehicleTypes: ['CAR' as const],
    services: ['Oil Change'],
    specialties: ['Toyota'],
    photos: [],
    userId: null,
    listedById: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('submitForVerification()', () => {
    it('sets status to PENDING and stores doc URLs', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(baseMechanic);
      prismaMock.mechanic.update.mockResolvedValue({
        ...baseMechanic,
        verificationStatus: 'PENDING',
        verificationDocs: ['doc1.pdf', 'doc2.pdf'],
      });

      const result = await service.submitForVerification('mech-1', 'user-1', [
        'doc1.pdf',
        'doc2.pdf',
      ]);

      expect(result.verificationStatus).toBe('PENDING');
      expect(result.verificationDocs).toEqual(['doc1.pdf', 'doc2.pdf']);
      expect(prismaMock.mechanic.update).toHaveBeenCalledWith({
        where: { id: 'mech-1' },
        data: {
          verificationStatus: 'PENDING',
          verificationDocs: ['doc1.pdf', 'doc2.pdf'],
        },
      });
    });

    it('rejects if not the lister', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(baseMechanic);

      await expect(
        service.submitForVerification('mech-1', 'other-user', ['doc.pdf'])
      ).rejects.toThrow(/permission|authorized/i);
    });

    it('rejects if mechanic not found', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(null);

      await expect(
        service.submitForVerification('bad-id', 'user-1', ['doc.pdf'])
      ).rejects.toThrow(/not found/i);
    });

    it('rejects if no documents provided', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(baseMechanic);

      await expect(
        service.submitForVerification('mech-1', 'user-1', [])
      ).rejects.toThrow(/document/i);
    });
  });

  describe('approve()', () => {
    it('sets status to VERIFIED and records timestamp', async () => {
      const pendingMechanic = {
        ...baseMechanic,
        verificationStatus: 'PENDING' as const,
        verificationDocs: ['doc.pdf'],
      };
      prismaMock.mechanic.findUnique.mockResolvedValue(pendingMechanic);
      prismaMock.mechanic.update.mockResolvedValue({
        ...pendingMechanic,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      });

      const result = await service.approve('mech-1');

      expect(result.verificationStatus).toBe('VERIFIED');
      expect(prismaMock.mechanic.update).toHaveBeenCalledWith({
        where: { id: 'mech-1' },
        data: {
          verificationStatus: 'VERIFIED',
          verifiedAt: expect.any(Date),
        },
      });
    });

    it('rejects if mechanic not in PENDING status', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(baseMechanic); // UNVERIFIED

      await expect(service.approve('mech-1')).rejects.toThrow(/pending/i);
    });
  });

  describe('reject()', () => {
    it('sets status to REJECTED', async () => {
      const pendingMechanic = {
        ...baseMechanic,
        verificationStatus: 'PENDING' as const,
      };
      prismaMock.mechanic.findUnique.mockResolvedValue(pendingMechanic);
      prismaMock.mechanic.update.mockResolvedValue({
        ...pendingMechanic,
        verificationStatus: 'REJECTED',
      });

      const result = await service.reject('mech-1');

      expect(result.verificationStatus).toBe('REJECTED');
      expect(prismaMock.mechanic.update).toHaveBeenCalledWith({
        where: { id: 'mech-1' },
        data: { verificationStatus: 'REJECTED' },
      });
    });
  });

  describe('getPending()', () => {
    it('returns all mechanics with PENDING status', async () => {
      const pendingMechanic = {
        ...baseMechanic,
        verificationStatus: 'PENDING' as const,
      };
      prismaMock.mechanic.findMany.mockResolvedValue([pendingMechanic]);

      const result = await service.getPending();

      expect(result).toHaveLength(1);
      expect(result[0].verificationStatus).toBe('PENDING');
      expect(prismaMock.mechanic.findMany).toHaveBeenCalledWith({
        where: { verificationStatus: 'PENDING' },
        include: expect.objectContaining({ listedBy: true }),
        orderBy: { createdAt: 'asc' },
      });
    });
  });
});
