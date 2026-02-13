'use client';

import { useState } from 'react';
import { Settings, Shield, Bell, Database, HardDrive, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12">
        <h2 className="text-4xl font-black tracking-tighter text-white mb-4 italic">Settings</h2>
        <p className="text-slate-400 text-lg">Manage your 2nd Brain infrastructure and agent permissions.</p>
      </header>

      <div className="space-y-6">
        {/* Connection Section */}
        <div className="bg-[#151515] border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Data Infrastructure</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white mb-1 tracking-tight">Supabase Sync</p>
                <p className="text-xs text-slate-500">Automatic backup of all memory nodes</p>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white mb-1 tracking-tight">Hourly Purge Loop</p>
                <p className="text-xs text-slate-500">Token efficiency and context maintenance</p>
              </div>
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Active</span>
            </div>
          </div>
        </div>

        {/* System Section */}
        <div className="bg-[#151515] border border-white/5 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Permissions & Security</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl opacity-50">
              <div>
                <p className="text-sm font-bold text-white mb-1 tracking-tight">Public Access Gate</p>
                <p className="text-xs text-slate-500">Require login outside of Tailscale</p>
              </div>
              <div className="w-10 h-5 bg-slate-800 rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-slate-600 rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white mb-1 tracking-tight">Agent Autonomy</p>
                <p className="text-xs text-slate-500">Allow agents to initiate file changes</p>
              </div>
              <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Sync Entire Database
        </button>
      </div>
    </div>
  );
}
