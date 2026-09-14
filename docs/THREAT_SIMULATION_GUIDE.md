# 🎯 SIH 26145 — 6 Threat Vectors Simulation Guide

This document outlines how to safely simulate and trigger detections for all **6 SIH 26145 Cyber Threat Vectors** in ZERO-DAY using the built-in scenario replay engine, synthetic traffic generators, and API alert triggers.

---

## 🛡️ The 6 SIH 26145 Threat Scenarios

| # | Threat Vector | Mechanism / Metric Trigger | Detection Subsystem |
| :---: | :--- | :--- | :--- |
| **1** | **Volumetric & Protocol DDoS** | SYN Floods, UDP packet rate burst exceeding threshold | Deterministic Sliding Window |
| **2** | **Botnet C2 Beaconing** | Periodic outbound heartbeats ($CV < 0.15$ inter-arrival time) | Neural Jump ODE + Entropy |
| **3** | **DGA (Domain Generation Algorithms)** | High lexical Shannon entropy & consonant ratios in DNS queries | Lexical Analyzer + NJ-ODE |
| **4** | **DNS Tunnelling** | Oversized labels, base64/hex encoding in DNS query names/TXT | Packet Parser + Anomaly Engine |
| **5** | **Reconnaissance & Port Scans** | Horizontal/vertical fan-out ratio to multiple destination ports | Source Fan-Out Ratio Engine |
| **6** | **Data Exfiltration** | Asymmetric outbound byte volume exceeding directional baseline | Egress Volumetric Ratio |

---

## ⚡ Method 1: Local CLI Replay Engine (Fastest Offline Verification)

The CLI detection engine includes pre-built synthetic packet capture traffic fixtures in `data/fixtures/`. You can replay any of the 6 attacks through the active detection algorithms:

```powershell
# Navigate to the CLI directory
cd "zeroday-cli\zero-day"
```

### 1. Volumetric & Protocol DDoS (SYN Flood)
```powershell
python -m zero_day.cli replay data\fixtures\syn_flood.jsonl --speed 0 --limit 100
```

### 2. Botnet C2 Beaconing
```powershell
python -m zero_day.cli replay data\fixtures\c2_beacon.jsonl --speed 0
```

### 3. DGA (Domain Generation Algorithms)
```powershell
python -m zero_day.cli replay data\fixtures\dga_domains.jsonl --speed 0
```

### 4. DNS Tunnelling
```powershell
python -m zero_day.cli replay data\fixtures\dns_tunnel.jsonl --speed 0
```

### 5. Reconnaissance & Port Scanning
```powershell
python -m zero_day.cli replay data\fixtures\port_scan.jsonl --speed 0
```

### 6. Data Exfiltration
```powershell
python -m zero_day.cli replay data\fixtures\data_exfil.jsonl --speed 0
```

### 🌟 Bonus: Replay Full Mixed Scenario (All 6 Vectors Concurrently)
```powershell
python -m zero_day.cli replay data\fixtures\full_scenario.jsonl --speed 0 --limit 200
```

---

## 📡 Method 2: Live Cloud & SOC Dashboard Ingestion

To trigger live alerts on the **React SOC Dashboard** and insert real rows into the **Supabase** database via Vercel:

### 1. Volumetric DDoS
```bash
python scripts/create_alert.py --threat volumetric_ddos --severity CRITICAL --src 198.51.100.42 --dst 10.0.0.2 --confidence 0.98 --reason "SYN flood exceeding 1500 pkts/sec threshold"
```

### 2. Botnet C2 Beaconing
```bash
python scripts/create_alert.py --threat botnet_c2_beacon --severity HIGH --src 10.0.0.50 --dst 185.234.72.10 --confidence 0.94 --reason "Regular periodic outbound beaconing (CV=0.08)"
```

### 3. DGA (Domain Generation Algorithms)
```bash
python scripts/create_alert.py --threat dga_domains --severity MEDIUM --src 10.0.1.15 --dst 8.8.8.8 --confidence 0.91 --reason "High-entropy algorithmic domain resolution query"
```

### 4. DNS Tunnelling
```bash
python scripts/create_alert.py --threat dns_tunnelling --severity HIGH --src 10.0.1.20 --dst 1.1.1.1 --confidence 0.96 --reason "Encoded payload detected inside oversized DNS query TXT labels"
```

### 5. Reconnaissance & Port Scanning
```bash
python scripts/create_alert.py --threat reconnaissance_port_scan --severity MEDIUM --src 45.33.32.156 --dst 10.0.0.5 --confidence 0.92 --reason "Rapid horizontal/vertical SYN probe fan-out"
```

### 6. Data Exfiltration
```bash
python scripts/create_alert.py --threat data_exfiltration --severity CRITICAL --src 10.0.4.102 --dst 93.184.216.34 --confidence 0.97 --reason "Asymmetric egress data transfer volume anomaly"
```

---

## 💻 Method 3: cURL Commands (Direct HTTP Simulation)

Use these commands directly in any terminal:

### 1. Volumetric DDoS
```bash
curl -X POST http://localhost:3000/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{"threat_class":"volumetric_ddos","severity":"CRITICAL","src_ip":"198.51.100.42","dst_ip":"10.0.0.1","protocol":"TCP"}'
```

### 2. Botnet C2 Beaconing
```bash
curl -X POST http://localhost:3000/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{"threat_class":"botnet_c2_beacon","severity":"HIGH","src_ip":"10.0.0.50","dst_ip":"185.234.72.10","protocol":"TCP"}'
```

### 3. DGA Domains
```bash
curl -X POST http://localhost:3000/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{"threat_class":"dga_domains","severity":"MEDIUM","src_ip":"10.0.1.15","dst_ip":"8.8.8.8","protocol":"DNS"}'
```

### 4. DNS Tunnelling
```bash
curl -X POST http://localhost:3000/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{"threat_class":"dns_tunnelling","severity":"HIGH","src_ip":"10.0.1.20","dst_ip":"1.1.1.1","protocol":"DNS"}'
```

### 5. Port Scan
```bash
curl -X POST http://localhost:3000/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{"threat_class":"reconnaissance_port_scan","severity":"MEDIUM","src_ip":"45.33.32.156","dst_ip":"10.0.0.5","protocol":"TCP"}'
```

### 6. Data Exfiltration
```bash
curl -X POST http://localhost:3000/api/create-alert \
  -H "Content-Type: application/json" \
  -d '{"threat_class":"data_exfiltration","severity":"CRITICAL","src_ip":"10.0.4.102","dst_ip":"93.184.216.34","protocol":"TCP"}'
```

---

## 🪟 Method 4: Live Socket SYN Scan Simulation

When the live sniffer (`run.py`) is running, you can test live socket detection by running the built-in script:

```powershell
cd "zeroday-cli\zero-day"
python trigger_scan.py 8.8.8.8
```
This transmits safe, sequential low-overhead SYN probe sockets across a range of ports to trigger the **Reconnaissance / Port Scan** detector in real time.
