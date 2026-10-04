/**
 * src/lib/about/constants.ts
 * Client-safe TypeScript interfaces and default configurations for About page blocks.
 * Safe for import in both Client and Server Components.
 */

export interface AboutHeroConfig {
  pill_text: string;
  title: string;
  highlighted_text: string;
  subtitle: string;
  lead_text: string;
  image_url: string;
  stats: Array<{ label: string; value: string; color: string }>;
}

export interface AboutStoryConfig {
  badge: string;
  heading: string;
  lead_paragraphs: string[];
  founder_quote: string;
  quote_author: string;
  quote_title: string;
  established_year: string;
  tenets: string[];
  // Founder's Village Story placeholder (T12.2)
  village_story_badge: string;
  village_story_title: string;
  village_story_content: string[];
  village_story_note: string;
}

export interface AboutPhotoItem {
  id: string;
  title: string;
  location: string;
  image_url: string;
  tag?: string;
}

export interface AboutPhotosConfig {
  badge: string;
  heading: string;
  description: string;
  photos: AboutPhotoItem[];
}

export interface AboutValueItem {
  icon: string;
  title: string;
  description: string;
}

export interface AboutValuesConfig {
  badge: string;
  heading: string;
  description: string;
  values: AboutValueItem[];
}

export interface AboutTeamMember {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  initials: string;
  avatar_color: string;
}

export interface AboutTeamConfig {
  badge: string;
  heading: string;
  description: string;
  members: AboutTeamMember[];
  parent_company: {
    name: string;
    badge: string;
    heading: string;
    tagline: string;
    description: string;
    pillars: string[];
  };
}

export interface AboutContactConfig {
  badge: string;
  heading: string;
  description: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  inquiry_email: string;
  inquiry_phone: string;
  location_text: string;
}

export interface AboutPageData {
  hero: AboutHeroConfig;
  story: AboutStoryConfig;
  photos: AboutPhotosConfig;
  values: AboutValuesConfig;
  team: AboutTeamConfig;
  contact: AboutContactConfig;
}

export const DEFAULT_ABOUT_HERO: AboutHeroConfig = {
  pill_text: 'Serandib Co. Initiative · Proudly Sri Lankan',
  title: 'About',
  highlighted_text: 'UncoverCeylon',
  subtitle: 'Discovering the true beauty of Sri Lanka, one destination at a time.',
  lead_text:
    'A free, open-access travel ecosystem crafted to empower independent travelers with authentic routes, live maps, and untold island wonders.',
  image_url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1920&q=90',
  stats: [
    { label: 'Free Forever', value: '100%', color: 'text-amber-400' },
    { label: 'Provinces Covered', value: '9 / 9', color: 'text-white' },
    { label: 'Curated Spots', value: '50+', color: 'text-sky-400' },
    { label: 'Local Island Data', value: '100%', color: 'text-white' },
  ],
};

export const DEFAULT_ABOUT_STORY: AboutStoryConfig = {
  badge: 'Our Origin Story',
  heading: 'Born from a Passion for the Island We Call Home',
  lead_paragraphs: [
    'UncoverCeylon was founded by young Sri Lankan innovators who share a deep, lifelong passion for travel, technology, and showcasing the boundless wonder of Sri Lanka to the world.',
    'Having spent years trekking along misty mountain ridges in the Central Highlands, wandering through millennia-old royal ruins in the Cultural Triangle, and uncovering quiet, virgin surf bays along the Southern coastline, we noticed a recurring challenge: travelers had to rely on fragmented blogs, outdated guidebooks, or pricey commercial packages that often bypassed the island’s authentic soul.',
    'Determined to bridge this gap, we envisioned a single, unified, modern platform where accurate travel guidance, interactive satellite maps, and off-the-beaten-path destinations are completely open and free for all explorers.',
  ],
  founder_quote: 'Sri Lanka shouldn’t just be visited — it should be felt, experienced, and uncovered on your own terms.',
  quote_author: 'Ravindu Wijethunga & Gayan Rathnaweera',
  quote_title: 'Founders, UncoverCeylon · Serandib Co.',
  established_year: 'Est. 2026',
  tenets: ['No commercial paywalls', 'Verified island GPS locations', 'Promoting local communities'],
  village_story_badge: "FOUNDER'S VILLAGE NARRATIVE · CONTENT PLACEHOLDER",
  village_story_title: 'Rooted in the Soil of Our Ancestral Village',
  village_story_content: [
    "Before the code, the interactive satellite maps, and the digital directories, UncoverCeylon was born from the quiet red-earth paths of our founder's ancestral village in Sri Lanka. Surrounded by ancient emerald paddy fields, freshwater wewas (village irrigation reservoirs), and the timeless rhythm of rural village life, the inspiration took root to preserve and share the unadorned soul of our motherland.",
    "In the village, hospitality isn't an industry—it is a sacred instinct. Every traveler who passes through is greeted with a genuine smile, a clay cup of warm Ceylon tea, and directions spoken from the heart. That same authentic spirit of generous, open-hearted guidance is the founding cornerstone of this platform.",
    'We believe that true island exploration does not happen through air-conditioned tour bubbles, but through genuine connections with local communities, respecting sacred traditions, and walking the lesser-known footpaths of this paradise.',
  ],
  village_story_note:
    'Note for Site Owner: This narrative is reserved for your personal village story and memories. You can customize or replace this text anytime from Admin → About Editor.',
};

