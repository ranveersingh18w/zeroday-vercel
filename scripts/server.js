// ============================================================================
// ZERO-DAY SIH26145 — Local Development API Server
// ============================================================================
// Runs the Vercel serverless functions locally at http://localhost:3000
// Endpoints:
//   - POST/GET http://localhost:3000/api/create-alert
//   - GET/POST http://localhost:3000/api/alerts
// ============================================================================

const http = require('http');
const path = require('path');
const createAlertHandler = require('../api/create-alert');
const alertsHandler = require('../api/alerts');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  // Attach Express/Vercel style helpers
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data, null, 2));
    return res;
  };

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    if (body) {
      try {
        req.body = JSON.parse(body);
      } catch {
        req.body = body;
      }
    } else {
      req.body = {};
    }

    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${req.method} ${parsedUrl.pathname}`);

    try {
      if (parsedUrl.pathname === '/api/create-alert') {
        await createAlertHandler(req, res);
      } else if (parsedUrl.pathname === '/api/alerts') {
        await alertsHandler(req, res);
      } else {
        res.status(404).json({
          error: 'Not Found',
          available_endpoints: [
            'POST /api/create-alert',
            'GET /api/create-alert',
            'GET /api/alerts',
            'POST /api/alerts',
          ],
        });
      }
    } catch (err) {
      console.error(`[API Error]`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n============================================================`);
  console.log(`🛡️ ZERO-DAY Local API Server is LIVE on http://localhost:${PORT}`);
  console.log(`============================================================`);
  console.log(`👉 Test with cURL (Zero Info):`);
  console.log(`   curl -X POST http://localhost:${PORT}/api/create-alert`);
  console.log(`\n👉 Test in Browser:`);
  console.log(`   http://localhost:${PORT}/api/create-alert`);
  console.log(`============================================================\n`);
});
