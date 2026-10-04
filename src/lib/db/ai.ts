/**
 * src/lib/db/ai.ts
 * Data access layer for Phase 9: AI Chatbot (Gemini).
 * - Safe parameterized read-only place database tools for function calling
 * - Session and message persistence with Recents history
 * - Guest limits (2 messages) and user daily limits
 * - Prompt versioning and admin metrics
 */

import { query, queryOne, execute, isMySqlEnabled } from '../db';
import { Place } from '@/types';
import {
  DEFAULT_AI_SYSTEM_PROMPT,
  DEFAULT_EXAMPLE_QUESTIONS,
  type AISettings,
  type AIChatSession,
  type AIChatMessage,
  type AIPromptVersion,
} from '../ai/constants';

export {
  DEFAULT_AI_SYSTEM_PROMPT,
  DEFAULT_EXAMPLE_QUESTIONS,
  type AISettings,
  type AIChatSession,
  type AIChatMessage,
  type AIPromptVersion,
} from '../ai/constants';

// -------------------------------------------------------------
// 1. Safe Parameterized Place Database Tools
// -------------------------------------------------------------

export interface PlaceSummaryToolResult {
  id: number;
  name: string;
  location: string;
  province: string;
  category: string;
  rating: number;
  short_description: string;
  entry_fee: string;
  best_time: string;
  distance_km?: number;
}

export async function searchPlacesTool(
  queryText: string,
  category?: string,
  province?: string
): Promise<PlaceSummaryToolResult[]> {
  try {
    let sql = `
      SELECT id, name, location, province, category, rating, short_description, entry_fee, best_time
      FROM places
      WHERE (status = 'published' OR status IS NULL)
    `;
    const params: (string | number)[] = [];

    if (queryText && queryText.trim()) {
      sql += ` AND (name LIKE ? OR location LIKE ? OR description LIKE ?)`;
      const term = `%${queryText.trim()}%`;
      params.push(term, term, term);
    }
    if (category && category !== 'All') {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (province && province !== 'All') {
      sql += ` AND province = ?`;
      params.push(province);
    }

    sql += ` ORDER BY featured DESC, rating DESC LIMIT 6`;
    return await query<PlaceSummaryToolResult>(sql, params);
  } catch (err) {
    console.error('searchPlacesTool error:', err);
    return [];
  }
}

export async function getPlaceDetailsTool(
  idOrName: string | number
): Promise<Place | null> {
  try {
    let place: Place | null = null;
    const numId = typeof idOrName === 'number' ? idOrName : parseInt(idOrName, 10);

    if (!isNaN(numId)) {
      place = await queryOne<Place>(
        `SELECT * FROM places WHERE id = ? AND (status = 'published' OR status IS NULL)`,
        [numId]
      );
    }

    if (!place && typeof idOrName === 'string') {
      place = await queryOne<Place>(
        `SELECT * FROM places WHERE name LIKE ? AND (status = 'published' OR status IS NULL) LIMIT 1`,
        [`%${idOrName.trim()}%`]
      );
    }

    return place;
  } catch (err) {
    console.error('getPlaceDetailsTool error:', err);
    return null;
  }
}

export async function getNearbyPlacesTool(
  lat: number,
  lng: number,
  radiusKm = 30
): Promise<PlaceSummaryToolResult[]> {
  try {
    const all = await query<Place>(
      `SELECT id, name, location, province, category, rating, short_description, entry_fee, best_time, lat, lng
       FROM places WHERE (status = 'published' OR status IS NULL)`
    );

    const deg2rad = (deg: number) => deg * (Math.PI / 180);
    const results: (PlaceSummaryToolResult & { dist: number })[] = [];

    for (const p of all) {
      if (!p.lat || !p.lng) continue;
      const R = 6371; // Earth radius km
      const dLat = deg2rad(p.lat - lat);
      const dLng = deg2rad(p.lng - lng);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat)) * Math.cos(deg2rad(p.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = R * c;

      if (dist <= radiusKm) {
        results.push({
          id: p.id,
          name: p.name,
          location: p.location,
          province: p.province,
          category: p.category,
          rating: p.rating,
          short_description: p.short_description,
          entry_fee: p.entry_fee,
          best_time: p.best_time,
          distance_km: Math.round(dist * 10) / 10,
          dist,
        });
      }
    }

    results.sort((a, b) => a.dist - b.dist);
    return results.slice(0, 5).map((item) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      province: item.province,
      category: item.category,
      rating: item.rating,
      short_description: item.short_description,
      entry_fee: item.entry_fee,
      best_time: item.best_time,
      distance_km: item.distance_km,
    }));
  } catch (err) {
    console.error('getNearbyPlacesTool error:', err);
    return [];
  }
}

