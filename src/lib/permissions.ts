/**
 * src/lib/permissions.ts
 * Single source of truth for Role-Based Access Control (RBAC).
 * Enforces Section 4.4 capability matrix across all administrative API routes and workflows.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { User, UserRole } from '@/types';

export type Capability =
  | 'manage_staff'
  | 'manage_secrets'
  | 'sql_console'
  | 'edit_ai_prompt'
  | 'manage_site_nodes'
  | 'manage_theme'
  | 'manage_ads'
  | 'manage_news'
  | 'view_file_map'
  | 'create_edit_places'
  | 'upload_media'
  | 'approve_submissions'
  | 'reply_customer_chat'
  | 'view_analytics'
  | 'manage_slides'
  | 'moderate_reviews'
  | 'delete_places'
  | 'upload_images'
  | 'direct_delete'
  | 'request_delete'
  | 'restore_trash'
  | 'empty_trash'
  | 'revert_version'
  | 'view_audit_log';

/**
 * Capability Matrix mapping roles to permitted actions.
 */
const CAPABILITIES: Record<Capability, UserRole[]> = {
  // Owner only capabilities
  manage_staff: ['owner'],
  manage_secrets: ['owner'],
  sql_console: ['owner'],
  empty_trash: ['owner'],
  direct_delete: ['owner'],
  delete_places: ['owner'],

  // Owner & Developer capabilities
  edit_ai_prompt: ['owner', 'developer'],
  manage_site_nodes: ['owner', 'developer'],
  manage_theme: ['owner', 'developer'],
  manage_ads: ['owner', 'developer'],
  manage_news: ['owner', 'developer'],
  view_file_map: ['owner', 'developer'],
  view_audit_log: ['owner', 'developer'],
  restore_trash: ['owner', 'developer'],
  revert_version: ['owner', 'developer'],

  // Owner, Developer & Uploader capabilities
  create_edit_places: ['owner', 'developer', 'uploader'],
  upload_media: ['owner', 'developer', 'uploader'],
  upload_images: ['owner', 'developer', 'uploader'],
  manage_slides: ['owner', 'developer', 'uploader'],
  moderate_reviews: ['owner', 'developer', 'uploader'],
  approve_submissions: ['owner', 'developer', 'uploader'],
  reply_customer_chat: ['owner', 'developer', 'uploader'],
  view_analytics: ['owner', 'developer', 'uploader'],

  // Deletion request capability (Developer and Uploader must request delete)
  request_delete: ['developer', 'uploader'],
};

/**
 * Checks whether a role possesses a specific capability.
 */
export function hasCapability(role: UserRole | undefined, capability: Capability): boolean {
  if (!role) return false;
  const allowed = CAPABILITIES[capability];
  return allowed ? allowed.includes(role) : false;
}

/**
 * Checks capability synchronously for an already-resolved User object.
 */
export function checkPermission(
  user: User | null | undefined,
  capability: Capability
): { authorized: boolean; error?: string } {
  if (!user) return { authorized: false, error: 'Unauthorized: Please sign in.' };
  if (user.status === 'suspended') return { authorized: false, error: 'Account suspended.' };
  if (!hasCapability(user.role, capability)) {
    return {
      authorized: false,
      error: `Forbidden: Your role (${user.role}) does not have permission for '${capability}'.`,
    };
  }
  return { authorized: true };
}

/**
 * Ensures the incoming request or user is authenticated and has the required capability.
 * Accepts either NextRequest or already resolved User object.
 */
export async function requirePermission(
  reqOrUser: NextRequest | User | null | undefined,
  capability: Capability
): Promise<
  | { authorized: true; user: User }
  | { authorized: false; response: NextResponse; error: string }
> {
  let user: User | null = null;
  if (reqOrUser && typeof reqOrUser === 'object' && 'role' in reqOrUser) {
    user = reqOrUser as User;
  } else if (reqOrUser) {
    user = await getCurrentUser(reqOrUser as NextRequest);
  }

  if (!user) {
    const error = 'Unauthorized: Please sign in.';
    return {
      authorized: false,
      response: NextResponse.json({ error }, { status: 401 }),
      error,
    };
  }

  if (user.status === 'suspended') {
    const error = 'Account suspended. Please contact the administrator.';
    return {
      authorized: false,
      response: NextResponse.json({ error }, { status: 403 }),
      error,
    };
  }

  if (!hasCapability(user.role, capability)) {
    const error = `Forbidden: Your role (${user.role}) does not have permission to perform this action.`;
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error,
          requiredCapability: capability,
        },
        { status: 403 }
      ),
      error,
    };
  }

  return { authorized: true, user };
}

/**
 * Ensures the user is an administrative team member (owner, developer, or uploader).
 */
export async function requireStaff(request: NextRequest): Promise<
  | { authorized: true; user: User }
  | { authorized: false; response: NextResponse }
> {
  const user = await getCurrentUser(request);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized: Please sign in.' }, { status: 401 }),
    };
  }

  if (user.status === 'suspended') {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Account suspended.' }, { status: 403 }),
    };
  }

  if (!['owner', 'developer', 'uploader'].includes(user.role)) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Forbidden: Staff access required.' }, { status: 403 }),
    };
  }

  return { authorized: true, user };
}
