/**
 * src/app/api/trips/route.ts
 * GET /api/trips - List all trips for current authenticated user
 * POST /api/trips - Create new trip or sync guest trips
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getUserTrips, createTrip, syncGuestTrips } from '@/lib/db/trips';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, trips: [] });
    }

    const trips = await getUserTrips(user.id);
    return NextResponse.json({ authenticated: true, trips });
  } catch (err: any) {
    console.error('GET /api/trips error:', err);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();

    // Guest sync action requires an authenticated user
    if (body.action === 'sync') {
      if (!user) {
        return NextResponse.json({ error: 'Authentication required to sync trips' }, { status: 401 });
      }
      const count = await syncGuestTrips(user.id, body.guestTrips || []);
      const updatedTrips = await getUserTrips(user.id);
      return NextResponse.json({ success: true, synced: count, trips: updatedTrips });
    }

    // Creating a trip
    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Trip title is required' }, { status: 400 });
    }

    // Allow guest creation return or user creation in DB
    const userId = user ? user.id : null;
    const trip = await createTrip(userId, {
      title: body.title,
      description: body.description,
      start_date: body.start_date,
      end_date: body.end_date,
      is_public: Boolean(body.is_public),
      is_ai_planned: Boolean(body.is_ai_planned),
    });

    return NextResponse.json({ success: true, trip }, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/trips error:', err);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