export async function filterPlacesTool(
  category?: string,
  season?: string,
  province?: string
): Promise<PlaceSummaryToolResult[]> {
  try {
    let sql = `
      SELECT id, name, location, province, category, rating, short_description, entry_fee, best_time
      FROM places
      WHERE (status = 'published' OR status IS NULL)
    `;
    const params: (string | number)[] = [];

    if (category && category !== 'All') {
      sql += ` AND category = ?`;
      params.push(category);
    }
    if (province && province !== 'All') {
      sql += ` AND province = ?`;
      params.push(province);
    }
    if (season && season !== 'All') {
      sql += ` AND (best_time LIKE ? OR description LIKE ?)`;
      params.push(`%${season}%`, `%${season}%`);
    }

    sql += ` ORDER BY rating DESC, review_count DESC LIMIT 6`;
    return await query<PlaceSummaryToolResult>(sql, params);
  } catch (err) {
    console.error('filterPlacesTool error:', err);
    return [];
  }
}

// -------------------------------------------------------------
// 2. Chat Sessions & Messages
// -------------------------------------------------------------

export async function getOrCreateSession(
  sessionId: string,
  userId: number | null,
  guestToken: string | null,
  title = 'New Trip Plan'
): Promise<AIChatSession> {
  const existing = await queryOne<AIChatSession>(
    'SELECT * FROM ai_chat_sessions WHERE id = ?',
    [sessionId]
  );
  if (existing) {
    if (userId && !existing.user_id) {
      await execute('UPDATE ai_chat_sessions SET user_id = ? WHERE id = ?', [userId, sessionId]);
      existing.user_id = userId;
    }
    return existing;
  }

  const nowSql = isMySqlEnabled() ? 'NOW()' : "datetime('now')";
  await execute(
    `INSERT INTO ai_chat_sessions (id, user_id, guest_token, title, created_at, updated_at)
     VALUES (?, ?, ?, ?, ${nowSql}, ${nowSql})`,
    [sessionId, userId, guestToken, title]
  );

  return {
    id: sessionId,
    user_id: userId,
    guest_token: guestToken,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function getUserSessions(userId: number, limit = 20): Promise<AIChatSession[]> {
  return await query<AIChatSession>(
    'SELECT * FROM ai_chat_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?',
    [userId, limit]
  );
}

export async function deleteUserSession(sessionId: string, userId: number): Promise<boolean> {
  const res = await execute(
    'DELETE FROM ai_chat_sessions WHERE id = ? AND user_id = ?',
    [sessionId, userId]
  );
  return res.affectedRows > 0;
}

export async function saveChatMessage(data: {
  sessionId: string;
  role: 'user' | 'model' | 'system';
  content: string;
  itineraryProposal?: unknown;
}): Promise<number> {
  const nowSql = isMySqlEnabled() ? 'NOW()' : "datetime('now')";
  const itineraryJson = data.itineraryProposal ? JSON.stringify(data.itineraryProposal) : null;

  const res = await execute(
    `INSERT INTO ai_chat_messages (session_id, role, content, itinerary_proposal, created_at)
     VALUES (?, ?, ?, ?, ${nowSql})`,
    [data.sessionId, data.role, data.content, itineraryJson]
  );

  // Update session updated_at
  await execute(
    `UPDATE ai_chat_sessions SET updated_at = ${nowSql} WHERE id = ?`,
    [data.sessionId]
  );

  // If user's first message, generate a 4-5 word title
  if (data.role === 'user') {
    const title = data.content.slice(0, 45).trim() + (data.content.length > 45 ? '...' : '');
    await execute(
      `UPDATE ai_chat_sessions SET title = ? WHERE id = ? AND (title = 'New Trip Plan' OR title = '')`,
      [title, data.sessionId]
    );
  }

  return res.insertId;
}

export async function getSessionMessages(sessionId: string, limit = 50): Promise<AIChatMessage[]> {
  return await query<AIChatMessage>(
    'SELECT * FROM ai_chat_messages WHERE session_id = ? ORDER BY id ASC LIMIT ?',
    [sessionId, limit]
  );
}

export async function rateChatMessage(messageId: number, feedback: number): Promise<boolean> {
  const res = await execute(
    'UPDATE ai_chat_messages SET feedback = ? WHERE id = ?',
    [feedback, messageId]
  );
  return res.affectedRows > 0;
}

// -------------------------------------------------------------
// 3. Guest & User Limits / Rate Limiting
// -------------------------------------------------------------

export interface RateLimitStatus {
  allowed: boolean;
  reason?: 'guest_limit_reached' | 'daily_limit_reached';
  currentCount: number;
  maxLimit: number;
}

export async function checkChatRateLimit(
  userId: number | null,
  guestToken: string | null
): Promise<RateLimitStatus> {
  const settings = await getAISettings();

  // Guest checking
  if (!userId) {
    if (!guestToken) {
      return { allowed: true, currentCount: 0, maxLimit: settings.guestMessageLimit };
    }

    const row = await queryOne<{ cnt: number }>(
      `SELECT COUNT(m.id) as cnt
       FROM ai_chat_messages m
       JOIN ai_chat_sessions s ON m.session_id = s.id
       WHERE s.guest_token = ? AND m.role = 'user'`,
      [guestToken]
    );

    const count = row ? Number(row.cnt) : 0;
    if (count >= settings.guestMessageLimit) {
      return {
        allowed: false,
        reason: 'guest_limit_reached',
        currentCount: count,
        maxLimit: settings.guestMessageLimit,
      };
    }
    return {
      allowed: true,
      currentCount: count,
      maxLimit: settings.guestMessageLimit,
    };
  }

  // Signed-in user checking (daily window)
  const todayCondition = isMySqlEnabled()
    ? 'm.created_at >= CURDATE()'
    : "date(m.created_at) = date('now')";

  const row = await queryOne<{ cnt: number }>(
    `SELECT COUNT(m.id) as cnt
     FROM ai_chat_messages m
     JOIN ai_chat_sessions s ON m.session_id = s.id
     WHERE s.user_id = ? AND m.role = 'user' AND ${todayCondition}`,
    [userId]
  );

  const count = row ? Number(row.cnt) : 0;
  if (count >= settings.userDailyLimit) {
    return {
      allowed: false,
      reason: 'daily_limit_reached',
      currentCount: count,
      maxLimit: settings.userDailyLimit,
    };
  }

  return {
    allowed: true,
    currentCount: count,
    maxLimit: settings.userDailyLimit,
  };
}

// -------------------------------------------------------------
// 4. Admin Settings, Prompt Versioning & Quality Review
// -------------------------------------------------------------

export async function getAISettings(): Promise<AISettings> {
  try {
    const rows = await query<{ key: string; value: string }>(
      "SELECT key, value FROM site_settings WHERE key LIKE 'ai_%'"
    );
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.key, r.value));

    const masterEnabled = map.get('ai_chatbot_enabled') !== '0';
    const model = map.get('ai_model') || 'gemini-2.5-flash';
    const storedApiKey = map.get('ai_gemini_api_key') || '';
    const hasApiKey = Boolean(storedApiKey || process.env.GEMINI_API_KEY);
    const guestLimit = parseInt(map.get('ai_guest_message_limit') || '2', 10);
    const userLimit = parseInt(map.get('ai_user_daily_limit') || '50', 10);
    const prompt = map.get('ai_system_prompt') || DEFAULT_AI_SYSTEM_PROMPT;

    let exampleQuestions = DEFAULT_EXAMPLE_QUESTIONS;
    const questionsRaw = map.get('ai_example_questions');
    if (questionsRaw) {
      try {
        exampleQuestions = JSON.parse(questionsRaw);
      } catch {
        exampleQuestions = DEFAULT_EXAMPLE_QUESTIONS;
      }
    }

    return {
      masterEnabled,
      model,
      hasApiKey,
      guestMessageLimit: isNaN(guestLimit) ? 2 : guestLimit,
      userDailyLimit: isNaN(userLimit) ? 50 : userLimit,
      systemPrompt: prompt,
      exampleQuestions,
    };
  } catch {
    return {
      masterEnabled: true,
      model: 'gemini-2.5-flash',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      guestMessageLimit: 2,
      userDailyLimit: 50,
      systemPrompt: DEFAULT_AI_SYSTEM_PROMPT,
      exampleQuestions: DEFAULT_EXAMPLE_QUESTIONS,
    };
  }
}

