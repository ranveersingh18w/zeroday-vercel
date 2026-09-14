# 📡 How to Fetch Alerts from ZERO-DAY — Data Retrieval Guide

**ZERO-DAY SIH 26145 | Cloud & SOC Alert Query API**

This guide provides end-to-end instructions and production code snippets for **fetching and querying threat alerts** from any platform, language, or tool.

---

## 📌 Available Retrieval Channels

| Channel | Endpoint | Protocol | Best For |
| :--- | :--- | :--- | :--- |
| **Vercel Serverless API** | `GET /api/alerts?limit=50` | HTTPS REST (JSON) | Universal access, zero API keys required, CORS-enabled |
| **Supabase Direct REST API** | `GET <SUPABASE_URL>/rest/v1/alerts` | HTTPS PostgREST | Advanced filtering, sorting, pagination, and range queries |
| **Supabase Realtime WebSockets** | `wss://<SUPABASE_URL>/realtime/v1` | WebSockets | Instant sub-100ms push streaming to SOC dashboards & agents |

### Endpoints
- **Local Dev Server**: `http://localhost:3000/api/alerts`
- **Production Vercel**: `https://<your-vercel-domain>.vercel.app/api/alerts`
- **Direct Supabase Host**: `https://czvjvwtvmyvajhlbwrud.supabase.co`

---

## ⚡ 1. The Fastest Ways (Zero Setup)

### 🌐 In Any Web Browser
Simply open the URL in your browser to inspect formatted JSON:
```
http://localhost:3000/api/alerts?limit=10
```

### 💻 Command Line (cURL)
```bash
# Fetch latest 50 alerts (default)
curl -s http://localhost:3000/api/alerts

# Fetch specific count (e.g. 10 alerts)
curl -s "http://localhost:3000/api/alerts?limit=10"
```

### 🪟 Windows PowerShell
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/alerts?limit=10"
$response.alerts | Format-Table alert_id, severity, threat_class, src_ip, dst_ip, timestamp
```

---

## 🐍 2. Python Examples

### A. Zero Dependencies (Standard Library)
Works out of the box in standard Python 3.x with no `pip install` required:

```python
import urllib.request
import json

url = "http://localhost:3000/api/alerts?limit=25" # Or production Vercel URL

req = urllib.request.Request(url, headers={"Accept": "application/json"})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode("utf-8"))

print(f"Retrieved {data['count']} alerts:")
for alert in data["alerts"]:
    print(f"[{alert['severity']}] {alert['threat_class']} from {alert['src_ip']} -> {alert['dst_ip']} (ID: {alert['alert_id']})")
```

### B. Using `requests`
```python
import requests

response = requests.get("http://localhost:3000/api/alerts", params={"limit": 20})
data = response.json()

if data.get("success"):
    for alert in data["alerts"]:
        print(f"{alert['timestamp']} | {alert['severity']:<8} | {alert['threat_class']:<25} | Confidence: {alert['confidence']}")
```

### C. Direct Supabase PostgREST (Advanced Filtering)
Query the database directly with advanced SQL-like filters:

```python
import requests

SUPABASE_URL = "https://czvjvwtvmyvajhlbwrud.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dmp2d3R2bXl2YWpobGJ3cnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDgxNzMsImV4cCI6MjEwNDU4NDE3M30.xNtvspUnHzaUGwD2DgHybHc64Xz52Ahd_dK3tcBvmjI"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Example: Filter only CRITICAL alerts from TCP protocol
params = {
    "select": "alert_id,severity,threat_class,src_ip,dst_ip,confidence,timestamp",
    "severity": "eq.CRITICAL",
    "protocol": "eq.TCP",
    "order": "timestamp.desc",
    "limit": 10
}

resp = requests.get(f"{SUPABASE_URL}/rest/v1/alerts", headers=headers, params=params)
critical_alerts = resp.json()
print("Critical alerts:", critical_alerts)
```

---

## ⚡ 3. JavaScript / TypeScript / Node.js

### A. Modern `fetch` (Browser or Node.js 18+)
```javascript
async function fetchLatestAlerts(limit = 20) {
  const response = await fetch(`http://localhost:3000/api/alerts?limit=${limit}`);
  const data = await response.json();

  if (data.success) {
    console.log(`Fetched ${data.count} alerts`);
    data.alerts.forEach((alert) => {
      console.log(`[${alert.severity}] ${alert.threat_class} (${alert.src_ip} -> ${alert.dst_ip})`);
    });
  }
}

fetchLatestAlerts();
```

### B. Supabase Real-Time Streaming (WebSockets)
Listen for alerts **live as they are inserted** in real time:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://czvjvwtvmyvajhlbwrud.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6dmp2d3R2bXl2YWpobGJ3cnVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDgxNzMsImV4cCI6MjEwNDU4NDE3M30.xNtvspUnHzaUGwD2DgHybHc64Xz52Ahd_dK3tcBvmjI';

const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Fetch initial records
const { data: initialAlerts, error } = await supabase
  .from('alerts')
  .select('*')
  .order('timestamp', { ascending: false })
  .limit(20);

console.log('Current alerts:', initialAlerts);

// 2. Subscribe to live inserts over WebSockets
const channel = supabase
  .channel('public:alerts')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'alerts' },
    (payload) => {
      console.log('🚨 NEW REAL-TIME ALERT RECEIVED:', payload.new);
    }
  )
  .subscribe();
```

