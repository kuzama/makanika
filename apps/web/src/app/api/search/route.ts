import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { SearchService } from '../../../services/search.service';

const searchService = new SearchService(prisma as any);

// GET /api/search — text search + filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || undefined;
    const vehicleType = searchParams.get('vehicleType') || undefined;
    const priceRange = searchParams.get('priceRange') || undefined;
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await searchService.search({
      query,
      vehicleType,
      priceRange,
      verifiedOnly,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
