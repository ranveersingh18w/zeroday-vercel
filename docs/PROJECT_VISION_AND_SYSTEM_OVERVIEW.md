# 🌐 ZERO-DAY — Project Vision & Complete System Architecture

> **Smart India Hackathon (SIH) 2026** | **Problem Statement ID: 26145**  
> **Topic**: AI-Based Detection of Cyber Threats in Unidirectional IP Traffic  
> **Organization**: National Technical Research Organisation (NTRO) / Critical Infrastructure Defense  
> **Repository**: `zeroday-vercel`

---

## 1. Executive Summary: What We Are Building

**ZERO-DAY** is an enterprise-grade, dual-layer Artificial Intelligence network security platform built specifically for **unidirectional network enclaves (hardware data diodes)**.

In mission-critical infrastructure—such as nuclear power plants, defense command centers, power grids, and intelligence agency vaults—hardware data diodes are physically installed to enforce **one-way data flow**. While this guarantees that external attackers cannot physically send malicious commands into the air-gapped core, it creates an extreme cybersecurity blind spot:

> ⚠️ **The Unidirectional Dilemma**:
> Traditional intrusion detection systems (Snort, Zeek, Suricata, firewalls, and EDRs) rely fundamentally on **bidirectional communication**. They depend on TCP 3-way handshakes (`SYN` ➔ `SYN-ACK` ➔ `ACK`), request/response pairing, active TCP resets (`RST`), and active network fingerprinting/probing.
>
> In a unidirectional environment, **return traffic does not exist**. The monitoring system can only **listen passively**. It can never query a sender, can never request packet re-transmission, and can never probe suspicious hosts.

**ZERO-DAY solves this fundamental challenge.** We are building an end-to-end passive threat detection system that monitors raw one-way IP traffic streams, extracts deep statistical and cryptographic metadata without decrypting payloads, and executes a **dual-layer detection engine** that combines microsecond deterministic rules with continuous-time deep learning (Neural Jump ODEs) to detect both known attacks and never-before-seen zero-day exploits.

---

## 2. The 6 Cyber Threat Classes (SIH 26145 Taxonomy)

