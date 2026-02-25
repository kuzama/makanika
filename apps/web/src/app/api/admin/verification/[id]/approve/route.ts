import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../../lib/prisma';
import { VerificationService } from '../../../../../../services/verification.service';
import { verifyToken, unauthorizedResponse, forbiddenResponse } from '../../../../../../lib/auth';

const verificationService = new VerificationService(prisma as any);

// POST /api/admin/verification/:id/approve — admin only
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();
  if (auth.role !== 'ADMIN') return forbiddenResponse();

  try {
    const { id } = await params;
    const result = await verificationService.approve(id);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message.includes('pending')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
