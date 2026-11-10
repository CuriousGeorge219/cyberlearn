// CyberLearn — Cloudflare Worker for cross-device progress sync.
// Stores one JSON progress bundle per "sync key" in Cloudflare KV.
//
// Endpoints (your sync key is the secret — keep it long and random):
//   GET  /sync?key=YOUR_SYNC_KEY          -> returns stored progress (404 if none)
//   PUT  /sync?key=YOUR_SYNC_KEY  (JSON)  -> saves progress
//
// Deployment: `npx wrangler deploy`  (see README)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function cors(body, status = 200, extra = {}) {
  return new Response(body, { status, headers: { ...CORS, ...extra } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/sync') return cors('Not found', 404);

    // CORS preflight
    if (request.method === 'OPTIONS') return cors(null, 204);

    const key = (url.searchParams.get('key') || '').trim();
    if (key.length < 8) return cors('Invalid or missing sync key', 400);
    const kvKey = 'progress:' + key;

    if (request.method === 'GET') {
      const val = await env.PROGRESS.get(kvKey);
      if (val === null) return cors('null', 404);
      return cors(val, 200, { 'Content-Type': 'application/json' });
    }

    if (request.method === 'PUT') {
      const body = await request.text();
      if (body.length > 10_000_000) return cors('Payload too large', 413);
      // basic sanity: must be JSON
      try { JSON.parse(body); } catch { return cors('Invalid JSON', 400); }
      await env.PROGRESS.put(kvKey, body);
      return cors('ok', 200, { 'Content-Type': 'application/json' });
    }

    return cors('Method not allowed', 405);
  },
};
