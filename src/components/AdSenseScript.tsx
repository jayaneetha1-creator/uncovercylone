'use client';

/**
 * src/components/AdSenseScript.tsx
 * Backend-ready Google AdSense script loader.
 * OFF by default per Section 4.8. Injects scripts only when master toggle is enabled in Admin Settings.
 */

import React, { useEffect, useState } from 'react';
import Script from 'next/script';

export default function AdSenseScript() {
  const [adsenseConfig, setAdsenseConfig] = useState<{
    enabled: boolean;
    clientId: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function checkAdSense() {
      try {
        const res = await fetch('/api/ads?placement=grid_card');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.adsense && data.adsense.enabled && data.adsense.clientId) {
          setAdsenseConfig({
            enabled: true,
            clientId: data.adsense.clientId,
          });
        }
      } catch {
        // Ignore failures
      }
    }

    checkAdSense();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!adsenseConfig || !adsenseConfig.enabled || !adsenseConfig.clientId) {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        adsenseConfig.clientId
      )}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
