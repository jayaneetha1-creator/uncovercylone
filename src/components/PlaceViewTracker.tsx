'use client';

/**
 * src/components/PlaceViewTracker.tsx
 * Invisible client-side component to record place views for analytics and visitor journeys.
 */

import { useEffect } from 'react';
import { trackPlaceView } from '@/lib/analytics';

interface PlaceViewTrackerProps {
  placeId: number;
}

export default function PlaceViewTracker({ placeId }: PlaceViewTrackerProps) {
  useEffect(() => {
    trackPlaceView(placeId, 'place_page');
  }, [placeId]);

  return null;
}
