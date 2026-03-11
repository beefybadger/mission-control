'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, RefreshCw } from 'lucide-react';
import ChatModal from '@/components/ChatModal';
import type { CouncilMember } from '@/types';

type LiveState = {
  id: string;
  status: 'working' | 'idle' | 'offline';
  lastActiveAt: string | null;
  room: 'baron-office' | 'cubicles' | 'relax-room';
};

type PositionedMember = CouncilMember & {
  live?: LiveState;
  x: number;
  y: number;
};

const MEMBERS: CouncilMember[] = [
  { id: 'baron', name: 'Baron', role: 'Lead Strategist & Architect', level: 'Tier 1', status: 'Active', description: '', capabilities: [], color: 'blue' },
  { id: 'scotty', name: 'Scotty', role: 'Market Intelligence Scout', level: 'Tier 2', status: 'Standby', description: '', capabilities: [], color: 'emerald' },
  { id: 'maurice', name: 'Maurice', role: 'Creative Director', level: 'Tier 2', status: 'Standby', description: '', capabilities: [], color: 'purple' },
  { id: 'hacker', name: 'Hacker', role: 'Code Engineer', level: 'Tier 2', status: 'Standby', description: '', capabilities: [], color: 'blue' },
  { id: 'oracle', name: 'Oracle', role: 'Data Analyst', level: 'Tier 2', status: 'Standby', description: '', capabilities: [], color: 'emerald' },
  { id: 'sentinel', name: 'Sentinel', role: 'Ops & Monitoring', level: 'Tier 2', status: 'Standby', description: '', capabilities: [], color: 'purple' },
];

const SPRITES: Record<string, string[]> = {
  baron: ['..bbb.', '.bwwb.', '.bkkb.', '.byyb.', '.b..b.', '..bb..'],
  scotty: ['..gg..', '.gwwg.', '.gkkg.', '.gyyg.', '.g..g.', '..gg..'],
  maurice: ['..pp..', '.pwwp.', '.pkkp.', '.pyyp.', '.p..p.', '..pp..'],
  hacker: ['..cc..', '.cwwc.', '.ckkc.', '.cyyc.', '.c..c.', '..cc..'],
  oracle: ['..te..', '.twwt.', '.tkkt.', '.tyyt.', '.t..t.', '..tt..'],
  sentinel: ['..rr..', '.rwwr.', '.rkkr.', '.ryyr.', '.r..r.', '..rr..'],
};

