import { sendCodeSchema, verifyCodeSchema, createMechanicSchema, createReviewSchema } from '../middleware/validation';

describe('Zod Validation Schemas', () => {
  describe('sendCodeSchema', () => {
    it('accepts valid +263 phone', () => {
      const result = sendCodeSchema.safeParse({ phone: '+263771234567' });
      expect(result.success).toBe(true);
    });

    it('accepts valid 0XX phone', () => {
      const result = sendCodeSchema.safeParse({ phone: '0771234567' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid phone format', () => {
      const result = sendCodeSchema.safeParse({ phone: '12345' });
      expect(result.success).toBe(false);
    });

    it('rejects empty phone', () => {
      const result = sendCodeSchema.safeParse({ phone: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('verifyCodeSchema', () => {
    it('accepts valid phone and 6-digit code', () => {
      const result = verifyCodeSchema.safeParse({ phone: '+263771234567', code: '123456' });
      expect(result.success).toBe(true);
    });

    it('rejects non-numeric code', () => {
      const result = verifyCodeSchema.safeParse({ phone: '+263771234567', code: 'abcdef' });
      expect(result.success).toBe(false);
    });

    it('rejects code with wrong length', () => {
      const result = verifyCodeSchema.safeParse({ phone: '+263771234567', code: '123' });
      expect(result.success).toBe(false);
    });
  });

  describe('createMechanicSchema', () => {
    const validMechanic = {
      businessName: 'Fix-It Garage',
      phone: '+263771234567',
      latitude: -17.83,
      longitude: 31.05,
    };

    it('accepts valid mechanic data', () => {
      const result = createMechanicSchema.safeParse(validMechanic);
      expect(result.success).toBe(true);
    });

    it('accepts mechanic with optional fields', () => {
      const result = createMechanicSchema.safeParse({
        ...validMechanic,
        address: '123 Main St',
        description: 'Best garage in town',
        priceRange: 'MODERATE',
        vehicleTypes: ['CAR', 'TRUCK'],
        services: ['Oil Change', 'Brake Repair'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects business name too short', () => {
      const result = createMechanicSchema.safeParse({ ...validMechanic, businessName: 'A' });
      expect(result.success).toBe(false);
    });

    it('rejects latitude outside Zimbabwe', () => {
      const result = createMechanicSchema.safeParse({ ...validMechanic, latitude: 0 });
      expect(result.success).toBe(false);
    });

    it('rejects invalid price range', () => {
      const result = createMechanicSchema.safeParse({ ...validMechanic, priceRange: 'EXPENSIVE' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid vehicle type', () => {
      const result = createMechanicSchema.safeParse({ ...validMechanic, vehicleTypes: ['SPACESHIP'] });
      expect(result.success).toBe(false);
    });
  });

  describe('createReviewSchema', () => {
    it('accepts valid rating 1-5', () => {
      expect(createReviewSchema.safeParse({ rating: 1 }).success).toBe(true);
      expect(createReviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    });

    it('accepts rating with comment', () => {
      const result = createReviewSchema.safeParse({ rating: 4, comment: 'Great service!' });
      expect(result.success).toBe(true);
    });

    it('rejects rating below 1', () => {
      expect(createReviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    });

    it('rejects rating above 5', () => {
      expect(createReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    });

    it('rejects non-integer rating', () => {
      expect(createReviewSchema.safeParse({ rating: 3.5 }).success).toBe(false);
    });

    it('rejects comment over 500 characters', () => {
      const result = createReviewSchema.safeParse({ rating: 3, comment: 'x'.repeat(501) });
      expect(result.success).toBe(false);
    });
  });
});
