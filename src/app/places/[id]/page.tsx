import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { Place, Review } from '@/types';
import ReviewSection from './ReviewSection';
import DestinationGallery from './DestinationGallery';
import PlaceMap from './PlaceMap';
import PlaceCard from '@/components/PlaceCard';
import WishlistButton from '@/components/WishlistButton';
import OfflineGuideButton from '@/components/OfflineGuideButton';
import PlaceSidebarQuickFacts from './PlaceSidebarQuickFacts';
import {
  MapPin, Star, Clock, Tag, Ticket, Calendar, ChevronLeft,
  ArrowUpRight, Heart, Share2, CheckCircle2, Map,
  AlertCircle, ShieldCheck, Sun, Info, ArrowRight, Eye,
  CloudSun, CloudRain, Thermometer, Wind, Umbrella, Sparkles,
  Users, Smartphone, Globe, Compass, Coffee, Camera, Footprints,
  Check, Phone, MessageSquare
} from 'lucide-react';

interface PlacePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PlacePageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const db = getDb();
    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(id) as Place | undefined;
    if (!place) {
      return {
        title: 'Destination Not Found — UncoverCeylon',
      };
    }

    const title = `${place.name} — UncoverCeylon Travel Guide`;
    const desc = place.short_description || `Discover ${place.name} in ${place.location}, Sri Lanka. Travel guide, best season to visit, photos, and reviews.`;
    const img = place.image_url || 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&h=630&fit=crop&q=85';

    return {
      title,
      description: desc,
      openGraph: {
        title: `${place.name} — Sri Lanka Travel Guide | UncoverCeylon`,
        description: desc,
        url: `/places/${place.id}`,
        siteName: 'UncoverCeylon',
        images: [
          {
            url: img,
            width: 1200,
            height: 630,
            alt: place.name,
          },
        ],
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${place.name} — UncoverCeylon`,
        description: desc,
        images: [img],
      },
    };
  } catch {
    return {
      title: 'UncoverCeylon — Discover Sri Lanka',
    };
  }
}

async function getPlaceDetails(id: string): Promise<{
  place: Place;
  reviews: Review[];
  relatedPlaces: Place[];
  nearbyAttractions: Place[];
} | null> {
  try {
    const db = getDb();
    const place = db.prepare('SELECT * FROM places WHERE id = ?').get(id) as Place | undefined;
    if (!place) return null;

    const reviews = db.prepare(
      'SELECT * FROM reviews WHERE place_id = ? ORDER BY created_at DESC'
    ).all(id) as Review[];

    const relatedPlaces = db.prepare(
      'SELECT * FROM places WHERE category = ? AND id != ? ORDER BY rating DESC LIMIT 3'
    ).all(place.category, id) as Place[];

    const nearbyAttractions = db.prepare(
      'SELECT * FROM places WHERE province = ? AND id != ? ORDER BY rating DESC LIMIT 3'
    ).all(place.province, id) as Place[];

    return { place, reviews, relatedPlaces, nearbyAttractions };
  } catch {
    return null;
  }
}

function getGalleryImages(place: Place): string[] {
  let images: string[] = [];
  try {
    const parsed = JSON.parse(place.gallery || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) {
      images = parsed.filter((img) => typeof img === 'string' && img.trim().length > 0);
    }
  } catch {
    // ignore
  }

  if (place.image_url && !images.includes(place.image_url)) {
    images.unshift(place.image_url);
  }

  if (images.length === 0) {
    images = [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1600&q=85',
    ];
  }

  return images;
}

// Suggested Itinerary Generator (TripAdvisor Image 4 Style)
function getItinerarySteps(place: Place): {
  badge: string;
  title: string;
  time: string;
  desc: string;
}[] {
  const cat = place.category.toLowerCase();
  const name = place.name.toLowerCase();

  if (cat.includes('mountain') || name.includes('bridge') || name.includes('ella') || cat.includes('gem')) {
    return [
      {
        badge: 'Start',
        title: 'Arrival & Trailhead Departure',
        time: 'Stop: 15–20 mins',
        desc: 'Depart from town or train station by local tuk-tuk or start an easy walking trail through lush eucalyptus woods.',
      },
      {
        badge: '1',
        title: 'Forest Footpath & Tea Ridge Trek',
        time: 'Stop: 25 mins',
        desc: 'Gentle, scenic descent through historic hillside tea estates with first glimpse of the landmark below.',
      },
      {
        badge: '2',
        title: 'Main Viaduct Observation Deck & Train Spotting',
        time: 'Stop: 45 mins',
        desc: 'Reach the iconic photo vantage point. Best spot to observe and photograph the vintage blue Ceylon railway train crossing.',
      },
      {
        badge: '3',
        title: 'Historic Bridge Walk & Tunnel Exploration',
        time: 'Stop: 30 mins',
        desc: 'Walk on foot across the colonial stone masonry structure curving high above the jungle valley and visit the adjacent tunnel portal.',
      },
      {
        badge: 'End',
        title: 'Hillside Tea Kiosk & Return Journey',
        time: 'Stop: 20 mins',
        desc: 'Conclude with freshly brewed Ceylon golden tip tea and coconut roti at family-run hillside cafes before heading back.',
      },
    ];
  } else if (cat.includes('ancient') || cat.includes('historic')) {
    return [
      {
        badge: 'Start',
        title: 'Main Archaeological Entrance & Moat Gate',
        time: 'Stop: 15 mins',
        desc: 'Pass through ticket checkpoints and receive your visitor map. Morning light provides the best reflections on ancient moats.',
      },
      {
        badge: '1',
        title: 'Royal Water Gardens & Boulder Terraces',
        time: 'Stop: 30 mins',
        desc: 'Walk among 5th-century hydraulic fountains, symmetrical pools, and monolithic granite boulder formations.',
      },
      {
        badge: '2',
        title: 'Mirror Wall & Frescoes Gallery',
        time: 'Stop: 30 mins',
        desc: 'Ascend the spiral staircase to examine ancient painted maiden frescoes and centuries-old Sinhala graffiti inscriptions.',
      },
      {
        badge: '3',
        title: 'Lion Plateau & Sky Palace Ascent',
        time: 'Stop: 45 mins',
        desc: 'Stand between the colossal carved lion paws before ascending the final staircase to the panoramic citadel summit.',
      },
      {
        badge: 'End',
        title: 'Heritage Museum & Local Artisan Refreshment',
        time: 'Stop: 25 mins',
        desc: 'Visit the artifact exhibition hall and enjoy king coconut water served fresh by local village vendors.',
      },
    ];
  } else if (cat.includes('beach')) {
    return [
      {
        badge: 'Start',
        title: 'Beachside Shoreline Stroll & Briefing',
        time: 'Stop: 15 mins',
        desc: 'Begin along the crescent bay with gentle morning waves and cool sea breeze.',
      },
      {
        badge: '1',
        title: 'Coconut Tree Hill Panoramic Viewpoint',
        time: 'Stop: 30 mins',
        desc: 'Climb the iconic reddish dirt knoll crowned with towering coconut palms overlooking the Indian Ocean.',
      },
      {
        badge: '2',
        title: 'Coral Reef Snorkeling & Turtle Watching',
        time: 'Stop: 45 mins',
        desc: 'Snorkel in sheltered turquoise waters frequented by wild sea turtles and colorful reef fish.',
      },
      {
        badge: '3',
        title: 'Ocean Whale Safari or Beginner Surfing',
        time: 'Stop: 1 hour',
        desc: 'Catch gentle beach-break waves or embark on a harbor safari to spot spinner dolphins.',
      },
      {
        badge: 'End',
        title: 'Golden Sunset Dining on the Sand',
        time: 'Stop: 45 mins',
        desc: 'Relax to sound of gentle surf with freshly grilled lobster, coconut curry, and tropical passion fruit juices.',
      },
    ];
  } else {
    return [
      {
        badge: 'Start',
        title: 'Park Gate Departure & Trailhead Briefing',
        time: 'Stop: 15 mins',
        desc: 'Meet local guide or ranger, review trail guidelines, and begin your excursion.',
      },
      {
        badge: '1',
        title: 'Nature Trail Walk & Canopy Birdwatching',
        time: 'Stop: 40 mins',
        desc: 'Walk through shaded trails observing indigenous flora, endemic birds, and natural streams.',
      },
      {
        badge: '2',
        title: 'Central Landmark & Panoramic Viewpoint',
        time: 'Stop: 45 mins',
        desc: 'Arrive at the principal observation platform overlooking surrounding valleys and natural wonders.',
      },
      {
        badge: '3',
        title: 'Photography & Wildlife Observations',
        time: 'Stop: 30 mins',
        desc: 'Capture scenic golden hour landscape photographs and spot local wildlife in their natural habitat.',
      },
      {
        badge: 'End',
        title: 'Local Village Tea Break & Refreshments',
        time: 'Stop: 25 mins',
        desc: 'Recharge with fresh fruit, warm spiced Ceylon tea, and traditional confectionery.',
      },
    ];
  }
}

interface InsiderTip {
  title: string;
  desc: string;
  categoryTag: string;
  iconType: 'camera' | 'footprints' | 'coffee' | 'compass' | 'eye' | 'clock';
}

function getThingsToDo(place: Place): InsiderTip[] {
  const cat = (place.category || '').toLowerCase();
  const name = (place.name || '').toLowerCase();

  if (name.includes('nine arch') || (name.includes('ella') && cat.includes('mountain'))) {
    return [
      {
        iconType: 'camera',
        categoryTag: 'Photo Vantage Point',
        title: 'Catch the 9:30 AM Blue Train Crossing',
        desc: 'Position yourself along the upper hillside tea terrace around 9:30 AM or 11:45 AM. The morning light casts a golden glow across the valley when the blue express rumbles across the viaduct.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Scenic Walking Route',
        title: 'Take the Shaded Forest Ridge Footpath',
        desc: 'Skip the bumpy gravel tuk-tuk road and take the gentle 20-minute walking path through eucalyptus woods and hillside tea estates starting from Ella town.',
      },
      {
        iconType: 'coffee',
        categoryTag: 'Local Rest Stop',
        title: 'Fresh King Coconut at Cliffside Kiosks',
        desc: 'Pause at family-run hillside wooden stalls along the trail for freshly tapped thambili (king coconut) and warm Ceylon ginger tea served with jaggery.',
      },
      {
        iconType: 'eye',
        categoryTag: 'Historic Exploration',
        title: 'Walk the Rails Through the Stone Tunnel',
        desc: 'Between train schedules, walk along the historic rail sleepers and admire the 1921 British Ceylon stone masonry tunnel built entirely without steel reinforcement.',
      },
    ];
  } else if (cat.includes('ancient') || cat.includes('historic')) {
    return [
      {
        iconType: 'clock',
        categoryTag: 'Timing & Crowds',
        title: 'Beat the Midday Sun & Tour Groups',
        desc: 'Arrive at the ticket checkpoint right as gates open at 7:00 AM. You will climb in shaded morning breeze and capture pristine, crowd-free photographs.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Trail & Footwear',
        title: 'Wear Sturdy Shoes for Granite Steps',
        desc: 'Centuries-old stone staircases and carved rock channels can be polished smooth. Lightweight footwear with reliable traction is strongly advised.',
      },
      {
        iconType: 'compass',
        categoryTag: 'Archaeological Detail',
        title: 'Examine the Ancient Hydraulic Engineering',
        desc: 'Pause at the symmetrical royal water gardens and boulder foundations—some of the ancient world’s earliest gravity-fed fountain systems still working after rains.',
      },
      {
        iconType: 'camera',
        categoryTag: 'Sunset Viewpoint',
        title: 'Golden Hour Panorama Across the Plains',
        desc: 'The highest stone terrace offers uninterrupted 360-degree vistas extending across ancient reservoirs, emerald paddy fields, and distant jungle ranges.',
      },
    ];
  } else if (cat.includes('mountain') || cat.includes('gem')) {
    return [
      {
        iconType: 'compass',
        categoryTag: 'Dawn Trek',
        title: 'Early Morning Ridge & Summit Ascent',
        desc: 'Begin your ascent before sunrise to hike above the cloud inversion layer and watch the morning sun break across the undulating central ranges.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Tea Estate Trail',
        title: 'Stroll Through Misty Highland Tea Terraces',
        desc: 'Follow hillside walking paths alongside resident tea pluckers and observe traditional Ceylon two-leaves-and-a-bud picking techniques firsthand.',
      },
      {
        iconType: 'camera',
        categoryTag: 'Valley Vista',
        title: 'Deep Gorge & Valley Photography',
        desc: 'Capture rolling ridges, cascading mountain streams, and dramatic escarpments plunging toward the southern coastal plains.',
      },
      {
        iconType: 'coffee',
        categoryTag: 'Hill Country Cafe',
        title: 'Fresh Highland Brews & Warm Pol Roti',
        desc: 'Warm up after the hike with freshly harvested Ceylon highland coffee, spiced ginger tea, and warm pol roti served with fiery lunu miris.',
      },
    ];
  } else if (cat.includes('beach')) {
    return [
      {
        iconType: 'compass',
        categoryTag: 'Ocean Safari',
        title: 'Early Morning Whale & Dolphin Expedition',
        desc: 'Depart the local harbor by 6:30 AM when ocean swells are quietest for the highest probability of spotting blue whales and pods of spinner dolphins.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Coastal Stroll',
        title: 'Sunset Walk to Palm-Crowned Headlands',
        desc: 'Stroll along the curved golden sand bay to the red-clay promontory crowned with swaying coconut palms just as dusk turns violet.',
      },
      {
        iconType: 'eye',
        categoryTag: 'Reef Snorkeling',
        title: 'Swim Gently with Wild Sea Turtles',
        desc: 'In calm shallow reef pockets near the point, wild green turtles graze peacefully on sea grass in the late afternoon.',
      },
      {
        iconType: 'coffee',
        categoryTag: 'Beachside Catch',
        title: 'Fresh Catch Grilled on the Shore',
        desc: 'Enjoy barefoot dining right on the sand with freshly caught red snapper, jumbo prawns, and fresh tropical passion fruit juices.',
      },
    ];
  } else if (cat.includes('waterfall')) {
    return [
      {
        iconType: 'footprints',
        categoryTag: 'Upper Trail',
        title: 'Trek to Natural Infinity Rock Pools',
        desc: 'Take the upper ridge trail accompanied by a licensed tracker to discover secluded freshwater pools overlooking dramatic mountain drops.',
      },
      {
        iconType: 'camera',
        categoryTag: 'Spray Photography',
        title: 'Morning Rainbows in the Waterfall Mist',
        desc: 'Morning sunlight slicing into the gorge creates vibrant rainbows in the spray. Keep a microfiber cloth handy to protect camera lenses.',
      },
      {
        iconType: 'coffee',
        categoryTag: 'Local Refreshment',
        title: 'Spiced Herbal Brew & Fresh Fruit',
        desc: 'Enjoy roadside refreshments from local village stalls offering freshly sliced pineapple with chili salt and warm herbal tea.',
      },
      {
        iconType: 'eye',
        categoryTag: 'Safety Advice',
        title: 'Mind Slippery Boulders & Water Levels',
        desc: 'Granite stones near waterfall bases are slick with moss. Always check flow conditions and avoid swimming during sudden highland rains.',
      },
    ];
  } else if (cat.includes('wildlife')) {
    return [
      {
        iconType: 'compass',
        categoryTag: 'Safari Timing',
        title: 'First Jeep Departure at Daybreak',
        desc: 'Queue at the park entrance gate before 6:00 AM when leopards and sloth bears are actively hunting before the tropical heat sets in.',
      },
      {
        iconType: 'camera',
        categoryTag: 'Wildlife Optics',
        title: 'Telephoto Lens & Protective Dust Pouch',
        desc: 'Bring at least a 300mm zoom lens. Keep gear in a sealed bag during transit to safeguard delicate optics from dry-zone safari dust.',
      },
      {
        iconType: 'eye',
        categoryTag: 'Herd Observation',
        title: 'Late Afternoon Elephant Gatherings',
        desc: 'Between 3:30 PM and 5:30 PM, family herds with young calves gather along seasonal lakes and reservoir fringes for communal dust baths.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Tracking Tip',
        title: 'Listen for Deer & Monkey Alarm Calls',
        desc: 'Experienced jungle trackers listen for the sharp barking alarm of spotted deer and langurs to locate camouflaged leopards nearby.',
      },
    ];
  } else if (cat.includes('religious')) {
    return [
      {
        iconType: 'footprints',
        categoryTag: 'Dress Code & Customs',
        title: 'Wear Modest White Attire & Remove Shoes',
        desc: 'Cover shoulders and knees out of respect for sacred ground. White clothing is customary, and walking barefoot on cool morning stone is traditional.',
      },
      {
        iconType: 'clock',
        categoryTag: 'Evening Ceremony',
        title: 'Experience the Thevava Drumming Ceremony',
        desc: 'Witness the rhythmic blowing of conch shells and sacred drumming rituals held during morning and evening pooja offerings.',
      },
      {
        iconType: 'compass',
        categoryTag: 'Sacred History',
        title: 'Learn the Centuries-Old Temple Legends',
        desc: 'Engage with resident temple custodians to understand the sacred relics, historic sandakada pahana (moonstones), and royal patrons.',
      },
      {
        iconType: 'camera',
        categoryTag: 'Respectful Photography',
        title: 'Photography Etiquette & Quiet Zones',
        desc: 'Never pose with your back turned directly to a Buddha statue, and always turn off camera flash inside interior painted shrine rooms.',
      },
    ];
  } else {
    return [
      {
        iconType: 'compass',
        categoryTag: 'Off the Beaten Path',
        title: 'Discover Quiet Scenic Viewpoints',
        desc: 'Ask local resident guides for the lesser-known walking trails around the destination for authentic encounters and peaceful photography.',
      },
      {
        iconType: 'camera',
        categoryTag: 'Lighting & Photography',
        title: 'Soft Morning Light & Golden Hour',
        desc: 'Morning mist and warm late afternoon sunlight bring out rich textures and vivid tropical greens across the surrounding landscape.',
      },
      {
        iconType: 'coffee',
        categoryTag: 'Local Hospitality',
        title: 'Authentic Island Spices & Refreshments',
        desc: 'Sample locally harvested spices, tropical fruit varieties, and freshly prepared Sri Lankan tea at family-owned neighborhood stalls.',
      },
      {
        iconType: 'footprints',
        categoryTag: 'Visitor Advice',
        title: 'Mindful Travel & Cultural Respect',
        desc: 'Travel gently, protect native flora and fauna, and engage respectfully with the welcoming local communities who call this area home.',
      },
    ];
  }
}

interface SeasonMonth {
  name: string;
  status: 'peak' | 'good' | 'monsoon';
  label: string;
}

function getClimateAndSeasonality(place: Place) {
  const prov = (place.province || '').toLowerCase();
  const cat = (place.category || '').toLowerCase();
  const name = (place.name || '').toLowerCase();

  let climateType = 'Tropical Warm & Breezy';
  let tempRange = '27°C – 32°C';
  let humidity = '65% – 75% (Moderate)';
  let weatherNote = 'Tropical sunshine, warm sea breezes, and pleasant island evenings.';
  let primeHours = '6:30 AM – 10:00 AM & 4:00 PM – 6:30 PM';
  let recommendedDuration = '2.5 – 4 Hours';

  const isHighland =
    prov.includes('central') ||
    prov.includes('uva') ||
    prov.includes('sabaragamuwa') ||
    cat.includes('mountain') ||
    name.includes('ella') ||
    name.includes('horton') ||
    name.includes('nuwara') ||
    name.includes('adam');

  const isRainforest =
    name.includes('sinharaja') ||
    name.includes('kithulgala');

  if (isRainforest) {
    climateType = 'Tropical Rainforest';
    tempRange = '21°C – 28°C';
    humidity = '80% – 90% (Lush Canopy)';
    weatherNote = 'Vibrant rainforest canopy with misty morning trails and afternoon showers.';
    primeHours = '6:00 AM – 11:00 AM';
    recommendedDuration = '4 – 6 Hours';
  } else if (isHighland) {
    climateType = 'Cool Montane / Hill Country';
    tempRange = '15°C – 24°C';
    humidity = '60% – 75% (Crisp Mountain Air)';
    weatherNote = 'Chilly misty mornings, comfortable warm afternoons, and crystal clear night skies.';
    primeHours = '6:00 AM – 9:30 AM & 3:30 PM – 6:00 PM';
    recommendedDuration = '3 – 5 Hours';
  }

  const months: SeasonMonth[] = [
    { name: 'Jan', status: 'peak', label: 'Crisp & sunny' },
    { name: 'Feb', status: 'peak', label: 'Clear skies' },
    { name: 'Mar', status: 'peak', label: 'Warm & dry' },
    { name: 'Apr', status: 'good', label: 'Pleasant' },
    { name: 'May', status: 'good', label: 'Mild showers' },
    { name: 'Jun', status: 'good', label: 'Great visibility' },
    { name: 'Jul', status: 'good', label: 'Breezy & dry' },
    { name: 'Aug', status: 'peak', label: 'Sunny days' },
    { name: 'Sep', status: 'good', label: 'Fewer crowds' },
    { name: 'Oct', status: 'monsoon', label: 'Afternoon rain' },
    { name: 'Nov', status: 'monsoon', label: 'Misty trails' },
    { name: 'Dec', status: 'peak', label: 'Festive season' },
  ];

  const currentMonthIdx = new Date().getMonth();
  const currentStatus = months[currentMonthIdx];

  return {
    climateType,
    tempRange,
    humidity,
    weatherNote,
    primeHours,
    recommendedDuration,
    months,
    currentStatus,
    currentMonthName: currentStatus.name,
  };
}

function renderTipIcon(type: InsiderTip['iconType']) {
  switch (type) {
    case 'camera':
      return <Camera className="w-4 h-4 text-sky-700" />;
    case 'footprints':
      return <Footprints className="w-4 h-4 text-emerald-700" />;
    case 'coffee':
      return <Coffee className="w-4 h-4 text-amber-700" />;
    case 'compass':
      return <Compass className="w-4 h-4 text-indigo-700" />;
    case 'clock':
      return <Clock className="w-4 h-4 text-rose-700" />;
    case 'eye':
    default:
      return <Eye className="w-4 h-4 text-teal-700" />;
  }
}

function getIconBg(type: InsiderTip['iconType']) {
  switch (type) {
    case 'camera':
      return 'bg-sky-50 border-sky-200/80';
    case 'footprints':
      return 'bg-emerald-50 border-emerald-200/80';
    case 'coffee':
      return 'bg-amber-50 border-amber-200/80';
    case 'compass':
      return 'bg-indigo-50 border-indigo-200/80';
    case 'clock':
      return 'bg-rose-50 border-rose-200/80';
    case 'eye':
    default:
      return 'bg-teal-50 border-teal-200/80';
  }
}

export default async function PlaceDetailPage({ params }: PlacePageProps) {
  const { id } = await params;
  const data = await getPlaceDetails(id);

  if (!data) {
    notFound();
  }

  const { place, reviews, relatedPlaces, nearbyAttractions } = data;
  const galleryImages = getGalleryImages(place);
  const thingsToDo = getThingsToDo(place);
  const seasonality = getClimateAndSeasonality(place);
  const itinerarySteps = getItinerarySteps(place);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 pt-20 sm:pt-24 pb-28">
      
      {/* ━━━ TOP BREADCRUMB & HEADER ━━━ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/?category=${encodeURIComponent(place.category)}#explore`} className="hover:text-slate-900 transition-colors">
              {place.category}
            </Link>
            <span>/</span>
            <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{place.name}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <OfflineGuideButton place={place} variant="pill" />
            <WishlistButton placeId={place.id} placeName={place.name} variant="pill" />
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Back to Explore</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ━━━ DESTINATION TITLE & METADATA BAR (Human-Crafted Boutique Style) ━━━ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-slate-200/80">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Curated Ceylon Highlight
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {place.province}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                {place.category}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {place.name}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-2xl">
              {place.short_description}
            </p>

            <div className="flex items-center gap-4 text-slate-500 text-xs sm:text-sm pt-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                {place.location}, Sri Lanka
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center gap-1 text-slate-900 font-bold">
                <span className="flex gap-0.5 text-emerald-600">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="w-2.5 h-2.5 rounded-full bg-[#00aa6c] inline-block" />
                  ))}
                </span>
                <span>{place.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">
                  ({place.review_count.toLocaleString()} traveler ratings)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 bg-white border border-slate-200/90 rounded-2xl p-2.5 px-4 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">100% Verified Destination</p>
                <p className="text-[11px] text-slate-400">Authentic GPS & Travel Guide</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ 1. 5-CARD MULTI-STAGE CAROUSEL (Image 1) ━━━ */}
      <div className="w-full mb-10 overflow-hidden">
        <DestinationGallery
          images={galleryImages}
          title={place.name}
          category={place.category}
          location={place.location}
        />
      </div>

      {/* ━━━ STICKY SUB-NAV TABS (TripAdvisor Image 3) ━━━ */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-3 text-xs sm:text-sm font-bold text-slate-600">
          <a href="#overview" className="hover:text-slate-900 pb-1 border-b-2 border-transparent hover:border-[#00aa6c] transition-colors whitespace-nowrap">
            Overview
          </a>
          <a href="#highlights" className="hover:text-slate-900 pb-1 border-b-2 border-transparent hover:border-[#00aa6c] transition-colors whitespace-nowrap">
            Insider Tips
          </a>
          <a href="#weather" className="hover:text-slate-900 pb-1 border-b-2 border-transparent hover:border-[#00aa6c] transition-colors whitespace-nowrap">
            Weather Outlook
          </a>
          <a href="#itinerary-map" className="hover:text-slate-900 pb-1 border-b-2 border-transparent hover:border-[#00aa6c] transition-colors whitespace-nowrap">
            Itinerary & Map
          </a>
          <a href="#reviews-section" className="hover:text-slate-900 pb-1 border-b-2 border-transparent hover:border-[#00aa6c] transition-colors whitespace-nowrap">
            Reviews ({reviews.length})
          </a>
        </div>
      </div>

      {/* ━━━ MAIN WORKSPACE (8 COLS CONTENT + 4 COLS BUY-BOX) ━━━ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* ━━━━ LEFT COLUMN (8 COLS): TRIPADVISOR / HUMAN STYLE ━━━━ */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* ━━━ SECTION 1: ABOUT & SPEC PILLS (TripAdvisor Image 3) ━━━ */}
            <section id="overview" className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  About {place.name}
                </h2>
                <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
                  {place.description}
                </p>
              </div>

              {/* TripAdvisor-Style Experience Specification Pills (Image 3) */}
              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Traveler Type</span>
                    <span className="font-bold text-slate-900">Solo, Couples, Families</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <Clock className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Duration</span>
                    <span className="font-bold text-slate-900">{seasonality.recommendedDuration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Ideal Timing</span>
                    <span className="font-bold text-slate-900">{seasonality.primeHours.split('&')[0]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Mobile Ticket</span>
                    <span className="font-bold text-slate-900">100% Offline Guide</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Languages</span>
                    <span className="font-bold text-slate-900">English, Sinhala, Tamil</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <Ticket className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Access Status</span>
                    <span className="font-bold text-slate-900">{place.entry_fee || 'Free Entry'}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ━━━ SECTION 2: INSIDER GUIDE & RECOMMENDED ACTIVITIES (Humanized, No AI Emojis) ━━━ */}
            <section id="highlights" className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-emerald-200">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Resident Guide Advice</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Top Recommendations & Insider Tips
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    Handpicked practical recommendations from travelers and resident Ceylon guides
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {thingsToDo.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${getIconBg(item.iconType)}`}>
                        {renderTipIcon(item.iconType)}
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-white border border-slate-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                        {item.categoryTag}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-1.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ━━━ SECTION 3: WEATHER CHANNEL "TODAY'S OUTLOOK" (Image 2) ━━━ */}
            <section id="weather" className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-6 scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Today&apos;s Outlook & Daylight Weather
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    Live climate conditions and daylight timeline for {place.name}
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>Season: {seasonality.currentStatus.label}</span>
                </div>
              </div>

              {/* Weather Banner (Image 2 style) */}
              <div className="bg-gradient-to-br from-[#EAF4FD] via-[#F5FAFF] to-[#DCEFFD] border border-[#DCE8F2] text-[#0F2A3D] rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-widest text-[#38A9F0]">Current Forecast</span>
                    <div className="text-4xl sm:text-5xl font-black mt-1 tracking-tight text-[#0F2A3D]">
                      {seasonality.tempRange.split('–')[0].trim()}
                    </div>
                    <p className="text-sm font-semibold text-[#5B7385] mt-1">
                      {seasonality.climateType} • {seasonality.weatherNote}
                    </p>
                  </div>

                  <div className="flex flex-wrap sm:flex-col gap-2 text-xs text-[#5B7385] sm:text-right">
                    <span>Humidity: <strong className="text-[#0F2A3D]">{seasonality.humidity}</strong></span>
                    <span>Best Daylight: <strong className="text-[#38A9F0]">{seasonality.primeHours}</strong></span>
                    <span>Elevation: <strong className="text-[#0F2A3D]">Ceylon Geographic Point</strong></span>
                  </div>
                </div>

                {/* Daylight Timeline Bar (Image 2 style) */}
                <div className="relative z-10 mt-6 pt-5 border-t border-[#DCE8F2] grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="bg-white/80 border border-[#DCE8F2] p-2.5 rounded-xl shadow-2xs">
                    <span className="text-[10px] text-[#5B7385] block font-medium">6:00 AM</span>
                    <span className="text-base my-0.5 block">🌅</span>
                    <span className="font-bold text-[#0F2A3D]">Sunrise</span>
                  </div>
                  <div className="bg-white/80 border border-[#DCE8F2] p-2.5 rounded-xl shadow-2xs">
                    <span className="text-[10px] text-[#5B7385] block font-medium">9:00 AM</span>
                    <span className="text-base my-0.5 block">🌤️</span>
                    <span className="font-bold text-[#0F2A3D]">Sunny</span>
                  </div>
                  <div className="bg-white/80 border border-[#DCE8F2] p-2.5 rounded-xl shadow-2xs">
                    <span className="text-[10px] text-[#5B7385] block font-medium">12:00 PM</span>
                    <span className="text-base my-0.5 block">☀️</span>
                    <span className="font-bold text-[#0F2A3D]">Warm</span>
                  </div>
                  <div className="bg-white/80 border border-[#DCE8F2] p-2.5 rounded-xl shadow-2xs">
                    <span className="text-[10px] text-[#5B7385] block font-medium">3:00 PM</span>
                    <span className="text-base my-0.5 block">🌤️</span>
                    <span className="font-bold text-[#0F2A3D]">Breezy</span>
                  </div>
                  <div className="bg-white/80 border border-[#DCE8F2] p-2.5 rounded-xl shadow-2xs">
                    <span className="text-[10px] text-[#5B7385] block font-medium">6:00 PM</span>
                    <span className="text-base my-0.5 block">🌇</span>
                    <span className="font-bold text-[#0F2A3D]">Golden</span>
                  </div>
                  <div className="bg-white/80 border border-[#DCE8F2] p-2.5 rounded-xl shadow-2xs">
                    <span className="text-[10px] text-[#5B7385] block font-medium">9:00 PM</span>
                    <span className="text-base my-0.5 block">🌙</span>
                    <span className="font-bold text-[#0F2A3D]">Clear</span>
                  </div>
                </div>
              </div>

              {/* Month-by-Month Calendar */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  12-Month Travel Seasonality Matrix
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                  {seasonality.months.map((m, idx) => {
                    const isCurrent = idx === new Date().getMonth();
                    const isPeak = m.status === 'peak';
                    const isGood = m.status === 'good';

                    return (
                      <div
                        key={idx}
                        className={`rounded-xl p-2 text-center flex flex-col items-center justify-between border transition-all ${
                          isCurrent ? 'ring-2 ring-emerald-600 shadow-sm' : ''
                        } ${
                          isPeak
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                            : isGood
                            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                            : 'bg-sky-50/70 border-sky-200 text-sky-950'
                        }`}
                      >
                        <span className="text-[11px] font-bold">{m.name}</span>
                        <span className="text-sm my-0.5">
                          {isPeak ? '☀️' : isGood ? '🌤️' : '🌧️'}
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-tight opacity-80">
                          {isPeak ? 'Peak' : isGood ? 'Good' : 'Wet'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ━━━ SECTION 4: TRIPADVISOR-STYLE STEP-BY-STEP ITINERARY & LIVE MAP (Image 4 Side-by-Side) ━━━ */}
            <section id="itinerary-map" className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-sm space-y-7 scroll-mt-28">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-emerald-200">
                    <Compass className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Curated Route & Coordinates</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Suggested Itinerary & Location Map
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                    Follow the recommended path alongside the live interactive terrain map of {place.name}
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#38A9F0] hover:bg-[#1E93DC] text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-[#38A9F0]/25 active:scale-95 text-xs self-start sm:self-auto shrink-0"
                >
                  <MapPin className="w-4 h-4 text-white" />
                  <span>Google Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                </a>
              </div>

              {/* Side-by-Side: Itinerary on Left, Map on Right (Image 4) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (xl:col-span-6): TripAdvisor-Style Itinerary Timeline */}
                <div className="xl:col-span-6 space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <h4 className="font-extrabold text-[#0F2A3D] text-base sm:text-lg">
                      Step-by-Step Route
                    </h4>
                    <span className="text-[11px] font-bold text-[#38A9F0] bg-[#EAF4FD] px-2.5 py-1 rounded-full border border-[#DCE8F2]">
                      {itinerarySteps.length} Stops
                    </span>
                  </div>

                  {/* Vertical Dashed Line Timeline matching Image 4 */}
                  <div className="relative pl-7 sm:pl-8 border-l-2 border-dashed border-[#DCE8F2] space-y-6 pt-1">
                    {itinerarySteps.map((step, idx) => {
                      const isStart = step.badge.toLowerCase() === 'start';
                      const isEnd = step.badge.toLowerCase() === 'end';

                      return (
                        <div key={idx} className="relative group">
                          {/* Badge matching Image 4 */}
                          {isStart || isEnd ? (
                            <div className="absolute -left-[43px] sm:-left-[47px] top-0 px-2.5 py-0.5 rounded-full bg-[#F5A623] text-white font-black text-[11px] shadow-xs tracking-tight">
                              {step.badge}
                            </div>
                          ) : (
                            <div className="absolute -left-[40px] sm:-left-[44px] top-0.5 w-6 h-6 rounded-full bg-[#38A9F0] text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {step.badge}
                            </div>
                          )}

                          <div className="bg-slate-50/70 group-hover:bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 transition-all shadow-xs space-y-1">
                            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                                {step.title}
                              </h5>
                              <span className="text-[10px] font-semibold text-slate-500">
                                {step.time}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column (xl:col-span-6): Interactive Terrain Map */}
                <div className="xl:col-span-6 xl:sticky xl:top-28 space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Interactive Map
                      </h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {place.lat.toFixed(4)}° N, {place.lng.toFixed(4)}° E
                    </span>
                  </div>

                  <div className="h-[420px] sm:h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-inner relative">
                    <PlaceMap place={place} compact={true} />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>{place.location} · {place.province}</span>
                    <span className="text-emerald-700 font-semibold">Live GPS Point</span>
                  </div>
                </div>

              </div>
            </section>

            {/* ━━━ SECTION 6: TRIPADVISOR REVIEWS BREAKDOWN (Image 5) ━━━ */}
            <section className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-sm scroll-mt-28">
              <ReviewSection placeId={place.id} initialReviews={reviews} />
            </section>
          </div>

          {/* ━━━━ RIGHT COLUMN (4 COLS): TRIPADVISOR BUY-BOX / VISIT PLANNER (Image 3) ━━━━ */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xl shadow-slate-900/5 sticky top-28 space-y-6">
              
              {/* Dynamic Admission Fee & Quick Facts */}
              <PlaceSidebarQuickFacts place={place} />

              {/* Action Buttons (TripAdvisor Green Buy Button Style) */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <OfflineGuideButton place={place} variant="sidebar" />

                <WishlistButton placeId={place.id} placeName={place.name} variant="pill" className="w-full justify-center py-3" />

                <a
                  href={`https://www.google.com/maps?q=${place.lat},${place.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#EAF4FD] hover:bg-[#DCEFFD] text-[#0F2A3D] font-bold py-3 px-6 rounded-2xl text-xs sm:text-sm border border-[#DCE8F2] transition-all active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-[#38A9F0]" />
                  <span>Open in Google Maps</span>
                  <ArrowUpRight className="w-4 h-4 text-[#5B7385]" />
                </a>

                <Link
                  href="/map"
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#F5FAFF] border border-[#DCE8F2] text-[#0F2A3D] font-bold py-2.5 px-6 rounded-2xl text-xs transition-all active:scale-95"
                >
                  <Map className="w-4 h-4 text-[#38A9F0]" />
                  <span>View on Ceylon Live Map</span>
                </Link>
              </div>

              {/* TripAdvisor Style "Have Questions?" Chat Box (Image 3) */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <p className="text-xs font-bold text-slate-900">Have travel questions?</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Connect with local island travelers and community guides for real-time advice.
                </p>
                <div className="pt-1 flex items-center gap-3 text-xs font-bold text-emerald-700">
                  <span className="flex items-center gap-1 hover:underline cursor-pointer">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+94 77 123 4567</span>
                  </span>
                  <span>•</span>
                  <a href="#reviews-section" className="hover:underline flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Ask Community</span>
                  </a>
                </div>
              </div>

              {/* Trust & Safety Guarantees */}
              <div className="pt-2 flex items-center gap-2.5 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified travel details curated by UncoverCeylon community.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ━━━ NEARBY ATTRACTIONS SECTION ━━━ */}
      {nearbyAttractions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-emerald-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Nearby in {place.province}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Nearby Attractions
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Combine your visit with other remarkable destinations nearby
              </p>
            </div>

            <Link
              href={`/?province=${encodeURIComponent(place.province)}#explore`}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 group"
            >
              <span>Explore all in {place.province}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {nearbyAttractions.map((nearby, idx) => (
              <PlaceCard key={nearby.id} place={nearby} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* ━━━ RELATED PLACES (SAME CATEGORY) ━━━ */}
      {relatedPlaces.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-12 sm:mt-20 pt-10 sm:pt-16 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1 rounded-full mb-2 border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>More {place.category}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Similar Destinations
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                More top-rated {place.category.toLowerCase()} across Sri Lanka
              </p>
            </div>

            <Link
              href={`/?category=${encodeURIComponent(place.category)}#explore`}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 group"
            >
              <span>View all {place.category}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6">
            {relatedPlaces.map((related, idx) => (
              <PlaceCard key={related.id} place={related} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* ━━━ MOBILE FLOATING ACTION BAR ━━━ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#DCE8F2] px-4 py-3 shadow-[0_-8px_30px_rgba(15,42,61,0.08)]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#5B7385] uppercase tracking-wider block">
              Admission
            </span>
            <span className="text-base font-black text-[#0F2A3D] truncate block">
              {place.entry_fee || 'Free'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <WishlistButton placeId={place.id} placeName={place.name} variant="pill" />
            <OfflineGuideButton place={place} variant="pill" />
          </div>
        </div>
      </div>
    </div>
  );
}
