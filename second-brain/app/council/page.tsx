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
  gx: number;
  gy: number;
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

const WORK_SPOTS = [
  { gx: 2, gy: 2 }, { gx: 4, gy: 2 }, { gx: 6, gy: 2 },
  { gx: 2, gy: 4 }, { gx: 4, gy: 4 }, { gx: 6, gy: 4 },
];
const RELAX_SPOTS = [{ gx: 9, gy: 7 }, { gx: 10, gy: 7 }, { gx: 9, gy: 8 }, { gx: 10, gy: 8 }];
const BARON_SPOT = { gx: 10, gy: 2 };
const OFFLINE_SPOT = { gx: 1, gy: 9 };

const TILE_W = 46;
const TILE_H = 24;
const ORIGIN_X = 320;
const ORIGIN_Y = 72;

function project(gx: number, gy: number) {
  return {
    x: ORIGIN_X + (gx - gy) * (TILE_W / 2),
    y: ORIGIN_Y + (gx + gy) * (TILE_H / 2),
  };
}

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

    const baron = merged.filter((m) => m.id === 'baron').map((m) => ({ ...m, gx: BARON_SPOT.gx, gy: BARON_SPOT.gy }));

    const workers = merged
      .filter((m) => m.id !== 'baron' && m.live?.status === 'working')
      .map((m, idx) => ({ ...m, gx: WORK_SPOTS[idx % WORK_SPOTS.length].gx, gy: WORK_SPOTS[idx % WORK_SPOTS.length].gy }));

    const idle = merged
      .filter((m) => m.id !== 'baron' && (!m.live || m.live.status === 'idle'))
      .map((m, idx) => ({ ...m, gx: RELAX_SPOTS[idx % RELAX_SPOTS.length].gx, gy: RELAX_SPOTS[idx % RELAX_SPOTS.length].gy }));

    const offline = merged
      .filter((m) => m.id !== 'baron' && m.live?.status === 'offline')
      .map((m) => ({ ...m, gx: OFFLINE_SPOT.gx, gy: OFFLINE_SPOT.gy }));

    return [...baron, ...workers, ...idle, ...offline] as PositionedMember[];
  }, [states]);

  const tiles = useMemo(() => {
    const out: { gx: number; gy: number }[] = [];
    for (let gx = 0; gx <= 12; gx += 1) {
      for (let gy = 0; gy <= 10; gy += 1) out.push({ gx, gy });
    }
    return out;
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pb-16">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Council Office Live View</h2>
          <p className="text-slate-400 text-sm max-w-3xl">
            Stardew-inspired isometric office: live status controls where each avatar moves. Baron has his own private office.
          </p>
        </div>
        <button onClick={refreshStates} className="pixel-btn px-3 py-1.5 text-xs flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> {loading ? 'Syncing...' : 'Refresh'}
        </button>
      </header>

      <div className="pixel-card p-4 mb-6 overflow-x-auto">
        <div className="relative min-w-[660px] h-[500px] wire-soft">
          {tiles.map((t) => {
            const p = project(t.gx, t.gy);
            return (
              <IsoTile key={`${t.gx}-${t.gy}`} x={p.x} y={p.y} />
            );
          })}

          <IsoZone label="Open Workspace" gx={4} gy={3} w={6} h={5} tone="blue" />
          <IsoZone label="Baron Office" gx={10} gy={2} w={2.5} h={3} tone="amber" />
          <IsoZone label="Relax Room" gx={9.6} gy={7.6} w={2.5} h={2.4} tone="emerald" />

          {WORK_SPOTS.map((s, i) => <IsoDesk key={i} gx={s.gx} gy={s.gy} />)}
          <IsoSofa gx={9.2} gy={7.7} />
          <IsoSofa gx={10.3} gy={7.8} />
          <IsoPlant gx={9.2} gy={2.2} />
          <IsoPlant gx={10.8} gy={2.2} />

          {positioned.map((member) => (
            <IsoAvatar key={member.id} member={member} onClick={() => setActiveMember(member)} />
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

function IsoTile({ x, y }: { x: number; y: number }) {
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <div
        className="w-[46px] h-[24px] border border-black/30"
        style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', background: '#c8d2c3' }}
      />
    </div>
  );
}

function IsoZone({ label, gx, gy, w, h, tone }: { label: string; gx: number; gy: number; w: number; h: number; tone: 'blue' | 'amber' | 'emerald' }) {
  const p = project(gx, gy);
  const color = tone === 'blue' ? '#93c5fd' : tone === 'amber' ? '#fcd34d' : '#86efac';
  return (
    <div className="absolute" style={{ left: p.x, top: p.y }}>
      <div
        className="absolute border-2 border-black/60"
        style={{
          width: w * TILE_W,
          height: h * TILE_H,
          transform: 'translate(-50%, -50%)',
          background: `${color}66`,
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        }}
      />
      <div className="absolute -top-4 left-0 text-[10px] font-bold text-zinc-800 bg-white/80 px-1 rounded">{label}</div>
    </div>
  );
}

function IsoDesk({ gx, gy }: { gx: number; gy: number }) {
  const p = project(gx, gy);
  return (
    <div className="absolute" style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)' }}>
      <div className="w-7 h-4 border border-black bg-[#d1d8e2]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
      <div className="w-2 h-1 bg-[#7ea3cc] border border-black absolute left-2.5 top-1.5" />
    </div>
  );
}

function IsoSofa({ gx, gy }: { gx: number; gy: number }) {
  const p = project(gx, gy);
  return (
    <div className="absolute" style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)' }}>
      <div className="w-9 h-5 border border-black bg-[#fbbf24]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
    </div>
  );
}

function IsoPlant({ gx, gy }: { gx: number; gy: number }) {
  const p = project(gx, gy);
  return (
    <div className="absolute" style={{ left: p.x, top: p.y, transform: 'translate(-50%, -50%)' }}>
      <div className="w-4 h-3 border border-black bg-[#22c55e]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
    </div>
  );
}

function IsoAvatar({ member, onClick }: { member: PositionedMember; onClick: () => void }) {
  const p = project(member.gx, member.gy);
  const status = member.live?.status ?? 'idle';
  const animation = status === 'working' ? 'floatWork 1.1s ease-in-out infinite' : status === 'idle' ? 'floatIdle 2.8s ease-in-out infinite' : undefined;

  return (
    <motion.button
      onClick={onClick}
      className="absolute group"
      animate={{ left: p.x, top: p.y - 18 }}
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
