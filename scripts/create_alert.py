#!/usr/bin/env python3
"""
ZERO-DAY SIH26145 — Universal Python Client for Alert Row Ingestion
===================================================================
Easily create and insert alert rows into Supabase via Vercel Serverless API
from anywhere using Python. Works with ZERO extra pip dependencies!

Usage:
  # 1. Zero additional info (intelligent defaults automatically generated):
  python scripts/create_alert.py

  # 2. Specify target Vercel URL:
  python scripts/create_alert.py --url https://your-deployment.vercel.app/api/create-alert

  # 3. Optional custom overrides:
  python scripts/create_alert.py --threat botnet_c2_beacon --severity CRITICAL --src 10.0.0.99
"""

import sys
import os
import json
import argparse
import urllib.request
import urllib.error

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

DEFAULT_API_URL = os.environ.get(
    "ZERODAY_API_URL",
    "http://localhost:3000/api/create-alert"
)

def create_alert(
    api_url: str = DEFAULT_API_URL,
    threat_class: str = None,
    severity: str = None,
    src_ip: str = None,
    dst_ip: str = None,
    confidence: float = None,
    reason: str = None,
    extra_fields: dict = None
):
    """
    Sends a POST request to the Vercel serverless API to create a new row.
    If no parameters are provided, the API automatically generates realistic defaults.
    """
    payload = {}
    if threat_class:
        payload["threat_class"] = threat_class
    if severity:
        payload["severity"] = severity
    if src_ip:
        payload["src_ip"] = src_ip
    if dst_ip:
        payload["dst_ip"] = dst_ip
    if confidence is not None:
        payload["confidence"] = confidence
    if reason:
        payload["reason"] = reason
    if extra_fields:
        payload.update(extra_fields)

    req_data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=req_data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "ZeroDay-Python-Client/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as resp:
            resp_body = resp.read().decode("utf-8")
            result = json.loads(resp_body)
            return result
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"❌ HTTP Error {e.code}: {err_msg}", file=sys.stderr)
        raise
    except urllib.error.URLError as e:
        print(f"❌ Network Error connecting to {api_url}: {e.reason}", file=sys.stderr)
        raise

def main():
    parser = argparse.ArgumentParser(description="Create a new alert row via Vercel Serverless API")
    parser.add_argument("--url", default=DEFAULT_API_URL, help="Vercel API URL (e.g., https://your-deployment.vercel.app/api/create-alert)")
    parser.add_argument("--threat", help="Threat class (e.g. botnet_c2_beacon, volumetric_ddos, data_exfiltration)")
    parser.add_argument("--severity", choices=["LOW", "MEDIUM", "HIGH", "CRITICAL"], help="Severity level")
    parser.add_argument("--src", help="Source IP address")
    parser.add_argument("--dst", help="Destination IP address")
    parser.add_argument("--confidence", type=float, help="Confidence score (0.0 - 1.0)")
    parser.add_argument("--reason", help="Evidence reason summary")

    args = parser.parse_args()

    print(f"🚀 Sending request to: {args.url}")
    print("📦 Payload overrides: " + (json.dumps({k: v for k, v in vars(args).items() if v and k != 'url'}) or "None (Generating smart defaults)"))

    try:
        res = create_alert(
            api_url=args.url,
            threat_class=args.threat,
            severity=args.severity,
            src_ip=args.src,
            dst_ip=args.dst,
            confidence=args.confidence,
            reason=args.reason
        )

        alert = res.get("alert", {})
        print("\n✅ Alert row successfully created in Supabase!")
        print(f"   • Alert ID:     {alert.get('alert_id')}")
        print(f"   • Timestamp:    {alert.get('timestamp')}")
        print(f"   • SIH Category: {alert.get('sih_category')}")
        print(f"   • Threat Class: {alert.get('threat_class')}")
        print(f"   • Severity:     {alert.get('severity')}")
        print(f"   • Source:       {alert.get('src_ip')}:{alert.get('src_port')}")
        print(f"   • Destination:  {alert.get('dst_ip')}:{alert.get('dst_port')}")
        print(f"   • Confidence:   {alert.get('confidence')}")
        print(f"   • Status:       {alert.get('status')}")
    except Exception as e:
        sys.exit(1)

if __name__ == "__main__":
    main()
