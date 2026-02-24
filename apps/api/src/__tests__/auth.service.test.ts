import { AuthService } from '../services/auth.service';
import { MockWhatsAppService } from '../services/whatsapp.service';
import { prismaMock } from './helpers/prisma-mock';

describe('AuthService', () => {
  let authService: AuthService;
  let whatsappService: MockWhatsAppService;

  beforeEach(() => {
    whatsappService = new MockWhatsAppService();
    authService = new AuthService(prismaMock, whatsappService);
  });

  describe('sendVerificationCode()', () => {
    it('stores a 6-digit code for a phone number', async () => {
      const result = await authService.sendVerificationCode('+263771234567');

      expect(result.success).toBe(true);
      const storedCode = authService.getStoredCode('+263771234567');
      expect(storedCode).toBeDefined();
      expect(storedCode!.code).toMatch(/^\d{6}$/);
    });

    it('normalizes phone format from 0XX to +263XX', async () => {
      const result = await authService.sendVerificationCode('0771234567');

      expect(result.success).toBe(true);
      const storedCode = authService.getStoredCode('+263771234567');
      expect(storedCode).toBeDefined();
    });

    it('returns error for invalid phone format', async () => {
      const result = await authService.sendVerificationCode('12345');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('sends code via WhatsApp service', async () => {
      const spy = jest.spyOn(whatsappService, 'sendMessage');
      await authService.sendVerificationCode('+263771234567');

      expect(spy).toHaveBeenCalledWith(
        '+263771234567',
        expect.stringContaining('verification code')
      );
    });
  });

  describe('verifyCode()', () => {
    it('returns success + JWT token for correct code', async () => {
      await authService.sendVerificationCode('+263771234567');
      const storedCode = authService.getStoredCode('+263771234567');

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        phone: '+263771234567',
        name: null,
        role: 'CUSTOMER',
        isPhoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.verifyCode('+263771234567', storedCode!.code);

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
    });

    it('returns error for incorrect code', async () => {
      await authService.sendVerificationCode('+263771234567');

      const result = await authService.verifyCode('+263771234567', '000000');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('returns error for expired code (>5 min)', async () => {
      await authService.sendVerificationCode('+263771234567');

      // Manually expire the code
      const storedCode = authService.getStoredCode('+263771234567');
      storedCode!.expiresAt = new Date(Date.now() - 1000); // expired 1 second ago

      const result = await authService.verifyCode('+263771234567', storedCode!.code);

      expect(result.success).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('creates new User if phone not seen before', async () => {
      await authService.sendVerificationCode('+263771234567');
      const storedCode = authService.getStoredCode('+263771234567');

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-1',
        phone: '+263771234567',
        name: null,
        role: 'CUSTOMER',
        isPhoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await authService.verifyCode('+263771234567', storedCode!.code);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: '+263771234567',
          isPhoneVerified: true,
        }),
      });
    });

    it('returns existing User if phone already registered', async () => {
      const existingUser = {
        id: 'existing-user',
        phone: '+263771234567',
        name: 'John',
        role: 'CUSTOMER' as const,
        isPhoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await authService.sendVerificationCode('+263771234567');
      const storedCode = authService.getStoredCode('+263771234567');

      prismaMock.user.findUnique.mockResolvedValue(existingUser);

      const result = await authService.verifyCode('+263771234567', storedCode!.code);

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe('existing-user');
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });
  });
});