ZERO-DAY is engineered to identify the six core cyber threat vectors defined in the SIH 26145 problem statement, plus advanced reconnaissance:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           6 SIH THREAT VECTORS                                   │
├───────────────────┬──────────────────────────────────┬──────────────────────────┤
│ Threat Category   │ Attack Mechanism                 │ Primary Detection Method │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 1. Volumetric /   │ High-rate SYN flood, UDP blast,  │ Sliding-window burst     │
│    Protocol DDoS  │ or ICMP reflection overwhelming  │ rate, source IP entropy, │
│                   │ diode buffer capacity.           │ directional imbalance.   │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 2. C2 Beaconing   │ Compromised internal host        │ Inter-Arrival Time (IAT) │
│                   │ emitting periodic heartbeats to  │ Coefficient of Variation │
│                   │ an external command-and-control  │ (CV < 0.15) & regularity.│
│                   │ listener node.                   │                          │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 3. DGA Domains    │ Malware generating pseudo-random │ Shannon lexical entropy, │
│                   │ domain names algorithmically     │ consonant-to-vowel ratio,│
│                   │ to evade static DNS sinkholes.   │ n-gram Markov scoring.   │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 4. DNS Tunnelling │ Covert exfiltration/tunneling    │ High query length (>50), │
│                   │ hiding encrypted data inside DNS │ anomalous record types   │
│                   │ query labels (TXT, AAAA, NULL).  │ (TXT), query entropy.    │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 5. Reconnaissance │ Port scan / host discovery       │ High fan-out ratio       │
│    & Port Scans   │ probing across subnets or ports  │ across ports/IPs from a  │
│                   │ from a single compromised node.  │ single source IP.        │
├───────────────────┼──────────────────────────────────┼──────────────────────────┤
│ 6. Data           │ Unauthorized massive or stealthy │ High outbound/inbound    │
│    Exfiltration   │ byte transfer transferring IP/   │ byte ratio (>5.0), large │
│                   │ secrets outside the enclave.     │ byte bursts, off-hours.  │
└───────────────────┴──────────────────────────────────┴──────────────────────────┘
```

---

## 3. The Dual-Layer AI Detection Architecture

The core intellectual property of ZERO-DAY is its **dual-layer detection strategy**:

```
                       UNIDIRECTIONAL IP INGEST (Data Diode TAP)
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    Passively Extracted 5-Tuple &      │
                      │    Cryptographic Metadata Stream       │
                      └───────────────────┬───────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
                     ▼                                         ▼
         ┌───────────────────────┐                 ┌───────────────────────┐
         │       LAYER 1         │                 │       LAYER 2         │
         │ Deterministic Rules   │                 │ Neural Jump ODE       │
         │ (Windowed Detectors)  │                 │ (Continuous-Time AI)  │
         ├───────────────────────┤                 ├───────────────────────┤
         │ • Throughput: 40,000+ │                 │ • Throughput: 70-100  │
         │   events/sec          │                 │   events/sec          │
         │ • Sub-millisecond     │                 │ • Unsupervised anomaly│
         │   latency             │                 │   detection           │
         │ • Zero false-negatives│                 │ • Flags unknown       │
         │   on known signatures │                 │   zero-day threats    │
         │ • Instant explainable │                 │ • Channel attribution │
         │   evidence metrics    │                 │   (IAT, Bytes, Entropy│
         └───────────┬───────────┘                 └───────────┬───────────┘
                     │                                         │
                     └────────────────────┬────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │         Unified Alert Engine          │
                      │   • Pydantic v2 Schema Enforcement    │
                      │   • Automated Confidence & Severity   │
                      │   • Threat Deduplication & Cooldown   │
                      └───────────────────┬───────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │   Supabase Cloud DB / PostgreSQL      │
                      │   • Realtime Replication (WebSocket)  │
                      │   • Row-Level Security & Audit Trail  │
                      └───────────────────┬───────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │     React 19 SOC Command Center       │
                      │   • Real-Time Threat Visualization    │
                      │   • Live Triage & Evidence Drawer     │
                      │   • Audio/Toast/Desktop Notifications │
                      └───────────────────────────────────────┘
```

### Layer 1: High-Speed Deterministic Rules
- Operates on a sliding micro-window (e.g. 5-minute rolling buffers with bounded memory `collections.deque`).
- Computes statistical indicators:
  - **DDoS**: Measures source IP entropy and counts half-open SYN packets per second.
  - **C2 Beaconing**: Computes the Coefficient of Variation ($CV = \frac{\sigma}{\mu}$) of Inter-Arrival Times (IAT). Legitimate human traffic has high variance ($CV > 1.0$), while automated malware beacons exhibit near-zero variance ($CV < 0.15$).
  - **DGA**: Scores domain labels using character entropy and n-gram analysis ($Score > 0.55$).
  - **DNS Tunnel**: Evaluates byte-entropy and flags queries longer than 50 characters.
  - **Port Scan**: Evaluates unique `(dst_ip, dst_port)` pairs per source over rolling 30 seconds.
  - **Exfiltration**: Computes outbound-to-inbound volume ratios and raw cumulative bytes.

### Layer 2: Neural Jump Ordinary Differential Equations (NJ-ODE)
- Based on breakthrough mathematical research (*Herrera, Krach & Teichmann, ICLR 2021*).
- **Why NJ-ODE?** Network packets arrive at **irregular time intervals**. Traditional RNNs, LSTMs, and Transformers assume discrete, fixed time steps ($\Delta t = 1$), which causes temporal distortion. NJ-ODE models the latent state of network flows as a continuous differential equation:
  $$\frac{dh(t)}{dt} = f_\theta(h(t))$$
  When a new packet arrives at time $t_i$, the state performs a discrete **jump** updated by the packet's features.
- **Unsupervised Training**: Trained strictly on normal, benign traffic. The model learns the expected continuous evolution of benign flows.
- **Anomaly Detection**: When anomalous traffic (such as a zero-day exploit or sophisticated covert channel) enters the diode, the model's prediction error (MSE) spikes.
- **Channel Attribution**: Because the model predicts 5 continuous channels (Inter-Arrival Time, Payload Bytes, Shannon Entropy, Burst Indicator, Direction), it pinpoints *which specific channel caused the anomaly*, providing human analysts with instant explainability without requiring labeled malware training sets.

---

## 4. End-to-End System Components

The complete ZERO-DAY ecosystem is composed of three cleanly decoupled systems:

```
[Physical Network / PCAP Ingest]
              │
              ▼
    [1. AI Detection Core] ────────► [2. Supabase Cloud DB] ────────► [3. React SOC Frontend]
    (Scapy/DPDK/PyTorch Engine)        (PostgreSQL + Realtime)          (Vite + React 19 Dashboard)
```

### Component 1: The Ingestion & AI Engine
- **Passive Ingestion**: Ingests raw PCAP files or captures live packets from a network TAP / mirror port.
- **Strict Compliance**: Adheres to the zero-return constraint—never transmits an ARP, never responds with SYN-ACK, never sends TCP RST.
- **Zero Decryption**: Analyzes only packet headers, inter-arrival times, payload byte distributions, and TLS handshake metadata (JA3/JA4 fingerprints, cipher suite offerings) without violating encryption privacy.
- **Alert Dispatch**: Formats alerts according to strict Pydantic contracts and ships them to the centralized persistence layer.

### Component 2: The Real-Time Persistence Layer (Supabase PostgreSQL)
- **Centralized Data Hub**: Hosted on Supabase (PostgreSQL 15+).
- **Schema Contracts**:
  - `alerts`: Stores threat class, confidence, severity, source/destination IPs, ports, protocol, evidence metadata, and ISO timestamps.
  - `traffic_metrics`: Stores time-series packet rates, bandwidth in Mbps, and active flow counts.
  - `threat_distributions`: Aggregates category counts across the 6 threat classes.
  - `system_health`: Tracks hardware CPU, memory, and engine health metrics.
- **PostgreSQL Realtime Engine**: Leverages logical replication (`wal2json`) to push instant change events over WebSockets to all connected clients.

### Component 3: The Next-Gen SOC Command Center (React 19 Frontend)
- **Operator Interface**: Accessible via modern web browsers on desktops, tablets, or SOC video walls.
- **Instant Situational Awareness**:
  - Dynamic KPI cards computing real-time threats detected and average AI confidence.
  - Live alerts table with multi-criteria filtering, search, and dedicated ascending/descending timestamp sorting.
  - Deep-dive Triage Drawer showing exact cryptographic evidence (entropy scores, IAT CV, packet samples).
  - Live interactive Traffic Inspector showing 5-tuple flow breakdowns.
  - Built-in Threat Simulator and Custom Alert Generator to inject realistic test vectors directly into Supabase for drills and demonstrations.
  - Desktop notifications and audio alerts for critical-severity zero-day incidents.

---

## 5. Why the Project Was Decoupled for Vercel

In this repository (`zeroday-vercel`), the project is structured as an **accessible, cloud-native frontend and database architecture**:

1. **Global High Availability**: Hosting the SOC command center on Vercel allows defense leadership, remote incident responders, and evaluation judges to view live telemetry from anywhere in the world with zero server maintenance.
2. **True Real-Time Cloud Synchronization**: By connecting directly to Supabase over secure WebSockets, any threat detected by an internal edge detector or injected via the simulation engine instantly propagates to all open dashboards in milliseconds.
3. **Interactive Simulation & Demonstration**: Because hardware data diodes are specialized physical equipment not accessible to every evaluator, the frontend includes a **built-in high-fidelity threat stream generator** that replicates the exact payload structures of real attacks, enabling end-to-end evaluation at the touch of a button.

---

## 6. Key Value Proposition & Innovations

| Innovation | Traditional Network Security | ZERO-DAY Solution |
| :--- | :--- | :--- |
| **Network Mode** | Requires full duplex (2-way traffic) | **100% Unidirectional & Passive** |
| **Traffic Handling** | Active probing, TCP RST, port knocking | **Zero probe, zero contact, zero signature leak** |
| **Encrypted Traffic** | Requires SSL interception / cert bumping | **Zero decryption — detects threats via TLS metadata & entropy** |
| **Zero-Day Attacks** | Blind to novel exploits missing known signatures | **Continuous-Time NJ-ODE flags any statistical deviation** |
| **Temporal Modeling** | Discrete binned time intervals ($\Delta t$) | **Continuous-time differential equation modeling** |
| **SOC Experience** | Cluttered, legacy, slow log viewers | **Modern dark-mode glassmorphic interface with instant triage** |

---

## 7. Related Documentation

- 📖 **[Frontend Architecture & Operations Guide](file:///c:/Users/Administrator/Desktop/zeroday-vercel/docs/FRONTEND_ARCHITECTURE_AND_GUIDE.md)**: Deep dive into React components, Vite configuration, timestamp sorting, Supabase client, and local startup commands.
- 🗄️ **[Database Construction Guide](file:///c:/Users/Administrator/Desktop/zeroday-vercel/docs/DATABASE_CONSTRUCTION_GUIDE.md)**: Complete PostgreSQL schema, table layouts, and indexing strategies.
- 📡 **[Supabase Data Insertion Guide](file:///c:/Users/Administrator/Desktop/zeroday-vercel/docs/SUPABASE_DATA_INSERTION.md)**: How to push alerts programmatically via REST API or Python scripts.
- 🏛️ **[Technical Architecture Details](file:///c:/Users/Administrator/Desktop/zeroday-vercel/docs/architecture.md)**: Deep mathematical and code-level breakdown of the detectors and NJ-ODE neural network.
