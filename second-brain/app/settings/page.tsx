'use client';

import { useEffect, useState } from 'react';
import { Shield, Link, Bell, Server, Key, RefreshCw } from 'lucide-react';

interface SettingToggle {
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

type ConnectionState = 'connected' | 'pending' | 'disconnected';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingToggle[]>([
    { label: 'Auto-sync Memory', description: 'Automatically sync memory files to Supabase on changes.', enabled: true, icon: Server },
    { label: 'Cron Monitoring', description: 'Enable monitoring of scheduled cron operations.', enabled: true, icon: Bell },
    { label: 'API Access', description: 'Allow external API access with authentication key.', enabled: false, icon: Key },
    { label: 'Agent Permissions', description: 'Grant agent read/write access to memory store.', enabled: true, icon: Shield },
  ]);

  const [supabaseStatus, setSupabaseStatus] = useState<ConnectionState>('pending');
  const [agentStatus, setAgentStatus] = useState<ConnectionState>('pending');
  const [checking, setChecking] = useState(false);

  function toggleSetting(index: number) {
    setSettings((prev) => prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)));
  }

  async function refreshConnectionStatus() {
    setChecking(true);
    try {
      const response = await fetch('/api/settings/connection-status');
      const data = await response.json();
      if (response.ok) {
        setSupabaseStatus(data.supabase);
        setAgentStatus(data.openclawAgent);
      }
    } catch {
      setSupabaseStatus('disconnected');
      setAgentStatus('pending');
    }
    setChecking(false);
  }

  useEffect(() => {
    async function loadInitialStatus() {
      setChecking(true);
      try {
        const response = await fetch('/api/settings/connection-status');
        const data = await response.json();
        if (response.ok) {
          setSupabaseStatus(data.supabase);
          setAgentStatus(data.openclawAgent);
        }
      } catch {
        setSupabaseStatus('disconnected');
        setAgentStatus('pending');
      }
      setChecking(false);
    }

    loadInitialStatus();
  }, []);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-black tracking-tight text-white mb-3">Settings</h2>
        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          Configure agent connections, permissions, and dashboard preferences.
        </p>
      </header>

      <div className="pixel-card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Connection Status</h3>
          </div>
          <button onClick={refreshConnectionStatus} disabled={checking} className="pixel-btn px-3 py-1.5 text-xs flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> {checking ? 'Checking...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusCard label="Supabase" status={supabaseStatus} />
          <StatusCard label="OpenClaw Agent" status={agentStatus} />
        </div>
      </div>

      <div className="space-y-4">
        {settings.map((setting, i) => {
          const Icon = setting.icon;
          return (
            <div key={setting.label} className="pixel-card p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl wire-soft flex items-center justify-center">
                  <Icon className="w-4 h-4 text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{setting.label}</h3>
                  <p className="text-[11px] text-slate-400">{setting.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(i)}
                className={`w-12 h-6 rounded-full relative transition-all border-2 ${setting.enabled ? 'bg-yellow-300 border-black' : 'bg-white border-black'}`}
              >
                <div className={`w-5 h-5 bg-white border border-black rounded-full absolute top-0.5 transition-all ${setting.enabled ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusCard({ label, status }: { label: string; status: ConnectionState }) {
  const tone = status === 'connected'
    ? 'text-emerald-400'
    : status === 'disconnected'
      ? 'text-rose-300'
      : 'text-amber-300';

  return (
    <div className="pixel-card-light p-4">
      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold ${tone}`}>{status === 'connected' ? 'Connected' : status === 'disconnected' ? 'Disconnected' : 'Pending'}</p>
    </div>
  );
}
