/**
 * src/app/api/trips/[id]/route.ts
 * GET /api/trips/[id] - Fetch trip with items
 * PUT /api/trips/[id] - Update trip metadata
 * DELETE /api/trips/[id] - Delete trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTripById, updateTrip, deleteTrip } from '@/lib/db/trips';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    const user = await getCurrentUser(req);
    const trip = await getTripById(tripId, user?.id);

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (err: any) {
    console.error('GET /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch trip' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await context.params;
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    const body = await req.json();
    const updated = await updateTrip(tripId, user.id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Trip not found or forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, trip: updated });
  } catch (err: any) {
    console.error('PUT /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update trip' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await context.params;
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    const success = await deleteTrip(tripId, user.id);
    if (!success) {
      return NextResponse.json({ error: 'Trip not found or forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete trip' }, { status: 500 });
  }
}
