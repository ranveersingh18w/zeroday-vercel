# 🔒 ZERO-DAY — SIH 26145 (Cloud & SOC Frontend)

**AI-Based Detection of Cyber Threats in Unidirectional IP Traffic**

> **Smart India Hackathon 2026** | **Problem Statement ID**: 26145 | **Organization**: NTRO  
> **Repository**: `zeroday-vercel` | **Platform**: React 19 + TypeScript + Vite + Supabase + Vercel

---

## 📚 Complete Project Documentation

| Document | Description |
| :--- | :--- |
| 🌐 **[What We Are Building — Project Vision & System Overview](docs/PROJECT_VISION_AND_SYSTEM_OVERVIEW.md)** | Full breakdown of SIH 26145, the unidirectional data diode problem, the 6 threat vectors, the dual-layer AI (Rules + NJ-ODE), and end-to-end architecture. |
| 💻 **[Frontend Architecture & Operations Guide](docs/FRONTEND_ARCHITECTURE_AND_GUIDE.md)** | In-depth guide to the React 19 frontend, directory structure, how real-time Supabase streaming works, timestamp sorting, notifications, and local startup steps. |
| 🗄️ **[Database Construction & Schema](docs/DATABASE_CONSTRUCTION_GUIDE.md)** | Supabase PostgreSQL schema, table contracts (`alerts`, `metrics`, `health`), indices, and Row-Level Security. |
| 🚨 **[How to Add Alerts — Ingestion API Guide](docs/HOW_TO_ADD_ALERTS.md)** | Complete guide to sending alerts via Python, JavaScript, cURL, or browser with zero required parameters. |
| 📡 **[How to Fetch Alerts — Data Retrieval Guide](docs/HOW_TO_FETCH_ALERTS.md)** | Full guide and production code snippets for querying and streaming alerts across Python, JS, cURL, Go, Rust, C#, and WebSockets. |
| 🎯 **[6 Threat Vectors Simulation Guide](docs/THREAT_SIMULATION_GUIDE.md)** | Ready-to-use commands for safely testing and triggering detections for all 6 SIH 26145 threat scenarios via CLI replay, API, and cURL. |
| 🗄️ **[Supabase Data Insertion Guide](docs/SUPABASE_DATA_INSERTION.md)** | Step-by-step instructions for pushing alerts via REST APIs, Python ingest scripts, or the frontend simulator. |

---

## 🎯 The Core Problem & Solution

Critical infrastructure (nuclear facilities, power grids, defense networks) utilizes **hardware data diodes** to enforce **unidirectional (one-way) physical data transmission**. 

- **The Challenge**: Traditional firewalls, EDRs, and intrusion detection systems depend on two-way TCP handshakes (`SYN` ➔ `SYN-ACK`), active resets (`RST`), and remote probing. On a unidirectional diode, **return traffic does not exist**.
- **The ZERO-DAY Solution**: A 100% passive, zero-probe detection architecture combining:
  1. **Layer 1 (Deterministic Rules)**: Microsecond sliding-window analysis (40,000+ events/sec) for known threat signatures.
  2. **Layer 2 (Neural Jump ODE Deep Learning)**: Continuous-time unsupervised AI modeling irregular packet arrival intervals to detect zero-day exploits and provide channel attribution without labeled attack data.
  3. **Cloud Real-Time Persistence (Supabase)**: Real-time PostgreSQL event bus pushing alerts to connected dashboards over WebSockets.
  4. **Mission-Critical SOC Dashboard (React 19)**: Dark-mode situational awareness command center with live triage, flow inspection, and interactive simulation.

---

## 🛡️ 6 SIH Threat Vectors Covered

1. **Volumetric & Protocol DDoS**: SYN floods, UDP amplification, and buffer exhaustion attacks.
2. **Botnet C2 Beaconing**: Periodic outbound heartbeats identified by Inter-Arrival Time Coefficient of Variation ($CV < 0.15$).
3. **DGA (Domain Generation Algorithms)**: Pseudo-random domain queries scored via lexical Shannon entropy and consonant ratios.
4. **DNS Tunnelling**: Covert data exfiltration hidden inside oversized, high-entropy DNS query labels.
5. **Reconnaissance & Port Scans**: Horizontal/vertical subnet and port sweeps identified via source fan-out ratios.
6. **Data Exfiltration**: Unauthorized bulk or stealthy byte transfers exceeding normal directional ratios.

---

## 🚀 Quick Start — How to Run Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Start the Frontend Dev Server

#### On Windows (PowerShell / Command Prompt):
Because Windows PowerShell may restrict `.ps1` execution policies, use either of the following commands:

```cmd
:: Method A: Navigate and run via CMD wrapper
cd frontend
cmd /c npm run dev
```

