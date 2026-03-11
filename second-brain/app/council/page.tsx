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
  { id: 'baron', name: 'Baron', role: 'Lead Strategist & Architect', level: 'Tier 1: Command', status: 'Active', description: 'System architecture and strategic command.', capabilities: ['Architecture', 'Decision Engine'], color: 'blue' },
  { id: 'scotty', name: 'Scotty', role: 'Market Intelligence Scout', level: 'Tier 2', status: 'Standby', description: 'Market trends and demand signals.', capabilities: ['Research', 'Trend Scan'], color: 'emerald' },
  { id: 'maurice', name: 'Maurice', role: 'Creative Director', level: 'Tier 2', status: 'Standby', description: 'Offer design and conversion copy.', capabilities: ['Offer Design', 'UX'], color: 'purple' },
  { id: 'hacker', name: 'Hacker', role: 'Code Engineer', level: 'Tier 2', status: 'Standby', description: 'Build and automation delivery.', capabilities: ['Engineering', 'Automation'], color: 'blue' },
  { id: 'oracle', name: 'Oracle', role: 'Data Analyst', level: 'Tier 2', status: 'Standby', description: 'Metrics and pattern analysis.', capabilities: ['Analytics', 'Forecasting'], color: 'emerald' },
  { id: 'sentinel', name: 'Sentinel', role: 'Ops & Monitoring', level: 'Tier 2', status: 'Standby', description: 'Operational resilience and alerts.', capabilities: ['Monitoring', 'Security'], color: 'purple' },
];

const SPRITES: Record<string, string[]> = {
  baron: ['..bbb.', '.bwwb.', '.bkkb.', '.byyb.', '.b..b.', '..bb..'],
  scotty: ['..gg..', '.gwwg.', '.gkkg.', '.gyyg.', '.g..g.', '..gg..'],
  maurice: ['..pp..', '.pwwp.', '.pkkp.', '.pyyp.', '.p..p.', '..pp..'],
  hacker: ['..cc..', '.cwwc.', '.ckkc.', '.cyyc.', '.c..c.', '..cc..'],
  oracle: ['..te..', '.twwt.', '.tkkt.', '.tyyt.', '.t..t.', '..tt..'],
  sentinel: ['..rr..', '.rwwr.', '.rkkr.', '.ryyr.', '.r..r.', '..rr..'],
};

const CUBICLE_SPOTS = [
  { x: 12, y: 20 }, { x: 30, y: 20 }, { x: 48, y: 20 }, { x: 12, y: 43 }, { x: 30, y: 43 }, { x: 48, y: 43 },
];
const RELAX_SPOTS = [{ x: 73, y: 70 }, { x: 84, y: 68 }, { x: 77, y: 82 }, { x: 88, y: 82 }];
const BARON_SPOT = { x: 79, y: 22 };
const OFFLINE_SPOT = { x: 6, y: 84 };

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
      .map((m, idx) => {
        const spot = CUBICLE_SPOTS[idx % CUBICLE_SPOTS.length];
        return { ...m, x: spot.x, y: spot.y };
      });

    const offline = merged
      .filter((m) => m.id !== 'baron' && m.live?.status === 'offline')
      .map((m) => ({ ...m, x: OFFLINE_SPOT.x, y: OFFLINE_SPOT.y }));

    const idle = merged
      .filter((m) => m.id !== 'baron' && (!m.live || m.live.status === 'idle'))
      .map((m, idx) => {
        const spot = RELAX_SPOTS[idx % RELAX_SPOTS.length];
        return { ...m, x: spot.x, y: spot.y };
      });

    return [...baron, ...workers, ...offline, ...idle] as PositionedMember[];
  }, [states]);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pb-16">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Council Office Live View</h2>
          <p className="text-slate-400 text-sm max-w-3xl">
            Real-style office layout. Working agents stay in cubicles, idle agents move to the relax room, Baron stays in his private office.
          </p>
        </div>
        <button onClick={refreshStates} className="pixel-btn px-3 py-1.5 text-xs flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> {loading ? 'Syncing...' : 'Refresh'}
        </button>
      </header>

      <div className="pixel-card p-4 mb-6">
        <div className="relative h-[540px] md:h-[520px] wire-soft overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }} />

          <Room label="Open Workspace" x={6} y={12} w={58} h={58} />
          <Room label="Baron Office" x={69} y={10} w={25} h={28} />
          <Room label="Relax Room" x={67} y={62} w={27} h={28} />
          <Room label="Entry" x={2} y={76} w={19} h={18} />

          {/* Cubicles */}
          {CUBICLE_SPOTS.map((d, i) => (
            <Desk key={i} x={d.x} y={d.y} />
          ))}

          {/* Relax furniture */}
          <Sofa x={72} y={74} />
          <Sofa x={83} y={74} />
          <CoffeeTable x={78} y={82} />

          {positioned.map((member) => (
            <Avatar
              key={member.id}
              member={member}
              onClick={() => setActiveMember(member)}
            />
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

function Room({ label, x, y, w, h }: { label: string; x: number; y: number; w: number; h: number }) {
  return (
    <div className="absolute border-2 border-black/70 rounded-md bg-white/20" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}>
      <span className="absolute -top-5 left-0 text-[10px] text-zinc-700 font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Desk({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute w-12 h-8 bg-[#d9dee6] border-2 border-black rounded-sm" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="w-4 h-2 bg-[#8aa1c2] border border-black mt-1 ml-1" />
    </div>
  );
}

function Sofa({ x, y }: { x: number; y: number }) {
  return <div className="absolute w-14 h-8 bg-[#facc15] border-2 border-black rounded-sm" style={{ left: `${x}%`, top: `${y}%` }} />;
}

function CoffeeTable({ x, y }: { x: number; y: number }) {
  return <div className="absolute w-10 h-6 bg-[#94a3b8] border-2 border-black rounded-sm" style={{ left: `${x}%`, top: `${y}%` }} />;
}

function Avatar({ member, onClick }: { member: PositionedMember; onClick: () => void }) {
  const status = member.live?.status ?? 'idle';
  const animation = status === 'working' ? 'floatWork 1.1s ease-in-out infinite' : status === 'idle' ? 'floatIdle 2.8s ease-in-out infinite' : undefined;

  return (
    <motion.button
      onClick={onClick}
      className="absolute group"
      animate={{ left: `${member.x}%`, top: `${member.y}%` }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{ animation }}
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
