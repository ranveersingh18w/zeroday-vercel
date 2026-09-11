// ============================================================================
// ZERO-DAY SIH26145 — Vercel Serverless API: /api/alerts
// ============================================================================
// REST endpoint for alerts:
//   - POST: Create an alert row (with or without custom fields)
//   - GET ?create=true: Quickly create an alert row via GET
//   - GET: Query the latest 50 alerts from Supabase
// ============================================================================

const createAlertHandler = require('./create-alert');

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://czvjvwtvmyvajhlbwrud.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dmp2d3R2bXl2YWpobGJ3cnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDgxNzMsImV4cCI6MjEwNDU4NDE3M30.xNtvspUnHzaUGwD2DgHybHc64Xz52Ahd_dK3tcBvmjI';

module.exports = async function handler(req, res) {
  // Universal CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // If POST, or GET with create=true or action=create, forward to create handler
  if (req.method === 'POST' || (req.method === 'GET' && (req.query?.create === 'true' || req.query?.action === 'create'))) {
    return createAlertHandler(req, res);
  }

  // Otherwise, handle GET to fetch alerts
  if (req.method === 'GET') {
    try {
      const limit = Math.min(100, parseInt(req.query?.limit || '50', 10));
      const supabaseEndpoint = `${SUPABASE_URL}/rest/v1/alerts?select=*&order=timestamp.desc&limit=${limit}`;

      const response = await fetch(supabaseEndpoint, {
        method: 'GET',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text();
        res.status(500).json({ success: false, error: 'Failed to fetch alerts', details: errText });
        return;
      }

      const alerts = await response.json();
      res.status(200).json({ success: true, count: alerts.length, alerts });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error', details: err.message || String(err) });
    }
    return;
  }

  res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
};
