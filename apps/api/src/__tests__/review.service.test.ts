import { ReviewService } from '../services/review.service';
import { prismaMock } from './helpers/prisma-mock';

describe('ReviewService', () => {
  let service: ReviewService;

  beforeEach(() => {
    service = new ReviewService(prismaMock);
  });

  const baseReview = {
    id: 'rev-1',
    rating: 5,
    comment: 'Great work!',
    authorId: 'user-1',
    mechanicId: 'mech-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('create()', () => {
    it('creates a review with valid data', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue({ id: 'mech-1' } as any);
      prismaMock.review.create.mockResolvedValue(baseReview);

      const result = await service.create({
        rating: 5,
        comment: 'Great work!',
        authorId: 'user-1',
        mechanicId: 'mech-1',
      });

      expect(result.id).toBe('rev-1');
      expect(result.rating).toBe(5);
      expect(prismaMock.review.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          rating: 5,
          comment: 'Great work!',
          authorId: 'user-1',
          mechanicId: 'mech-1',
        }),
        include: expect.objectContaining({ author: true }),
      });
    });

    it('rejects rating below 1', async () => {
      await expect(
        service.create({ rating: 0, authorId: 'user-1', mechanicId: 'mech-1' })
      ).rejects.toThrow(/rating/i);
    });

    it('rejects rating above 5', async () => {
      await expect(
        service.create({ rating: 6, authorId: 'user-1', mechanicId: 'mech-1' })
      ).rejects.toThrow(/rating/i);
    });

    it('rejects review for non-existent mechanic', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ rating: 5, authorId: 'user-1', mechanicId: 'bad-id' })
      ).rejects.toThrow(/mechanic/i);
    });

    it('rejects duplicate review (same author + mechanic)', async () => {
      prismaMock.mechanic.findUnique.mockResolvedValue({ id: 'mech-1' } as any);
      prismaMock.review.create.mockRejectedValue({
        code: 'P2002',
        message: 'Unique constraint failed',
      });

      await expect(
        service.create({ rating: 5, authorId: 'user-1', mechanicId: 'mech-1' })
      ).rejects.toThrow(/already reviewed/i);
    });
  });

  describe('getByMechanic()', () => {
    it('returns reviews for a mechanic', async () => {
      prismaMock.review.findMany.mockResolvedValue([baseReview]);

      const result = await service.getByMechanic('mech-1');

      expect(result).toHaveLength(1);
      expect(result[0].mechanicId).toBe('mech-1');
      expect(prismaMock.review.findMany).toHaveBeenCalledWith({
        where: { mechanicId: 'mech-1' },
        include: expect.objectContaining({ author: true }),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getAverageRating()', () => {
    it('calculates average rating for a mechanic', async () => {
      prismaMock.review.aggregate.mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 10 },
      } as any);

      const result = await service.getAverageRating('mech-1');

      expect(result.average).toBe(4.5);
      expect(result.count).toBe(10);
    });

    it('returns 0 average and 0 count for no reviews', async () => {
      prismaMock.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      } as any);

      const result = await service.getAverageRating('mech-1');

      expect(result.average).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe('delete()', () => {
    it('deletes a review by its author', async () => {
      prismaMock.review.findUnique.mockResolvedValue(baseReview);
      prismaMock.review.delete.mockResolvedValue(baseReview);

      await service.delete('rev-1', 'user-1');

      expect(prismaMock.review.delete).toHaveBeenCalledWith({
        where: { id: 'rev-1' },
      });
    });

    it('rejects delete if not the author', async () => {
      prismaMock.review.findUnique.mockResolvedValue(baseReview);

      await expect(service.delete('rev-1', 'other-user')).rejects.toThrow(
        /permission|authorized/i
      );
    });

    it('allows admin to delete any review', async () => {
      prismaMock.review.findUnique.mockResolvedValue(baseReview);
      prismaMock.review.delete.mockResolvedValue(baseReview);

      await service.delete('rev-1', 'admin-1', 'ADMIN');

      expect(prismaMock.review.delete).toHaveBeenCalled();
    });
  });
});
