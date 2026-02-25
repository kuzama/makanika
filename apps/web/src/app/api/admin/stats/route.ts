import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { verifyToken, unauthorizedResponse, forbiddenResponse } from '../../../../lib/auth';

// GET /api/admin/stats — admin dashboard stats
export async function GET(request: NextRequest) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();
  if (auth.role !== 'ADMIN') return forbiddenResponse();

  try {
    const [totalMechanics, pendingVerifications, verifiedMechanics, totalUsers, totalReviews] =
      await Promise.all([
        prisma.mechanic.count(),
        prisma.mechanic.count({ where: { verificationStatus: 'PENDING' } }),
        prisma.mechanic.count({ where: { verificationStatus: 'VERIFIED' } }),
        prisma.user.count(),
        prisma.review.count(),
      ]);

    return NextResponse.json({
      totalMechanics,
      pendingVerifications,
      verifiedMechanics,
      totalUsers,
      totalReviews,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
