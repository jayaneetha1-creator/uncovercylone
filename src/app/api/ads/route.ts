/**
 * src/app/api/ads/route.ts
 * Public endpoint to fetch active ads for a given placement.
 * Respects master kill switch and placement-level switches.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAds, getAdSettings } from '@/lib/db/ads';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get('placement') || undefined;
    const device = searchParams.get('device') || 'all';

    const settings = await getAdSettings();

    // Check master switch
    if (!settings.masterEnabled) {
      return NextResponse.json({ enabled: false, ads: [] });
    }

    // Check specific placement switch
    if (placement === 'grid_card' && !settings.gridCardEnabled) {
      return NextResponse.json({ enabled: false, ads: [] });
    }
    if (placement === 'home_banner' && !settings.homeBannerEnabled) {
      return NextResponse.json({ enabled: false, ads: [] });
    }
    if (placement === 'sidebar_partner' && !settings.sidebarPartnerEnabled) {
      return NextResponse.json({ enabled: false, ads: [] });
    }
    if (placement === 'carousel_slot' && !settings.carouselSlotEnabled) {
      return NextResponse.json({ enabled: false, ads: [] });
    }
    if (placement === 'footer_strip' && !settings.footerStripEnabled) {
      return NextResponse.json({ enabled: false, ads: [] });
    }

    const ads = await getAds({
      placement,
      activeOnly: true,
      device,
    });

    return NextResponse.json({
      enabled: true,
      ads,
      adsense: {
        enabled: settings.adsenseEnabled,
        clientId: settings.adsenseClientId,
      },
    });
  } catch (error) {
    console.error('API /api/ads error:', error);
    return NextResponse.json({ enabled: false, ads: [] }, { status: 500 });
  }
}
