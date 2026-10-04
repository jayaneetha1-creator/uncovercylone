/**
 * src/lib/analytics.ts
 * Client-side event tracking utility.
 * Lightweight, privacy-respecting (no PII, no IP addresses stored).
 */

import { EventType } from '@/types';

const SESSION_KEY = 'uc_anon_session_id';

/**
 * Get or create a persistent anonymous session ID.
 */
export function getAnonymousSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = 'sid_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/**
 * Detect simple client device category.
 */
function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Send an event payload to /api/events.
 */
export async function trackEvent(
  eventType: EventType,
  placeId?: number | null,
  source?: string,
  extraMetadata?: Record<string, unknown>
): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionId = getAnonymousSessionId();
  const device = getDeviceType();

  const payload = {
    session_id: sessionId,
    event_type: eventType,
    place_id: placeId || null,
    source: source || 'web',
    metadata: JSON.stringify({
      device,
      path: window.location.pathname,
      ...extraMetadata,
    }),
  };

  const bodyStr = JSON.stringify(payload);

  // Use sendBeacon for fire-and-forget if supported
  if (navigator.sendBeacon) {
    const blob = new Blob([bodyStr], { type: 'application/json' });
    navigator.sendBeacon('/api/events', blob);
  } else {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyStr,
      keepalive: true,
    }).catch(() => {
      // Ignore background tracking failures gracefully
    });
  }
}

export function trackPlaceView(placeId: number, source?: string) {
  trackEvent('view', placeId, source);
}

export function trackPlaceClick(placeId: number, source?: string) {
  trackEvent('click', placeId, source);
}

export function trackPlaceSave(placeId: number) {
  trackEvent('save', placeId, 'save_button');
}

export function trackDirectionsClick(placeId: number) {
  trackEvent('directions', placeId, 'google_maps');
}

export function trackSearchQuery(query: string, resultsCount: number) {
  trackEvent('search', null, 'search_bar', {
    query,
    results: resultsCount,
    hasResults: resultsCount > 0,
  });
}
