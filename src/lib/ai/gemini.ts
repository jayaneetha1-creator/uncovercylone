/**
 * src/lib/ai/gemini.ts
 * Server-side Google Gemini client for UncoverCeylon.
 * - Dynamic system instructions with page context
 * - Function calling / tool execution with whitelisted database queries
 * - Streaming responses with SSE
 * - Fallback handler when no Gemini key is configured
 */

import {
  getAISettings,
  getActualGeminiApiKey,
  searchPlacesTool,
  getPlaceDetailsTool,
  getNearbyPlacesTool,
  filterPlacesTool,
  PlaceSummaryToolResult,
} from '../db/ai';

// Gemini Function Declarations Schema
const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_places',
        description: 'Search for published Sri Lanka destinations, beaches, waterfalls, temples, or towns by keyword, category, or province.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: {
              type: 'STRING',
              description: 'Search keywords, destination names, or attractions (e.g. "Sigiriya", "Ella", "surf", "tea")',
            },
            category: {
              type: 'STRING',
              description: 'Optional category filter: Beaches, Waterfalls, Mountains, Ancient Sites, Wildlife, Hidden Gems, Historical, Religious Places',
            },
            province: {
              type: 'STRING',
              description: 'Optional Sri Lankan province filter: Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_place_details',
        description: 'Get complete verified details about a specific Sri Lankan place by name or ID (entry fee, best season, location, insider tips).',
        parameters: {
          type: 'OBJECT',
          properties: {
            idOrName: {
              type: 'STRING',
              description: 'The place ID or destination name (e.g. "Sigiriya Rock Fortress" or "42")',
            },
          },
          required: ['idOrName'],
        },
      },
      {
        name: 'get_nearby_places',
        description: 'Find places and attractions within a geographic radius of given latitude and longitude coordinates.',
        parameters: {
          type: 'OBJECT',
          properties: {
            lat: { type: 'NUMBER', description: 'Latitude coordinate' },
            lng: { type: 'NUMBER', description: 'Longitude coordinate' },
            radiusKm: { type: 'NUMBER', description: 'Radius in kilometers (default 30km)' },
          },
          required: ['lat', 'lng'],
        },
      },
      {
        name: 'filter_places',
        description: 'Filter places by category, travel season, or province when a user asks for recommendations.',
        parameters: {
          type: 'OBJECT',
          properties: {
            category: { type: 'STRING', description: 'Beaches, Mountains, Waterfalls, Wildlife, etc.' },
            season: { type: 'STRING', description: 'Month or season (e.g. "December", "Yala Monsoon", "Dry season")' },
            province: { type: 'STRING', description: 'Province name' },
          },
        },
      },
    ],
  },
];

export interface ChatMessageInput {
  role: 'user' | 'model' | 'assistant' | 'system';
  content: string;
}

export interface StreamGenerationOptions {
  messages: ChatMessageInput[];
  pageContext?: {
    placeId?: number;
    placeName?: string;
    category?: string;
    path?: string;
  };
  overridePrompt?: string;
  overrideModel?: string;
}

/**
 * Executes a whitelisted tool function safely.
 */
