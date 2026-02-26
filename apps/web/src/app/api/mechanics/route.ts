import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { MechanicService } from '../../../services/mechanic.service';
import { verifyToken, unauthorizedResponse } from '../../../lib/auth';

const mechanicService = new MechanicService(prisma as any);

// GET /api/mechanics — public, paginated list
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const vehicleType = searchParams.get('vehicleType') || undefined;
    const service = searchParams.get('service') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await mechanicService.findAll({
      page,
      limit,
      vehicleType,
      service,
      search,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/mechanics — public (auth optional, links listing to user if logged in)
export async function POST(request: NextRequest) {
  const auth = verifyToken(request);

  try {
    const body = await request.json();
    const mechanic = await mechanicService.create({
      ...body,
      listedById: auth?.userId,
    });

    return NextResponse.json(mechanic, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('required')) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
