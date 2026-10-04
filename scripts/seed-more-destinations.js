// scripts/seed-more-destinations.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'uncoverceylon.db');
const db = new Database(dbPath);

const moreDestinations = [
  // North Western
  {
    name: 'Wilpattu National Park (Willu Wilderness)',
    short_description: 'Sri Lanka’s largest and oldest national park renowned for natural sand-rimmed water basins and leopards.',
    description: 'Encompassing over 1,300 square kilometers, Wilpattu is famous for its unique topographical feature: "Willus"—over 60 natural sand-rimmed rainwater lakes scattered throughout dense dry-zone forest. Wilpattu is a world-class wilderness for spotting the Sri Lankan leopard (Panthera pardus kotiya), sloth bears, Asian elephants, and barking deer without the safari jeep traffic of southern parks.',
    location: 'Nochchiyagama / Puttalam border',
    province: 'North Western Province',
    category: 'Wildlife',
    lat: 8.4333,
    lng: 80.0167,
    image_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&q=85',
      'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1200&q=85'
    ]),
    tips: 'Full-day safari jeep tours are recommended to reach deep willus where leopards and bears drink at dawn and dusk.',
    best_time: 'February to October (Dry season)',
    entry_fee: 'USD 25 (Foreign Adults) + Jeep Hire',
    distance_km: 180,
    rating: 4.9,
    review_count: 215,
    featured: 1
  },
  {
    name: 'Panduwasnuwara Ancient Kingdom',
    short_description: 'Ancient 12th-century royal capital housing a miniature circular palace moat and King Parakramabahu’s fortress.',
    description: 'Panduwasnuwara served briefly as the capital of Sri Lanka during the 12th century under King Parakramabahu I before he unified the island. The 20-hectare site contains well-preserved brick defensive ramparts, moats, a royal palace with intricate bath systems, and the legendary circular foundation believed to be "Ektamge"—the high round tower of Princess Unmada Chitra.',
    location: 'Hettipola, Kurunegala District',
    province: 'North Western Province',
    category: 'Historical',
    lat: 7.7333,
    lng: 80.1833,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85'
    ]),
    tips: 'Visit the small archaeological museum on site to see stone inscriptions and ancient gaming boards.',
    best_time: 'Morning or late afternoon',
    entry_fee: 'LKR 500',
    distance_km: 110,
    rating: 4.5,
    review_count: 42,
    featured: 0
  },

  // Eastern
  {
    name: 'Kumana National Park (Bird Sanctuary)',
    short_description: 'World-renowned mangrove wetland sanctuary hosting hundreds of thousands of migratory waterfowl.',
    description: 'Adjoining Yala to the east, Kumana National Park is celebrated worldwide as one of the most significant bird breeding grounds in South Asia. Its central 200-hectare mangrove swamp, "Kumana Villu", attracts rare migratory birds from Siberia and the Arctic between May and August, including black-necked storks, spoonbills, and glossy ibises.',
    location: 'Okanda, Ampara District',
    province: 'Eastern Province',
    category: 'Wildlife',
    lat: 6.5167,
    lng: 81.7000,
    image_url: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1200&q=85'
    ]),
    tips: 'Bring high-magnification telephoto lenses and binoculars for the elevated bird watchtowers.',
    best_time: 'May to August (Peak breeding season)',
    entry_fee: 'USD 20 (Foreign Adults) + Jeep Hire',
    distance_km: 350,
    rating: 4.8,
    review_count: 98,
    featured: 0
  },
  {
    name: 'Batticaloa Dutch Fort & Kallady Lagoon',
    short_description: 'Square 17th-century colonial fortress on a tranquil island lagoon famous for its musical singing fish.',
    description: 'Constructed by the Portuguese in 1628 and seized by the Dutch in 1638, Batticaloa Fort is an intimate square bastion fortified by thick coral walls and surrounded on two sides by the tranquil waters of the lagoon. The adjacent Kallady Bridge is legendary for the mysterious acoustic phenomenon of "singing fish" heard on moonlit nights between April and September.',
    location: 'Puliyanthivu, Batticaloa',
    province: 'Eastern Province',
    category: 'Historical',
    lat: 7.7167,
    lng: 81.7000,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85'
    ]),
    tips: 'Take a sunset lagoon boat ride near the Lady Manning bridge to experience local lagoon life and fishing traps.',
    best_time: 'Late afternoon (4:00 PM - 6:30 PM)',
    entry_fee: 'Free',
    distance_km: 305,
    rating: 4.6,
    review_count: 76,
    featured: 0
  },
  {
    name: 'Marble Beach, Trincomalee',
    short_description: 'Pristine naval bay boasting crystal glass waters smooth as polished marble, ideal for ocean bathing.',
    description: 'Tucked inside the protected deep waters of China Bay in Trincomalee, Marble Beach earns its name from its calm, glass-like surface that sparkles like polished marble in tropical sunlight. Surrounded by verdant forested hills with peacocks wandering the coastline, it is widely considered one of Sri Lanka’s most tranquil swimming bays.',
    location: 'China Bay, Trincomalee',
    province: 'Eastern Province',
    category: 'Beaches',
    lat: 8.5167,
    lng: 81.2000,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85'
    ]),
    tips: 'Maintained by the Sri Lanka Air Force, it has clean shower facilities and a pleasant beachside restaurant.',
    best_time: 'March to October',
    entry_fee: 'LKR 200',
    distance_km: 255,
    rating: 4.8,
    review_count: 142,
    featured: 1
  },

  // Northern
  {
    name: 'Nainativu Island & Nagadeepa Viharaya',
    short_description: 'Sacred twin-shrine island featuring the historic Nagadeepa Buddhist Stupa and Sri Nagapooshani Amman Kovil.',
    description: 'Nainativu is an island of profound spiritual harmony in the Palk Bay. According to the Mahavamsa, Gautama Buddha visited Nagadeepa during his second journey to Sri Lanka to settle a dispute between two Naga kings over a gem-set throne. Just a short walk across the village stands the vibrant Dravidian Sri Nagapooshani Amman Kovil with a grand multi-tiered gopuram.',
    location: 'Nainativu Island, Jaffna District',
    province: 'Northern Province',
    category: 'Religious Places',
    lat: 9.6167,
    lng: 79.7667,
    image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85'
    ]),
    tips: 'Reach via a 20-minute wooden passenger ferry ride from Kurikadduwan jetty. Very safe and scenic.',
    best_time: 'Morning (ferries run 7:00 AM - 4:00 PM)',
    entry_fee: 'Free (Ferry ~ LKR 100)',
    distance_km: 425,
    rating: 4.8,
    review_count: 118,
    featured: 0
  },
  {
    name: 'Point Pedro & Manalkadu Sand Dunes',
    short_description: 'The northernmost tip of Sri Lanka with a colonial lighthouse and desert-like coastal sand dunes.',
    description: 'Point Pedro marks the northernmost tip of the island, where an iconic 32-meter white lighthouse stands sentinel over the Bay of Bengal. South along the coast lies Manalkadu, an astonishing desert-like landscape of undulating white sand dunes and buried church ruins from a 16th-century tsunami.',
    location: 'Point Pedro, Jaffna Peninsula',
    province: 'Northern Province',
    category: 'Hidden Gems',
    lat: 9.8333,
    lng: 80.2333,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85'
    ]),
    tips: 'Sunset over the northern coast is spectacular. Try traditional Jaffna ice cream at Rio Ice Cream on the way back.',
    best_time: 'Late afternoon (4:30 PM - 6:30 PM)',
    entry_fee: 'Free',
    distance_km: 435,
    rating: 4.6,
    review_count: 85,
    featured: 0
  },

  // Western
  {
    name: 'Negombo Lagoon & Old Dutch Canal',
    short_description: 'Bustling artisanal coastal haven with traditional outrigger karuvala catamarans and fresh lobster stalls.',
    description: 'Known affectionately as "Little Rome" for its grand Portuguese Catholic churches, Negombo is centered around its vast 3,160-hectare saltwater lagoon. In the morning mist, hundreds of traditional outrigger sailing canoes (oruvas) return loaded with blue lagoon crabs and jumbo prawns. The historic Hamilton and Dutch canals weave inland through quaint colonial fishing hamlets.',
    location: 'Negombo, Gampaha District',
    province: 'Western Province',
    category: 'Hidden Gems',
    lat: 7.2008,
    lng: 79.8358,
    image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=85'
    ]),
    tips: 'Visit the Lellama (fish auction market) at 6:00 AM for an authentic glimpse of local coastal life.',
    best_time: 'November to April (Early morning)',
    entry_fee: 'Free',
    distance_km: 38,
    rating: 4.6,
    review_count: 160,
    featured: 0
  },
  {
    name: 'Seethawaka Wet Zone Botanical Garden',
    short_description: 'Picturesque mountain valley garden created to conserve endangered wet-zone flora, with pedal boats on calm lakes.',
    description: 'Opened in 2014 in the historic Kingdom of Sitawaka near Avissawella, this 43-hectare botanical garden is tucked into a lush valley of rubber plantations. It is dedicated to conserving threatened endemic plants of the lowland wet zone, featuring Japanese tea gardens, rolling flower lawns, and tranquil pedal boats on central mountain-fed ponds.',
    location: 'Illukowita, Avissawella',
    province: 'Western Province',
    category: 'Hidden Gems',
    lat: 6.9472,
    lng: 80.2528,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Electric carts are available for hire. Great day trip from Colombo with fresh mountain air.',
    best_time: 'Morning or late afternoon (8:00 AM - 5:00 PM)',
    entry_fee: 'LKR 1500 (Foreign Adults)',
    distance_km: 55,
    rating: 4.7,
    review_count: 94,
    featured: 0
  },

  // Sabaragamuwa
  {
    name: 'Kirindi Ella Falls, Pelmadulla',
    short_description: 'Majestic 116-meter cascade descending in a silvery column into a deep pool shrouded by virgin rainforest.',
    description: 'Cascading 116 meters through dense tropical evergreen forest, Kirindi Ella is the 7th highest waterfall in Sri Lanka. The Kirindi Oya leaps over a sheer precipice into a deep amphitheater pool that local folklore claims conceals a submerged treasure cave guarded by spirits.',
    location: 'Pelmadulla, Ratnapura District',
    province: 'Sabaragamuwa Province',
    category: 'Waterfalls',
    lat: 6.6333,
    lng: 80.5333,
    image_url: 'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85'
    ]),
    tips: 'A peaceful alternative to crowded waterfalls. The downhill steps to the base take about 15 minutes.',
    best_time: 'October to February',
    entry_fee: 'Free',
    distance_km: 115,
    rating: 4.6,
    review_count: 65,
    featured: 0
  },
  {
    name: 'Belilena Prehistoric Cave, Kitulgala',
    short_description: 'Archaeological cave sanctuary revealing remains of the 16,000-year-old prehistoric Balangoda Man.',
    description: 'Belilena is a colossal rock shelter hidden in the rainforest above Kitulgala. Excavations by archaeological teams unearthed skeletal remains of the prehistoric "Balangoda Man" (Homo sapiens balangodensis) dating back 16,000 to 30,000 years, alongside geometric microlithic stone tools, bone points, and remains of game animals and salt crystals.',
    location: 'Kitulgala, Kegalle District',
    province: 'Sabaragamuwa Province',
    category: 'Ancient Sites',
    lat: 6.9917,
    lng: 80.4333,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'The trail through rubber and tea plantations takes about 30 minutes of uphill walking.',
    best_time: 'Dry season (January to April)',
    entry_fee: 'Free',
    distance_km: 92,
    rating: 4.6,
    review_count: 52,
    featured: 0
  },

  // Central
  {
    name: 'Knuckles Five Peaks (Dumbara Range)',
    short_description: 'UNESCO World Heritage mountain fold with five knuckle-like peaks, cloud forests, and highland streams.',
    description: 'Known historically as Dumbara Kanduvetiya (Mist-laden mountains) and named Knuckles by British cartographers for its resemblance to a clenched fist, this 18,500-hectare mountain wilderness rises to 1,900 meters. It harbors miniature cloud forests, pygmy trees, rare pygmy lizards found nowhere else on earth, and isolated traditional villages like Meemure.',
    location: 'Matale / Kandy Districts',
    province: 'Central Province',
    category: 'Mountains',
    lat: 7.4500,
    lng: 80.8000,
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Hiring an official wildlife department guide is mandatory. Pack waterproof gear as weather can turn swiftly.',
    best_time: 'June to August & December to February',
    entry_fee: 'USD 15 (Foreign Adults)',
    distance_km: 155,
    rating: 4.9,
    review_count: 195,
    featured: 1
  }
];

