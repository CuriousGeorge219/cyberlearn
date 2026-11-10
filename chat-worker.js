// CyberLearn — AI Tutor chat proxy (Cloudflare Worker)
// Proxies chat requests from the browser to an OpenAI-compatible endpoint
// (OpenRouter by default), keeping the API key server-side and falling back
// across a list of free models if one is rate-limited or unavailable.
//
// Endpoints:
//   POST /chat  { messages: [...], model?, temperature?, max_tokens? }
//
// Config:
//   [vars]  LLM_BASE_URL   e.g. https://openrouter.ai/api/v1
//   [vars]  LLM_MODEL      preferred model (optional)
//   secret  LLM_API_KEY    provider API key (e.g. sk-or-...)
//
// Deployment: `npx wrangler deploy -c wrangler.chat.toml`

// All currently-free models on OpenRouter, most-capable first. Tried in order;
// the router falls through when one is rate-limited or unavailable.
const FALLBACK_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'xingchen-agi/xing4.0-29b-a4b:free',
  'cohere/north-mini-code:free',
  'nvidia/nemotron-3.5-lightning:free',
  'dots-studio/dots-3-note-preview:free',
  'nvidia/nemotron-3.5-super-vl:free',
  'thinkingmachines/inkling-2-small:free',
  'recursive/flint-v1.0:free',
  'liquid/lfm-2.5-2.6b:free',
  'liquid/lfm-3-1.7b:free',
];

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

    // LLM_BASE_URL includes the /v1 prefix (OpenAI-style base URL); we append the route.
    const base = (env.LLM_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/+$/, '');

    let body;
    try { body = await request.json(); } catch { /* handled below */ }
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      return cors(JSON.stringify({ error: { message: 'Invalid request: expected { messages: [...] }.' } }), 400, { 'Content-Type': 'application/json' });
    }

    // Build the ordered model list: requested (if real) -> preferred -> fallbacks.
    const models = [];
    const requested = body.model;
    if (requested && requested !== 'auto') models.push(requested);
    if (env.LLM_MODEL) models.push(env.LLM_MODEL);
    for (const m of FALLBACK_MODELS) if (!models.includes(m)) models.push(m);

    const headers = {
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cyberlearn-1t7.pages.dev',
      'X-Title': 'CyberLearn AI Tutor',
    };
    if (env.LLM_API_KEY) headers['Authorization'] = 'Bearer ' + env.LLM_API_KEY;

    let lastErr = { message: 'No model available' };
    let lastStatus = 502;

    for (const model of models) {
      const payload = {
        model,
        messages: body.messages,
        temperature: typeof body.temperature === 'number' ? body.temperature : 0.4,
        max_tokens: body.max_tokens || 1024,
      };
      try {
        const upstream = await fetch(base + '/chat/completions', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        const text = await upstream.text();
        if (upstream.ok) {
          return cors(text, upstream.status, { 'Content-Type': 'application/json' });
        }
        lastStatus = upstream.status;
        let msg = text;
        try { msg = (JSON.parse(text).error && JSON.parse(text).error.message) || text; } catch { /* keep raw text */ }
        lastErr = { message: msg, model };
      } catch (e) {
        lastStatus = 502;
        lastErr = { message: e.message || String(e), model };
      }
    }

    return cors(JSON.stringify({ error: lastErr }), lastStatus, { 'Content-Type': 'application/json' });
  },
};
