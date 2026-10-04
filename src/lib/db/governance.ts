/**
 * src/lib/db/governance.ts
 * Data access layer for administrative governance:
 * - Deletion change requests & approval workflow
 * - 30-Day Trash & one-click restore
 * - Version snapshots & rollback
 * - Notification dispatch & inbox
 * - Audit trail logging
 */

import { query, queryOne, execute, isMySqlEnabled } from '../db';
import { UserRole } from '@/types';

// -------------------------------------------------------------
// 1. Change Requests (Delete/Edit Approval Workflow)
// -------------------------------------------------------------

export interface ChangeRequestRecord {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  user_role?: UserRole;
  action_type: 'delete' | 'edit' | 'publish';
  entity_type: string;
  entity_id: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: number | null;
  reviewer_name?: string;
  reviewed_at: string | null;
  created_at: string;
}

export async function createChangeRequest(data: {
  userId: number;
  actionType: 'delete' | 'edit' | 'publish';
  entityType: string;
  entityId: number;
  reason: string;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO change_requests (user_id, action_type, entity_type, entity_id, reason, status, created_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ${isMySqlEnabled() ? 'NOW()' : "datetime('now')"})`,
    [data.userId, data.actionType, data.entityType, data.entityId, data.reason]
  );
  return result.insertId;
}

export async function getChangeRequests(status?: string): Promise<ChangeRequestRecord[]> {
  let sql = `
    SELECT cr.*, u.name as user_name, u.email as user_email, u.role as user_role,
           rev.name as reviewer_name
    FROM change_requests cr
    LEFT JOIN users u ON cr.user_id = u.id
    LEFT JOIN users rev ON cr.reviewed_by = rev.id
  `;
  const params: (string | number)[] = [];

  if (status && status !== 'all') {
    sql += ' WHERE cr.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY cr.created_at DESC';
  return query<ChangeRequestRecord>(sql, params);
}

export async function getChangeRequestById(id: number): Promise<ChangeRequestRecord | null> {
  const sql = `
    SELECT cr.*, u.name as user_name, u.email as user_email, u.role as user_role,
           rev.name as reviewer_name
    FROM change_requests cr
    LEFT JOIN users u ON cr.user_id = u.id
    LEFT JOIN users rev ON cr.reviewed_by = rev.id
    WHERE cr.id = ?
  `;
  return queryOne<ChangeRequestRecord>(sql, [id]);
}

export async function reviewChangeRequest(
  id: number,
  reviewerId: number,
  status: 'approved' | 'rejected'
): Promise<boolean> {
  const result = await execute(
    `UPDATE change_requests 
     SET status = ?, reviewed_by = ?, reviewed_at = ${isMySqlEnabled() ? 'NOW()' : "datetime('now')"}
     WHERE id = ? AND status = 'pending'`,
    [status, reviewerId, id]
  );
  return result.affectedRows > 0;
}

// -------------------------------------------------------------
// 2. Soft Deletion & 30-Day Trash
// -------------------------------------------------------------

export interface TrashRecord {
  id: number;
  entity_type: string;
  entity_id: number;
  entity_data: string;
  deleted_by: number;
  deleted_by_name?: string;
  deleted_at: string;
  expires_at: string;
}

export async function moveToTrash(
  entityType: string,
  entityId: number,
  entityData: Record<string, unknown>,
  deletedBy: number,
  retentionDays = 30
): Promise<number> {
  const jsonStr = JSON.stringify(entityData);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + retentionDays * 24 * 60 * 60 * 1000);

  const result = await execute(
    `INSERT INTO trash (entity_type, entity_id, entity_data, deleted_by, deleted_at, expires_at)
     VALUES (?, ?, ?, ?, ${isMySqlEnabled() ? 'NOW()' : "datetime('now')"}, ?)`,
    [entityType, entityId, jsonStr, deletedBy, expiresAt.toISOString()]
  );
  return result.insertId;
}

export async function getTrashItems(): Promise<TrashRecord[]> {
  const sql = `
    SELECT t.*, u.name as deleted_by_name
    FROM trash t
    LEFT JOIN users u ON t.deleted_by = u.id
    ORDER BY t.deleted_at DESC
  `;
  return query<TrashRecord>(sql);
}

export async function getTrashItemById(id: number): Promise<TrashRecord | null> {
  const sql = `
    SELECT t.*, u.name as deleted_by_name
    FROM trash t
    LEFT JOIN users u ON t.deleted_by = u.id
    WHERE t.id = ?
  `;
  return queryOne<TrashRecord>(sql, [id]);
}

export async function deleteTrashItem(id: number): Promise<boolean> {
  const result = await execute('DELETE FROM trash WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function emptyTrash(): Promise<number> {
  const result = await execute('DELETE FROM trash');
  return result.affectedRows;
}

// -------------------------------------------------------------
// 3. Version History & Snapshots
// -------------------------------------------------------------

export interface VersionRecord {
  id: number;
  entity_type: string;
  entity_id: number;
  version_num: number;
  snapshot: string;
  created_by: number;
  created_by_name?: string;
  created_at: string;
}

export async function createVersionSnapshot(
  entityType: string,
  entityId: number,
  snapshotData: Record<string, unknown>,
  createdBy: number
): Promise<number> {
  // Get latest version number
  const latest = await queryOne<{ max_ver: number | null }>(
    'SELECT MAX(version_num) as max_ver FROM versions WHERE entity_type = ? AND entity_id = ?',
    [entityType, entityId]
  );
  const nextVer = (latest?.max_ver || 0) + 1;
  const jsonStr = JSON.stringify(snapshotData);

  const result = await execute(
    `INSERT INTO versions (entity_type, entity_id, version_num, snapshot, created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ${isMySqlEnabled() ? 'NOW()' : "datetime('now')"})`,
    [entityType, entityId, nextVer, jsonStr, createdBy]
  );
  return result.insertId;
}

export async function getVersionHistory(entityType: string, entityId: number): Promise<VersionRecord[]> {
  const sql = `
    SELECT v.*, u.name as created_by_name
    FROM versions v
    LEFT JOIN users u ON v.created_by = u.id
    WHERE v.entity_type = ? AND v.entity_id = ?
    ORDER BY v.version_num DESC
  `;
  return query<VersionRecord>(sql, [entityType, entityId]);
}

export async function getVersionById(id: number): Promise<VersionRecord | null> {
  const sql = `
    SELECT v.*, u.name as created_by_name
    FROM versions v
    LEFT JOIN users u ON v.created_by = u.id
    WHERE v.id = ?
  `;
  return queryOne<VersionRecord>(sql, [id]);
}

// -------------------------------------------------------------
// 4. Notifications Engine
// -------------------------------------------------------------

export interface NotificationRecord {
  id: number;
  user_id: number | null;
  recipient_role: string | null;
  type: string;
  title: string;
  body: string;
  link: string;
  payload: string | null;
  is_read: number;
  created_at: string;
}

export async function dispatchNotification(data: {
  userId?: number | null;
  recipientRole?: 'all_staff' | 'owner' | 'developer' | 'uploader' | null;
  type: string;
  title: string;
  body: string;
  link?: string;
  payload?: Record<string, unknown> | null;
}): Promise<number> {
  const payloadStr = data.payload ? JSON.stringify(data.payload) : null;
  const result = await execute(
    `INSERT INTO notifications (user_id, recipient_role, type, title, body, link, payload, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ${isMySqlEnabled() ? 'NOW()' : "datetime('now')"})`,
    [
      data.userId || null,
      data.recipientRole || null,
      data.type,
      data.title,
      data.body,
      data.link || '',
      payloadStr,
    ]
  );
  return result.insertId;
}

export async function getNotificationsForUser(
  userId: number,
  role: UserRole,
  limit = 40
): Promise<NotificationRecord[]> {
  let roleFilter = "recipient_role IS NULL OR recipient_role = 'all_staff'";
  if (role === 'owner') {
    roleFilter += " OR recipient_role = 'owner'";
  } else if (role === 'developer') {
    roleFilter += " OR recipient_role = 'developer'";
  } else if (role === 'uploader') {
    roleFilter += " OR recipient_role = 'uploader'";
  }

  const sql = `
    SELECT * FROM notifications
    WHERE user_id = ? OR (${roleFilter})
    ORDER BY created_at DESC
    LIMIT ?
  `;
  return query<NotificationRecord>(sql, [userId, limit]);
}

export async function getUnreadNotificationCount(
  userId: number,
  role: UserRole
): Promise<number> {
  let roleFilter = "recipient_role IS NULL OR recipient_role = 'all_staff'";
  if (role === 'owner') {
    roleFilter += " OR recipient_role = 'owner'";
  } else if (role === 'developer') {
    roleFilter += " OR recipient_role = 'developer'";
  } else if (role === 'uploader') {
    roleFilter += " OR recipient_role = 'uploader'";
  }

  const sql = `
    SELECT COUNT(*) as unread_count 
    FROM notifications
    WHERE is_read = 0 AND (user_id = ? OR (${roleFilter}))
  `;
  const result = await queryOne<{ unread_count: number }>(sql, [userId]);
  return result?.unread_count || 0;
}

export async function markNotificationAsRead(id: number): Promise<boolean> {
  const result = await execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function markAllNotificationsAsRead(userId: number, role: UserRole): Promise<boolean> {
  let roleFilter = "recipient_role IS NULL OR recipient_role = 'all_staff'";
  if (role === 'owner') {
    roleFilter += " OR recipient_role = 'owner'";
  } else if (role === 'developer') {
    roleFilter += " OR recipient_role = 'developer'";
  } else if (role === 'uploader') {
    roleFilter += " OR recipient_role = 'uploader'";
  }

  const sql = `
    UPDATE notifications 
    SET is_read = 1 
    WHERE is_read = 0 AND (user_id = ? OR (${roleFilter}))
  `;
  const result = await execute(sql, [userId]);
  return result.affectedRows > 0;
}

// -------------------------------------------------------------
// 5. Audit Logging
// -------------------------------------------------------------

export interface AuditLogRecord {
  id: number;
  user_id: number | null;
  user_email: string;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export async function recordAuditLog(data: {
  userId?: number | null;
  userEmail?: string;
  userRole?: string;
  action: string;
  entityType: string;
  entityId?: string | number;
  details: string;
  ipAddress?: string;
}): Promise<number> {
  const result = await execute(
    `INSERT INTO audit_log (user_id, user_email, user_role, action, entity_type, entity_id, details, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ${isMySqlEnabled() ? 'NOW()' : "datetime('now')"})`,
    [
      data.userId || null,
      data.userEmail || '',
      data.userRole || '',
      data.action,
      data.entityType,
      data.entityId ? String(data.entityId) : '',
      data.details,
      data.ipAddress || '',
    ]
  );
  return result.insertId;
}

export async function getAuditLogs(
  limit = 100,
  action?: string,
  entityType?: string
): Promise<AuditLogRecord[]> {
  let sql = 'SELECT * FROM audit_log';
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (action && action !== 'all') {
    conditions.push('action = ?');
    params.push(action);
  }
  if (entityType && entityType !== 'all') {
    conditions.push('entity_type = ?');
    params.push(entityType);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  return query<AuditLogRecord>(sql, params);
}
