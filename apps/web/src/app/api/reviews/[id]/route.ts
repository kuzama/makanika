import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { ReviewService } from '../../../../services/review.service';
import { verifyToken, unauthorizedResponse } from '../../../../lib/auth';

const reviewService = new ReviewService(prisma as any);

// DELETE /api/reviews/:id — auth required, author or admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { id } = await params;
    await reviewService.delete(id, auth.userId, auth.role);

    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message.includes('permission') || error.message.includes('authorized')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
