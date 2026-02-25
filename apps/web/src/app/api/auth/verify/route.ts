import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { AuthService } from '../../../../services/auth.service';
import { MockWhatsAppService } from '../../../../services/whatsapp.service';

const whatsappService = new MockWhatsAppService();
const authService = new AuthService(prisma as any, whatsappService);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json({ error: 'Phone and code are required' }, { status: 400 });
    }

    const result = await authService.verifyCode(phone, code);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true, token: result.token, user: result.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
