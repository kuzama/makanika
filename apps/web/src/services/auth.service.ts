import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { WhatsAppService } from './whatsapp.service';

interface SendCodeResult {
  success: boolean;
  error?: string;
}

interface VerifyResult {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

const ZIMBABWE_PHONE_REGEX = /^(\+263|0)\d{9}$/;
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function normalizePhone(phone: string): string {
  if (phone.startsWith('0') && phone.length === 10) {
    return '+263' + phone.slice(1);
  }
  return phone;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Auth service adapted for serverless — uses Prisma VerificationCode model
 * instead of in-memory Map (which doesn't persist across serverless invocations).
 */
export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private whatsapp: WhatsAppService
  ) {}

  async sendVerificationCode(phone: string): Promise<SendCodeResult> {
    const normalized = normalizePhone(phone);

    if (!ZIMBABWE_PHONE_REGEX.test(phone) && !ZIMBABWE_PHONE_REGEX.test(normalized)) {
      return { success: false, error: 'Invalid phone number format. Use +263XXXXXXXXX or 0XXXXXXXXX' };
    }

    const code = generateCode();

    // Upsert verification code in DB (replaces in-memory Map)
    await this.prisma.verificationCode.upsert({
      where: { phone: normalized },
      update: {
        code,
        expiresAt: new Date(Date.now() + CODE_EXPIRY_MS),
      },
      create: {
        phone: normalized,
        code,
        expiresAt: new Date(Date.now() + CODE_EXPIRY_MS),
      },
    });

    await this.whatsapp.sendMessage(
      normalized,
      `Your Mechanic Finder verification code is: ${code}`
    );

    return { success: true };
  }

  async verifyCode(phone: string, code: string): Promise<VerifyResult> {
    const normalized = normalizePhone(phone);

    // Look up code from DB instead of in-memory Map
    const stored = await this.prisma.verificationCode.findUnique({
      where: { phone: normalized },
    });

    if (!stored) {
      return { success: false, error: 'Invalid code. No code sent for this number.' };
    }

    if (new Date() > stored.expiresAt) {
      // Clean up expired code
      await this.prisma.verificationCode.delete({ where: { phone: normalized } });
      return { success: false, error: 'Code has expired. Please request a new one.' };
    }

    if (stored.code !== code) {
      return { success: false, error: 'Invalid verification code.' };
    }

    // Code is correct — remove it
    await this.prisma.verificationCode.delete({ where: { phone: normalized } });

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { phone: normalized },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: normalized,
          isPhoneVerified: true,
        },
      });
    } else if (!user.isPhoneVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { isPhoneVerified: true },
      });
    }

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-key';
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return { success: true, token, user };
  }
}
