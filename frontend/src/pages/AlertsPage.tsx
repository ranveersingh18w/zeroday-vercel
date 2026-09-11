import { useEffect, useMemo, useState } from 'react';
import { Trash2, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { alertService } from '../services';
import type { Alert } from '../types';
import { SeverityBadge, StatusPill } from '../components/Badge';
import { AlertDetails } from '../components/AlertDetails';
import { EmptyState, LoadingState, ErrorState } from '../components/States';
import { relTime, CATEGORY_ORDER } from '../lib/theme';
import { useToast } from '../components/Toast';
import { DemoTag } from '../components/DemoTag';

const PAGE_SIZE = 10;
const TIME_FILTERS = ['All time', 'Last 24h', 'Last 7d', 'Last 30d'];
const PROTOCOLS = ['All', 'TCP', 'UDP', 'TLS', 'DNS', 'ICMP'];
const CONFIDENCE = ['All', '≥ 90%', '≥ 80%', '≥ 70%'];

export function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [threat, setThreat] = useState('All');
  const [sev, setSev] = useState('All');
  const [time, setTime] = useState('All time');
  const [proto, setProto] = useState('All');
  const [conf, setConf] = useState('All');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    let alive = true;
    alertService.list().then((a) => alive && setAlerts(a)).catch(() => alive && setError('Failed to load alerts.'));
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!alerts) return [];
    const cutoff = time === 'Last 24h' ? 24 : time === 'Last 7d' ? 168 : time === 'Last 30d' ? 720 : 0;
    let rows = alerts;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((a) => a.id.toLowerCase().includes(q) || a.source.ip.includes(q) || a.destination.ip.includes(q) || a.threatClass.toLowerCase().includes(q));
    }
    if (threat !== 'All') rows = rows.filter((a) => a.sihCategory === threat);
    if (sev !== 'All') rows = rows.filter((a) => a.severity === sev);
    if (proto !== 'All') rows = rows.filter((a) => a.protocol === proto);
    if (conf !== 'All') {
      const min = parseInt(conf.replace(/\D/g, ''), 10) / 100;
      rows = rows.filter((a) => a.confidence >= min);
    }
    if (cutoff) rows = rows.filter((a) => Date.now() - new Date(a.timestamp).getTime() <= cutoff * 3600000);
    
    // Sort strictly by Timestamp
    rows = [...rows].sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return sortDir === 'asc' ? tA - tB : tB - tA;
    });
    return rows;
  }, [alerts, search, threat, sev, time, proto, conf, sortDir]);

  // Clamp current page to the valid range after filtering changes.
  useEffect(() => {
    const max = Math.max(0, Math.floor((filtered.length - 1) / PAGE_SIZE));
    setPage((p) => Math.min(p, max));
  }, [filtered.length]);

  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const toggleTimestampSort = () => {
    setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
  };

  const exportCsv = () => {
    const header = ['ID', 'Category', 'Severity', 'Source', 'Destination', 'Protocol', 'Confidence', 'Detected At', 'Status'];
    const rows = filtered.map((a) => [a.id, a.sihCategory, a.severity, `${a.source.ip}:${a.source.port}`, `${a.destination.ip}:${a.destination.port}`, a.protocol, a.confidence.toFixed(3), a.timestamp, a.status].map((x) => `"${x}"`).join(','));
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = `sih26145_alerts_${Date.now()}.csv`; link.click();
    URL.revokeObjectURL(url);
    toast('success', `Exported ${filtered.length} alerts to CSV.`);
  };

  const clearAlerts = async () => {
    if (window.confirm('Are you sure you want to delete ALL alerts from Supabase? This action cannot be undone.')) {
      const success = await alertService.clear();
      if (success) {
        toast('success', 'All alerts cleared from Supabase.');
        setAlerts([]);
      } else {
        toast('error', 'Failed to clear alerts.');
      }
    }
  };

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Alerts</h1>
          <div className="sub">Detected threats across the monitored unidirectional traffic.</div>
        </div>
        <div className="page-head-actions">
          <DemoTag />
          <button className="btn" onClick={clearAlerts} style={{ backgroundColor: 'var(--red-600)', color: 'white', borderColor: 'var(--red-700)' }}>
            <Trash2 size={15} /> Clear All
          </button>
          <button className="btn" onClick={exportCsv}><Download size={15} /> Export</button>
        </div>
      </div>

      <div className="card">
        <div className="card-head" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="search-box" style={{ width: 260 }}>
            <span>⌕</span>
            <input placeholder="Search ID, IP, class…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} aria-label="Search alerts" />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="select" value={threat} onChange={(e) => { setThreat(e.target.value); setPage(0); }} aria-label="Threat filter">
              <option>All</option>
              {CATEGORY_ORDER.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="select" value={sev} onChange={(e) => { setSev(e.target.value); setPage(0); }} aria-label="Severity filter">
              <option>All</option>
              <option>CRITICAL</option><option>HIGH</option><option>MEDIUM</option><option>LOW</option>
            </select>
            <select className="select" value={time} onChange={(e) => { setTime(e.target.value); setPage(0); }} aria-label="Time filter">
              {TIME_FILTERS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select className="select" value={proto} onChange={(e) => { setProto(e.target.value); setPage(0); }} aria-label="Protocol filter">
              {PROTOCOLS.map((p) => <option key={p}>{p}</option>)}
            </select>
            <select className="select" value={conf} onChange={(e) => { setConf(e.target.value); setPage(0); }} aria-label="Confidence filter">
              {CONFIDENCE.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              className="select"
              style={{ borderColor: 'var(--cyan-700)', color: 'var(--cyan-400)', fontWeight: 600 }}
              value={sortDir}
              onChange={(e) => {
                setSortDir(e.target.value as 'desc' | 'asc');
                setPage(0);
              }}
              aria-label="Timestamp Sort"
            >
              <option value="desc">Timestamp: Newest First (Desc ↓)</option>
              <option value="asc">Timestamp: Oldest First (Asc ↑)</option>
            </select>
          </div>
          <span style={{ fontSize: 12.5, color: 'var(--muted)', marginLeft: 'auto' }}><b style={{ color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{filtered.length}</b> alerts</span>
        </div>

        {!alerts ? (
          <LoadingState rows={4} />
        ) : pageRows.length === 0 ? (
          <EmptyState title="No alerts match" message="Try adjusting the filters or search query." />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Threat</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Protocol</th>
                  <th>Confidence</th>
                  <th style={{ cursor: 'pointer', color: 'var(--cyan-400)' }} onClick={toggleTimestampSort}>
                    Detected At {sortDir === 'desc' ? '▼' : '▲'}
                  </th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((a) => (
                  <tr key={a.id} onClick={() => setSelected(a.id)}>
                    <td><SeverityBadge severity={a.severity} /></td>
                    <td style={{ fontWeight: 600, color: 'var(--ink)', maxWidth: 200, whiteSpace: 'normal' }}>{a.sihCategory}</td>
                    <td><span className="ip">{a.source.ip}</span><span className="ip-arrow">:</span>{a.source.port}</td>
                    <td><span className="ip">{a.destination.ip}</span><span className="ip-arrow">:</span>{a.destination.port}</td>
                    <td>{a.protocol}</td>
                    <td>
                      <div className="conf">
                        <span className="bar"><span style={{ width: `${a.confidence * 100}%` }} /></span>
                        {Math.round(a.confidence * 100)}%
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{relTime(a.timestamp)}</td>
                    <td><StatusPill status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination">
          <span>Showing {pageRows.length ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          <div className="page-arrows">
            <button className="btn btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
            <span style={{ alignSelf: 'center', fontSize: 12.5 }}>Page {page + 1} / {pages}</span>
            <button className="btn btn-sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <AlertDetails
        alertId={selected}
        onClose={() => setSelected(null)}
        onStatusChange={() => {
          alertService.list().then(setAlerts);
        }}
      />
    </>
  );
}
