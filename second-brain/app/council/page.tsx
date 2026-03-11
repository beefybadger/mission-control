'use client';

import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, MessageSquare } from 'lucide-react';
import ChatModal from '@/components/ChatModal';
import type { CouncilMember } from '@/types';

type LiveState = {
  id: string;
  status: 'working' | 'idle' | 'offline';
  lastActiveAt: string | null;
  room: 'baron-office' | 'cubicles' | 'relax-room';
};

const COUNCIL_MEMBERS: CouncilMember[] = [
  {
    id: 'baron',
    name: 'Baron',
    role: 'Lead Strategist & Architect',
    level: 'Tier 1: Command',
    status: 'Active',
    description: 'Lead expert operator. Responsible for system architecture, strategic pivots, and project deployment.',
    capabilities: ['Architecture', 'Technical Deployment', 'Decision Engine'],
    color: 'blue',
  },
  {
    id: 'scotty',
    name: 'Scotty',
    role: 'Market Intelligence Scout',
    level: 'Tier 2: Execution & Support',
    status: 'Standby',
    description: 'Deep-web researcher. Specialized in trend hunting, competitor auditing, and local lead scouting.',
    capabilities: ['Brave Search', 'Data Scraping', 'Market Audits'],
    color: 'emerald',
  },
  {
    id: 'maurice',
    name: 'Maurice',
    role: 'Creative Director',
    level: 'Tier 2: Execution & Support',
    status: 'Standby',
    description: 'Revenue vibe architect. Responsible for offer crafting, marketing angles, and product design.',
    capabilities: ['Ideation', 'Offer Design', 'UX/UI Direction'],
    color: 'purple',
  },
  {
    id: 'hacker',
    name: 'Hacker',
    role: 'Code Engineer & Automation Specialist',
    level: 'Tier 2: Execution & Support',
    status: 'Standby',
    description: 'Builds and maintains automation, scraping, and deployment infrastructure.',
    capabilities: ['Programming', 'DevOps', 'Automation'],
    color: 'blue',
  },
  {
    id: 'oracle',
    name: 'Oracle',
    role: 'Data Analyst & AI Modeler',
    level: 'Tier 2: Execution & Support',
    status: 'Standby',
    description: 'Interprets market data and patterns to optimize strategy and conversion.',
    capabilities: ['Data Science', 'Predictive Analytics', 'Modeling'],
    color: 'emerald',
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    role: 'Operations & Monitoring Specialist',
    level: 'Tier 2: Execution & Support',
    status: 'Standby',
    description: 'Guards uptime, security posture, and operational resilience.',
    capabilities: ['System Monitoring', 'Security', 'Incident Response'],
    color: 'purple',
  },
];

export default function CouncilPage() {
  const [activeMember, setActiveMember] = useState<CouncilMember | null>(null);
  const [states, setStates] = useState<LiveState[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshStates() {
    setLoading(true);
    const res = await fetch('/api/council/status');
    const data = await res.json();
    if (res.ok) setStates((data.states ?? []) as LiveState[]);
    setLoading(false);
  }

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      const res = await fetch('/api/council/status');
      const data = await res.json();
      if (res.ok) setStates((data.states ?? []) as LiveState[]);
      setLoading(false);
    }

    async function poll() {
      const res = await fetch('/api/council/status');
      const data = await res.json();
      if (res.ok) setStates((data.states ?? []) as LiveState[]);
    }

    loadInitial();
    const timer = setInterval(poll, 20000);
    return () => clearInterval(timer);
  }, []);

  const merged = useMemo(() => COUNCIL_MEMBERS.map((m) => ({
    ...m,
    live: states.find((s) => s.id === m.id),
  })), [states]);

  return (
    <div className="max-w-7xl mx-auto pb-16 p-6 md:p-8">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Council Office</h2>
          <p className="text-slate-400 text-sm max-w-3xl">
            Pixel office view with live movement by status: working agents stay in cubicles, idle agents move in the relax room. Baron has a private office.
          </p>
        </div>
        <button onClick={refreshStates} className="pixel-btn px-3 py-1.5 text-xs flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> {loading ? 'Syncing...' : 'Refresh'}
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-8">
        <OfficeRoom title="Baron Office" subtitle="Command" members={merged.filter((m) => m.id === 'baron')} room="baron-office" onMessage={setActiveMember} />
        <OfficeRoom title="Cubicles" subtitle="Working" members={merged.filter((m) => m.id !== 'baron')} room="cubicles" onMessage={setActiveMember} />
        <OfficeRoom title="Relax Room" subtitle="Idle" members={merged.filter((m) => m.id !== 'baron')} room="relax-room" onMessage={setActiveMember} />
      </div>

      <div className="pixel-card p-4">
        <h3 className="text-sm font-bold text-white mb-3">Live Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {merged.map((member) => {
            const status = member.live?.status ?? 'idle';
            const tone = status === 'working' ? 'text-emerald-300' : status === 'offline' ? 'text-rose-300' : 'text-amber-200';
            return (
              <div key={member.id} className="pixel-card-light p-3">
                <p className="text-sm font-bold text-zinc-900">{member.name}</p>
                <p className="text-[11px] text-zinc-600">{member.role}</p>
                <p className={`text-xs font-bold mt-2 uppercase ${tone}`}>{status}</p>
                <p className="text-[11px] text-zinc-600 mt-1">
                  {member.live?.lastActiveAt ? `Last active ${new Date(member.live.lastActiveAt).toLocaleTimeString()}` : 'No recent log'}
                </p>
                <button onClick={() => setActiveMember(member)} className="mt-2 pixel-btn px-2 py-1 text-[11px] flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Message
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <ChatModal
        member={activeMember}
        isOpen={!!activeMember}
        onClose={() => setActiveMember(null)}
      />
    </div>
  );
}

function OfficeRoom({
  title,
  subtitle,
  members,
  room,
  onMessage,
}: {
  title: string;
  subtitle: string;
  members: (CouncilMember & { live?: LiveState })[];
  room: LiveState['room'];
  onMessage: (member: CouncilMember) => void;
}) {
  const displayed = members.filter((m) => (m.live?.room ?? (m.id === 'baron' ? 'baron-office' : 'relax-room')) === room);

  return (
    <section className="pixel-card p-4 min-h-[260px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{subtitle}</span>
      </div>
      <div className="relative h-[190px] wire-soft overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{
          backgroundImage:
            'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }} />

        {displayed.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-zinc-600 font-semibold">No agents in this room.</div>
        )}

        {displayed.map((member, idx) => (
          <button
            key={member.id}
            onClick={() => onMessage(member)}
            className="absolute group"
            style={{
              left: `${12 + (idx % 3) * 28}%`,
              top: `${22 + Math.floor(idx / 3) * 34}%`,
              animation: member.live?.status === 'working'
                ? 'floatWork 1.4s ease-in-out infinite'
                : 'floatIdle 2.6s ease-in-out infinite',
            }}
          >
            <div className="w-10 h-10 border-2 border-black rounded-sm bg-yellow-300 shadow-[2px_2px_0_#000] flex items-center justify-center text-[10px] font-black text-black">
              {member.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="mt-1 text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
              {member.name}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
