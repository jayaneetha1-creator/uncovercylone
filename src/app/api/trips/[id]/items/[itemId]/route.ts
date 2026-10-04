/**
 * src/app/api/trips/[id]/items/[itemId]/route.ts
 * PUT /api/trips/[id]/items/[itemId] - Update trip item (notes, visited, date)
 * DELETE /api/trips/[id]/items/[itemId] - Delete trip item
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTripById, updateTripItem, deleteTripItem } from '@/lib/db/trips';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id, itemId } = await context.params;
    const tripId = parseInt(id, 10);
    const itemNum = parseInt(itemId, 10);

    if (isNaN(tripId) || isNaN(itemNum)) {
      return NextResponse.json({ error: 'Invalid ID parameters' }, { status: 400 });
    }

    const trip = await getTripById(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.user_id !== null && (!user || user.id !== trip.user_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const updated = await updateTripItem(itemNum, body);

    if (!updated) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error('PUT trip item error:', err);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id, itemId } = await context.params;
    const tripId = parseInt(id, 10);
    const itemNum = parseInt(itemId, 10);

    if (isNaN(tripId) || isNaN(itemNum)) {
      return NextResponse.json({ error: 'Invalid ID parameters' }, { status: 400 });
    }

    const trip = await getTripById(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.user_id !== null && (!user || user.id !== trip.user_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteTripItem(itemNum);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE trip item error:', err);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
