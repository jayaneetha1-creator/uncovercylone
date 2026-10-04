/**
 * scripts/db-seed.js
 * Database seeder for initial owner account, site nodes tree, default categories, and settings.
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  console.log('🌱 Starting UncoverCeylon Database Seeding...');

  const isMySql = process.env.DB_TYPE === 'mysql' || !!process.env.MYSQL_HOST;

  if (!isMySql) {
    console.log('ℹ️  SQLite mode detected. Seeding initial settings and schema...');
    // Seed SQLite directly if needed
    return;
  }

  const config = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'uncoverceylon',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'uncoverceylon',
    charset: 'utf8mb4',
  };

  const conn = await mysql.createConnection(config);

  try {
    // 1. Seed Owner Account
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@uncoverceylon.com';
    const ownerPassword = process.env.OWNER_INITIAL_PASSWORD || 'CeylonAdmin2026!';
    const passwordHash = await bcrypt.hash(ownerPassword, 12);

    const [existingOwner] = await conn.query('SELECT id FROM users WHERE email = ?', [ownerEmail]);
    if (existingOwner.length === 0) {
      await conn.query(
        `INSERT INTO users (email, password_hash, role, name, country, status, email_verified_at, must_change_password)
         VALUES (?, ?, 'owner', 'Site Owner', 'Sri Lanka', 'active', NOW(), 1)`,
        [ownerEmail, passwordHash]
      );
      console.log(`👤 Initial Owner user created: ${ownerEmail} (Must change password on first login)`);
    } else {
      console.log(`👤 Owner user ${ownerEmail} already exists.`);
    }

    // 2. Seed Default Categories
    const categories = [
      { slug: 'beaches', name_en: 'Beaches & Coast', name_si: 'වෙරළ සහ මුහුදු තීර', icon: 'Waves', sort_order: 1 },
      { slug: 'waterfalls', name_en: 'Waterfalls', name_si: 'දියඇලි', icon: 'Droplets', sort_order: 2 },
      { slug: 'wildlife', name_en: 'Wildlife & Safari', name_si: 'වනජීවී සහ සෆාරි', icon: 'Trees', sort_order: 3 },
      { slug: 'ancient', name_en: 'Ancient Sites', name_si: 'පෞරාණික ස්ථාන', icon: 'Landmark', sort_order: 4 },
      { slug: 'mountains', name_en: 'Hill Country & Mountains', name_si: 'කඳුකරය සහ උස්බිම්', icon: 'Mountain', sort_order: 5 },
      { slug: 'religious', name_en: 'Religious Places', name_si: 'ආගමික සිද්ධස්ථාන', icon: 'Sparkles', sort_order: 6 },
      { slug: 'hidden', name_en: 'Hidden Gems', name_si: 'සැඟවුණු සුන්දර තැන්', icon: 'Gem', sort_order: 7 },
      { slug: 'historical', name_en: 'Historical', name_si: 'ඓතිහාසික ස්ථාන', icon: 'Scroll', sort_order: 8 },
    ];

    for (const c of categories) {
      await conn.query(
        `INSERT INTO categories (slug, name_en, name_si, icon, sort_order)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name_en=VALUES(name_en), name_si=VALUES(name_si), icon=VALUES(icon)`,
        [c.slug, c.name_en, c.name_si, c.icon, c.sort_order]
      );
    }
    console.log(`🏷️  Seeded ${categories.length} core categories.`);

    // 3. Seed Default Site Nodes (Site Tree / Folder Manager)
    const rootPages = [
      { key: 'page_home', type: 'page', title_en: 'Home', title_si: 'මුල් පිටුව', sort_order: 1, default_open: 1 },
      { key: 'page_destinations', type: 'page', title_en: 'Destinations', title_si: 'ගමනාන්ත', sort_order: 2, default_open: 1 },
      { key: 'page_map', type: 'page', title_en: 'Interactive Map', title_si: 'සිතියම', sort_order: 3, default_open: 1 },
      { key: 'page_trips', type: 'page', title_en: 'My Trips', title_si: 'මගේ චාරිකා', sort_order: 4, default_open: 1 },
      { key: 'page_news', type: 'page', title_en: 'Tourism News', title_si: 'සංචාරක පුවත්', sort_order: 5, default_open: 1 },
      { key: 'page_about', type: 'page', title_en: 'About Us', title_si: 'අප ගැන', sort_order: 6, default_open: 1 },
    ];

    for (const rp of rootPages) {
      await conn.query(
        `INSERT INTO site_nodes (node_key, type, title_en, title_si, enabled, sort_order, default_open)
         VALUES (?, ?, ?, ?, 1, ?, ?)
         ON DUPLICATE KEY UPDATE title_en=VALUES(title_en), title_si=VALUES(title_si)`,
        [rp.key, rp.type, rp.title_en, rp.title_si, rp.sort_order, rp.default_open]
      );
    }

    // Home Sub-sections
    const [homeNode] = await conn.query('SELECT id FROM site_nodes WHERE node_key = "page_home"');
    if (homeNode.length > 0) {
      const homeSections = [
        { key: 'home_hero', title_en: 'Hero Slideshow & Search', title_si: 'ප්‍රධාන බැනරය සහ සෙවුම', sort_order: 1, default_open: 1 },
        { key: 'home_interests', title_en: 'Find Things by Interest', title_si: 'කැමැත්ත අනුව තෝරන්න', sort_order: 2, default_open: 1 },
        { key: 'home_curated', title_en: "Travelers' Favourites & Hidden Gems", title_si: 'සංචාරකයන්ගේ ප්‍රියතම තැන්', sort_order: 3, default_open: 1 },
        { key: 'home_region_map', title_en: 'Explore by Region Teaser', title_si: 'පළාත් අනුව ගවේෂණය', sort_order: 4, default_open: 0 },
        { key: 'home_latest_news', title_en: 'Latest Tourism News Strip', title_si: 'නවතම පුවත් තීරුව', sort_order: 5, default_open: 0 },
      ];

      for (const hs of homeSections) {
        await conn.query(
          `INSERT INTO site_nodes (parent_id, node_key, type, title_en, title_si, enabled, sort_order, default_open)
           VALUES (?, ?, 'section', ?, ?, 1, ?, ?)
           ON DUPLICATE KEY UPDATE title_en=VALUES(title_en), title_si=VALUES(title_si)`,
          [homeNode[0].id, hs.key, hs.title_en, hs.title_si, hs.sort_order, hs.default_open]
        );
      }
    }
    console.log('🌲 Seeded Site Tree (Folder Manager) nodes.');

    console.log('🎉 Seeding completed successfully!');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
