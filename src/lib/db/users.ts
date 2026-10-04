/**
 * src/lib/db/users.ts
 * Data access module for users, roles, sessions, and email tokens.
 */

import { queryOne, execute, isMySqlEnabled } from '../db';
import { User, Session, UserRole } from '@/types';

export async function getUserByEmail(email: string): Promise<User | null> {
  if (isMySqlEnabled()) {
    return queryOne<User>('SELECT * FROM users WHERE email = ?', [email]);
  }
  // SQLite fallback in development if users table exists
  try {
    return queryOne<User>('SELECT * FROM users WHERE email = ?', [email]);
  } catch {
    return null;
  }
}

export async function getUserById(id: number): Promise<User | null> {
  return queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
}

export async function createUser(data: {
  email: string;
  password_hash: string;
  name: string;
  role?: UserRole;
  country?: string;
  avatar?: string;
  status?: 'unverified' | 'active' | 'suspended';
}): Promise<number> {
  const result = await execute(
    `INSERT INTO users (email, password_hash, name, role, country, avatar, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      data.email,
      data.password_hash,
      data.name,
      data.role || 'user',
      data.country || 'Sri Lanka',
      data.avatar || '',
      data.status || 'unverified',
    ]
  );
  return result.insertId;
}

export async function updateUser(
  id: number,
  data: Partial<Pick<User, 'name' | 'country' | 'avatar' | 'status' | 'email_verified_at' | 'must_change_password'>>
): Promise<boolean> {
  const fields: string[] = [];
  const params: (string | number | null)[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    params.push(data.name);
  }
  if (data.country !== undefined) {
    fields.push('country = ?');
    params.push(data.country);
  }
  if (data.avatar !== undefined) {
    fields.push('avatar = ?');
    params.push(data.avatar);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    params.push(data.status);
  }
  if (data.email_verified_at !== undefined) {
    fields.push('email_verified_at = ?');
    params.push(data.email_verified_at);
  }
  if (data.must_change_password !== undefined) {
    fields.push('must_change_password = ?');
    params.push(data.must_change_password);
  }

  if (fields.length === 0) return false;

  params.push(id);
  const result = await execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
  return result.affectedRows > 0;
}

export async function updateUserPassword(id: number, passwordHash: string): Promise<boolean> {
  const result = await execute(
    'UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?',
    [passwordHash, id]
  );
  return result.affectedRows > 0;
}

// -------------------------------------------------------------
// Sessions
// -------------------------------------------------------------

export async function createSession(
  sessionId: string,
  userId: number,
  expiresAt: Date,
  ipAddress = '',
  userAgent = ''
): Promise<void> {
  await execute(
    'INSERT INTO sessions (id, user_id, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
    [sessionId, userId, expiresAt, ipAddress, userAgent]
  );
}

export async function getSession(sessionId: string): Promise<(Session & { user?: User }) | null> {
  const session = await queryOne<Session>(
    'SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()',
    [sessionId]
  );
  if (!session) return null;

  const user = await getUserById(session.user_id);
  return { ...session, user: user || undefined };
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const result = await execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
  return result.affectedRows > 0;
}

export async function deleteUserSessions(userId: number): Promise<boolean> {
  const result = await execute('DELETE FROM sessions WHERE user_id = ?', [userId]);
  return result.affectedRows > 0;
}

// -------------------------------------------------------------
// Email & Password Reset Tokens
// -------------------------------------------------------------

export async function createEmailToken(
  userId: number,
  token: string,
  type: 'verify_email' | 'reset_password' | 'change_email',
  expiresAt: Date,
  newEmail: string | null = null
): Promise<number> {
  const result = await execute(
    'INSERT INTO email_tokens (user_id, token, type, new_email, expires_at) VALUES (?, ?, ?, ?, ?)',
    [userId, token, type, newEmail, expiresAt]
  );
  return result.insertId;
}

export async function getEmailToken(
  token: string,
  type: 'verify_email' | 'reset_password' | 'change_email'
): Promise<{ id: number; user_id: number; new_email: string | null; expires_at: string } | null> {
  return queryOne(
    'SELECT * FROM email_tokens WHERE token = ? AND type = ? AND used_at IS NULL AND expires_at > NOW()',
    [token, type]
  );
}

export async function markEmailTokenUsed(token: string): Promise<boolean> {
  const result = await execute('UPDATE email_tokens SET used_at = NOW() WHERE token = ?', [token]);
  return result.affectedRows > 0;
}
