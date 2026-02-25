import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { VerificationService } from '../../../../../services/verification.service';
import { verifyToken, unauthorizedResponse } from '../../../../../lib/auth';

const verificationService = new VerificationService(prisma as any);

// POST /api/mechanics/:id/verify — owner submits for verification
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const { documents } = body;

    const result = await verificationService.submitForVerification(
      id,
      auth.userId,
      documents
    );

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message.includes('permission') || error.message.includes('authorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error.message.includes('document')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
