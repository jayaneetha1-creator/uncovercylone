import type { Metadata } from 'next';
import { getDb } from '@/lib/db';
import { Place } from '@/types';
import DestinationsClientView from '@/components/DestinationsClientView';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Destinations in Sri Lanka — Complete Directory | UncoverCeylon',
  description:
    'Browse all handpicked destinations in Sri Lanka. Filter by category (beaches, waterfalls, mountains, ancient ruins), province, visiting season, and verified traveler ratings.',
  openGraph: {
    title: 'Destinations in Sri Lanka — Complete Directory | UncoverCeylon',
    description:
      'Filter and discover Sri Lanka’s top sights, hidden gems, entry fees, and optimal travel windows.',
    url: '/destinations',
    siteName: 'UncoverCeylon',
  },
};

interface ReviewSnippetRow {
  place_id: number;
  comment: string;
}

export default async function DestinationsPage() {
  const db = getDb();

  // Fetch all published places
  const places = (
    db.prepare("SELECT * FROM places WHERE status = 'published' OR status IS NULL ORDER BY featured DESC, rating DESC").all()
  ) as Place[];

  // Fetch recent approved review snippets grouped by place_id
  const reviewRows = (
    db.prepare("SELECT place_id, comment FROM reviews WHERE status = 'approved' OR status IS NULL ORDER BY id DESC").all()
  ) as ReviewSnippetRow[];

  const reviewSnippetsMap: Record<number, string[]> = {};
  for (const row of reviewRows) {
    if (!reviewSnippetsMap[row.place_id]) {
      reviewSnippetsMap[row.place_id] = [];
    }
    if (reviewSnippetsMap[row.place_id].length < 2 && row.comment && row.comment.trim().length > 10) {
      reviewSnippetsMap[row.place_id].push(row.comment.trim());
    }
  }

  return (
    <DestinationsClientView
      initialPlaces={places}
      reviewSnippetsMap={reviewSnippetsMap}
    />
  );
}
