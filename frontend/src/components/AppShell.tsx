import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bell, Siren, Activity, Radar, BarChart3, Settings,
  HeartPulse, ListChecks, PanelLeftClose, PanelLeftOpen, Zap, Trash2, X,
} from 'lucide-react';
import { systemService } from '../services';
import type { Notifications } from '../types';
import { SeverityBadge } from './Badge';

import { useToast } from './Toast';
import { subscribeToSupabaseRealtime } from '../services/supabaseClient';

interface NavEntry { to: string; label: string; icon: ReactNode; badge?: string }

const NAV_GROUPS: { label: string; items: NavEntry[] }[] = [
  {
    label: 'Monitoring',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { to: '/alerts', label: 'Alerts', icon: <Siren size={18} /> },
      { to: '/traffic', label: 'Traffic', icon: <Activity size={18} /> },
      { to: '/threats', label: 'Threats', icon: <Radar size={18} /> },
      { to: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
      { to: '/simulation', label: 'Scenarios', icon: <Zap size={18} /> },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/health', label: 'System Health', icon: <HeartPulse size={18} /> },
      { to: '/activity', label: 'Activity', icon: <ListChecks size={18} /> },
    ],
  },
];

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  return (
    <>
      <div className="sidebar-head">
        <div className="brand-mark" style={{ width: 34, height: 34, fontSize: 15, borderRadius: 9 }}>ZΔ</div>
        {!collapsed && (
          <div className="brand-text">
            <div className="b1" style={{ fontWeight: 700, fontSize: 15 }}>ZERO-DAY</div>
            <div className="b2">Cyber Threat Intel</div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_GROUPS.map((g) => (
          <div key={g.label}>
            {!collapsed && <div className="nav-group-label">{g.label}</div>}
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                title={collapsed ? it.label : undefined}
              >
                <span className="nav-ic">{it.icon}</span>
                <span>{it.label}</span>
                {it.badge && <span className="nav-count">{it.badge}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <NavLink to="/settings" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} title={collapsed ? 'Settings' : undefined}>
          <span className="nav-ic"><Settings size={18} /></span><span>Settings</span>
        </NavLink>
      </div>
    </>
  );
}

function NotificationPanel({
  open,
  items,
  onClose,
  onClear,
  onDismiss,
}: {
  open: boolean;
  items: Notifications[];
  onClose: () => void;
  onClear: () => void;
  onDismiss: (id: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="popover" style={{ width: 340 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <b style={{ fontSize: 13.5 }}>Notifications</b>
          {items.length > 0 && (
            <span style={{ fontSize: 11, background: 'rgba(34,211,238,0.15)', color: 'var(--cyan-400)', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>
              {items.length}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {items.length > 0 && (
            <button
              className="btn btn-sm"
              onClick={onClear}
              style={{ fontSize: 11, padding: '2px 8px', height: 24, borderColor: 'rgba(239,68,68,0.4)', color: '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}
              title="Clear all notifications"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
          <span className="demo-badge" style={{ fontSize: 9.5 }}>LIVE</span>
        </div>
      </div>
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div className="state-box" style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            <p>No notifications.</p>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border-soft)', background: n.read ? 'transparent' : 'rgba(34,211,238,0.04)' }}
            >
              <SeverityBadge severity={n.severity} />
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onClose}>
                <div style={{ fontSize: 13, color: 'var(--ink)' }}>{n.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--faint)' }}>{n.time}</div>
              </div>
              <button
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss(n.id);
                }}
                title="Dismiss notification"
                style={{ width: 22, height: 22, opacity: 0.6 }}
              >
                <X size={12} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AppShell({ children, collapsed, setCollapsed }: { children: ReactNode; collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const toast = useToast();

  useEffect(() => {
    systemService.notifications().then(setNotifications).catch(() => {});
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const unsubscribe = subscribeToSupabaseRealtime((alert) => {
      setUnreadCount((c) => c + 1);
      setNotifications((prev) => [
        {
          id: alert.id,
          title: `${alert.sihCategory} (${alert.severity})`,
          severity: alert.severity,
          time: 'Just now',
          read: false,
        },
        ...prev,
      ]);
      toast('warning', `⚡ [Supabase Realtime] ${alert.severity}: ${alert.sihCategory} (${alert.id})`);

      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(`🚨 ZERO-DAY Threat Alert: ${alert.severity}`, {
            body: `${alert.sihCategory}\nSrc: ${alert.source.ip} → Dst: ${alert.destination.ip}`,
          });
        } catch (_) {}
      }
    });

    return () => unsubscribe();
  }, [toast]);

  // useLocation is router-aware under HashRouter, so it reflects the active
  // hash route — unlike window.location.pathname which is always "/".
  const { pathname } = useLocation();
  const crumb = () => {
    const map: Record<string, [string, string]> = {
      '/dashboard': ['Workspace', 'Dashboard'],
      '/alerts': ['Workspace', 'Alerts'],
      '/traffic': ['Workspace', 'Traffic'],
      '/threats': ['Workspace', 'Threats'],
      '/analytics': ['Workspace', 'Analytics'],
      '/simulation': ['Workspace', 'Scenarios'],
      '/settings': ['Workspace', 'Settings'],
      '/health': ['Workspace', 'System Health'],
      '/activity': ['Workspace', 'Activity'],
    };
    return map[pathname] ?? ['Workspace', 'Dashboard'];
  };

  const [group, page] = crumb();

  return (
    <div className={`app-shell${collapsed ? ' collapsed' : ''}`}>
      <aside className="sidebar">
        <SidebarContent collapsed={collapsed} />
      </aside>
      <div className="app-main">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <div className="crumb">
            <span style={{ color: 'var(--faint)' }}>{group}</span>
            <span className="sep">/</span>
            <span className="cur">{page}</span>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <span>⌕</span>
              <input placeholder="Search alerts, IPs, flows…" aria-label="Global search" />
            </div>
            <div className="health-pill"><span className="pulse" />Monitoring active</div>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => { setNotifOpen(!notifOpen); setUnreadCount(0); }} aria-label="Notifications">
                <Bell size={18} />
                <span className="notif-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, minWidth: 8, height: 8 }}>
                  {unreadCount > 0 ? unreadCount : ''}
                </span>
              </button>
              <NotificationPanel
                open={notifOpen}
                items={notifications}
                onClose={() => setNotifOpen(false)}
                onClear={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
              />
            </div>
          </div>
        </header>
        <main className="page-body" onClick={() => { if (notifOpen) setNotifOpen(false); }}>
          {children}
        </main>
      </div>
    </div>
  );
}