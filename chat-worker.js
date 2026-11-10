// CyberLearn — AI Tutor chat proxy (Cloudflare Worker)
// Proxies chat requests from the browser to an OmniRoute OpenAI-compatible
// endpoint, keeping the base URL and API key server-side (never exposed to
// the client).
//
// Endpoints:
//   POST /chat  { messages: [...], model?, temperature?, max_tokens? }
//       -> forwards to OMNIROUTE_BASE_URL + '/v1/chat/completions'
//
// Secrets (set via `wrangler secret put`):
//   OMNIROUTE_BASE_URL   e.g. https://your-omniroute-host (no trailing slash)
//   OMNIROUTE_API_KEY    (optional) the OmniRoute server key, if REQUIRE_API_KEY is on
//
// Deployment: `npx wrangler deploy`  (see wrangler.toml)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function cors(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...CORS, ...extra } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/chat') return cors('Not found', 404);
    if (request.method === 'OPTIONS') return cors(null, 204);
    if (request.method !== 'POST') return cors('Method not allowed', 405);

    const base = (env.OMNIROUTE_BASE_URL || '').replace(/\/+$/, '');
    if (!base) {
      return cors(JSON.stringify({ error: { message: 'Server not configured (missing OMNIROUTE_BASE_URL).' } }), 500, { 'Content-Type': 'application/json' });
    }

    let body;
    try { body = await request.json(); } catch { /* handled below */ }
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return cors(JSON.stringify({ error: { message: 'Invalid request: expected { messages: [...] }.' } }), 400, { 'Content-Type': 'application/json' });
    }

    const payload = {
      model: body.model || 'auto',
      messages: body.messages,
      temperature: typeof body.temperature === 'number' ? body.temperature : 0.4,
      max_tokens: body.max_tokens || 1024,
      stream: false,
    };

    const headers = { 'Content-Type': 'application/json' };
    if (env.OMNIROUTE_API_KEY) headers['Authorization'] = 'Bearer ' + env.OMNIROUTE_API_KEY;

    try {
      const upstream = await fetch(base + '/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const text = await upstream.text();
      return cors(text, upstream.status, { 'Content-Type': 'application/json' });
    } catch (e) {
      return cors(JSON.stringify({ error: { message: 'Upstream error: ' + (e.message || String(e)) } }), 502, { 'Content-Type': 'application/json' });
    }
  },
};