export const DEFAULT_ABOUT_PHOTOS: AboutPhotosConfig = {
  badge: 'Visual Journey',
  heading: 'Capturing Ceylon: From Village Sanctuaries to Mountain Peaks',
  description: 'Authentic frames highlighting the raw majesty and serene village life across Sri Lanka.',
  photos: [
    {
      id: 'photo-1',
      title: 'Misty Highland Tea Trails',
      location: 'Ella & Nuwara Eliya',
      image_url: 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=1000&q=80',
      tag: 'Central Highlands',
    },
    {
      id: 'photo-2',
      title: 'Quiet Village Reservoir at Dawn',
      location: 'Anuradhapura Rural Basin',
      image_url: 'https://images.unsplash.com/photo-1588598198321-9735fd52455d?w=1000&q=80',
      tag: 'Cultural Heritage',
    },
    {
      id: 'photo-3',
      title: 'Untouched Southern Coastlines',
      location: 'Mirissa & Hiriketiya',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&q=80',
      tag: 'Coastal Sanctuaries',
    },
    {
      id: 'photo-4',
      title: 'Historic Sigiriya Citadel',
      location: 'Matale District',
      image_url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?w=1000&q=80',
      tag: 'Ancient Wonder',
    },
  ],
};

export const DEFAULT_ABOUT_VALUES: AboutValuesConfig = {
  badge: 'Core Values & Purpose',
  heading: 'Values That Guide Every Recommendation',
  description: 'The fundamental principles behind every guide, map coordinate, and line of code we craft.',
  values: [
    {
      icon: 'Globe',
      title: 'Authenticity',
      description: 'Showing the real Sri Lanka with honest perspectives, unedited local beauty, and genuine cultural appreciation.',
    },
    {
      icon: 'Zap',
      title: 'Accessibility',
      description: 'Making essential travel information freely available to everyone without financial or technical barriers.',
    },
    {
      icon: 'Cpu',
      title: 'Innovation',
      description: 'Using modern technology, interactive GIS mapping, and high-performance design to enrich travel experiences.',
    },
    {
      icon: 'Heart',
      title: 'Community First',
      description: 'Supporting local tourism, village eco-initiatives, and the communities who protect our island sanctuaries.',
    },
  ],
};

export const DEFAULT_ABOUT_TEAM: AboutTeamConfig = {
  badge: 'Leadership & Team',
  heading: 'Meet the Team Behind UncoverCeylon',
  description: 'The passionate Sri Lankan innovators, engineers, and digital storytellers shaping the next generation of open-access island exploration.',
  members: [
    {
      name: 'Ravindu Wijethunga',
      role: 'Founder & Lead Developer',
      tagline: 'Product Architecture · Engineering',
      bio: 'Passionate about software architecture and tourism innovation. Ravindu guides the product strategy, system engineering, interactive map engines, and core vision of UncoverCeylon under Serandib Co.',
      initials: 'RW',
      avatar_color: 'from-[#0F2A3D] to-[#38A9F0]',
    },
    {
      name: 'Gayan Rathnaweera',
      role: 'Co-Founder & Social Media',
      tagline: 'Community Growth · Brand Strategy',
      bio: "Driving brand presence and digital outreach across global travel communities. Gayan spearheads social media engagement, traveler storytelling, and creative partnerships to share Sri Lanka's wonders.",
      initials: 'GR',
      avatar_color: 'from-sky-600 to-sky-400',
    },
    {
      name: 'Sasindu Udantha',
      role: 'Developer',
      tagline: 'Frontend Systems · Performance',
      bio: 'Dedicated software developer focused on crafting responsive, intuitive, and modern user interfaces. Sasindu develops high-performance frontend components and interactive features.',
      initials: 'SU',
      avatar_color: 'from-indigo-600 to-indigo-400',
    },
    {
      name: 'Venura Rashmika',
      role: 'Social Media Manager',
      tagline: 'Content Creation · Visual Media',
      bio: 'Creative content specialist crafting compelling visual reels, island photography highlights, and real-time destination updates across the Serandib digital travel network.',
      initials: 'VR',
      avatar_color: 'from-emerald-600 to-teal-500',
    },
  ],
  parent_company: {
    name: 'SERANDIB CO.',
    badge: 'Parent Initiative',
    heading: 'Serandib Co.',
    tagline: 'A Sri Lankan digital initiative dedicated to creating innovative platforms that promote local culture, tourism, and technology.',
    description:
      'Rooted in the royal legacy of our island — famous across historical seafaring lore for serenity and wonder — Serandib Co. champions high-impact digital ventures that showcase Sri Lanka’s unparalleled heritage, craftsmanship, and ecological treasures to global audiences.',
    pillars: ['Technology & Culture', 'Open Tourism Infrastructure', 'Colombo, Sri Lanka'],
  },
};

export const DEFAULT_ABOUT_CONTACT: AboutContactConfig = {
  badge: 'Embark on Your Journey',
  heading: 'Start Exploring Sri Lanka Today',
  description:
    'Discover breathtaking destinations, hidden gems, and unforgettable experiences with UncoverCeylon.',
  primary_button_text: 'Explore Destinations',
  primary_button_link: '/destinations',
  secondary_button_text: 'Interactive Map',
  secondary_button_link: '/map',
  inquiry_email: 'hello@uncoverceylon.com',
  inquiry_phone: '+94 11 234 5678',
  location_text: 'Colombo & Central Highlands, Sri Lanka',
};

export const DEFAULT_ABOUT_DATA: AboutPageData = {
  hero: DEFAULT_ABOUT_HERO,
  story: DEFAULT_ABOUT_STORY,
  photos: DEFAULT_ABOUT_PHOTOS,
  values: DEFAULT_ABOUT_VALUES,
  team: DEFAULT_ABOUT_TEAM,
  contact: DEFAULT_ABOUT_CONTACT,
};
