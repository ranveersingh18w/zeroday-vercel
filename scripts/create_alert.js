#!/usr/bin/env node
/**
 * ZERO-DAY SIH26145 — Universal JavaScript / Node.js Client for Alert Ingestion
 * ==============================================================================
 * Easily create and insert alert rows into Supabase via Vercel Serverless API
 * from Node.js or modern browsers.
 *
 * Usage:
 *   # 1. Zero additional info:
 *   node scripts/create_alert.js
 *
 *   # 2. Specify target Vercel URL:
 *   node scripts/create_alert.js --url https://your-deployment.vercel.app/api/create-alert
 *
 *   # 3. Custom overrides:
 *   node scripts/create_alert.js --threat data_exfiltration --severity CRITICAL
 */

const DEFAULT_API_URL = process.env.ZERODAY_API_URL || 'http://localhost:3000/api/create-alert';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { url: DEFAULT_API_URL, payload: {} };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) {
      options.url = args[++i];
    } else if (arg === '--threat' && args[i + 1]) {
      options.payload.threat_class = args[++i];
    } else if (arg === '--severity' && args[i + 1]) {
      options.payload.severity = args[++i];
    } else if (arg === '--src' && args[i + 1]) {
      options.payload.src_ip = args[++i];
    } else if (arg === '--dst' && args[i + 1]) {
      options.payload.dst_ip = args[++i];
    } else if (arg === '--confidence' && args[i + 1]) {
      options.payload.confidence = parseFloat(args[++i]);
    }
  }
  return options;
}

async function createAlert(apiUrl = DEFAULT_API_URL, customFields = {}) {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'ZeroDay-JS-Client/1.0',
    },
    body: JSON.stringify(customFields),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  return await res.json();
}

async function main() {
  const { url, payload } = parseArgs();

  console.log(`🚀 Sending request to: ${url}`);
  console.log(`📦 Payload overrides: ${Object.keys(payload).length ? JSON.stringify(payload) : 'None (Generating smart defaults)'}`);

  try {
    const result = await createAlert(url, payload);
    const alert = result.alert || {};

    console.log('\n✅ Alert row successfully created in Supabase!');
    console.log(`   • Alert ID:     ${alert.alert_id}`);
    console.log(`   • Timestamp:    ${alert.timestamp}`);
    console.log(`   • SIH Category: ${alert.sih_category}`);
    console.log(`   • Threat Class: ${alert.threat_class}`);
    console.log(`   • Severity:     ${alert.severity}`);
    console.log(`   • Source:       ${alert.src_ip}:${alert.src_port}`);
    console.log(`   • Destination:  ${alert.dst_ip}:${alert.dst_port}`);
    console.log(`   • Confidence:   ${alert.confidence}`);
    console.log(`   • Status:       ${alert.status}`);
  } catch (err) {
    console.error(`❌ Failed to create alert:`, err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createAlert };
