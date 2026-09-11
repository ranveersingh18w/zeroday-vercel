// ============================================================================
// ZERO-DAY SIH26145 — Vercel Serverless API: /api/create-alert
// ============================================================================
// Creates a new alert row in Supabase with ZERO required parameters.
// Call with empty JSON {} or via GET/POST from Python, JS, curl, or browser.
// ============================================================================

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://czvjvwtvmyvajhlbwrud.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dmp2d3R2bXl2YWpobGJ3cnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDgxNzMsImV4cCI6MjEwNDU4NDE3M30.xNtvspUnHzaUGwD2DgHybHc64Xz52Ahd_dK3tcBvmjI';

const PRESET_SCENARIOS = [
  {
    threat_class: 'botnet_c2_beacon',
    sih_category: 'Botnet C2 Beaconing',
    severity: 'HIGH',
    protocol: 'TCP',
    src_ip: '10.0.0.50',
    dst_ip: '185.234.72.10',
    reason: 'Periodic outbound beaconing detected to suspected C2 node',
  },
  {
    threat_class: 'data_exfiltration',
    sih_category: 'Data Exfiltration',
    severity: 'CRITICAL',
    protocol: 'TCP',
    src_ip: '10.0.4.102',
    dst_ip: '93.184.216.34',
    reason: 'Asymmetric high-volume outbound data transfer detected',
  },
  {
    threat_class: 'dga_domains',
    sih_category: 'DGA / DNS Tunnelling',
    severity: 'MEDIUM',
    protocol: 'DNS',
    src_ip: '10.0.1.15',
    dst_ip: '8.8.8.8',
    reason: 'High-entropy algorithmically generated domain resolution query',
  },
  {
    threat_class: 'dns_tunnelling',
    sih_category: 'DGA / DNS Tunnelling',
    severity: 'HIGH',
    protocol: 'DNS',
    src_ip: '10.0.1.20',
    dst_ip: '1.1.1.1',
    reason: 'Data encoding detected in DNS query labels and TXT records',
  },
  {
    threat_class: 'encrypted_malware',
    sih_category: 'Malicious Encrypted Sessions',
    severity: 'HIGH',
    protocol: 'TLS',
    src_ip: '10.0.3.44',
    dst_ip: '104.21.55.2',
    reason: 'JA3/JA4 fingerprint anomaly in TLS handshake metadata',
  },
  {
    threat_class: 'volumetric_ddos',
    sih_category: 'Volumetric / Protocol DDoS',
    severity: 'CRITICAL',
    protocol: 'TCP',
    src_ip: '198.51.100.42',
    dst_ip: '10.0.0.2',
    reason: 'Severe SYN packet rate anomaly exceeding 1450 pps threshold',
  },
  {
    threat_class: 'reconnaissance_port_scan',
    sih_category: 'Reconnaissance / Port Scanning',
    severity: 'MEDIUM',
    protocol: 'TCP',
    src_ip: '45.33.32.156',
    dst_ip: '10.0.0.5',
    reason: 'Horizontal port scan traversing sequential destination ports',
  },
];

function getCategoryForThreat(threatClass) {
  const tc = (threatClass || '').toLowerCase();
  if (tc.includes('c2') || tc.includes('beacon') || tc.includes('botnet')) return 'Botnet C2 Beaconing';
  if (tc.includes('exfil') || tc.includes('leak') || tc.includes('data')) return 'Data Exfiltration';
  if (tc.includes('dns') || tc.includes('dga') || tc.includes('tunnel')) return 'DGA / DNS Tunnelling';
  if (tc.includes('tls') || tc.includes('encrypt') || tc.includes('session')) return 'Malicious Encrypted Sessions';
  if (tc.includes('scan') || tc.includes('recon') || tc.includes('probe')) return 'Reconnaissance / Port Scanning';
  if (tc.includes('ddos') || tc.includes('flood') || tc.includes('syn') || tc.includes('volumetric')) return 'Volumetric / Protocol DDoS';
  return 'Volumetric / Protocol DDoS';
}

