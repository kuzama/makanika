import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { AuthService } from '../../../../services/auth.service';
import { MockWhatsAppService } from '../../../../services/whatsapp.service';

const whatsappService = new MockWhatsAppService();
const authService = new AuthService(prisma as any, whatsappService);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const result = await authService.sendVerificationCode(phone);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