```powershell
# Method B: One-line launch from anywhere
npm.cmd --prefix frontend run dev
```

The application will start immediately at:  
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🏗️ Building & Deploying to Vercel

### Local Production Build
To test the optimized production distribution locally:
```cmd
cd frontend
cmd /c npm run build
cmd /c npm run preview
```

### Automatic Vercel Deployment
This repository is pre-configured with root `vercel.json` and `package.json` build redirects:
```bash
git add .
git commit -m "Deploy updates"
git push origin main
```
Vercel automatically compiles the `frontend/` package and deploys the production single-page application.

---

## 🌐 Vercel Serverless API — Zero-Config Row Ingestion

You can create and insert new alert rows into the Supabase database directly via Vercel Serverless Functions **with ZERO additional info required** (intelligent schema defaults are automatically generated).

### Endpoints
- **`POST /api/create-alert`**: Creates a new alert row (accepts optional JSON body with overrides or `{}` for full defaults).
- **`GET /api/create-alert`**: Creates a new alert row directly via GET (supports optional query params like `?severity=CRITICAL&threat_class=syn_flood`).
- **`GET /api/alerts`**: Fetches the latest 50 alerts from Supabase (or creates an alert if `?create=true`).

---

### 1. Zero-Config Usage (No extra info needed)

#### 🐍 From Python:
Run the built-in zero-dependency script:
```bash
python scripts/create_alert.py
```
Or in any Python script using the standard library:
```python
import urllib.request, json

# Creates a realistic alert row with zero additional info
req = urllib.request.Request(
    "https://<your-vercel-domain>.vercel.app/api/create-alert",
    data=b"{}",
    headers={"Content-Type": "application/json"},
    method="POST"
)
with urllib.request.urlopen(req) as resp:
    print(json.loads(resp.read().decode("utf-8")))
```

#### ⚡ From JavaScript / Node.js:
Run the built-in script:
```bash
node scripts/create_alert.js
```
Or in any JS / browser application:
```javascript
const res = await fetch('https://<your-vercel-domain>.vercel.app/api/create-alert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}) // Zero info required!
});
const data = await res.json();
console.log('Created alert:', data.alert);
```

#### 💻 From cURL / Command Line:
```bash
# POST with zero payload:
curl -X POST https://<your-vercel-domain>.vercel.app/api/create-alert

# GET in browser or curl:
curl https://<your-vercel-domain>.vercel.app/api/create-alert
```

---

### 2. Custom Overrides (Optional)

You can selectively pass any field you want; the API will preserve your values and generate valid defaults for all remaining schema columns:

```bash
# Python:
python scripts/create_alert.py --threat botnet_c2_beacon --severity CRITICAL --src 10.0.0.99

# Node.js:
node scripts/create_alert.js --threat data_exfiltration --severity CRITICAL

# cURL:
curl -X POST https://<your-vercel-domain>.vercel.app/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{"threat_class":"volumetric_ddos","severity":"CRITICAL","src_ip":"192.168.1.100"}'
```

---

## 📁 Repository Structure

```
zeroday-vercel/
├── api/
│   ├── create-alert.js             # Vercel Serverless Function: Zero-config alert row creation
│   └── alerts.js                   # Vercel Serverless Function: REST alerts endpoint
├── database/
│   └── supabase_schema.sql         # Production Supabase PostgreSQL schema
├── docs/
│   ├── FRONTEND_ARCHITECTURE_AND_GUIDE.md  # Detailed Frontend guide & components
│   ├── PROJECT_VISION_AND_SYSTEM_OVERVIEW.md # Comprehensive SIH 26145 vision doc
│   ├── DATABASE_CONSTRUCTION_GUIDE.md     # SQL schema construction guide
│   └── SUPABASE_DATA_INSERTION.md         # API & Python insertion examples
├── frontend/
│   ├── src/
│   │   ├── components/             # Reusable SOC UI components (AlertDetails, AppShell, etc.)
│   │   ├── pages/                  # Route views (Dashboard, Alerts, Simulation, Traffic, etc.)
│   │   ├── services/               # Supabase REST & WebSocket client
│   │   └── types/                  # TypeScript interface contracts
│   ├── package.json                # Frontend dependencies (React 19, Vite, Recharts, Supabase)
│   ├── vite.config.ts              # Bundler configuration
│   └── vercel.json                 # SPA client-side rewrite rules
├── scripts/
│   ├── create_alert.py             # Universal Python client (zero dependencies)
│   └── create_alert.js             # Universal Node.js / JS client
├── package.json                    # Root build runner for Vercel
├── vercel.json                     # Vercel deployment root configuration & API routing
└── README.md                       # Main project portal
```
