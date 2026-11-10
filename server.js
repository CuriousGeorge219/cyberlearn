// Minimal local server for CyberLearn.
// Usage: node server.js   (or: npm start)
// Then open http://localhost:8080

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = path.join(__dirname, 'public');

// OmniRoute endpoint for the AI tutor (local dev only — production uses chat-worker.js).
const OMNIROUTE_BASE_URL = process.env.OMNIROUTE_BASE_URL || 'http://127.0.0.1:20128';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // AI tutor proxy: forward /chat to OmniRoute (adds CORS for safety).
  if (urlPath === '/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', async () => {
      try {
        const upstream = await fetch(OMNIROUTE_BASE_URL + '/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        const text = await upstream.text();
        res.writeHead(upstream.status, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(text);
      } catch (e) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'Upstream error: ' + (e.message || e) } }));
      }
    });
    return;
  }
  if (urlPath === '/chat' && req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end();
    return;
  }

  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('CyberLearn is running:');
  console.log(`  ➜  http://localhost:${PORT}`);
  console.log('  (press Ctrl+C to stop)');
});