export async function getActualGeminiApiKey(): Promise<string> {
  try {
    const row = await queryOne<{ value: string }>(
      "SELECT value FROM site_settings WHERE key = 'ai_gemini_api_key'"
    );
    if (row && row.value && row.value.trim()) {
      return row.value.trim();
    }
  } catch {
    // fallback
  }
  return process.env.GEMINI_API_KEY || '';
}

export async function updateAISettings(
  settings: Partial<{
    masterEnabled: boolean;
    model: string;
    apiKey: string;
    guestMessageLimit: number;
    userDailyLimit: number;
    systemPrompt: string;
    exampleQuestions: { en: string; si: string }[];
  }>,
  adminUserId?: number | null
): Promise<boolean> {
  try {
    const upsertSetting = async (key: string, value: string) => {
      if (isMySqlEnabled()) {
        await execute(
          'INSERT INTO site_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
          [key, value]
        );
      } else {
        await execute(
          'INSERT INTO site_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
          [key, value]
        );
      }
    };

    if (settings.masterEnabled !== undefined) {
      await upsertSetting('ai_chatbot_enabled', settings.masterEnabled ? '1' : '0');
    }
    if (settings.model) {
      await upsertSetting('ai_model', settings.model.trim());
    }
    if (settings.apiKey !== undefined && settings.apiKey.trim()) {
      await upsertSetting('ai_gemini_api_key', settings.apiKey.trim());
    }
    if (settings.guestMessageLimit !== undefined) {
      await upsertSetting('ai_guest_message_limit', String(settings.guestMessageLimit));
    }
    if (settings.userDailyLimit !== undefined) {
      await upsertSetting('ai_user_daily_limit', String(settings.userDailyLimit));
    }
    if (settings.exampleQuestions) {
      await upsertSetting('ai_example_questions', JSON.stringify(settings.exampleQuestions));
    }

    if (settings.systemPrompt !== undefined) {
      const current = await getAISettings();
      if (settings.systemPrompt !== current.systemPrompt) {
        await upsertSetting('ai_system_prompt', settings.systemPrompt);

        // Record prompt version
        const lastVer = await queryOne<{ max_ver: number }>(
          'SELECT MAX(version_num) as max_ver FROM ai_prompt_versions'
        );
        const nextVer = (lastVer?.max_ver || 0) + 1;
        const nowSql = isMySqlEnabled() ? 'NOW()' : "datetime('now')";
        await execute(
          `INSERT INTO ai_prompt_versions (version_num, system_prompt, created_by, created_at)
           VALUES (?, ?, ?, ${nowSql})`,
          [nextVer, settings.systemPrompt, adminUserId || null]
        );
      }
    }

    return true;
  } catch (err) {
    console.error('updateAISettings error:', err);
    return false;
  }
}

