import { PrismaClient, Mechanic } from '@prisma/client';

export class VerificationService {
  constructor(private prisma: PrismaClient) {}

  async submitForVerification(
    mechanicId: string,
    userId: string,
    documents: string[]
  ): Promise<Mechanic> {
    if (!documents || documents.length === 0) {
      throw new Error('At least one verification document is required');
    }

    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
    });

    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    if (mechanic.listedById !== userId) {
      throw new Error(
        'Not authorized — you do not have permission to submit this for verification'
      );
    }

    return this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: {
        verificationStatus: 'PENDING',
        verificationDocs: documents,
      },
    });
  }

  async approve(mechanicId: string): Promise<Mechanic> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
    });

    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    if (mechanic.verificationStatus !== 'PENDING') {
      throw new Error('Only mechanics with pending status can be approved');
    }

    return this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: {
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });
  }

  async reject(mechanicId: string): Promise<Mechanic> {
    const mechanic = await this.prisma.mechanic.findUnique({
      where: { id: mechanicId },
    });

    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    return this.prisma.mechanic.update({
      where: { id: mechanicId },
      data: { verificationStatus: 'REJECTED' },
    });
  }

  async getPending(): Promise<Mechanic[]> {
    return this.prisma.mechanic.findMany({
      where: { verificationStatus: 'PENDING' },
      include: { listedBy: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
