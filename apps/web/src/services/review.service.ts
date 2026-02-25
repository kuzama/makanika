import { PrismaClient, Review } from '@prisma/client';

interface CreateReviewInput {
  rating: number;
  comment?: string;
  authorId: string;
  mechanicId: string;
}

interface AverageRating {
  average: number;
  count: number;
}

export class ReviewService {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateReviewInput): Promise<Review> {
    if (input.rating < 1 || input.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: input.mechanicId },
    });

    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    try {
      return await this.prisma.review.create({
        data: {
          rating: input.rating,
          comment: input.comment,
          authorId: input.authorId,
          mechanicId: input.mechanicId,
        },
        include: { author: true },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('You have already reviewed this mechanic');
      }
      throw error;
    }
  }

  async getByMechanic(mechanicId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: { mechanicId },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAverageRating(mechanicId: string): Promise<AverageRating> {
    const result = await this.prisma.review.aggregate({
      where: { mechanicId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: result._avg.rating ?? 0,
      count: result._count.rating,
    };
  }

  async delete(
    reviewId: string,
    userId: string,
    userRole?: string
  ): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.authorId !== userId && userRole !== 'ADMIN') {
      throw new Error(
        'Not authorized — you do not have permission to delete this review'
      );
    }

    await this.prisma.review.delete({ where: { id: reviewId } });
  }
}
