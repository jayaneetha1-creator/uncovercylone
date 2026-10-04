/**
 * src/app/api/trips/[id]/items/route.ts
 * POST /api/trips/[id]/items - Add stop or task to trip
 * PUT /api/trips/[id]/items - Reorder items in trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTripById, addTripItem, reorderTripItems } from '@/lib/db/trips';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await context.params;
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    const trip = await getTripById(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // If trip belongs to a user, enforce ownership
    if (trip.user_id !== null && (!user || user.id !== trip.user_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const item = await addTripItem(tripId, {
      place_id: body.place_id ? parseInt(body.place_id, 10) : null,
      item_type: body.item_type || 'place',
      title: body.title || '',
      notes: body.notes || '',
      target_date: body.target_date || '',
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/trips/[id]/items error:', err);
    return NextResponse.json({ error: 'Failed to add trip item' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    const { id } = await context.params;
    const tripId = parseInt(id, 10);
    if (isNaN(tripId)) {
      return NextResponse.json({ error: 'Invalid trip ID' }, { status: 400 });
    }

    const trip = await getTripById(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.user_id !== null && (!user || user.id !== trip.user_id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    if (!Array.isArray(body.itemIds)) {
      return NextResponse.json({ error: 'itemIds array required' }, { status: 400 });
    }

    await reorderTripItems(tripId, body.itemIds);
    const updatedTrip = await getTripById(tripId);

    return NextResponse.json({ success: true, items: updatedTrip?.items || [] });
  } catch (err: any) {
    console.error('PUT /api/trips/[id]/items error:', err);
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 });
  }
}
