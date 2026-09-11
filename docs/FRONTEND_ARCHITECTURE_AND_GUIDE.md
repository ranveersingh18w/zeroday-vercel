# ZERO-DAY Frontend — Architecture, Components & Operations Guide

> **SIH 26145**: AI-Based Detection of Cyber Threats in Unidirectional IP Traffic  
> **Repository**: `zeroday-vercel`  
> **Deployment**: Vercel (Production) / Localhost (Development)

---

## 1. Executive Summary

The **ZERO-DAY** frontend is a high-performance, dark-mode Security Operations Center (SOC) dashboard built with **React 19**, **TypeScript**, and **Vite**. It is designed to provide real-time situational awareness for unidirectional networks guarded by data diodes.

The frontend communicates with a cloud-hosted **Supabase (PostgreSQL)** database over both **REST APIs** (for CRUD, pagination, and simulation data insertion) and **WebSockets** (for real-time live alert streaming and desktop notifications).

---

## 2. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **UI Framework** | React 19 + TypeScript | Modern declarative component architecture with strict type safety |
| **Build Tool** | Vite 8 + Rolldown | Ultra-fast HMR and optimized production bundling |
| **Database & Realtime** | `@supabase/supabase-js` | PostgreSQL query execution and WebSocket `postgres_changes` listener |
| **Charts & Visuals** | Recharts 3 | High-fidelity traffic graphs, threat distributions, and latency curves |
| **Iconography** | Lucide React | Clean, standardized cybersecurity and interface icons |
| **Routing** | React Router DOM 7 | Client-side HashRouter for seamless single-page app navigation |
| **Styling** | Vanilla CSS Design System | Custom cybersecurity dark-mode theme with glassmorphism and CSS variables |

---

## 3. Directory Structure

```
frontend/
├── public/                     # Static assets (favicons, manifests)
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── AlertDetails.tsx    # Slide-out triage drawer with deep evidence breakdown
│   │   ├── AppShell.tsx        # Master layout (sidebar, topbar, notification panel)
│   │   ├── Badge.tsx           # Color-coded Severity & Status pills
│   │   ├── DemoTag.tsx         # Demo and live mode indicators
│   │   ├── LiveAlertList.tsx   # Real-time alert feed widget
│   │   ├── StatCard.tsx        # KPI metric cards with glow indicators
│   │   ├── States.tsx          # Loading, error, and empty state fallbacks
│   │   ├── SystemHealth.tsx    # Hardware, engine, and database health metrics
│   │   ├── ThreatActivity.tsx  # Interactive breakdown of 6 SIH threat categories
│   │   ├── ThreatDistribution.tsx # Radial / Pie threat share chart
│   │   ├── Toast.tsx           # Global notification toast provider
│   │   └── TrafficChart.tsx    # Real-time bandwidth and packet throughput line chart
│   │
│   ├── data/                   # Fallback mock telemetry datasets
│   │   ├── mockActivity.ts     # Mock SOC audit events
│   │   ├── mockAlerts.ts       # Deterministic sample threat alerts
│   │   ├── mockAnalytics.ts    # ML model calibration and anomaly score samples
│   │   ├── mockSystem.ts       # System hardware status
│   │   └── mockTraffic.ts      # Synthetic time-series traffic generator
│   │
│   ├── lib/                    # Styling tokens, date formatters, color scales
│   │   └── theme.ts            # Severity color constants, relative time formatter
│   │
│   ├── pages/                  # Page-level route views
│   │   ├── ActivityPage.tsx    # SOC Event Timeline with Timestamp Sorting
│   │   ├── AlertsPage.tsx      # Comprehensive Alerts Table with multi-filter & sorting
│   │   ├── AnalyticsPage.tsx   # ML metrics, ROC curves, feature importances
│   │   ├── DashboardPage.tsx   # Primary SOC command center overview
│   │   ├── HealthPage.tsx      # Diagnostic health monitor
│   │   ├── SettingsPage.tsx    # Subnet config, diode IP ranges, thresholds
│   │   ├── SimulationPage.tsx  # Direct Supabase threat streamer & custom alert injector
│   │   ├── ThreatsPage.tsx     # Threat category matrix & MITRE ATT&CK alignment
│   │   └── TrafficPage.tsx     # Unidirectional 5-tuple flow inspector
│   │
│   ├── services/               # API & Supabase data abstraction layer
│   │   ├── index.ts            # Consolidated services (alertService, trafficService)
│   │   └── supabaseClient.ts   # Direct Supabase client, queries, and realtime pub/sub
│   │
│   ├── types/                  # Shared TypeScript interfaces
│   │   └── index.ts            # Alert, Severity, FlowEvent, ThreatCategory definitions
│   │
│   ├── App.tsx                 # Top-level Route definitions & Shell Layout
│   ├── index.css               # Global CSS tokens, dark mode design system
│   └── main.tsx                # React DOM root entrypoint
│
├── .env                        # Local environment variables (Supabase URL & Anon Key)
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler options
├── vercel.json                 # Vercel SPA routing rewrite configuration
└── vite.config.ts              # Vite bundler configuration
```