const WORK_SPOTS = [
  { x: 220, y: 205 },
  { x: 300, y: 226 },
  { x: 380, y: 248 },
  { x: 460, y: 270 },
];
const RELAX_SPOTS = [
  { x: 560, y: 300 },
  { x: 605, y: 320 },
  { x: 575, y: 343 },
];
const BARON_SPOT = { x: 545, y: 142 };
const OFFLINE_SPOT = { x: 145, y: 330 };

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
    async function initialLoad() {
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

    initialLoad();
    const timer = setInterval(poll, 20000);
    return () => clearInterval(timer);
  }, []);

  const positioned = useMemo(() => {
    const merged = MEMBERS.map((m) => ({ ...m, live: states.find((s) => s.id === m.id) }));

    const baron = merged.filter((m) => m.id === 'baron').map((m) => ({ ...m, x: BARON_SPOT.x, y: BARON_SPOT.y }));
    const workers = merged
      .filter((m) => m.id !== 'baron' && m.live?.status === 'working')
      .map((m, i) => ({ ...m, x: WORK_SPOTS[i % WORK_SPOTS.length].x, y: WORK_SPOTS[i % WORK_SPOTS.length].y }));
    const idle = merged
      .filter((m) => m.id !== 'baron' && (!m.live || m.live.status === 'idle'))
      .map((m, i) => ({ ...m, x: RELAX_SPOTS[i % RELAX_SPOTS.length].x, y: RELAX_SPOTS[i % RELAX_SPOTS.length].y }));
    const offline = merged
      .filter((m) => m.id !== 'baron' && m.live?.status === 'offline')
      .map((m) => ({ ...m, x: OFFLINE_SPOT.x, y: OFFLINE_SPOT.y }));

    return [...baron, ...workers, ...idle, ...offline] as PositionedMember[];
  }, [states]);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pb-16">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Council Office Live View</h2>
          <p className="text-slate-400 text-sm max-w-3xl">
            Clean isometric office style with live behavior. Working agents stay at desks, idle agents move to lounge, Baron has private office.
          </p>
        </div>
        <button onClick={refreshStates} className="pixel-btn px-3 py-1.5 text-xs flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> {loading ? 'Syncing...' : 'Refresh'}
        </button>
      </header>

      <div className="pixel-card p-4 mb-6 overflow-x-auto">
        <div className="relative min-w-[720px] h-[470px] wire-soft">
          <OfficeIsometricScene />

          {positioned.map((member) => (
            <Avatar key={member.id} member={member} onClick={() => setActiveMember(member)} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {positioned.map((member) => {
          const status = member.live?.status ?? 'idle';
          const tone = status === 'working' ? 'text-emerald-300' : status === 'offline' ? 'text-rose-300' : 'text-amber-200';
          return (
            <div key={member.id} className="pixel-card-light p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-zinc-900">{member.name}</p>
                  <p className="text-[11px] text-zinc-600">{member.role}</p>
                </div>
                <span className={`text-[11px] font-bold uppercase ${tone}`}>{status}</span>
              </div>
              <p className="text-[11px] text-zinc-600 mt-1">
                {member.live?.lastActiveAt ? `Last active ${new Date(member.live.lastActiveAt).toLocaleTimeString()}` : 'No recent logs'}
              </p>
              <button onClick={() => setActiveMember(member)} className="mt-2 pixel-btn px-2 py-1 text-[11px] flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Message
              </button>
            </div>
          );
        })}
      </div>

      <ChatModal member={activeMember} isOpen={!!activeMember} onClose={() => setActiveMember(null)} />
    </div>
  );
}

function OfficeIsometricScene() {
  return (
    <svg viewBox="0 0 720 470" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="floor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e3c8a6" />
          <stop offset="100%" stopColor="#c9a37a" />
        </linearGradient>
        <linearGradient id="wallLeft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3e7d9" />
          <stop offset="100%" stopColor="#e0ccb6" />
        </linearGradient>
        <linearGradient id="wallRight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#efe2d2" />
          <stop offset="100%" stopColor="#dcc6ad" />
        </linearGradient>
        <linearGradient id="deskTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e5ebf3" />
          <stop offset="100%" stopColor="#cdd6e2" />
        </linearGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c2e6ff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#8bb6d6" stopOpacity="0.45" />
        </linearGradient>
      </defs>

      {/* Floor plane */}
      <polygon points="110,150 520,40 700,175 290,285" fill="url(#floor)" stroke="#8b6b4e" strokeWidth="2" />

      {/* Back + side walls */}
      <polygon points="110,150 520,40 520,-110 110,0" fill="#f4e9dc" stroke="#8b6b4e" strokeWidth="2" />
      <polygon points="110,150 290,285 290,120 110,0" fill="url(#wallLeft)" stroke="#8b6b4e" strokeWidth="2" />
      <polygon points="520,40 700,175 700,10 520,-110" fill="url(#wallRight)" stroke="#8b6b4e" strokeWidth="2" />

      {/* Window band */}
      <polygon points="210,70 470,5 470,-45 210,20" fill="#c9def0" opacity="0.65" />
      <line x1="300" y1="45" x2="560" y2="-20" stroke="#b4c9db" strokeWidth="2" opacity="0.7" />

      {/* Entry mat */}
      <polygon points="140,300 220,282 250,302 170,320" fill="#1f2937" opacity="0.6" />
      <polygon points="152,300 220,286 238,298 170,312" fill="#334155" opacity="0.75" />

      {/* Baron private office (glass cube) */}
      <polygon points="455,118 545,94 615,138 525,162" fill="#cfd8e3" stroke="#6b7280" strokeWidth="2" />
      <polygon points="455,118 525,162 525,95 455,52" fill="url(#glass)" stroke="#5f7f99" strokeWidth="2" />
      <polygon points="545,94 615,138 615,70 545,26" fill="url(#glass)" stroke="#5f7f99" strokeWidth="2" />
      <polygon points="525,162 615,138 615,210 525,234" fill="url(#glass)" stroke="#5f7f99" strokeWidth="2" />

      {/* Baron desk */}
      <polygon points="500,138 545,126 570,141 525,153" fill="#9aa4b2" stroke="#4b5563" strokeWidth="2" />
      <polygon points="500,138 525,153 525,170 500,154" fill="#6b7280" stroke="#374151" strokeWidth="2" />
      <polygon points="525,153 570,141 570,160 525,172" fill="#7b8794" stroke="#374151" strokeWidth="2" />

      {/* Cubicle cluster */}
      <polygon points="170,185 230,170 255,186 195,201" fill="url(#deskTop)" stroke="#6d7786" strokeWidth="2" />
      <polygon points="230,170 290,155 315,171 255,186" fill="url(#deskTop)" stroke="#6d7786" strokeWidth="2" />
      <polygon points="290,155 350,140 375,156 315,171" fill="url(#deskTop)" stroke="#6d7786" strokeWidth="2" />
      <polygon points="350,140 410,125 435,141 375,156" fill="url(#deskTop)" stroke="#6d7786" strokeWidth="2" />

      <polygon points="195,201 255,186 255,208 195,223" fill="#b7c0cb" stroke="#6d7786" strokeWidth="2" />
      <polygon points="255,186 315,171 315,193 255,208" fill="#aeb7c2" stroke="#6d7786" strokeWidth="2" />
      <polygon points="315,171 375,156 375,178 315,193" fill="#b7c0cb" stroke="#6d7786" strokeWidth="2" />
      <polygon points="375,156 435,141 435,163 375,178" fill="#aeb7c2" stroke="#6d7786" strokeWidth="2" />

      {/* Chairs */}
      <polygon points="210,210 225,206 234,212 219,216" fill="#6b7280" stroke="#111827" strokeWidth="1" />
      <polygon points="290,201 305,197 314,203 299,207" fill="#6b7280" stroke="#111827" strokeWidth="1" />
      <polygon points="370,193 385,189 394,195 379,199" fill="#6b7280" stroke="#111827" strokeWidth="1" />
      <polygon points="450,184 465,180 474,186 459,190" fill="#6b7280" stroke="#111827" strokeWidth="1" />

      {/* Lounge area */}
      <polygon points="505,268 590,248 625,270 540,292" fill="#f6d365" stroke="#a67c00" strokeWidth="2" />
      <polygon points="530,300 615,280 650,302 565,324" fill="#f6d365" stroke="#a67c00" strokeWidth="2" />
      <polygon points="520,282 560,272 575,282 535,292" fill="#94a3b8" stroke="#475569" strokeWidth="2" />

      {/* Sofa */}
      <polygon points="545,265 595,253 615,266 565,278" fill="#d97706" stroke="#92400e" strokeWidth="2" />
      <polygon points="545,265 565,278 565,298 545,285" fill="#b45309" stroke="#92400e" strokeWidth="2" />
      <polygon points="565,278 615,266 615,286 565,298" fill="#c2410c" stroke="#92400e" strokeWidth="2" />

      {/* File cabinets */}
      <polygon points="140,170 175,162 190,172 155,180" fill="#cbd5f5" stroke="#6b7280" strokeWidth="2" />
      <polygon points="155,180 190,172 190,200 155,208" fill="#a5b4fc" stroke="#6b7280" strokeWidth="2" />

      {/* Plants */}
      <polygon points="130,140 145,136 152,143 137,147" fill="#22c55e" stroke="#166534" strokeWidth="1" />
      <polygon points="640,175 655,171 662,178 647,182" fill="#22c55e" stroke="#166534" strokeWidth="1" />

      {/* Labels */}
      <text x="165" y="108" fontSize="11" fontWeight="700" fill="#374151">Open Workspace</text>
      <text x="520" y="88" fontSize="11" fontWeight="700" fill="#374151">Baron Office</text>
      <text x="560" y="240" fontSize="11" fontWeight="700" fill="#374151">Lounge</text>
    </svg>
  );
}

function Avatar({ member, onClick }: { member: PositionedMember; onClick: () => void }) {
  const status = member.live?.status ?? 'idle';
  const animation = status === 'working' ? 'floatWork 1.1s ease-in-out infinite' : status === 'idle' ? 'floatIdle 2.8s ease-in-out infinite' : undefined;

  return (
    <motion.button
      onClick={onClick}
      className="absolute group"
      animate={{ left: member.x, top: member.y }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
      style={{ transform: 'translate(-50%, -50%)', animation }}
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute -bottom-1 w-9 h-3 rounded-full bg-black/35 blur-[2px]" />
        <div className="w-10 h-10 border-2 border-black rounded bg-gradient-to-br from-amber-200 to-amber-400 shadow-[2px_2px_0_#000] flex items-center justify-center">
          <PixelSprite id={member.id} />
        </div>
        <div className="mt-1 text-[10px] font-bold text-white bg-black/70 px-1.5 py-0.5 rounded">
          {member.name}
        </div>
      </div>
    </motion.button>
  );
}

function PixelSprite({ id }: { id: string }) {
  const rows = SPRITES[id] ?? SPRITES.baron;

  return (
    <div className="grid grid-cols-6 gap-[1px] p-[2px] bg-black">
      {rows.join('').split('').map((ch, idx) => {
        const color = ch === 'b' ? '#3b82f6'
          : ch === 'g' ? '#10b981'
          : ch === 'p' ? '#a855f7'
          : ch === 'c' ? '#06b6d4'
          : ch === 't' ? '#14b8a6'
          : ch === 'r' ? '#f43f5e'
          : ch === 'w' ? '#f8fafc'
          : ch === 'k' ? '#111827'
          : ch === 'y' ? '#facc15'
          : 'transparent';

        return <span key={idx} className="w-1.5 h-1.5" style={{ backgroundColor: color }} />;
      })}
    </div>
  );
}
