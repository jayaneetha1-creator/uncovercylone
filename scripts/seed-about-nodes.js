const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'uncoverceylon.db');
const db = new Database(dbPath);

const aboutNode = db.prepare('SELECT id FROM site_nodes WHERE node_key = ?').get('page_about');
if (!aboutNode) {
  console.log('page_about not found');
  process.exit(0);
}

const blocks = [
  { key: 'about_hero', title: 'Hero Banner & Key Metrics', order: 1 },
  { key: 'about_story', title: "Founder's Village Story & Origin", order: 2 },
  { key: 'about_photos', title: 'Island Moments & Village Photos', order: 3 },
  { key: 'about_values', title: 'Mission & Guiding Values', order: 4 },
  { key: 'about_team', title: 'Team & Serandib Co. Credits', order: 5 },
  { key: 'about_contact', title: 'Community Inquiries & Call to Action', order: 6 },
];

for (const b of blocks) {
  db.prepare(`
    INSERT INTO site_nodes (parent_id, node_key, type, title_en, title_si, enabled, sort_order, default_open, priority, device_visibility)
    VALUES (?, ?, 'block', ?, '', 1, ?, 1, 5, 'all')
    ON CONFLICT(node_key) DO UPDATE SET title_en = excluded.title_en, parent_id = excluded.parent_id
  `).run(aboutNode.id, b.key, b.title, b.order);
}

console.log('Successfully seeded 6 about blocks under page_about (id: ' + aboutNode.id + ')');