---

## 4. How Everything Works Inside the Frontend

### 4.1 Real-Time Data Pipeline (Supabase Realtime)
1. When `AppShell.tsx` mounts, it calls `subscribeToSupabaseRealtime()` from `supabaseClient.ts`.
2. A unique WebSocket channel (`alerts-channel-xxxx`) connects to the Supabase Realtime service listening for `INSERT` events on the `public.alerts` table.
3. When any alert is inserted (either via the Simulation Tab, Custom Alert Generator, or external Python script):
   - A **Toast Alert** pops up on screen showing `[Supabase Realtime] SEVERITY: Category (ID)`.
   - The topbar **Bell Icon** increments its unread notification badge.
   - If enabled by the user, a **Desktop Notification** triggers via the HTML5 Notification API.
   - Any open pages (e.g. Dashboard, Alerts table) refresh their data automatically.

### 4.2 Simulation & Scenario Streaming (`SimulationPage.tsx`)
- **Pre-Configured Scenarios**: 8 realistic threat vectors covering the 6 SIH threat classes (SYN Flood, C2 Beacon, DNS Tunnel, Data Exfil, etc.).
- **Immediate + 5-Second Streaming**:
  - Clicking **Stream** triggers an immediate insertion of **2 new threat rows** into Supabase.
  - A 5000ms timer continuously generates and pushes **2 brand new rows** per tick in a batch request (`[payload1, payload2]`).
  - Terminal logs inside the **Simulation Live Supabase Audit Log** display each inserted row with its unique `alert_id` and timestamp.
- **Custom Alert Generator**:
  - Allows the SOC operator to configure custom source/destination IPs, severity levels, threat categories, and confidence scores.
  - Generates a unique timestamped alert ID (`al-custom-{time}-{hex}`) and directly inserts a compliant row into the Supabase database.

### 4.3 Timestamp Sorting
- **Alerts Table (`AlertsPage.tsx`)**:
  - Features a dedicated **Timestamp Sort** dropdown: `Timestamp: Newest First (Desc ↓)` and `Timestamp: Oldest First (Asc ↑)`.
  - Clicking the **Detected At** column header toggles between ascending and descending order with visual arrow indicators (`▼` / `▲`).
- **Activity Timeline (`ActivityPage.tsx`)**:
  - Toggle button allows switching the SOC event stream between newest-first and oldest-first.
- **Audit Log (`SimulationPage.tsx`)**:
  - Allows reversing terminal output order between latest-first and earliest-first.

### 4.4 Notification Management (`NotificationPanel`)
- Click the **Bell Icon** in the topbar to open the notification drawer.
- Shows live notifications from Supabase and simulated system events.
- **Clear All**: Clicking the red `Clear` button wipes all UI notifications.
- **Individual Dismiss**: Each item has an `(X)` button to remove specific alerts.

---

## 5. How to Start and Run the Project

### 5.1 Running Locally (Development Mode)

#### Windows (PowerShell):
PowerShell may block npm script execution due to execution policy. Use `cmd /c`:
```powershell
# Navigate to the frontend directory
cd c:\Users\Administrator\Desktop\zeroday-vercel\frontend

# Start Vite dev server
cmd /c npm run dev
```

Or from anywhere in a single command:
```powershell
npm.cmd --prefix c:\Users\Administrator\Desktop\zeroday-vercel\frontend run dev
```

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

### 5.2 Building for Production

To test the optimized production build locally:
```powershell
cd c:\Users\Administrator\Desktop\zeroday-vercel\frontend
cmd /c npm run build
```
This compiles TypeScript (`tsc -b`) and generates the minified production distribution inside `frontend/dist/`.

To preview the production bundle:
```powershell
cmd /c npm run preview
```

---

### 5.3 Deploying to Vercel

The repository is already configured with:
1. `vercel.json` in the root: directs build execution into `frontend/` and specifies `frontend/dist` as the output directory.
2. `package.json` in the root: redirecting `"build"` to `cd frontend && npm install && npm run build`.
3. `frontend/vercel.json`: ensuring all client-side routes redirect to `index.html` for SPA routing.

#### Deploy via Git Push:
```powershell
cd c:\Users\Administrator\Desktop\zeroday-vercel
git add .
git commit -m "Deploy latest frontend updates"
git push origin main
```
Vercel will automatically detect the push, run the build, and deploy the application live!
