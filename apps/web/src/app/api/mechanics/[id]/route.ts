import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { MechanicService } from '../../../../services/mechanic.service';
import { verifyToken, unauthorizedResponse } from '../../../../lib/auth';

const mechanicService = new MechanicService(prisma as any);

// GET /api/mechanics/:id — public, single mechanic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mechanic = await mechanicService.findById(id);

    if (!mechanic) {
      return NextResponse.json({ error: 'Mechanic not found' }, { status: 404 });
    }

    return NextResponse.json(mechanic);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/mechanics/:id — auth required, owner only
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { id } = await params;
    const body = await request.json();
    const mechanic = await mechanicService.update(id, auth.userId, body);

    return NextResponse.json(mechanic);
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

// DELETE /api/mechanics/:id — auth required, owner or admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = verifyToken(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { id } = await params;
    await mechanicService.delete(id, auth.userId, auth.role);

    return NextResponse.json({ success: true, message: 'Mechanic deleted' });
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