---

## 🐹 4. Go Example

```go
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Alert struct {
	AlertID     string  `json:"alert_id"`
	ThreatClass string  `json:"threat_class"`
	Severity    string  `json:"severity"`
	SrcIP       string  `json:"src_ip"`
	DstIP       string  `json:"dst_ip"`
	Confidence  float64 `json:"confidence"`
	Timestamp   string  `json:"timestamp"`
}

type APIResponse struct {
	Success bool    `json:"success"`
	Count   int     `json:"count"`
	Alerts  []Alert `json:"alerts"`
}

func main() {
	resp, err := http.Get("http://localhost:3000/api/alerts?limit=10")
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var apiResp APIResponse
	json.Unmarshal(body, &apiResp)

	fmt.Printf("Successfully fetched %d alerts\n", apiResp.Count)
	for _, a := range apiResp.Alerts {
		fmt.Printf("[%s] %s: %s -> %s (conf: %.2f)\n", a.Severity, a.ThreatClass, a.SrcIP, a.DstIP, a.Confidence)
	}
}
```

---

## 🦀 5. Rust Example

Using `reqwest` and `serde_json`:

```rust
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct Alert {
    alert_id: String,
    threat_class: String,
    severity: String,
    src_ip: String,
    dst_ip: String,
    confidence: f64,
}

#[derive(Deserialize, Debug)]
struct ApiResponse {
    success: bool,
    count: usize,
    alerts: Vec<Alert>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let url = "http://localhost:3000/api/alerts?limit=10";
    let resp: ApiResponse = reqwest::get(url).await?.json().await?;

    println!("Fetched {} alerts:", resp.count);
    for alert in resp.alerts {
        println!("[{}] {} from {}", alert.severity, alert.threat_class, alert.src_ip);
    }
    Ok(())
}
```

---

## 🔷 6. C# / .NET Example

Using standard `HttpClient`:

```csharp
using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        string url = "http://localhost:3000/api/alerts?limit=10";

        var response = await client.GetStringAsync(url);
        using var doc = JsonDocument.Parse(response);
        var root = doc.RootElement;

        int count = root.GetProperty("count").GetInt32();
        Console.WriteLine($"Total alerts fetched: {count}");

        foreach (var alert in root.GetProperty("alerts").EnumerateArray())
        {
            string id = alert.GetProperty("alert_id").GetString();
            string threat = alert.GetProperty("threat_class").GetString();
            string sev = alert.GetProperty("severity").GetString();
            Console.WriteLine($"[{sev}] {threat} (ID: {id})");
        }
    }
}
```

---

## 📬 7. Postman / REST Client Setup

1. **Method**: `GET`
2. **URL**: `http://localhost:3000/api/alerts` (or your live Vercel domain)
3. **Query Parameters**:
   - `limit` (Optional): integer between `1` and `100` (Default: `50`)
4. **Headers**: `Accept: application/json`

---

## 📋 Response Structure

A successful response returns status code `200 OK`:

```json
{
  "success": true,
  "count": 2,
  "alerts": [
    {
      "alert_id": "alt-1789008200-a1b2c3",
      "timestamp": "2026-09-14T04:20:00.000Z",
      "flow_id": "flow-syn-flood-10.0.0.5",
      "threat_class": "volumetric_ddos",
      "sih_category": "Volumetric / Protocol DDoS",
      "severity": "CRITICAL",
      "confidence": 0.98,
      "status": "New",
      "src_ip": "198.51.100.42",
      "dst_ip": "10.0.0.2",
      "src_port": 54120,
      "dst_port": 80,
      "protocol": "TCP",
      "detector": "rules_sliding_window",
      "evidence": [
        {
          "feature": "packet_rate",
          "value": 15420.5,
          "threshold": 1000.0,
          "reason": "Abnormal packet spike detected"
        }
      ],
      "model_version": "1.0",
      "observation_window_s": 5.0,
      "source_rate": 15420.5,
      "created_at": "2026-09-14T04:20:00.120Z"
    }
  ]
}
```

---

## 🛡️ Summary of Available Data Fields

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `alert_id` | `string` | Unique identifier (`alt-<timestamp>-<hash>`) |
| `timestamp` | `ISO 8601 string` | Time threat was detected |
| `threat_class` | `string` | Specific threat vector (e.g. `botnet_c2_beacon`, `volumetric_ddos`) |
| `sih_category` | `string` | Official SIH 26145 threat classification name |
| `severity` | `string` | `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW` |
| `confidence` | `float` | AI / Rule confidence score (`0.0` - `1.0`) |
| `status` | `string` | Workflow status: `New`, `Investigating`, `Acknowledged`, `Resolved` |
| `src_ip`, `dst_ip` | `string` | Source and destination IP addresses |
| `src_port`, `dst_port` | `integer` | Transport ports |
| `protocol` | `string` | Protocol (`TCP`, `UDP`, `DNS`, `TLS`, `ICMP`) |
| `detector` | `string` | Detection subsystem (`rules_sliding_window`, `njode_deep_learning`, etc.) |
| `evidence` | `array` | Granular statistical metrics triggering the alert |
