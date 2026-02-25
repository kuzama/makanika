import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { ReviewService } from '../../../../../services/review.service';
import { verifyToken, unauthorizedResponse } from '../../../../../lib/auth';

const reviewService = new ReviewService(prisma as any);

// GET /api/mechanics/:id/reviews — public
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await reviewService.getByMechanic(id);
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/mechanics/:id/reviews — auth required
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const review = await reviewService.create({
      rating,
      comment,
      authorId: auth.userId,
      mechanicId: id,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('rating') || error.message.includes('already reviewed')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message.includes('not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
