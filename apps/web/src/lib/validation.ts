import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Phone validation — Zimbabwe format
const zimbabwePhone = z
  .string()
  .regex(/^(\+263|0)\d{9}$/, 'Invalid phone format. Use +263XXXXXXXXX or 0XXXXXXXXX');

// Auth schemas
export const sendCodeSchema = z.object({
  phone: zimbabwePhone,
});

export const verifyCodeSchema = z.object({
  phone: zimbabwePhone,
  code: z.string().length(6, 'Code must be exactly 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

// Mechanic schemas
export const createMechanicSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  phone: zimbabwePhone,
  latitude: z.number().min(-22).max(-15, 'Latitude must be within Zimbabwe bounds'),
  longitude: z.number().min(25).max(34, 'Longitude must be within Zimbabwe bounds'),
  address: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  priceRange: z.enum(['BUDGET', 'MODERATE', 'PREMIUM']).optional(),
  vehicleTypes: z.array(z.enum(['CAR', 'SUV', 'SEDAN', 'HATCHBACK', 'OTHER'])).optional(),
  services: z.array(z.string().max(50)).optional(),
  specialties: z.array(z.string().max(50)).optional(),
});

export const updateMechanicSchema = createMechanicSchema.partial();

// Review schemas
export const createReviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5'),
  comment: z.string().max(500).optional(),
});

// Search schemas
export const searchQuerySchema = z.object({
  q: z.string().max(100).optional(),
  vehicleType: z.string().optional(),
  priceRange: z.enum(['BUDGET', 'MODERATE', 'PREMIUM']).optional(),
  verifiedOnly: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
});

/**
 * Parse and validate a JSON request body against a Zod schema.
 * Returns { data, error } — if error is set, return it as the response.
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const errors = result.error.issues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return {
        data: null,
        error: NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        ),
      };
    }

    return { data: result.data, error: null };
  } catch {
    return {
      data: null,
      error: NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      ),
    };
  }
}
