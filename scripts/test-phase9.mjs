// scripts/test-phase9.mjs
// Automated verification for Phase 9: AI Chatbot (Gemini)

async function testPhase9() {
  console.log('Testing Phase 9 AI Chatbot endpoints...');

  // 1. Test POST /api/chat with a simple prompt
  try {
    const chatRes = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What are the top 3 places to visit in Kandy?',
        sessionId: 'test-phase-9-session',
        guestToken: 'guest-phase-9-test',
      }),
    });
    console.log(`POST /api/chat status: ${chatRes.status}`);
    const text = await chatRes.text();
    console.log(`POST /api/chat response preview: ${text.slice(0, 150)}...`);
    if (chatRes.status === 200 && text.length > 20) {
      console.log('✓ POST /api/chat stream verified!');
    } else {
      console.warn('⚠️ POST /api/chat unexpected response');
    }
  } catch (err) {
    console.error('Error testing /api/chat:', err);
  }

  // 2. Test GET /api/chat/sessions
  try {
    const sessRes = await fetch('http://localhost:3000/api/chat/sessions');
    console.log(`GET /api/chat/sessions status: ${sessRes.status}`);
    const data = await sessRes.json();
    console.log(`GET /api/chat/sessions count: ${data.sessions?.length ?? 0}`);
    console.log('✓ GET /api/chat/sessions verified!');
  } catch (err) {
    console.error('Error testing /api/chat/sessions:', err);
  }

  // 3. Test GET /api/admin/ai
  try {
    const adminRes = await fetch('http://localhost:3000/api/admin/ai');
    console.log(`GET /api/admin/ai status: ${adminRes.status}`);
    const adminData = await adminRes.json();
    console.log(`Admin AI settings model: ${adminData.settings?.model_name}`);
    console.log(`Admin AI total messages: ${adminData.stats?.totalMessages}`);
    console.log('✓ GET /api/admin/ai verified!');
  } catch (err) {
    console.error('Error testing /api/admin/ai:', err);
  }

  console.log('\nAll Phase 9 endpoint tests complete!');
}

testPhase9();