function buildAlertPayload(input = {}) {
  // Select a preset scenario template as base
  const randomScenario = PRESET_SCENARIOS[Math.floor(Math.random() * PRESET_SCENARIOS.length)];
  const randomHex = Math.random().toString(36).substring(2, 8);
  const now = new Date().toISOString();

  const threatClass = input.threat_class || input.threatClass || randomScenario.threat_class;
  const sihCategory =
    input.sih_category ||
    input.sihCategory ||
    (input.threat_class ? getCategoryForThreat(input.threat_class) : randomScenario.sih_category);

  const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  let severity = (input.severity || randomScenario.severity || 'HIGH').toUpperCase();
  if (!validSeverities.includes(severity)) severity = 'HIGH';

  let confidence = 0.92;
  if (typeof input.confidence === 'number') {
    confidence = Math.min(1.0, Math.max(0.0, input.confidence));
  } else if (input.confidence) {
    const parsed = parseFloat(input.confidence);
    confidence = isNaN(parsed) ? 0.92 : Math.min(1.0, Math.max(0.0, parsed));
  } else {
    confidence = parseFloat((0.85 + Math.random() * 0.14).toFixed(3));
  }

  const validStatuses = ['New', 'Investigating', 'Acknowledged', 'Resolved', 'Dismissed'];
  let status = input.status || 'New';
  if (!validStatuses.includes(status)) status = 'New';

  const protocol = (input.protocol || randomScenario.protocol || 'TCP').toUpperCase();

  return {
    alert_id: input.alert_id || input.id || `alt-${randomHex}-${Date.now().toString(36)}`,
    timestamp: input.timestamp || now,
    flow_id: input.flow_id || input.flowId || `fl-${randomHex}`,
    src_ip: input.src_ip || input.src || input.source_ip || randomScenario.src_ip,
    dst_ip: input.dst_ip || input.dst || input.destination_ip || randomScenario.dst_ip,
    src_port: parseInt(input.src_port || input.source_port || Math.floor(1024 + Math.random() * 64000), 10),
    dst_port: parseInt(input.dst_port || input.destination_port || (protocol === 'DNS' ? 53 : 443), 10),
    protocol: protocol,
    threat_class: threatClass,
    sih_category: sihCategory,
    severity: severity,
    confidence: confidence,
    status: status,
    detector: input.detector || 'zero_day_api_engine',
    evidence: Array.isArray(input.evidence)
      ? input.evidence
      : [
          {
            feature: 'anomaly_score',
            value: confidence,
            reason: input.reason || randomScenario.reason || 'Automated ingestion via Vercel Serverless API',
          },
        ],
    model_version: input.model_version || '1.0',
    observation_window_s: typeof input.observation_window_s === 'number' ? input.observation_window_s : 1.0,
    source_rate: typeof input.source_rate === 'number' ? input.source_rate : parseFloat((1000 + Math.random() * 500).toFixed(1)),
  };
}

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

  try {
    let inputData = {};

    // Handle POST body
    if (req.method === 'POST') {
      if (typeof req.body === 'string') {
        try {
          inputData = JSON.parse(req.body);
        } catch {
          inputData = {};
        }
      } else if (req.body && typeof req.body === 'object') {
        inputData = req.body;
      }
    } else if (req.method === 'GET') {
      // Also allow GET query parameters e.g. /api/create-alert?severity=CRITICAL
      inputData = req.query || {};
    } else {
      res.status(405).json({ success: false, error: `Method ${req.method} not allowed. Use GET or POST.` });
      return;
    }

    const alertRow = buildAlertPayload(inputData);

    // Direct REST insert into Supabase alerts table
    const supabaseEndpoint = `${SUPABASE_URL}/rest/v1/alerts`;
    const response = await fetch(supabaseEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify([alertRow]),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('[create-alert API] Supabase error:', errBody);
      res.status(500).json({
        success: false,
        error: 'Failed to insert alert into Supabase',
        details: errBody,
      });
      return;
    }

    const insertedRows = await response.json();
    const createdAlert = Array.isArray(insertedRows) && insertedRows.length > 0 ? insertedRows[0] : alertRow;

    res.status(201).json({
      success: true,
      message: 'Alert row created successfully',
      alert: createdAlert,
    });
  } catch (err) {
    console.error('[create-alert API] Server error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message || String(err),
    });
  }
};
