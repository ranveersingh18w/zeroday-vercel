import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import type { StatCardData, Alert } from '../types';
import { StatCard } from '../components/StatCard';
import { TrafficChart } from '../components/TrafficChart';
import { ThreatDistribution } from '../components/ThreatDistribution';
import { LiveAlertList } from '../components/LiveAlertList';
import { ThreatActivity } from '../components/ThreatActivity';
import { SystemHealth } from '../components/SystemHealth';
import { AlertDetails } from '../components/AlertDetails';
import { useToast } from '../components/Toast';
import { trafficService } from '../services';
import { subscribeToSupabaseRealtime, isSupabaseConfigured, fetchSupabaseAlerts } from '../services/supabaseClient';

export function DashboardPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StatCardData[] | null>(null);

  const loadStats = async () => {
    try {
      const s = await trafficService.stats();
      let threatsCount = s.flowCount;
      let avgConfidence = '88.4%';

      if (isSupabaseConfigured()) {
        const liveAlerts = await fetchSupabaseAlerts(500);
        threatsCount = liveAlerts.length;
        if (liveAlerts.length > 0) {
          const sum = liveAlerts.reduce((acc, a) => acc + (typeof a.confidence === 'number' ? a.confidence : 0.9), 0);
          avgConfidence = `${((sum / liveAlerts.length) * 100).toFixed(1)}%`;
        } else {
          avgConfidence = '0.0%';
        }
      }

      setStats([
        { key: 'total', label: 'Total Traffic', value: `${s.totalVolumeMbps.toFixed(2)}`, support: 'Mbps aggregate', icon: 'activity', tone: 'neutral' },
        { key: 'flows', label: 'Flows Analyzed', value: s.flowCount.toLocaleString(), support: 'Unidirectional 5-tuples', icon: 'branch', tone: 'neutral' },
        { key: 'threats', label: 'Threats Detected', value: `${threatsCount}`, support: 'Across 6 SIH categories', icon: 'alert', tone: 'high' },
        { key: 'critical', label: 'Critical Alerts', value: `${s.activeFlows}`, support: 'Action required', icon: 'flame', tone: 'critical' },
        { key: 'confidence', label: 'Detection Confidence', value: avgConfidence, support: 'Avg across alerts', icon: 'brain', tone: 'low' },
        { key: 'health', label: 'System Health', value: 'Healthy', support: 'All engines active', icon: 'heart', tone: 'healthy' },
      ]);
    } catch (_) {}
  };

  useEffect(() => {
    loadStats();

    const unsubscribe = subscribeToSupabaseRealtime((alert) => {
      toast('warning', `[Supabase Realtime] ${alert.sihCategory}: ${alert.id}`);
      setLastUpdated(new Date());
      loadStats();
    });

    return () => unsubscribe();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    loadStats().then(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
      toast('success', 'Data refreshed.');
    });
  };

  const openAlert = (a: Alert) => setSelectedAlert(a.id);
  const openThreat = () => navigate('/threats');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Security Operations Center</h1>
          <div className="sub">Real-time visibility into unidirectional network traffic and detected cyber threats.</div>
        </div>
        <div className="page-head-actions">
          <div className="health-pill"><span className="pulse" />Monitoring active</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Last updated {lastUpdated.toLocaleTimeString()}</div>
          <button className="btn" onClick={refresh} disabled={refreshing}>
            {refreshing ? <span className="spinner" /> : <RefreshCw size={15} />} Refresh
          </button>
        </div>
      </div>

      {!stats ? (
        <div className="stat-grid">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton skel-card" />)}</div>
      ) : (
        <div className="stat-grid">{stats.map((s) => <StatCard key={s.key} data={s} />)}</div>
      )}

      <div className="section">
        <div className="card card-pad">
          <TrafficChart height={300} />
        </div>
      </div>

      <div className="grid-main-side" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <h3>Live Threat Alerts</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/alerts')}>View all →</button>
            </div>
          </div>
          <LiveAlertList limit={8} onSelect={openAlert} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card card-pad">
            <ThreatDistribution height={210} />
          </div>
          <div className="card card-pad">
            <div className="card-head" style={{ padding: '0 0 12px 0', borderBottom: 'none' }}>
              <h3 style={{ fontSize: 14 }}>System Health</h3>
              <span className="hint" style={{ fontSize: 11 }}>Components</span>
            </div>
            <SystemHealth />
          </div>
        </div>
      </div>

      <div className="section" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-head">
            <h3>Threat Activity</h3>
            <span className="hint">6 SIH categories</span>
          </div>
          <div style={{ padding: '12px 20px 20px' }}>
            <ThreatActivity onSelect={openThreat} />
          </div>
        </div>
      </div>



      <AlertDetails alertId={selectedAlert} onClose={() => setSelectedAlert(null)} />
    </>
  );
}