export async function getPromptVersions(): Promise<AIPromptVersion[]> {
  return await query<AIPromptVersion>(
    'SELECT * FROM ai_prompt_versions ORDER BY version_num DESC LIMIT 15'
  );
}

export async function getChatLogsForAdmin(limit = 60): Promise<{
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  message_count: number;
  last_message: string;
}[]> {
  const sql = `
    SELECT s.id, s.title, s.created_at, s.updated_at,
           COALESCE(u.name, 'Guest Traveler') as user_name,
           COALESCE(u.email, 'guest@uncoverceylon.com') as user_email,
           (SELECT COUNT(m.id) FROM ai_chat_messages m WHERE m.session_id = s.id) as message_count,
           (SELECT m2.content FROM ai_chat_messages m2 WHERE m2.session_id = s.id ORDER BY m2.id DESC LIMIT 1) as last_message
    FROM ai_chat_sessions s
    LEFT JOIN users u ON s.user_id = u.id
    ORDER BY s.updated_at DESC
    LIMIT ?
  `;
  return await query(sql, [limit]);
}

export async function getAIUsageStats(): Promise<{
  totalSessions: number;
  totalMessages: number;
  guestConversations: number;
  helpfulCount: number;
  unhelpfulCount: number;
}> {
  const sessRow = await queryOne<{ cnt: number }>('SELECT COUNT(id) as cnt FROM ai_chat_sessions');
  const msgRow = await queryOne<{ cnt: number }>('SELECT COUNT(id) as cnt FROM ai_chat_messages WHERE role = "user"');
  const guestRow = await queryOne<{ cnt: number }>('SELECT COUNT(id) as cnt FROM ai_chat_sessions WHERE user_id IS NULL');
  const helpfulRow = await queryOne<{ cnt: number }>('SELECT COUNT(id) as cnt FROM ai_chat_messages WHERE feedback = 1');
  const unhelpfulRow = await queryOne<{ cnt: number }>('SELECT COUNT(id) as cnt FROM ai_chat_messages WHERE feedback = -1');

  return {
    totalSessions: sessRow ? Number(sessRow.cnt) : 0,
    totalMessages: msgRow ? Number(msgRow.cnt) : 0,
    guestConversations: guestRow ? Number(guestRow.cnt) : 0,
    helpfulCount: helpfulRow ? Number(helpfulRow.cnt) : 0,
    unhelpfulCount: unhelpfulRow ? Number(unhelpfulRow.cnt) : 0,
  };
}
