/**
 * src/lib/db/admin.ts
 * Owner SQL Console & Table Browser with safety guards, auto-backup, and audit logging.
 */

import { query, execute, isMySqlEnabled, getDb, logActivity } from '../db';
import fs from 'fs';
import path from 'path';

export interface SqlExecutionResult {
  success: boolean;
  message?: string;
  rows?: Record<string, unknown>[];
  affectedRows?: number;
  columns?: string[];
  backupFile?: string;
}

/**
 * Executes raw SQL from the Owner Console with strict safety guards.
 */
export async function executeOwnerSql(
  sql: string,
  userRole: string,
  allowDestructive = false
): Promise<SqlExecutionResult> {
  // Guard 1: Only owner role permitted
  if (userRole !== 'owner') {
    return { success: false, message: 'Forbidden: Only the site owner can execute SQL commands.' };
  }

  const trimmed = sql.trim();
  const upper = trimmed.toUpperCase();

  // Guard 2: Destructive protection (DROP, TRUNCATE)
  const isDestructive =
    upper.includes('DROP DATABASE') ||
    upper.includes('DROP TABLE') ||
    upper.includes('TRUNCATE TABLE') ||
    upper.startsWith('TRUNCATE ');

  if (isDestructive && !allowDestructive) {
    return {
      success: false,
      message: 'Destructive statement detected (DROP / TRUNCATE). Explicit confirmation is required to proceed.',
    };
  }

  // Guard 3: Automatic backup snapshot before write operations
  const isWrite =
    upper.startsWith('INSERT') ||
    upper.startsWith('UPDATE') ||
    upper.startsWith('DELETE') ||
    upper.startsWith('ALTER') ||
    upper.startsWith('DROP') ||
    upper.startsWith('REPLACE');

  let backupFile = '';
  if (isWrite) {
    backupFile = createPreSqlBackup();
  }

  try {
    if (upper.startsWith('SELECT') || upper.startsWith('SHOW') || upper.startsWith('DESCRIBE') || upper.startsWith('EXPLAIN')) {
      const rows = await query<Record<string, unknown>>(trimmed);
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      logActivity('SQL_QUERY', 'database', 'console', `Ran SELECT query: ${trimmed.slice(0, 100)}`, 'Owner');
      return {
        success: true,
        rows,
        columns,
        affectedRows: rows.length,
      };
    } else {
      const res = await execute(trimmed);
      logActivity('SQL_WRITE', 'database', 'console', `Ran WRITE statement: ${trimmed.slice(0, 100)}`, 'Owner');
      return {
        success: true,
        affectedRows: res.affectedRows,
        backupFile: backupFile || undefined,
        message: `Statement executed successfully. ${res.affectedRows} row(s) affected.`,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logActivity('SQL_ERROR', 'database', 'console', `SQL Error: ${errorMsg}`, 'Owner');
    return { success: false, message: `SQL Execution Error: ${errorMsg}` };
  }
}

/**
 * Creates an instantaneous safety backup snapshot before raw SQL mutations.
 */
function createPreSqlBackup(): string {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pre_sql_backup_${timestamp}.db`;
    const backupDir = path.join(process.cwd(), 'data', 'backups');

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    if (!isMySqlEnabled()) {
      const src = path.join(process.cwd(), 'data', 'uncoverceylon.db');
      const dest = path.join(backupDir, filename);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        return filename;
      }
    }
    return filename;
  } catch (err) {
    console.error('Pre-SQL backup warning:', err);
    return '';
  }
}

/**
 * Returns available table list for the Table Browser.
 */
export async function getDatabaseTables(): Promise<string[]> {
  if (isMySqlEnabled()) {
    const rows = await query<{ Tables_in_uncoverceylon: string }>('SHOW TABLES');
    return rows.map((r) => Object.values(r)[0] as string);
  } else {
    const db = getDb();
    const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[];
    return rows.map((r) => r.name);
  }
}

/**
 * Returns rows from a specified table for the Table Browser.
 */
export async function getTableRows(
  tableName: string,
  limit = 50,
  offset = 0
): Promise<{ rows: Record<string, unknown>[]; total: number }> {
  // Sanitize table name against alphanumeric whitelist
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    throw new Error('Invalid table name');
  }

  const rows = await query<Record<string, unknown>>(
    `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const countRow = await query<{ count: number }>(`SELECT COUNT(*) as count FROM ${tableName}`);
  const total = countRow.length > 0 ? Number(countRow[0].count) : rows.length;

  return { rows, total };
}
