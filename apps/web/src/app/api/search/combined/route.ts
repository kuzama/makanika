import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { SearchService } from '../../../../services/search.service';

const searchService = new SearchService(prisma as any);

// GET /api/search/combined — combined text + location + filters search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || undefined;
    const vehicleTypes = searchParams.get('vehicleTypes')
      ? searchParams.get('vehicleTypes')!.split(',')
      : undefined;
    const services = searchParams.get('services')
      ? searchParams.get('services')!.split(',')
      : undefined;
    const priceRange = searchParams.get('priceRange') || undefined;
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await searchService.combinedSearch({
      query,
      vehicleTypes,
      services,
      priceRange,
      verifiedOnly,
      lat,
      lng,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
