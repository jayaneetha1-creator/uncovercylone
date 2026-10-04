import Database from 'better-sqlite3';
import mysql, { Pool } from 'mysql2/promise';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// -------------------------------------------------------------
// Database Drivers & Dual-Engine Connectivity
// -------------------------------------------------------------

let sqliteDb: Database.Database | null = null;
let mysqlPool: Pool | null = null;

export function isMySqlEnabled(): boolean {
  return process.env.DB_TYPE === 'mysql' || Boolean(process.env.MYSQL_HOST);
}

/**
 * Returns MySQL connection pool when MySQL mode is active.
 */
export function getPool(): Pool {
  if (!mysqlPool) {
    const config = {
      host: process.env.MYSQL_HOST || '127.0.0.1',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user: process.env.MYSQL_USER || 'uncoverceylon',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'uncoverceylon',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
    };
    mysqlPool = mysql.createPool(config);
  }
  return mysqlPool;
}

/**
 * Backward-compatible SQLite instance getter.
 */
export function getDb(): Database.Database {
  if (!sqliteDb) {
    ensureDataDir();
    const DB_PATH = path.join(DATA_DIR, 'uncoverceylon.db');
    sqliteDb = new Database(DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    initializeSqliteDb(sqliteDb);
  }
  return sqliteDb;
}

function initializeSqliteDb(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS hero_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      location TEXT NOT NULL,
      province TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT NOT NULL,
      location TEXT NOT NULL,
      province TEXT NOT NULL,
      category TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      image_url TEXT DEFAULT '',
      gallery TEXT DEFAULT '[]',
      tips TEXT DEFAULT '',
      best_time TEXT DEFAULT '',
      entry_fee TEXT DEFAULT 'Free',
      distance_km INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      status TEXT DEFAULT 'approved',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS region_slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_url TEXT NOT NULL,
      title TEXT NOT NULL,
      region TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT DEFAULT '',
      details TEXT NOT NULL,
      actor TEXT DEFAULT 'Admin',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// -------------------------------------------------------------
// Universal Query Execution Helpers
// -------------------------------------------------------------

export type QueryParam = string | number | boolean | null | Date;

export async function query<T = unknown>(
  sql: string,
  params: (QueryParam | undefined)[] = []
): Promise<T[]> {
  const cleanParams = params.map((p) => (p === undefined ? null : p));
  if (isMySqlEnabled()) {
    const pool = getPool();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [rows] = await pool.execute(sql, cleanParams as any);
    return rows as T[];
  } else {
    const db = getDb();
    const stmt = db.prepare(sql);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return stmt.all(...cleanParams as any) as T[];
  }
}

export async function queryOne<T = unknown>(
  sql: string,
  params: (QueryParam | undefined)[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(
  sql: string,
  params: (QueryParam | undefined)[] = []
): Promise<{ insertId: number; affectedRows: number }> {
  const cleanParams = params.map((p) => (p === undefined ? null : p));
  if (isMySqlEnabled()) {
    const pool = getPool();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [result] = (await pool.execute(sql, cleanParams as any)) as [mysql.ResultSetHeader, unknown];
    return {
      insertId: result.insertId || 0,
      affectedRows: result.affectedRows || 0,
    };
  } else {
    const db = getDb();
    const stmt = db.prepare(sql);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = stmt.run(...cleanParams as any);
    return {
      insertId: Number(result.lastInsertRowid) || 0,
      affectedRows: result.changes || 0,
    };
  }
}

// -------------------------------------------------------------
// Activity Logging & Audit
// -------------------------------------------------------------

export function logActivity(
  action: string,
  entityType: string,
  entityId: string | number | bigint,
  details: string,
  actor = 'Admin'
) {
  try {
    if (isMySqlEnabled()) {
      execute(
        `INSERT INTO audit_log (action, entity_type, entity_id, details, user_role, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [action, entityType, String(entityId || ''), details, actor]
      ).catch((err) => console.error('MySQL audit log error:', err));
    } else {
      const database = getDb();
      database.prepare(`
        INSERT INTO activity_logs (action, entity_type, entity_id, details, actor, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).run(action, entityType, String(entityId || ''), details, actor);
    }
  } catch (err) {
    console.error('Error logging activity:', err);
  }
}

export function getActivityLogs(limit = 100) {
  try {
    const database = getDb();
    return database.prepare(`
      SELECT * FROM activity_logs ORDER BY id DESC LIMIT ?
    `).all(limit);
  } catch (err) {
    console.error('Error getting activity logs:', err);
    return [];
  }
}

export function clearActivityLogs() {
  try {
    const database = getDb();
    database.prepare('DELETE FROM activity_logs').run();
    logActivity('CLEAR_LOGS', 'system', 'logs', 'Admin cleared all activity history');
    return true;
  } catch (err) {
    console.error('Error clearing activity logs:', err);
    return false;
  }
}

// Re-export decoupled domain access modules
export * from './db/locations';
export * from './db/users';
export * from './db/nodes';
export * from './db/admin';
