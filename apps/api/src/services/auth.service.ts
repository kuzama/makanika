import jwt from 'jsonwebtoken';
import { PrismaClient, User } from '@prisma/client';
import { WhatsAppService } from './whatsapp.service';
import { config } from '../config';

interface StoredCode {
  code: string;
  expiresAt: Date;
}

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

export class AuthService {
  private codes: Map<string, StoredCode> = new Map();

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
    this.codes.set(normalized, {
      code,
      expiresAt: new Date(Date.now() + CODE_EXPIRY_MS),
    });

    await this.whatsapp.sendMessage(
      normalized,
      `Your Mechanic Finder verification code is: ${code}`
    );

    return { success: true };
  }

  getStoredCode(phone: string): StoredCode | undefined {
    const normalized = normalizePhone(phone);
    return this.codes.get(normalized);
  }

  async verifyCode(phone: string, code: string): Promise<VerifyResult> {
    const normalized = normalizePhone(phone);
    const stored = this.codes.get(normalized);

    if (!stored) {
      return { success: false, error: 'Invalid code. No code sent for this number.' };
    }

    if (new Date() > stored.expiresAt) {
      this.codes.delete(normalized);
      return { success: false, error: 'Code has expired. Please request a new one.' };
    }

    if (stored.code !== code) {
      return { success: false, error: 'Invalid verification code.' };
    }

    // Code is correct — remove it
    this.codes.delete(normalized);

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

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return { success: true, token, user };
  }
}
