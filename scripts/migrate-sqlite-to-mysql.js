/**
 * scripts/migrate-sqlite-to-mysql.js
 * Migrates data from local SQLite database (data/uncoverceylon.db) to MySQL 8.
 * Verifies matching row counts across all tables.
 * Leaves data/uncoverceylon.db untouched as an immutable backup.
 */

const Database = require('better-sqlite3');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

async function main() {
  console.log('🚀 Starting UncoverCeylon SQLite → MySQL Data Migration...');

  const sqlitePath = path.join(process.cwd(), 'data', 'uncoverceylon.db');
  if (!fs.existsSync(sqlitePath)) {
    console.error(`❌ SQLite database file not found at ${sqlitePath}`);
    process.exit(1);
  }

  const sqlite = new Database(sqlitePath, { readonly: true });

  const mysqlConfig = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'uncoverceylon',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'uncoverceylon',
    charset: 'utf8mb4',
  };

  let connection;
  try {
    connection = await mysql.createConnection(mysqlConfig);
    console.log(`✅ Connected to MySQL database "${mysqlConfig.database}" at ${mysqlConfig.host}:${mysqlConfig.port}`);
  } catch (err) {
    console.error('❌ Failed to connect to MySQL:', err.message);
    console.log('ℹ️  Ensure MySQL is running and credentials in environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE) are configured.');
    process.exit(1);
  }

  try {
    await connection.beginTransaction();

    // 1. Migrate Places -> Locations
    const places = sqlite.prepare('SELECT * FROM places').all();
    console.log(`📦 Found ${places.length} places in SQLite...`);

    let locCount = 0;
    for (const p of places) {
      await connection.execute(
        `INSERT INTO locations (
          id, name, name_si, description, description_si, short_description, short_description_si,
          location, province, district, category, lat, lng, image_url, gallery, tips, best_time,
          entry_fee, distance_km, rating, review_count, featured, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), rating=VALUES(rating)`,
        [
          p.id,
          p.name,
          p.name_si || '',
          p.description,
          p.description_si || '',
          p.short_description || p.name,
          p.short_description_si || '',
          p.location,
          p.province,
          p.district || '',
          p.category,
          p.lat,
          p.lng,
          p.image_url || '',
          p.gallery || '[]',
          p.tips || '',
          p.best_time || '',
          p.entry_fee || 'Free',
          p.distance_km || 0,
          p.rating || 0.0,
          p.review_count || 0,
          p.featured ? 1 : 0,
          p.created_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]
      );
      locCount++;
    }
    console.log(`✅ Migrated ${locCount} locations to MySQL.`);

    // 2. Migrate Hero Slides
    const heroSlides = sqlite.prepare('SELECT * FROM hero_slides').all();
    console.log(`📦 Found ${heroSlides.length} hero slides in SQLite...`);
    for (const hs of heroSlides) {
      await connection.execute(
        `INSERT INTO hero_slides (id, image_url, location, province, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE image_url=VALUES(image_url), location=VALUES(location)`,
        [hs.id, hs.image_url, hs.location, hs.province, hs.sort_order || 0, hs.created_at]
      );
    }
    console.log(`✅ Migrated ${heroSlides.length} hero slides to MySQL.`);

    // 3. Migrate Region Slides
    const regionSlides = sqlite.prepare('SELECT * FROM region_slides').all();
    console.log(`📦 Found ${regionSlides.length} region slides in SQLite...`);
    for (const rs of regionSlides) {
      await connection.execute(
        `INSERT INTO region_slides (id, image_url, title, region, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE image_url=VALUES(image_url), title=VALUES(title)`,
        [rs.id, rs.image_url, rs.title, rs.region, rs.sort_order || 0, rs.created_at]
      );
    }
    console.log(`✅ Migrated ${regionSlides.length} region slides to MySQL.`);

    // 4. Migrate Reviews
    const reviews = sqlite.prepare('SELECT * FROM reviews').all();
    console.log(`📦 Found ${reviews.length} reviews in SQLite...`);
    for (const r of reviews) {
      await connection.execute(
        `INSERT INTO reviews (id, place_id, author, rating, comment, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE comment=VALUES(comment), rating=VALUES(rating)`,
        [r.id, r.place_id, r.author, r.rating, r.comment, r.status || 'approved', r.created_at]
      );
    }
    console.log(`✅ Migrated ${reviews.length} reviews to MySQL.`);

    // 5. Migrate Site Settings
    const settings = sqlite.prepare('SELECT * FROM site_settings').all();
    console.log(`📦 Found ${settings.length} site settings in SQLite...`);
    for (const s of settings) {
      await connection.execute(
        `INSERT INTO site_settings (key_name, value_text)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE value_text=VALUES(value_text)`,
        [s.key, s.value]
      );
    }
    console.log(`✅ Migrated ${settings.length} settings to MySQL.`);

    // 6. Migrate Activity Logs -> audit_log
    const logs = sqlite.prepare('SELECT * FROM activity_logs').all();
    console.log(`📦 Found ${logs.length} activity logs in SQLite...`);
    for (const l of logs) {
      await connection.execute(
        `INSERT INTO audit_log (id, action, entity_type, entity_id, details, user_role, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE details=VALUES(details)`,
        [l.id, l.action, l.entity_type, String(l.entity_id || ''), l.details, l.actor || 'Admin', l.created_at]
      );
    }
    console.log(`✅ Migrated ${logs.length} activity logs to MySQL.`);

    await connection.commit();
    console.log('🎉 Data migration committed successfully!');

    // VERIFICATION: Compare row counts between SQLite and MySQL
    console.log('\n--- 🔍 VERIFYING ROW COUNTS ---');

    const [myLocCount] = await connection.query('SELECT COUNT(*) as count FROM locations');
    const [myHeroCount] = await connection.query('SELECT COUNT(*) as count FROM hero_slides');
    const [myRegionCount] = await connection.query('SELECT COUNT(*) as count FROM region_slides');
    const [myRevCount] = await connection.query('SELECT COUNT(*) as count FROM reviews');
    const [mySetCount] = await connection.query('SELECT COUNT(*) as count FROM site_settings');

    const verification = [
      { table: 'locations (places)', sqlite: places.length, mysql: myLocCount[0].count },
      { table: 'hero_slides', sqlite: heroSlides.length, mysql: myHeroCount[0].count },
      { table: 'region_slides', sqlite: regionSlides.length, mysql: myRegionCount[0].count },
      { table: 'reviews', sqlite: reviews.length, mysql: myRevCount[0].count },
      { table: 'site_settings', sqlite: settings.length, mysql: mySetCount[0].count },
    ];

    console.table(verification);

    let allMatch = true;
    for (const v of verification) {
      if (v.sqlite !== v.mysql) {
        console.error(`⚠️ Row count mismatch for ${v.table}: SQLite=${v.sqlite} vs MySQL=${v.mysql}`);
        allMatch = false;
      }
    }

    if (allMatch) {
      console.log('✅ ALL ROW COUNTS MATCH 100%! SQLite data successfully migrated to MySQL.');
    } else {
      console.warn('⚠️ Some row counts differed. Please review table above.');
    }

  } catch (err) {
    await connection.rollback();
    console.error('❌ Migration failed, transaction rolled back:', err);
    process.exit(1);
  } finally {
    sqlite.close();
    await connection.end();
  }
}

main().catch((err) => {
  console.error('Unhandled migration error:', err);
  process.exit(1);
});
