/**
 * src/app/api/chat/route.ts
 * Streaming AI Chatbot endpoint for UncoverCeylon.
 * - Handles rate limits (2 messages for guests, daily limit for users)
 * - Injects page context (e.g. current destination)
 * - Streams output chunks directly to client
 * - Extracts and saves structured itinerary proposals
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getAISettings,
  checkChatRateLimit,
  getOrCreateSession,
  saveChatMessage,
  getSessionMessages,
} from '@/lib/db/ai';
import { streamGeminiChat } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const settings = await getAISettings();
    if (!settings.masterEnabled) {
      return NextResponse.json(
        { error: 'The AI Travel Assistant is currently taking a short rest. Please check back soon!' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const sessionId = typeof body.sessionId === 'string' && body.sessionId ? body.sessionId : `uc_ai_${Date.now()}`;
    const guestToken = typeof body.guestToken === 'string' ? body.guestToken : null;
    const pageContext = body.pageContext || undefined;

    if (!message) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    const userId = user ? user.id : null;

    // Check rate limit (guests: 2 messages, signed-in users: daily limit)
    const rateStatus = await checkChatRateLimit(userId, guestToken);
    if (!rateStatus.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit reached',
          reason: rateStatus.reason,
          currentCount: rateStatus.currentCount,
          maxLimit: rateStatus.maxLimit,
          isGuest: !userId,
        },
        { status: 429 }
      );
    }

    // Ensure session exists
    await getOrCreateSession(sessionId, userId, guestToken);

    // Save user message
    await saveChatMessage({
      sessionId,
      role: 'user',
      content: message,
    });

    // Retrieve previous turns in this session for context
    const history = await getSessionMessages(sessionId, 8);
    const messagesForAI = history.map((h) => ({
      role: h.role,
      content: h.content,
    }));

    // Start streaming from Gemini
    const geminiStream = await streamGeminiChat({
      messages: messagesForAI,
      pageContext,
    });

    // Tap stream to collect full response and save to database on finish
    const reader = geminiStream.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    const transformedStream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();

            // Extract itinerary proposal if present
            let proposalData: unknown = null;
            const itineraryMatch = accumulatedText.match(/```itinerary\s*([\s\S]*?)\s*```/);
            if (itineraryMatch && itineraryMatch[1]) {
              try {
                proposalData = JSON.parse(itineraryMatch[1]);
              } catch (e) {
                console.warn('Failed to parse itinerary JSON:', e);
              }
            }

            // Save assistant message to database
            if (accumulatedText.trim()) {
              await saveChatMessage({
                sessionId,
                role: 'model',
                content: accumulatedText,
                itineraryProposal: proposalData,
              });
            }
            return;
          }

          accumulatedText += decoder.decode(value, { stream: true });
          controller.enqueue(value);
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(transformedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-Session-ID': sessionId,
      },
    });
  } catch (err) {
    console.error('API /api/chat error:', err);
    return NextResponse.json({ error: 'Internal assistant error.' }, { status: 500 });
  }
}
