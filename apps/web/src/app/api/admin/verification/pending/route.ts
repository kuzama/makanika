import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { VerificationService } from '../../../../../services/verification.service';
import { verifyToken, unauthorizedResponse, forbiddenResponse } from '../../../../../lib/auth';

const verificationService = new VerificationService(prisma as any);

// GET /api/admin/verification/pending — admin only
export async function GET(request: NextRequest) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();
  if (auth.role !== 'ADMIN') return forbiddenResponse();

  try {
    const pending = await verificationService.getPending();
    return NextResponse.json(pending);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
