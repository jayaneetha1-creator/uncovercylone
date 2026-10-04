// scripts/fix-place-images.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'uncoverceylon.db');
const db = new Database(dbPath);

console.log('Connected to database at:', dbPath);

const updates = [
  {
    id: 2,
    name: 'Ella Rock',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Ella_Rock_Climbing%2C_Sri_Lanka.jpg'
  },
  {
    id: 3,
    name: 'Nine Arch Bridge',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Nine_Arches_Bridge_in_Ella.jpg'
  },
  {
    id: 6,
    name: "Adam's Peak (Sri Pada)",
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Adam%27s_Peak_-_January_2020.jpg'
  },
  {
    id: 8,
    name: 'Pidurangala Rock',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Pidurangala_Rock.jpg'
  },
  {
    id: 11,
    name: 'Dambulla Cave Temple',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/3/34/Dambulla-buddhastupa.jpg'
  },
  {
    id: 19,
    name: 'Temple of the Sacred Tooth Relic (Dalada Maligawa)',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/SL_Kandy_asv2020-01_img33_Sacred_Tooth_Temple.jpg'
  },
  {
    id: 20,
    name: 'Ambuluwawa Biodiversity Complex & Tower',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Ambuluwawa_hill_tower.jpg'
  }
];

const updateStmt = db.prepare('UPDATE places SET image_url = ? WHERE id = ?');

for (const item of updates) {
  const result = updateStmt.run(item.image_url, item.id);
  console.log(`Updated [${item.id}] ${item.name}: ${result.changes} row(s) changed`);
}

// Also check if any gallery entries contain the broken photo-1576706374778-95a95efff7b1 or photo-1575994532946-e99d18c8a39e
const placesWithGallery = db.prepare('SELECT id, name, gallery FROM places WHERE gallery IS NOT NULL').all();
const updateGalleryStmt = db.prepare('UPDATE places SET gallery = ? WHERE id = ?');

for (const p of placesWithGallery) {
  if (p.gallery && (p.gallery.includes('photo-1576706374778-95a95efff7b1') || p.gallery.includes('photo-1575994532946-e99d18c8a39e'))) {
    const fixedGallery = p.gallery
      .replace(/https:\/\/images\.unsplash\.com\/photo-1576706374778-95a95efff7b1\?w=1200&q=85/g, 'https://upload.wikimedia.org/wikipedia/commons/4/44/Ambuluwawa_hill_tower.jpg')
      .replace(/https:\/\/images\.unsplash\.com\/photo-1575994532946-e99d18c8a39e\?w=800&q=80/g, 'https://upload.wikimedia.org/wikipedia/commons/3/34/Dambulla-buddhastupa.jpg');
    updateGalleryStmt.run(fixedGallery, p.id);
    console.log(`Fixed gallery for [${p.id}] ${p.name}`);
  }
}

console.log('Finished updating place images!');