async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_places': {
      const q = typeof args.query === 'string' ? args.query : '';
      const cat = typeof args.category === 'string' ? args.category : undefined;
      const prov = typeof args.province === 'string' ? args.province : undefined;
      return await searchPlacesTool(q, cat, prov);
    }
    case 'get_place_details': {
      const target = String(args.idOrName || '');
      const place = await getPlaceDetailsTool(target);
      if (!place) return { error: `Place "${target}" not found in database.` };
      return {
        id: place.id,
        name: place.name,
        location: place.location,
        province: place.province,
        category: place.category,
        rating: place.rating,
        review_count: place.review_count,
        best_time: place.best_time,
        entry_fee: place.entry_fee,
        tips: place.tips,
        short_description: place.short_description,
        coordinates: { lat: place.lat, lng: place.lng },
      };
    }
    case 'get_nearby_places': {
      const lat = Number(args.lat);
      const lng = Number(args.lng);
      const radius = Number(args.radiusKm) || 30;
      return await getNearbyPlacesTool(lat, lng, radius);
    }
    case 'filter_places': {
      const cat = typeof args.category === 'string' ? args.category : undefined;
      const sea = typeof args.season === 'string' ? args.season : undefined;
      const prov = typeof args.province === 'string' ? args.province : undefined;
      return await filterPlacesTool(cat, sea, prov);
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/**
 * Builds the full system instruction with page context injected.
 */
function buildSystemInstruction(basePrompt: string, pageContext?: StreamGenerationOptions['pageContext']): string {
  let instruction = basePrompt.trim();

  if (pageContext?.placeName) {
    instruction += `\n\nCURRENT PAGE CONTEXT:\nThe traveler is currently viewing the page for "${pageContext.placeName}" (Category: ${pageContext.category || 'Destination'}, ID: ${pageContext.placeId || 'N/A'}). If their question relates to "here" or "this place", tailor your answer specifically to ${pageContext.placeName}.`;
  } else if (pageContext?.path) {
    instruction += `\n\nCURRENT PAGE CONTEXT:\nThe traveler is browsing ${pageContext.path}.`;
  }

  return instruction;
}

/**
 * Formats messages into Gemini API content format.
 */
function formatGeminiContents(messages: ChatMessageInput[]) {
  return messages.map((m) => ({
    role: m.role === 'assistant' || m.role === 'system' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

/**
 * Creates an intelligent local fallback stream when no Gemini API key is configured.
 */
function createFallbackStream(userQuery: string, pageContext?: StreamGenerationOptions['pageContext']): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let reply = '';
      const lower = userQuery.toLowerCase();

      // Basic keyword search in database
      let matchedPlaces: PlaceSummaryToolResult[] = [];
      if (pageContext?.placeName) {
        const p = await getPlaceDetailsTool(pageContext.placeName);
        if (p) matchedPlaces = [p];
      }
      if (matchedPlaces.length === 0) {
        matchedPlaces = await searchPlacesTool(userQuery);
      }

      if (lower.includes('hello') || lower.includes('hi') || lower.includes('ayubowan')) {
        reply = `**Ayubowan! 🙏 Welcome to UncoverCeylon.**\n\nI am your intelligent Sri Lanka travel companion. Whether you are looking for secluded sandy beaches, misty highland tea trails, ancient sacred temples, or wildlife safaris, I am here to help you design an unforgettable journey.\n\n`;
        if (pageContext?.placeName) {
          reply += `I see you are exploring **${pageContext.placeName}**. Would you like insider tips, best times to visit, or nearby highlights?\n\n`;
        } else {
          reply += `What kind of adventure are you dreaming of today?\n\n`;
        }
      } else if (lower.includes('itinerary') || lower.includes('plan') || lower.includes('days') || lower.includes('trip')) {
        reply = `### 🌴 Curated Ceylon Journey Proposal\n\nHere is a balanced and scenic travel sequence crafted for you:\n\n- **Day 1**: Arrival in Colombo / Negombo beach coastal sunset.\n- **Day 2**: Cultural Triangle — Sigiriya Rock Fortress & Minneriya National park.\n- **Day 3**: Kandy — Sacred Temple of the Tooth & Royal Botanical Gardens.\n- **Day 4**: Scenic Blue Train to Ella — Nine Arch Bridge & Little Adam's Peak.\n\n\`\`\`itinerary\n{\n  "title": "Essential Island Circuit (4 Days)",\n  "days": [\n    {\n      "day": 1,\n      "title": "Coastal Arrival",\n      "places": [\n        { "id": 1, "name": "Colombo Promenade", "notes": "Relax after flight" }\n      ],\n      "travelTime": "1 hour from BIA airport"\n    },\n    {\n      "day": 2,\n      "title": "Ancient Marvels",\n      "places": [\n        { "id": 61, "name": "Sigiriya Rock Fortress", "notes": "Early morning climb" }\n      ],\n      "travelTime": "3.5 hours drive to Sigiriya"\n    },\n    {\n      "day": 3,\n      "title": "Hill Country Heritage",\n      "places": [\n        { "id": 65, "name": "Temple of the Sacred Tooth Relic", "notes": "Evening pooja ceremony" }\n      ],\n      "travelTime": "2.5 hours scenic drive to Kandy"\n    },\n    {\n      "day": 4,\n      "title": "Misty Peaks & Bridges",\n      "places": [\n        { "id": 68, "name": "Nine Arch Bridge", "notes": "Afternoon train spotting" }\n      ],\n      "travelTime": "6 hours scenic highland train journey"\n    }\n  ]\n}\n\`\`\`\n\n*(Note: For real-time AI live reasoning with Gemini 2.5 Flash, the administrator can enter a Gemini API Key in the Admin AI Chatbot Tab.)*`;
      } else if (matchedPlaces.length > 0) {
        const top = matchedPlaces[0];
        reply = `### ✨ Spotlight: **${top.name}**\n\n- **Region**: ${top.location} (${top.province})\n- **Category**: ${top.category}\n- **Rating**: ⭐ ${top.rating ? top.rating.toFixed(1) : '4.8'} / 5.0\n- **Best Season**: ${top.best_time || 'November to April'}\n- **Entry**: ${top.entry_fee || 'Free admission'}\n\n${top.short_description}\n\nWould you like recommendations for stays, nearby attractions, or transport directions?`;
      } else {
        reply = `Sri Lanka is blessed with stunning diversity! From the golden beaches of Mirissa and Trincomalee to the cool heights of Horton Plains and Ella, every region offers a unique charm.\n\nCould you tell me a little more about your travel style? For example:\n- Are you traveling solo, as a couple, or with family?\n- Do you prefer wildlife safaris, hiking, culture, or beach relaxation?`;
      }

      // Simulate streaming chunks
      const words = reply.split(' ');
      for (let i = 0; i < words.length; i += 3) {
        const chunk = words.slice(i, i + 3).join(' ') + ' ';
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 20));
      }
      controller.close();
    },
  });
}

