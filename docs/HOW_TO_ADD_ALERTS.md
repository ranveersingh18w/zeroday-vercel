# 🚨 How to Add Alerts to ZERO-DAY — Ingestion API Guide

**ZERO-DAY SIH 26145 | Cloud & SOC Alert Ingestion**

This guide explains how to send alerts and create rows in the ZERO-DAY Supabase database from **any external source** (Python scripts, AI engines, Node.js applications, cURL, webhooks, or browser endpoints) using our zero-configuration Vercel Serverless API.

---

## 📌 Quick Summary

- **API Endpoint (Live Vercel)**: `https://<your-vercel-domain>.vercel.app/api/create-alert`
- **API Endpoint (Local Dev)**: `http://localhost:3000/api/create-alert`
- **Zero Information Needed**: If you send `{}` or an empty request, the API **automatically generates schema-compliant, realistic defaults** for all required database fields.
- **Selective Overrides**: Any field you provide will overwrite the default while preserving the rest.
- **Instant Real-Time Sync**: Any alert inserted via this API is immediately streamed over Supabase Realtime WebSockets to all connected React SOC dashboards!

---

## 🚀 1. The Fastest Way (Zero Info Needed)

### 🐍 Python (No packages needed)
Run the bundled script:
```bash
python scripts/create_alert.py
```
Or use 5 lines of Python code anywhere:
```python
import urllib.request, json

url = "http://localhost:3000/api/create-alert" # Or your Vercel URL
req = urllib.request.Request(url, data=b"{}", headers={"Content-Type": "application/json"}, method="POST")

with urllib.request.urlopen(req) as response:
    result = json.loads(response.read().decode("utf-8"))
    print("Created Alert ID:", result["alert"]["alert_id"])
```

### ⚡ JavaScript / Node.js
Run the bundled script:
```bash
node scripts/create_alert.js
```
Or in any JavaScript/TypeScript code:
```javascript
const res = await fetch('http://localhost:3000/api/create-alert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({}) // Zero info required!
});

const data = await res.json();
console.log('Created Alert:', data.alert);
```

### 💻 cURL (Command Line)
```bash
curl -X POST http://localhost:3000/api/create-alert
```

### 🌐 Web Browser
Simply open the URL in your browser:
👉 **`http://localhost:3000/api/create-alert`** (or your Vercel URL)

---

## 🛠️ 2. Custom Alert Fields & Overrides

You can selectively provide any custom fields. Any missing fields are automatically completed by the API.

### JSON Payload Schema

| Field | Type | Required | Default If Omitted | Description / Valid Values |
| :--- | :--- | :---: | :--- | :--- |
| `threat_class` | `string` | No | Random preset | e.g. `botnet_c2_beacon`, `volumetric_ddos`, `data_exfiltration`, `dga_domains`, `dns_tunnelling`, `encrypted_malware`, `reconnaissance_port_scan` |
| `sih_category` | `string` | No | Auto-derived from threat | `Botnet C2 Beaconing`, `Volumetric / Protocol DDoS`, `Data Exfiltration`, `DGA / DNS Tunnelling`, `Malicious Encrypted Sessions`, `Reconnaissance / Port Scanning` |
| `severity` | `string` | No | `HIGH` | `'LOW'`, `'MEDIUM'`, `'HIGH'`, `'CRITICAL'` |
| `confidence` | `number` | No | Random `0.85` - `0.99` | Float between `0.0` and `1.0` |
| `src_ip` | `string` | No | Realistic preset IP | Source IPv4 address (e.g. `'192.168.1.105'`) |
| `dst_ip` | `string` | No | Realistic preset IP | Destination IPv4 address (e.g. `'10.0.0.1'`) |
| `src_port` | `number` | No | Ephemeral port | Integer `1` - `65535` |
| `dst_port` | `number` | No | `443` (or `53` for DNS) | Integer `1` - `65535` |
| `protocol` | `string` | No | `TCP` | `'TCP'`, `'UDP'`, `'DNS'`, `'TLS'`, `'ICMP'` |
| `status` | `string` | No | `'New'` | `'New'`, `'Investigating'`, `'Acknowledged'`, `'Resolved'`, `'Dismissed'` |
| `reason` | `string` | No | Threat description | Human-readable explanation of why this alert triggered |
| `detector` | `string` | No | `'zero_day_api_engine'` | Identifier of the engine/model that detected the threat |
| `evidence` | `array` | No | Auto-generated array | Array of objects `[{ feature: string, value: any, reason: string }]` |
| `alert_id` | `string` | No | `alt-<timestamp>-<hex>` | Unique alert identifier |
| `timestamp` | `string` | No | `NOW()` | ISO 8601 timestamp string |

