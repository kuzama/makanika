import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { SearchService } from '../../../../services/search.service';

const searchService = new SearchService(prisma as any);

// GET /api/search/nearby — location-based search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'lat and lng query params are required' },
        { status: 400 }
      );
    }

    const radius = parseFloat(searchParams.get('radius') || '10');

    const results = await searchService.findNearby(lat, lng, radius);
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