/**
 * Main streaming generator communicating with Gemini API via REST with function calling.
 */
export async function streamGeminiChat(options: StreamGenerationOptions): Promise<ReadableStream<Uint8Array>> {
  const settings = await getAISettings();
  const apiKey = await getActualGeminiApiKey();

  const userQuery = options.messages[options.messages.length - 1]?.content || '';

  // Fallback if no API key is provided
  if (!apiKey) {
    return createFallbackStream(userQuery, options.pageContext);
  }

  const model = options.overrideModel || settings.model || 'gemini-2.5-flash';
  const systemInstruction = buildSystemInstruction(
    options.overridePrompt || settings.systemPrompt,
    options.pageContext
  );

  const contents: Array<{
    role: string;
    parts: Array<Record<string, unknown>>;
  }> = formatGeminiContents(options.messages);

  const requestBody: Record<string, unknown> = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    tools: GEMINI_TOOLS,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  // Step 1: Initial call to check for function calls
  const initialUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  let initialRes: Response;
  try {
    initialRes = await fetch(initialUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    console.error('Gemini initial fetch failed:', err);
    return createFallbackStream(userQuery, options.pageContext);
  }

  if (!initialRes.ok) {
    const errText = await initialRes.text();
    console.warn(`Gemini API returned ${initialRes.status}: ${errText}. Using fallback assistant.`);
    return createFallbackStream(userQuery, options.pageContext);
  }

  const initialData = await initialRes.json();
  const candidate = initialData.candidates?.[0];
  const functionCalls = candidate?.content?.parts?.filter(
    (p: { functionCall?: { name: string; args: Record<string, unknown> } }) => p.functionCall
  );

  // If Gemini requested tools/function calls, execute them and build the next turn
  if (functionCalls && functionCalls.length > 0) {
    // Append model's tool calls to contents
    contents.push({
      role: 'model',
      parts: candidate.content.parts,
    });

    // Execute each tool and append function responses
    const responseParts: Array<Record<string, unknown>> = [];
    for (const part of functionCalls) {
      const call = part.functionCall;
      const result = await executeTool(call.name, call.args || {});
      responseParts.push({
        functionResponse: {
          name: call.name,
          response: { result },
        },
      });
    }

    contents.push({
      role: 'user',
      parts: responseParts,
    });

    requestBody.contents = contents;
  }

  // Step 2: Stream the final response using streamGenerateContent
  const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  let streamRes: Response;
  try {
    streamRes = await fetch(streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
    console.error('Gemini stream fetch failed:', err);
    return createFallbackStream(userQuery, options.pageContext);
  }

  if (!streamRes.ok || !streamRes.body) {
    return createFallbackStream(userQuery, options.pageContext);
  }

  // Transform Gemini SSE stream into plain text chunks
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = streamRes.body.getReader();

  return new ReadableStream({
    async start(controller) {
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const jsonStr = trimmed.slice(6);
              if (jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        if (buffer.trim().startsWith('data: ')) {
          try {
            const parsed = JSON.parse(buffer.trim().slice(6));
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) controller.enqueue(encoder.encode(text));
          } catch {
            // End of stream
          }
        }
      } catch (err) {
        console.error('Error during Gemini stream processing:', err);
      } finally {
        controller.close();
      }
    },
  });
}