---

## 📋 3. Code Examples with Custom Data

### A. Python with `requests`
```python
import requests

payload = {
    "threat_class": "volumetric_ddos",
    "sih_category": "Volumetric / Protocol DDoS",
    "severity": "CRITICAL",
    "confidence": 0.98,
    "src_ip": "198.51.100.42",
    "dst_ip": "10.0.0.2",
    "reason": "SYN flood exceeding 1500 pkts/sec threshold",
    "detector": "njode_deep_learning"
}

response = requests.post(
    "http://localhost:3000/api/create-alert", # Or Vercel URL
    json=payload
)

print(response.json())
```

### B. Python CLI with Flags
```bash
python scripts/create_alert.py \
  --threat botnet_c2_beacon \
  --severity CRITICAL \
  --src 10.0.0.50 \
  --dst 185.234.72.10 \
  --confidence 0.95 \
  --reason "Outbound beaconing interval CV = 0.08"
```

### C. Node.js / TypeScript
```typescript
import { createAlert } from './scripts/create_alert';

async function sendThreat() {
  const result = await createAlert('http://localhost:3000/api/create-alert', {
    threat_class: 'data_exfiltration',
    severity: 'CRITICAL',
    src_ip: '10.0.4.102',
    dst_ip: '93.184.216.34',
    reason: 'Asymmetric high-volume egress byte transfer detected',
  });

  console.log('Success:', result.success);
}

sendThreat();
```

### D. cURL with Custom JSON
```bash
curl -X POST http://localhost:3000/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{
    "threat_class": "botnet_c2_beacon",
    "severity": "HIGH",
    "src_ip": "172.16.0.4",
    "dst_ip": "194.26.29.11",
    "confidence": 0.94,
    "reason": "Regular periodic jitter-free outbound traffic"
  }'
```

### E. PowerShell
```powershell
$body = @{
    threat_class = "reconnaissance_port_scan"
    severity     = "MEDIUM"
    src_ip       = "45.33.32.156"
    dst_ip       = "10.0.0.5"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/create-alert" -Method Post -Body $body -ContentType "application/json"
```

### F. Go
```go
package main

import (
	"bytes"
	"fmt"
	"net/http"
)

func main() {
	jsonData := []byte(`{"threat_class":"volumetric_ddos","severity":"CRITICAL","src_ip":"198.51.100.42"}`)
	resp, err := http.Post("http://localhost:3000/api/create-alert", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("Response status:", resp.Status)
}
```

### G. Rust
```rust
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    let res = client.post("http://localhost:3000/api/create-alert")
        .json(&serde_json::json!({
            "threat_class": "botnet_c2_beacon",
            "severity": "HIGH",
            "src_ip": "10.0.0.50"
        }))
        .send()
        .await?;
    println!("Status: {}", res.status());
    Ok(())
}
```

### H. C# / .NET
```csharp
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        using var client = new HttpClient();
        var json = "{\"threat_class\":\"data_exfiltration\",\"severity\":\"CRITICAL\"}";
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("http://localhost:3000/api/create-alert", content);
        System.Console.WriteLine(await response.Content.ReadAsStringAsync());
    }
}
```

---

## 🔍 4. Reading Alerts via API

To inspect alerts currently stored in Supabase:

```bash
# Fetch latest 10 alerts
curl "http://localhost:3000/api/alerts?limit=10"
```

---

## 🔄 5. How It Integrates with the SOC Dashboard

1. When your detection script calls `/api/create-alert`, the serverless function validates the fields and inserts a new row into the Supabase PostgreSQL `alerts` table.
2. The Supabase `alerts` table has **Realtime enabled** (`ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts`).
3. The React SOC dashboard (listening over WebSockets) receives the `INSERT` payload in **< 100ms**.
4. The dashboard:
   - Pops up an instant notification toast.
   - Updates the live Alert Counter.
   - Adds the row to the top of the **Live Alerts Table** with severity badge and drill-down drawer.
