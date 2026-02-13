'use client';

import { useState } from 'react';
import { Settings, Shield, Link, Bell, Server, Key } from 'lucide-react';

interface SettingToggle {
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingToggle[]>([
    { label: 'Auto-sync Memory', description: 'Automatically sync memory files to Supabase on changes.', enabled: true, icon: Server },
    { label: 'Cron Monitoring', description: 'Enable monitoring of scheduled cron operations.', enabled: true, icon: Bell },
    { label: 'API Access', description: 'Allow external API access with authentication key.', enabled: false, icon: Key },
    { label: 'Agent Permissions', description: 'Grant agent read/write access to memory store.', enabled: true, icon: Shield },
  ]);

  function toggleSetting(index: number) {
    setSettings(prev => prev.map((s, i) => i === index ? { ...s, enabled: !s.enabled } : s));
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-black tracking-tighter text-white mb-4 italic underline decoration-blue-500/30 text-shadow">Settings</h2>
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
          Configure agent connections, permissions, and dashboard preferences.
        </p>
      </header>

      {/* Connection Status */}
      <div className="bg-[#090909] border border-white/5 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-bold text-white">Connection Status</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Supabase</p>
            <p className="text-sm font-bold text-emerald-500">Connected</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">OpenClaw Agent</p>
            <p className="text-sm font-bold text-amber-500">Pending</p>
          </div>
        </div>
      </div>

      {/* Settings Toggles */}
      <div className="space-y-4">
        {settings.map((setting, i) => {
          const Icon = setting.icon;
          return (
            <div key={setting.label} className="bg-[#090909] border border-white/5 rounded-2xl p-6 flex items-center justify-between hover:border-white/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">{setting.label}</h3>
                  <p className="text-[11px] text-slate-500">{setting.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSetting(i)}
                className={`w-12 h-6 rounded-full relative transition-all ${setting.enabled ? 'bg-blue-600' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${setting.enabled ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
