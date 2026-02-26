import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyToken, unauthorizedResponse } from '../../../../lib/auth';

// GET /api/mechanics/mine — returns mechanics listed by the current user
export async function GET(request: NextRequest) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();

  try {
    const mechanics = await prisma.mechanic.findMany({
      where: { listedById: auth.userId },
      orderBy: { createdAt: 'desc' },
      include: { reviews: true },
    });

    return NextResponse.json(mechanics);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
