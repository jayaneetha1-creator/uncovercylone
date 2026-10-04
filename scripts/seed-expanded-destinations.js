// scripts/seed-expanded-destinations.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'uncoverceylon.db');
const db = new Database(dbPath);

console.log('Connected to database at:', dbPath);

// List of high-quality authentic places across all 9 provinces
const destinations = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. WESTERN PROVINCE (Colombo, Gampaha, Kalutara)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Colombo National Museum',
    short_description: 'Sri Lanka’s premier cultural storehouse established in 1877, housing royal regalia and ancient art.',
    description: 'The National Museum of Colombo, housed in an Italianate white mansion dating back to 1877, is the grandest cultural treasure house in Sri Lanka. It displays the gilded throne and crown of King Sri Vikrama Rajasinha of Kandy, 9th-century bronze Buddha statues, ancient palm-leaf manuscripts, and Dutch colonial artifacts. Surrounded by giant banyan trees in Cinnamon Gardens, it provides an unparalleled journey through island history.',
    location: 'Cinnamon Gardens, Colombo 07',
    province: 'Western Province',
    category: 'Historical',
    lat: 6.9069,
    lng: 79.8606,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85'
    ]),
    tips: 'Visit in the early morning for quiet galleries. Photography permits are available at the entrance counter.',
    best_time: 'Year-round (9:00 AM - 5:00 PM)',
    entry_fee: 'LKR 1200 (Foreign Adults)',
    distance_km: 3,
    rating: 4.6,
    review_count: 84,
    featured: 0
  },
  {
    name: 'Gangaramaya Temple & Seema Malaka',
    short_description: 'Eclectic Buddhist sanctuary on Beira Lake designed in part by iconic architect Geoffrey Bawa.',
    description: 'Gangaramaya is one of Colombo’s most revered Buddhist temples, blending Sri Lankan, Thai, Indian, and Chinese architectural styles. The temple grounds house a pagoda, bodhi tree, library, museum of antiquities, and a vast collection of jeweled artifacts. Its serene water pavilion, Seema Malaka, floats elegantly on Beira Lake and was masterminded by celebrated architect Geoffrey Bawa.',
    location: 'Slave Island, Colombo 02',
    province: 'Western Province',
    category: 'Religious Places',
    lat: 6.9168,
    lng: 79.8567,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85'
    ]),
    tips: 'Remove footwear before stepping onto temple platforms. Modest attire covering shoulders and knees is strictly observed.',
    best_time: 'Sunset (5:30 PM - 7:00 PM)',
    entry_fee: 'LKR 400 (Foreign Visitors)',
    distance_km: 2,
    rating: 4.7,
    review_count: 140,
    featured: 1
  },
  {
    name: 'Galle Face Green & Port City Beach',
    short_description: 'Colonial oceanside promenade bustling with sunset strollers, kite flyers, and street food stalls.',
    description: 'Stretching for half a kilometer along the Indian Ocean, Galle Face Green has been the heart of Colombo outdoor social life since the 1850s. At dusk, ocean breezes sweep over the lawns as families fly colorful kites and food lovers line up for crispy Isso Vade (prawn fritters) and spiced kottu. The adjacent new Port City Beach offers turquoise lagoon waters and palm-lined leisure walkways.',
    location: 'Fort / Kollupitiya, Colombo',
    province: 'Western Province',
    category: 'Beaches',
    lat: 6.9248,
    lng: 79.8437,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=85'
    ]),
    tips: 'Arrive around 5:00 PM for the golden hour sunset. Try freshly fried isso wade from coastal food carts.',
    best_time: 'Late afternoon & evening',
    entry_fee: 'Free',
    distance_km: 1,
    rating: 4.5,
    review_count: 195,
    featured: 0
  },
  {
    name: 'Beddagana Wetland Park',
    short_description: 'Protected urban wetlands teeming with migratory waterbirds, dragonflies, and elevated wooden boardwalks.',
    description: 'Nestled on the fringes of Diyawanna Lake near the Parliament, Beddagana Wetland Park is an 18-hectare ecological sanctuary. Raised wooden canopies wander through mangrove forests, reed beds, and butterfly gardens. Over 50 species of wetland birds, including the purple swamphen, painted storks, and nocturnal fishing cats, make this a tranquil haven for birdwatchers and nature photographers.',
    location: 'Sri Jayawardenepura Kotte',
    province: 'Western Province',
    category: 'Wildlife',
    lat: 6.8924,
    lng: 79.9142,
    image_url: 'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1200&q=85'
    ]),
    tips: 'Best visited at 6:30 AM or 4:30 PM for bird sightings. Bring binoculars and insect repellent.',
    best_time: 'Early morning (6:30 AM - 9:00 AM)',
    entry_fee: 'LKR 300 (Foreign Adults)',
    distance_km: 9,
    rating: 4.8,
    review_count: 62,
    featured: 0
  },
  {
    name: 'Richmond Castle & Kalutara Bodhiya',
    short_description: 'An Edwardian castle with intricate Italian glasswork paired with a holy hollow river stupa.',
    description: 'Built between 1900 and 1910 by wealthy philanthropist Padikara Mudaliyan Nanayakkara Rajawasala, Richmond Castle is a lavish two-storey Edwardian-palatial mansion built with teak from Burma, stained glass from Scotland, and marble from Italy. Nearby sits the Kalutara Bodhiya, featuring the world’s only hollow Buddhist stupa overlooking the scenic Kalu Ganga estuary.',
    location: 'Kalutara South',
    province: 'Western Province',
    category: 'Hidden Gems',
    lat: 6.5833,
    lng: 79.9667,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'A guide at the castle entrance gives great historical commentary. Combine with the Kalutara basket-weaving village.',
    best_time: 'Morning or late afternoon',
    entry_fee: 'LKR 500',
    distance_km: 43,
    rating: 4.6,
    review_count: 48,
    featured: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. CENTRAL PROVINCE (Kandy, Matale, Nuwara Eliya)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Temple of the Sacred Tooth Relic (Dalada Maligawa)',
    short_description: 'The holiest Buddhist sanctuary in Sri Lanka housing the left canine tooth relic of Gautama Buddha.',
    description: 'Enshrined inside the royal palace complex of the former Kingdom of Kandy, Sri Dalada Maligawa is venerated by millions of Buddhists worldwide. The golden-roofed inner sanctum holds the sacred tooth relic within seven nested golden stupa caskets. Daily Thevava rituals with rhythmic drums, blowing of conch shells, and offerings of fragrant frangipani blossoms create an unforgettable spiritual atmosphere.',
    location: 'Kandy Lake, Kandy',
    province: 'Central Province',
    category: 'Religious Places',
    lat: 7.2936,
    lng: 80.6413,
    image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Attend the morning puja at 5:30 AM or evening puja at 6:30 PM. Wear respectful white clothing covering legs and shoulders.',
    best_time: 'During Puja hours (5:30 AM, 9:30 AM, 6:30 PM)',
    entry_fee: 'LKR 2000 (Foreign Adults)',
    distance_km: 115,
    rating: 4.9,
    review_count: 320,
    featured: 1
  },
  {
    name: 'Ambuluwawa Biodiversity Complex & Tower',
    short_description: 'Dizzying spiral tower piercing mountain clouds with 360-degree aerial views of the Central Highlands.',
    description: 'Perched 3,567 feet above sea level on an isolated peak in Gampola, Ambuluwawa is Sri Lanka’s first multi-religious biodiversity sanctuary. Its centerpiece is a surreal, white conical spire resembling an elongated Buddhist pagoda that spirals into the mist. Climbing the narrowing outdoor stairwell tests your nerve but rewards you with breathtaking panoramas of Hanthana, Piduruthalagala, and the Bible Rock.',
    location: 'Gampola, Kandy District',
    province: 'Central Province',
    category: 'Hidden Gems',
    lat: 7.1706,
    lng: 80.5475,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Ambuluwawa_hill_tower.jpg',
    gallery: JSON.stringify([
      'https://upload.wikimedia.org/wikipedia/commons/4/44/Ambuluwawa_hill_tower.jpg',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85'
    ]),
    tips: 'The upper spiral staircase becomes very narrow and windy. Avoid climbing on rainy days or if you suffer from severe vertigo.',
    best_time: 'Early morning on a clear sunny day',
    entry_fee: 'LKR 1000 (Foreign Adults)',
    distance_km: 125,
    rating: 4.8,
    review_count: 210,
    featured: 1
  },
  {
    name: 'Royal Botanical Gardens, Peradeniya',
    short_description: 'Renowned 147-acre botanical haven showcasing 4,000 plant species, royal palm avenues, and giant bamboo.',
    description: 'Bordered on three sides by the Mahaweli River, the Peradeniya Botanical Gardens were once the pleasure garden of a Kandyan king before being formally established by the British in 1821. Highlights include an Orchid House with over 300 rare varieties, a giant Javanese fig tree whose canopy sprawls across 2,400 square meters, and majestic royal palm avenues planted by world dignitaries.',
    location: 'Peradeniya, Kandy',
    province: 'Central Province',
    category: 'Ancient Sites',
    lat: 7.2717,
    lng: 80.5962,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Rent a golf cart at the main entrance if traveling with elderly family members. Allocate at least 2 to 3 hours.',
    best_time: 'December to April (8:00 AM - 5:30 PM)',
    entry_fee: 'LKR 3000 (Foreign Adults)',
    distance_km: 110,
    rating: 4.7,
    review_count: 175,
    featured: 0
  },
  {
    name: 'Ramboda Falls & Twin Cascades',
    short_description: 'Spectacular 109-meter tiered waterfall crashing through lush tea hills on the Kandy-Nuwara Eliya highway.',
    description: 'Ramboda Falls is the 11th highest waterfall in Sri Lanka, standing at 109 meters (358 ft). The waterfall cascades in two thunderous tiers over ancient granite escarpments surrounded by emerald tea bushes. The Ramboda Pass tunnel and viewing pavilions offer front-row panoramas of the roaring spray, making it a beloved scenic rest stop on the mountain journey to Little England.',
    location: 'Pussellawa / Ramboda Pass',
    province: 'Central Province',
    category: 'Waterfalls',
    lat: 7.0544,
    lng: 80.6978,
    image_url: 'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85'
    ]),
    tips: 'Walk down the stone pathway through the hotel pavilion to reach the base viewing platform for cool mist spray.',
    best_time: 'Post-monsoon (September to January)',
    entry_fee: 'Free',
    distance_km: 140,
    rating: 4.7,
    review_count: 115,
    featured: 0
  },
  {
    name: 'Sembuwatta Lake, Matale',
    short_description: 'Pine-fringed manmade lake fed by natural springs, hidden deep inside private tea plantations.',
    description: 'Formed from natural mountain spring waters and surrounded by soaring pine groves and tea bushes, Sembuwatta Lake in Elkaduwa is an enchanting high-altitude picnic paradise. The deep green lake reflecting pine hills, alongside a natural swimming pool and zip-line course, makes it a favored off-the-beaten-path destination for families and honeymooners.',
    location: 'Elkaduwa, Matale District',
    province: 'Central Province',
    category: 'Hidden Gems',
    lat: 7.4339,
    lng: 80.7006,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85'
    ]),
    tips: 'The last 5km estate road is rugged; a 4x4 or tuk-tuk is recommended. Swimming in the lake itself is prohibited.',
    best_time: 'Morning mist hours (8:00 AM - 12:00 PM)',
    entry_fee: 'LKR 1000',
    distance_km: 145,
    rating: 4.6,
    review_count: 72,
    featured: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. SOUTHERN PROVINCE (Galle, Matara, Hambantota)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Sinharaja Rainforest Reserve',
    short_description: 'Sri Lanka’s last primary tropical rainforest and a UNESCO Biosphere Reserve boasting 95% endemic birds.',
    description: 'Sinharaja is a biodiversity gem of global importance. Blanketing steep virgin mountain ridges, this primeval rainforest is home to elusive leopards, purple-faced langurs, and giant green pit vipers. Over 95% of Sri Lanka’s endemic bird species can be spotted here, frequently moving in magnificent mixed feeding flocks led by the noisy orange-billed babbler and greater racket-tailed drongo.',
    location: 'Deniyaya / Kudawa entrances',
    province: 'Southern Province',
    category: 'Wildlife',
    lat: 6.4167,
    lng: 80.4167,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
      'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1200&q=85'
    ]),
    tips: 'Leech socks and herbal repellent are essential. Engaging an authorized wildlife department tracker is mandatory.',
    best_time: 'December to April & August to September',
    entry_fee: 'USD 15 (Foreign Adults)',
    distance_km: 165,
    rating: 4.9,
    review_count: 155,
    featured: 1
  },
  {
    name: 'Unawatuna Beach & Jungle Beach',
    short_description: 'Horseshoe coral bay famous for calm turquoise swimming, beach cafes, and secluded forest coves.',
    description: 'Protected by a double offshore reef, Unawatuna’s golden crescent beach is legendary for safe year-round swimming. Just across the Rumassala headland lies Jungle Beach, a tranquil hidden cove framed by thick coastal forest where monkeys leap overhead and coral reefs begin right off the shoreline, offering sensational snorkeling.',
    location: 'Unawatuna, Galle District',
    province: 'Southern Province',
    category: 'Beaches',
    lat: 6.0108,
    lng: 80.2483,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85'
    ]),
    tips: 'Hike to Jungle Beach via the Peace Pagoda trail for spectacular panoramic ocean vistas over Galle harbor.',
    best_time: 'November to April',
    entry_fee: 'Free',
    distance_km: 122,
    rating: 4.7,
    review_count: 240,
    featured: 0
  },
  {
    name: 'Madu Ganga River Safari',
    short_description: 'Coastal wetland mangrove estuary featuring 64 islands, cinnamon peeling demonstrations, and fish therapy.',
    description: 'The Madu Ganga wetland in Balapitiya is a pristine mangrove estuary recognized under the Ramsar Convention. Boat safaris cruise through intricate mangrove tunnels, visiting traditional cinnamon-peeling island communities, a 200-year-old Buddhist temple on Kothduwa Island, and natural open-water fish massage spas perched over the lazy river current.',
    location: 'Balapitiya, Galle District',
    province: 'Southern Province',
    category: 'Hidden Gems',
    lat: 6.2764,
    lng: 80.0547,
    image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=85'
    ]),
    tips: 'Negotiate the boat fare per boat rather than per person. The full circuit takes about 1.5 to 2 hours.',
    best_time: 'Early morning (8:00 AM - 11:00 AM)',
    entry_fee: 'LKR 4500 (Per Boat)',
    distance_km: 82,
    rating: 4.6,
    review_count: 130,
    featured: 0
  },
  {
    name: 'Hummanaya Blowhole, Kudawella',
    short_description: 'The second largest natural marine blowhole in the world, shooting seawater up to 30 meters into the sky.',
    description: 'Hummanaya is the only known natural blowhole in Sri Lanka and one of the most powerful in the world. Deep ocean currents force surging waves through a narrow fissure at the base of a towering sea cliff, compressing water until it explodes through a chimney opening up to 25–30 meters high with a booming whistle heard kilometers away.',
    location: 'Kudawella, Tangalle',
    province: 'Southern Province',
    category: 'Hidden Gems',
    lat: 5.9833,
    lng: 80.7000,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85'
    ]),
    tips: 'The spray is strongest during the southwest monsoon months (May to September) when seas are rough.',
    best_time: 'Mid-morning during high tide',
    entry_fee: 'LKR 500',
    distance_km: 185,
    rating: 4.5,
    review_count: 88,
    featured: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. NORTHERN PROVINCE (Jaffna, Kilinochchi, Mannar, Mullaitivu, Vavuniya)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Jaffna Dutch Fort & Coastal Moat',
    short_description: 'Expansive 17th-century star fortress built of coral and limestone overlooking the Jaffna Lagoon.',
    description: 'Built by the Portuguese in 1618 and extensively overhauled by the Dutch in 1680, Jaffna Fort is among the most impressive coastal fortifications in South Asia. Its massive pentagonal coral-stone ramparts and wide defensive moats overlook the sparkling lagoon. Visitors can walk the elevated bastions, explore old artillery vaults, and witness unforgettable golden sunsets over the northern sea.',
    location: 'Jaffna City Center',
    province: 'Northern Province',
    category: 'Historical',
    lat: 9.6615,
    lng: 80.0089,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85'
    ]),
    tips: 'Walk the ramparts at 5:00 PM for cool sea breezes and prime photography of lagoon fishing boats.',
    best_time: 'Late afternoon (4:30 PM - 6:30 PM)',
    entry_fee: 'Free',
    distance_km: 395,
    rating: 4.8,
    review_count: 160,
    featured: 1
  },
  {
    name: 'Nallur Kandaswamy Kovil',
    short_description: 'Majestic golden-walled Hindu temple complex dedicated to Lord Murugan with towering gopurams.',
    description: 'Nallur Kandaswamy Kovil is the spiritual beating heart of the Jaffna Peninsula. Rebuilt on the site of ancient Jaffna royalty, the complex features a striking golden Dravidian entrance tower (gopuram), a sacred step-well pool, and towering brass lamps. The annual 25-day Nallur festival attracts hundreds of thousands of devotees with majestic chariot processions and devotional music.',
    location: 'Nallur, Jaffna',
    province: 'Northern Province',
    category: 'Religious Places',
    lat: 9.6744,
    lng: 80.0292,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Men must remove shirts before entering the temple sanctum. Modest, respectful attire is mandatory.',
    best_time: 'Pooja times (6:00 AM, 11:00 AM, 5:00 PM)',
    entry_fee: 'Free',
    distance_km: 398,
    rating: 4.9,
    review_count: 220,
    featured: 1
  },
  {
    name: 'Casuarina Beach, Karainagar',
    short_description: 'Endless white sand beach with shallow crystal-clear waters shaded by whispering casuarina pine trees.',
    description: 'Regarded as the finest beach in the Northern Province, Casuarina Beach in Karainagar is famous for soft ivory sands and extremely shallow, calm waters where you can walk safely hundreds of meters into the sea. Shaded by needle-leaved casuarina trees, it is a peaceful retreat far from commercial crowds.',
    location: 'Karainagar Island, Jaffna',
    province: 'Northern Province',
    category: 'Beaches',
    lat: 9.7719,
    lng: 79.8889,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85'
    ]),
    tips: 'Rent a beach hut for shade. The drive across the Karainagar causeway offers lovely lagoon views.',
    best_time: 'January to September',
    entry_fee: 'LKR 200',
    distance_km: 420,
    rating: 4.6,
    review_count: 94,
    featured: 0
  },
  {
    name: 'Delft Island (Neduntheevu)',
    short_description: 'Remote windswept island of wild feral horses, coral stone walls, and giant African baobab trees.',
    description: 'Located in the Palk Strait, Delft Island is an extraordinary world apart. Populated by feral horses descended from Portuguese mounts, ancient baobab trees planted by Arab sailors, a ruined Dutch court and pigeon tower, and miles of coral stone fences, Delft offers an adventurous step back in time reached by public navy ferry.',
    location: 'Neduntheevu, Jaffna District',
    province: 'Northern Province',
    category: 'Hidden Gems',
    lat: 9.5167,
    lng: 79.6833,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85'
    ]),
    tips: 'Catch the early morning free public ferry from Kurikadduwan (KKD) jetty. Hire a local truck on arrival.',
    best_time: 'Morning (ferry departs around 8:00 AM)',
    entry_fee: 'Free (Ferry is free/nominal)',
    distance_km: 430,
    rating: 4.8,
    review_count: 85,
    featured: 0
  },
  {
    name: 'Keerimalai Sacred Springs & Naguleswaram',
    short_description: 'Ancient mineral spring baths built directly against the ocean waves with natural therapeutic waters.',
    description: 'The natural freshwater springs of Keerimalai bubble up right at the edge of the Indian Ocean sea wall. Famous for high mineral content, devotees believe the waters have therapeutic healing properties. Adjacent is Naguleswaram Temple, one of the five ancient Pancha Ishwarams of Lord Shiva in Sri Lanka dating back millennia.',
    location: 'Keerimalai, Jaffna Peninsula',
    province: 'Northern Province',
    category: 'Ancient Sites',
    lat: 9.8167,
    lng: 80.0167,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Separate bathing enclosures exist for men and women. Great to visit in the late morning after temple pooja.',
    best_time: 'Morning or late afternoon',
    entry_fee: 'Free',
    distance_km: 415,
    rating: 4.5,
    review_count: 65,
    featured: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. EASTERN PROVINCE (Trincomalee, Batticaloa, Ampara)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Arugam Bay (A-Bay)',
    short_description: 'World-renowned surfing mecca with legendary right-hand point breaks, chilled cafes, and lagoon wildlife.',
    description: 'Rated consistently among the top 10 surf destinations on the planet, Arugam Bay is a crescent-shaped bay on the southeast coast. Main Point, Whiskey Point, and Peanut Farm offer world-class right-hand sand point waves suitable for beginners and pro riders alike. Beyond surfing, the town is packed with bohemian beachfront cafes, yoga centers, and scenic mangrove lagoons.',
    location: 'Pottuvil, Ampara District',
    province: 'Eastern Province',
    category: 'Beaches',
    lat: 6.8417,
    lng: 81.8333,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
      'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&q=85'
    ]),
    tips: 'Peak surf season runs from May to October with dry offshore winds and steady 4-8 foot swells.',
    best_time: 'May to October (Surf Season)',
    entry_fee: 'Free',
    distance_km: 320,
    rating: 4.9,
    review_count: 310,
    featured: 1
  },
  {
    name: 'Pigeon Island National Park, Nilaveli',
    short_description: 'Marine national park harboring live coral reefs, blacktip reef sharks, and hundreds of tropical fish.',
    description: 'Located 1km offshore from Nilaveli Beach, Pigeon Island is one of Sri Lanka’s two marine national parks. Its shallow coral reef gardens are home to over 100 species of corals, hawksbill sea turtles, and harmless juvenile blacktip reef sharks that glide gracefully alongside snorkelers in crystal-clear waters.',
    location: 'Nilaveli, Trincomalee',
    province: 'Eastern Province',
    category: 'Wildlife',
    lat: 8.7214,
    lng: 81.2039,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Bring your own snorkel mask and reef-safe sunscreen. Take a boat from Nilaveli beach (15 min ride).',
    best_time: 'March to October (Calm seas & best visibility)',
    entry_fee: 'USD 15 (Foreign Adults) + Boat Hire',
    distance_km: 275,
    rating: 4.8,
    review_count: 190,
    featured: 1
  },
  {
    name: 'Koneswaram Temple & Swami Rock',
    short_description: 'Ancient Shiva temple perched high atop a precipitous cliff overlooking the worlds 5th largest natural harbor.',
    description: 'Perched on the summit of Swami Rock inside Fort Frederick, Koneswaram is an ancient Hindu temple of great spiritual importance dating back over two millennia. The cliff, known as Lovers Leap, plunges vertically 130 meters into the azure waters of Trincomalee natural harbor. From the temple grounds, blue whales can frequently be spotted swimming in the deep ocean trench below.',
    location: 'Fort Frederick, Trincomalee',
    province: 'Eastern Province',
    category: 'Religious Places',
    lat: 8.5794,
    lng: 81.2411,
    image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85'
    ]),
    tips: 'Wild spotted deer roam freely around Fort Frederick. The path to the temple is lined with stalls selling fresh king coconut.',
    best_time: 'Sunset or early morning pooja',
    entry_fee: 'Free',
    distance_km: 260,
    rating: 4.8,
    review_count: 180,
    featured: 0
  },
  {
    name: 'Pasikudah Bay (Coral Shelf Lagoon)',
    short_description: 'Broad sheltered bay renowned for one of the longest stretches of shallow reef flat in the world.',
    description: 'Pasikudah is famous for its tranquil, horseshoe-shaped bay protected by an outer coral reef. The water is exceptionally calm and shallow—you can walk out into the crystal-clear ocean for nearly 150 meters with water barely reaching your chest. It is a premier luxury beach destination lined with five-star eco-resorts.',
    location: 'Kalkudah, Batticaloa District',
    province: 'Eastern Province',
    category: 'Beaches',
    lat: 7.9250,
    lng: 81.5647,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=85'
    ]),
    tips: 'Ideal for young children and non-swimmers because of zero currents. Water sports like jet-skiing are available.',
    best_time: 'April to September',
    entry_fee: 'Free',
    distance_km: 295,
    rating: 4.7,
    review_count: 145,
    featured: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. NORTH WESTERN (WAYAMBA) PROVINCE (Kurunegala, Puttalam)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Yapahuwa Rock Fortress',
    short_description: '13th-century cliff capital featuring an ornamental granite staircase guarded by sculpted lion guardians.',
    description: 'Yapahuwa was the medieval capital of Sri Lanka during the 1270s following the fall of Polonnaruwa. Rising 100 meters above the dry zone plains, its iconic feature is a breathtaking, steep ceremonial stone staircase flanked by elaborate friezes, dancing figures, and the legendary Yapahuwa Lion carving, which is featured on the Sri Lankan 10-rupee note.',
    location: 'Maho, Kurunegala District',
    province: 'North Western Province',
    category: 'Ancient Sites',
    lat: 7.8286,
    lng: 80.3061,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85'
    ]),
    tips: 'Far less crowded than Sigiriya. Climb to the top summit for stunning 360-degree views across rural Wayamba.',
    best_time: 'Early morning or late afternoon (cooler stones)',
    entry_fee: 'LKR 1000 (Foreign Adults)',
    distance_km: 145,
    rating: 4.8,
    review_count: 110,
    featured: 1
  },
  {
    name: 'Kalpitiya Peninsula & Dolphin Haven',
    short_description: 'Sandbar peninsula offering kite-surfing lagoons, offshore dolphin pods, and Dutch colonial history.',
    description: 'Separating the Indian Ocean from the massive Puttalam Lagoon, Kalpitiya is one of the world’s premier kitesurfing hotspots with steady thermal winds. In winter, hundreds of spinner dolphins gather in colossal super-pods just offshore, leaping and twirling alongside safari catamarans against the sunrise.',
    location: 'Kalpitiya, Puttalam District',
    province: 'North Western Province',
    category: 'Wildlife',
    lat: 8.2333,
    lng: 79.7667,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Dolphin watching is best from November to April when the sea is calm. Kitesurfing peaks May to September.',
    best_time: 'November to April (Dolphins) / May to Oct (Kite-surfing)',
    entry_fee: 'Free (Boat safaris ~ LKR 8000)',
    distance_km: 165,
    rating: 4.8,
    review_count: 135,
    featured: 1
  },
  {
    name: 'Munneswaram Kovil, Chilaw',
    short_description: 'Millennia-old Hindu pilgrimage complex associated with the Ramayana legend and King Ravana.',
    description: 'Munneswaram is a celebrated Hindu temple complex dedicated to Lord Shiva that predates the arrival of Prince Vijaya in the 6th century BC. According to the Ramayana epic, King Rama prayed here after his victory over Ravana. The temple features ancient Dravidian stone pillared halls, brass vahanams, and an adjacent Kali kovil attracting diverse pilgrims.',
    location: 'Chilaw, Puttalam District',
    province: 'North Western Province',
    category: 'Religious Places',
    lat: 7.5819,
    lng: 79.8164,
    image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85'
    ]),
    tips: 'The annual Munneswaram festival in August features vibrant fire-walking ceremonies.',
    best_time: 'Morning pooja (7:30 AM - 10:00 AM)',
    entry_fee: 'Free',
    distance_km: 80,
    rating: 4.6,
    review_count: 78,
    featured: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. NORTH CENTRAL PROVINCE (Anuradhapura, Polonnaruwa)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Anuradhapura Sacred City & Ruwanwelisaya',
    short_description: 'UNESCO World Heritage cradle of ancient Sinhalese civilization with gigantic whitewashed stupas.',
    description: 'Anuradhapura was the glorious capital of Sri Lanka from the 4th century BC to the 11th century AD. The Sacred City is dominated by the colossal Ruwanwelisaya stupa, built by King Dutugemunu in 140 BC, and the sacred Jaya Sri Maha Bodhi—the oldest recorded human-planted tree in the world (planted 288 BC). Vast irrigation reservoirs and stone bathing pools attest to unparalleled ancient hydraulic engineering.',
    location: 'Anuradhapura Sacred Area',
    province: 'North Central Province',
    category: 'Ancient Sites',
    lat: 8.3500,
    lng: 80.3964,
    image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85'
    ]),
    tips: 'Bicycle rental is the best way to explore the sprawling ruins. Wear white attire and socks for hot stone surfaces.',
    best_time: 'Early morning or late afternoon sunset',
    entry_fee: 'USD 25 (Foreign Adults)',
    distance_km: 205,
    rating: 4.9,
    review_count: 280,
    featured: 1
  },
  {
    name: 'Polonnaruwa Ancient City & Gal Vihara',
    short_description: 'Splendid medieval garden capital featuring monumental rock-cut Buddha statues and royal palaces.',
    description: 'Polonnaruwa served as Sri Lanka’s second royal capital from 1070 to 1214. Its most awe-inspiring masterpiece is the Gal Vihara—four monumental Buddha figures carved with supreme delicacy from a single granite rock wall. The ancient council chambers of King Parakramabahu the Great and the Vatadage circular relic house stand as enduring triumphs of Sinhalese architecture.',
    location: 'Polonnaruwa Ancient Complex',
    province: 'North Central Province',
    category: 'Ancient Sites',
    lat: 7.9403,
    lng: 81.0189,
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=85'
    ]),
    tips: 'The onsite archaeological museum provides essential context before visiting the ruins.',
    best_time: 'November to March (7:30 AM - 5:30 PM)',
    entry_fee: 'USD 25 (Foreign Adults)',
    distance_km: 225,
    rating: 4.9,
    review_count: 240,
    featured: 1
  },
  {
    name: 'Mihintale (The Cradle of Buddhism)',
    short_description: 'Sacred mountain sanctuary with 1,840 granite steps where Buddhism was first introduced to Sri Lanka in 247 BC.',
    description: 'Mihintale is venerated as the birthplace of Buddhism in Sri Lanka. In 247 BC, Arahat Mahinda met King Devanampiya Tissa here and preached the Dhamma. A flight of 1,840 grand stone steps bordered by temple trees leads up to the summit stupas, meditation caves, an ancient hospital, and the sheer pinnacle of Aradhana Gala overlooking sweeping forest plains.',
    location: 'Mihintale, 12km east of Anuradhapura',
    province: 'North Central Province',
    category: 'Religious Places',
    lat: 8.3508,
    lng: 80.5158,
    image_url: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=1200&q=85'
    ]),
    tips: 'Climb for the Poson full moon festival in June or late afternoon sunset over the tanks.',
    best_time: 'Late afternoon (3:30 PM - 6:30 PM)',
    entry_fee: 'LKR 1000 (Foreign Adults)',
    distance_km: 215,
    rating: 4.8,
    review_count: 165,
    featured: 0
  },
  {
    name: 'Ritigala Strict Nature Reserve & Monastery',
    short_description: 'Mysterious ancient forest monastery ruins tucked away in a mist-shrouded mountain biosphere reserve.',
    description: 'Rising abruptly 766 meters above the dry plains, Ritigala is an isolated ecological island and 1st-century BC forest monastery. Unlike ornate royal temples, the ascetic monks here built austere, unadorned double-platform stone meditation structures, deep bathing ponds, and granite paved pathways winding through ancient medicinal forest trees.',
    location: 'Galapitagala, North Central',
    province: 'North Central Province',
    category: 'Hidden Gems',
    lat: 8.1167,
    lng: 80.6500,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Wear sturdy shoes for moss-covered stone trails. Carry water; there are no shops inside the sanctuary.',
    best_time: 'Morning mist hours (8:00 AM - 11:00 AM)',
    entry_fee: 'LKR 1500 (Foreign Adults)',
    distance_km: 180,
    rating: 4.8,
    review_count: 92,
    featured: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. UVA PROVINCE (Badulla, Monaragala)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Diyaluma Falls & Upper Rock Pools',
    short_description: 'Sri Lanka’s second-highest waterfall (220m) featuring natural infinity plunge pools on the cliff edge.',
    description: 'Plunging 220 meters in a roaring cascade, Diyaluma is one of Sri Lanka’s most breathtaking waterfalls. A hiking trail leading to the upper crest unveils a sequence of natural tiered rock pools and natural water slides. Swimming in the refreshing mountain pools with direct cliffside drop-offs over the southern plains provides an unforgettable adrenaline rush.',
    location: 'Poonagala / Koslanda, Badulla District',
    province: 'Uva Province',
    category: 'Waterfalls',
    lat: 6.7328,
    lng: 81.0319,
    image_url: 'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'Access the upper pools from the top estate village (Uda Diyaluma) rather than climbing from the road base.',
    best_time: 'Post-monsoon (September to March)',
    entry_fee: 'Free',
    distance_km: 210,
    rating: 4.9,
    review_count: 260,
    featured: 1
  },
  {
    name: 'Dunhinda Falls (The Smoky Cascade)',
    short_description: 'Thunderous 64-meter waterfall named for its perpetual vapor mist cloud crashing into an amphitheater pool.',
    description: 'Located 5km from Badulla town, Dunhinda Falls is created by the Badulu Oya river leaping over a 64-meter cliff into a secluded gorge. The force of the drop creates a perpetual cloud of smoky water droplets giving the falls its name (Dun meaning smoke/mist). The scenic 1km jungle footpath to the falls is lively with wild monkeys and vendors selling wild honey.',
    location: 'Badulla Town outskirts',
    province: 'Uva Province',
    category: 'Waterfalls',
    lat: 7.0278,
    lng: 81.0667,
    image_url: 'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85'
    ]),
    tips: 'The walkway can be muddy; wear grippy shoes. Do not swim in the deep whirlpool at the base.',
    best_time: 'June to December',
    entry_fee: 'LKR 300',
    distance_km: 215,
    rating: 4.7,
    review_count: 140,
    featured: 0
  },
  {
    name: 'Liptons Seat & Dambatenne Tea Estate',
    short_description: 'Famous viewpoint where tea magnate Sir Thomas Lipton surveyed his verdant highland tea empire.',
    description: 'Perched 1,970 meters up on the Poonagala ridge, Lipton’s Seat was the favorite vantage point of Sir Thomas Lipton. On clear mornings, you can gaze across seven Sri Lankan provinces, taking in the southern coastline and Udawalawe reservoir. Walking through Dambatenne, the longest tea factory in Sri Lanka, reveals the secrets of authentic Ceylon black tea processing.',
    location: 'Haputale, Badulla District',
    province: 'Uva Province',
    category: 'Hidden Gems',
    lat: 6.7828,
    lng: 81.0139,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85'
    ]),
    tips: 'Arrive before 7:30 AM before clouds roll in from the south to block the horizon vista.',
    best_time: 'Sunrise (6:00 AM - 8:30 AM)',
    entry_fee: 'LKR 500',
    distance_km: 195,
    rating: 4.8,
    review_count: 175,
    featured: 0
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 9. SABARAGAMUWA PROVINCE (Ratnapura, Kegalle)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    name: 'Udawalawe National Park (Elephant Safari)',
    short_description: 'Premier open-plains wildlife sanctuary home to over 500 wild elephants, water birds, and crocodiles.',
    description: 'Surrounding the massive Udawalawe reservoir, this national park rivals the savannas of East Africa. It is the best place in Asia to observe wild Asian elephants year-round in their natural habitat. Herds of mothers and calves bathe in the lake, while water buffaloes, spotted deer, monitor lizards, and over 180 species of birds roam freely across the grasslands.',
    location: 'Udawalawe, Sabaragamuwa / Uva border',
    province: 'Sabaragamuwa Province',
    category: 'Wildlife',
    lat: 6.4744,
    lng: 80.8986,
    image_url: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=1200&q=85',
      'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=1200&q=85'
    ]),
    tips: 'Book a 4x4 open safari jeep for the 6:00 AM morning drive or 3:00 PM sunset drive. Visit the Elephant Transit Home nearby.',
    best_time: 'Year-round (Dry months May to September are easiest)',
    entry_fee: 'USD 25 (Foreign Adults) + Jeep Hire',
    distance_km: 165,
    rating: 4.9,
    review_count: 290,
    featured: 1
  },
  {
    name: 'Bopath Ella Falls, Ratnapura',
    short_description: 'Iconic leaf-shaped waterfall cascading into a wide natural bathing pool amid lush rubber plantations.',
    description: 'Bopath Ella is one of the most uniquely shaped waterfalls in Sri Lanka, closely resembling the heart-shaped leaf of the sacred Bo tree (Ficus religiosa). The Kurugana river cascades through a narrow rocky gap and widens dramatically as it descends 30 meters into an inviting natural rock pool surrounded by lush foliage in the heart of gem country.',
    location: 'Kuruwita, Ratnapura District',
    province: 'Sabaragamuwa Province',
    category: 'Waterfalls',
    lat: 6.7917,
    lng: 80.3667,
    image_url: 'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1467173572719-f14b9fb86e5f?w=1200&q=85'
    ]),
    tips: 'Popular with locals on weekends. Visit on a weekday morning for peaceful photographs.',
    best_time: 'Post-monsoon (September to January)',
    entry_fee: 'LKR 100',
    distance_km: 85,
    rating: 4.5,
    review_count: 95,
    featured: 0
  },
  {
    name: 'Kitulgala White Water Rafting & Kelani River',
    short_description: 'Sri Lanka’s adventure capital featuring grade 2-3 rapids, rainforest canyoning, and prehistoric caves.',
    description: 'Kitulgala is nestled in humid rainforests along the rushing Kelani River. It served as the filming location for David Lean’s Oscar-winning classic "The Bridge on the River Kwai". Thrill-seekers flock here for exhilarating whitewater rafting through 7 named rapids, waterfall abseiling, rainforest canyon trekking, and exploring the prehistoric Belilena cave where 16,000-year-old human skeletons were discovered.',
    location: 'Kitulgala, Kegalle District',
    province: 'Sabaragamuwa Province',
    category: 'Hidden Gems',
    lat: 6.9892,
    lng: 80.4161,
    image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&q=85'
    ]),
    tips: 'All operators provide safety helmets and life vests. No previous rafting experience is required for the main run.',
    best_time: 'Year-round (Best water flow May to December)',
    entry_fee: 'LKR 4000 (Rafting package per person)',
    distance_km: 88,
    rating: 4.8,
    review_count: 185,
    featured: 1
  }
];

// Insert or update destinations safely
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

insertTx(destinations);

console.log(`Seeding complete: ${inserted} new places inserted, ${skipped} already existed.`);
const total = db.prepare('SELECT COUNT(*) as c FROM places').get().c;
console.log('Total places in database now:', total);

const provinceSummary = db.prepare('SELECT province, count(*) as count FROM places GROUP BY province ORDER BY count DESC').all();
console.log('Places per province:');
console.table(provinceSummary);
