import { PrismaClient, Mechanic, VehicleType } from '@prisma/client';

export interface CreateMechanicInput {
  businessName: string;
  phone: string;
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  priceRange?: 'BUDGET' | 'MODERATE' | 'PREMIUM';
  vehicleTypes: string[];
  services: string[];
  specialties: string[];
  listedById: string;
  userId?: string;
}

export interface UpdateMechanicInput {
  businessName?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
  priceRange?: 'BUDGET' | 'MODERATE' | 'PREMIUM';
  vehicleTypes?: string[];
  services?: string[];
  specialties?: string[];
}

export interface FindAllOptions {
  page: number;
  limit: number;
  vehicleType?: string;
  service?: string;
  search?: string;
}

export interface PaginatedResult {
  mechanics: Mechanic[];
  total: number;
  page: number;
  limit: number;
}

export class MechanicService {
  constructor(private prisma: PrismaClient) {}

  async create(input: CreateMechanicInput): Promise<Mechanic> {
    if (!input.businessName || input.businessName.trim() === '') {
      throw new Error('businessName is required');
    }
    if (!input.phone || input.phone.trim() === '') {
      throw new Error('phone is required');
    }

    return this.prisma.mechanic.create({
      data: {
        businessName: input.businessName,
        phone: input.phone,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        description: input.description,
        priceRange: input.priceRange || 'MODERATE',
        vehicleTypes: input.vehicleTypes as VehicleType[],
        services: input.services,
        specialties: input.specialties,
        listedById: input.listedById,
        userId: input.userId,
      },
    });
  }

  async findById(id: string): Promise<Mechanic | null> {
    return this.prisma.mechanic.findUnique({
      where: { id },
      include: { reviews: true, listedBy: true },
    });
  }

  async findAll(options: FindAllOptions): Promise<PaginatedResult> {
    const { page, limit, vehicleType, service, search } = options;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (vehicleType) {
      where.vehicleTypes = { has: vehicleType };
    }

    if (service) {
      where.services = { has: service };
    }

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
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

  async update(
    id: string,
    userId: string,
    data: UpdateMechanicInput
  ): Promise<Mechanic> {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id } });

    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    if (mechanic.listedById !== userId) {
      throw new Error('Not authorized — you do not have permission to update this listing');
    }

    return this.prisma.mechanic.update({
      where: { id },
      data: {
        ...data,
        vehicleTypes: data.vehicleTypes as VehicleType[] | undefined,
      },
    });
  }

  async delete(id: string, userId: string, userRole?: string): Promise<void> {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id } });

    if (!mechanic) {
      throw new Error('Mechanic not found');
    }

    if (mechanic.listedById !== userId && userRole !== 'ADMIN') {
      throw new Error('Not authorized — you do not have permission to delete this listing');
    }

    await this.prisma.mechanic.delete({ where: { id } });
  }
}
