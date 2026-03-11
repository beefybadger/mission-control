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
  { x: 180, y: 175 }, { x: 260, y: 198 }, { x: 340, y: 220 }, { x: 420, y: 243 },
];
const RELAX_SPOTS = [
  { x: 505, y: 275 }, { x: 560, y: 292 }, { x: 525, y: 325 },
];
const BARON_SPOT = { x: 490, y: 148 };
const OFFLINE_SPOT = { x: 110, y: 310 };

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
      {/* Floor */}
      <polygon points="140,120 520,40 660,170 280,250" fill="#cfb495" stroke="#8b6b4e" strokeWidth="2" />

      {/* Left wall */}
      <polygon points="140,120 280,250 280,120 140,-10" fill="#e8d9c8" stroke="#8b6b4e" strokeWidth="2" />
      {/* Right wall */}
      <polygon points="520,40 660,170 660,40 520,-90" fill="#e3d3c1" stroke="#8b6b4e" strokeWidth="2" />

      {/* Baron office glass */}
      <polygon points="430,72 530,50 585,100 485,122" fill="#9ec5e8" opacity="0.55" stroke="#5f7f99" strokeWidth="2" />

      {/* Cubicle desks */}
      <polygon points="170,165 225,153 247,173 192,185" fill="#d9dee6" stroke="#6d7786" strokeWidth="2" />
      <polygon points="245,187 300,175 322,195 267,207" fill="#d9dee6" stroke="#6d7786" strokeWidth="2" />
      <polygon points="320,210 375,198 397,218 342,230" fill="#d9dee6" stroke="#6d7786" strokeWidth="2" />
      <polygon points="395,233 450,221 472,241 417,253" fill="#d9dee6" stroke="#6d7786" strokeWidth="2" />

      {/* Chairs */}
      <polygon points="206,183 220,180 225,186 211,189" fill="#6b7280" stroke="#111827" strokeWidth="1" />
      <polygon points="281,205 295,202 300,208 286,211" fill="#6b7280" stroke="#111827" strokeWidth="1" />
      <polygon points="356,228 370,225 375,231 361,234" fill="#6b7280" stroke="#111827" strokeWidth="1" />
      <polygon points="431,251 445,248 450,254 436,257" fill="#6b7280" stroke="#111827" strokeWidth="1" />

      {/* Relax room */}
      <polygon points="490,255 555,241 578,262 513,276" fill="#f8d45d" stroke="#a77c00" strokeWidth="2" />
      <polygon points="525,289 590,275 613,296 548,310" fill="#f8d45d" stroke="#a77c00" strokeWidth="2" />
      <polygon points="530,265 560,258 572,270 542,277" fill="#94a3b8" stroke="#475569" strokeWidth="2" />

      {/* Plants */}
      <polygon points="150,115 162,112 167,118 155,121" fill="#22c55e" stroke="#166534" strokeWidth="1" />
      <polygon points="610,150 622,147 627,153 615,156" fill="#22c55e" stroke="#166534" strokeWidth="1" />

      {/* Labels */}
      <text x="170" y="98" fontSize="11" fontWeight="700" fill="#374151">Open Workspace</text>
      <text x="495" y="88" fontSize="11" fontWeight="700" fill="#374151">Baron Office</text>
      <text x="535" y="237" fontSize="11" fontWeight="700" fill="#374151">Relax Room</text>
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
      <div className="w-10 h-10 border-2 border-black rounded-sm bg-yellow-300 shadow-[2px_2px_0_#000] flex items-center justify-center">
        <PixelSprite id={member.id} />
      </div>
      <div className="mt-1 text-[10px] font-bold text-white bg-black/65 px-1.5 py-0.5 rounded">
        {member.name}
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