const checkExisting = db.prepare('SELECT id FROM places WHERE name = ?');
const insertPlace = db.prepare(`
  INSERT INTO places (
    name, description, short_description, location, province, category,
    lat, lng, image_url, gallery, tips, best_time, entry_fee,
    distance_km, rating, review_count, featured
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let inserted = 0;
let skipped = 0;

const insertTx = db.transaction((places) => {
  for (const p of places) {
    const exists = checkExisting.get(p.name);
    if (!exists) {
      insertPlace.run(
        p.name,
        p.description,
        p.short_description,
        p.location,
        p.province,
        p.category,
        p.lat,
        p.lng,
        p.image_url,
        p.gallery,
        p.tips,
        p.best_time,
        p.entry_fee,
        p.distance_km,
        p.rating,
        p.review_count,
        p.featured
      );
      inserted++;
    } else {
      skipped++;
    }
  }
});

insertTx(moreDestinations);

console.log(`Seeding complete: ${inserted} new places inserted, ${skipped} already existed.`);
const total = db.prepare('SELECT COUNT(*) as c FROM places').get().c;
console.log('Total places in database now:', total);

const provinceSummary = db.prepare('SELECT province, count(*) as count FROM places GROUP BY province ORDER BY count DESC').all();
console.log('Places per province:');
console.table(provinceSummary);
