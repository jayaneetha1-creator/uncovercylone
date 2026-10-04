/**
 * scripts/db-migrate.js
 * Versioned SQL migration runner.
 * Reads migrations from db/migrations/ and executes them in sequence.
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  console.log('🔄 Running UncoverCeylon Database Migrations...');

  const migrationsDir = path.join(process.cwd(), 'db', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No db/migrations directory found.');
    return;
  }

  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  const isMySql = process.env.DB_TYPE === 'mysql' || !!process.env.MYSQL_HOST;

  if (isMySql) {
    const config = {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user: process.env.MYSQL_USER || 'uncoverceylon',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'uncoverceylon',
      multipleStatements: true,
      charset: 'utf8mb4',
    };

    let conn;
    try {
      conn = await mysql.createConnection(config);
      console.log(`✅ Connected to MySQL: ${config.database}`);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS _migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL UNIQUE,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      for (const file of files) {
        const [rows] = await conn.query('SELECT filename FROM _migrations WHERE filename = ?', [file]);
        if (rows.length > 0) {
          console.log(`⏩ Migration ${file} already executed.`);
          continue;
        }

        console.log(`⚡ Executing ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await conn.query(sql);
        await conn.query('INSERT INTO _migrations (filename) VALUES (?)', [file]);
        console.log(`✅ Completed ${file}`);
      }
    } catch (err) {
      console.error('❌ Migration error:', err.message);
      process.exit(1);
    } finally {
      if (conn) await conn.end();
    }
  } else {
    console.log('ℹ️  Running in SQLite local development mode. Tables are auto-synchronized via src/lib/db.ts.');
  }

  console.log('🎉 Migrations finished successfully!');
}

main().catch((err) => {
  console.error('Unhandled error in db-migrate:', err);
  process.exit(1);
});
