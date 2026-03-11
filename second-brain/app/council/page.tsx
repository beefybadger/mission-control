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

const TILE_W = 52;
const TILE_H = 26;
const ORIGIN_X = 360;
const ORIGIN_Y = 78;

const MEMBERS: CouncilMember[] = [
  { id: 'baron', name: 'Baron', role: 'Orchestrator', level: 'Command', status: 'Active', description: '', capabilities: ['Dashboard', 'Planning'], color: 'blue' },
  { id: 'scotty', name: 'Scotty', role: 'Research Agent', level: 'Execution', status: 'Standby', description: '', capabilities: ['Books', 'Market Notes'], color: 'purple' },
  { id: 'hacker', name: 'Hacker', role: 'Coding Agent', level: 'Execution', status: 'Standby', description: '', capabilities: ['Terminal', 'Code'], color: 'blue' },
  { id: 'oracle', name: 'Oracle', role: 'Data Agent', level: 'Execution', status: 'Standby', description: '', capabilities: ['Server', 'Metrics'], color: 'emerald' },
  { id: 'maurice', name: 'Maurice', role: 'UI Agent', level: 'Execution', status: 'Standby', description: '', capabilities: ['Sketches', 'Tablet'], color: 'purple' },
  { id: 'sentinel', name: 'Sentinel', role: 'QA Agent', level: 'Execution', status: 'Standby', description: '', capabilities: ['Checklist', 'Validation'], color: 'purple' },
];

const SPRITES: Record<string, string[]> = {
  baron: ['..bbb.', '.bwwb.', '.bkkb.', '.byyb.', '.b..b.', '..bb..'],
  scotty: ['..pp..', '.pwwp.', '.pkkp.', '.pyyp.', '.p..p.', '..pp..'],
  hacker: ['..cc..', '.cwwc.', '.ckkc.', '.cyyc.', '.c..c.', '..cc..'],
  oracle: ['..gg..', '.gwwg.', '.gkkg.', '.gyyg.', '.g..g.', '..gg..'],
  maurice: ['..oo..', '.owwo.', '.okko.', '.oyyo.', '.o..o.', '..oo..'],
  sentinel: ['..rr..', '.rwwr.', '.rkkr.', '.ryyr.', '.r..r.', '..rr..'],
};

const ROLE_WORK_SPOT: Record<string, { gx: number; gy: number }> = {
  baron: { gx: 6.4, gy: 4.7 },
  hacker: { gx: 3.0, gy: 5.1 },
  maurice: { gx: 4.1, gy: 6.0 },
  scotty: { gx: 8.5, gy: 5.4 },
  sentinel: { gx: 8.0, gy: 6.4 },
  oracle: { gx: 10.2, gy: 3.6 },
};

const RELAX_SPOTS = [
  { gx: 9.4, gy: 8.4 },
  { gx: 10.4, gy: 8.2 },
  { gx: 9.8, gy: 9.2 },
  { gx: 10.7, gy: 9.1 },
];

const OFFLINE_SPOT = { gx: 1.2, gy: 9.4 };

const FLOW_LINKS: [string, string][] = [
  ['baron', 'hacker'],
  ['baron', 'maurice'],
  ['hacker', 'sentinel'],
  ['sentinel', 'baron'],
  ['scotty', 'baron'],
  ['oracle', 'hacker'],
  ['oracle', 'baron'],
];

function iso(gx: number, gy: number) {
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
    async function loadInitial() {
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

  const positioned = useMemo(() => {
    const merged = MEMBERS.map((m) => ({ ...m, live: states.find((s) => s.id === m.id) }));

    const baron = merged
      .filter((member) => member.id === 'baron')
      .map((member) => {
        const s = ROLE_WORK_SPOT.baron;
        return { ...member, gx: s.gx, gy: s.gy };
      });

    const working = merged
      .filter((member) => member.id !== 'baron' && (member.live?.status ?? 'idle') === 'working')
      .map((member) => {
        const s = ROLE_WORK_SPOT[member.id] ?? { gx: 3, gy: 5 };
        return { ...member, gx: s.gx, gy: s.gy };
      });

    const offline = merged
      .filter((member) => member.id !== 'baron' && member.live?.status === 'offline')
      .map((member) => ({ ...member, gx: OFFLINE_SPOT.gx, gy: OFFLINE_SPOT.gy }));

    const idle = merged
      .filter((member) => member.id !== 'baron' && (!member.live || member.live.status === 'idle'))
      .map((member, index) => {
        const s = RELAX_SPOTS[index % RELAX_SPOTS.length];
        return { ...member, gx: s.gx, gy: s.gy };
      });

    return [...baron, ...working, ...offline, ...idle] as PositionedMember[];
  }, [states]);

  const byId = useMemo(() => {
    const map = new Map<string, PositionedMember>();
    positioned.forEach((p) => map.set(p.id, p));
    return map;
  }, [positioned]);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 pb-16">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2">Council Office (Stardew 2.5D)</h2>
          <p className="text-slate-400 text-sm max-w-3xl">
            Cozy indie-dev isometric workspace with live agent movement and visual data flow.
          </p>
        </div>
        <button onClick={refreshStates} className="pixel-btn px-3 py-1.5 text-xs flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> {loading ? 'Syncing...' : 'Refresh'}
        </button>
      </header>

      <div className="pixel-card p-4 mb-6 overflow-x-auto">
        <div className="relative min-w-[760px] h-[560px] wire-soft">
          <Scene />

          {FLOW_LINKS.map(([from, to]) => {
            const a = byId.get(from);
            const b = byId.get(to);
            if (!a || !b) return null;
            return <DataLink key={`${from}-${to}`} from={iso(a.gx, a.gy)} to={iso(b.gx, b.gy)} />;
          })}

          {positioned.map((member) => (
            <Avatar key={member.id} member={member} onClick={() => setActiveMember(member)} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
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

      <div className="pixel-card-light p-3 mb-3">
        <p className="text-[11px] font-bold text-zinc-700 mb-1">Layout Diagram</p>
        <pre className="text-[11px] text-zinc-700 whitespace-pre-wrap">[Back Wall: Whiteboards + Activity Screens]
---------------------------------------------------------------
| Bookshelf/Notes | Server Rack (Data) | Glass Panel |
|-----------------+--------------------+------------|
| Coding Desk     | Command Core       | Research   |
| UI Desk         | (Orchestrator)     | QA Desk    |
|-----------------+--------------------+------------|
| Plants + Storage| Walkway            | Coffee Nook|
---------------------------------------------------------------
[Front/Entry edge with subtle data cables]</pre>
      </div>

      <ChatModal member={activeMember} isOpen={!!activeMember} onClose={() => setActiveMember(null)} />
    </div>
  );
}

function Scene() {
  return (
    <svg viewBox="0 0 760 560" className="absolute inset-0 w-full h-full">
      <defs>
        <linearGradient id="woodFloor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C89B6D" />
          <stop offset="100%" stopColor="#9B744D" />
        </linearGradient>
      </defs>

      {/* Floor */}
      <polygon points="130,165 555,52 720,185 295,298" fill="url(#woodFloor)" stroke="#7a583b" strokeWidth="2" />

      {/* Walls */}
      <polygon points="130,165 295,298 295,118 130,-15" fill="#EADFCF" stroke="#8B6B4E" strokeWidth="2" />
      <polygon points="555,52 720,185 720,4 555,-128" fill="#E6D7C4" stroke="#8B6B4E" strokeWidth="2" />
      <polygon points="130,165 555,52 555,-128 130,-15" fill="#F1E7DA" stroke="#8B6B4E" strokeWidth="2" />

      {/* Whiteboards + activity screen */}
      <polygon points="210,52 360,13 360,-40 210,-1" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
      <polygon points="368,11 505,-24 505,-72 368,-37" fill="#dbeafe" stroke="#64748b" strokeWidth="2" className="monitor-blink" />

      {/* Command core (center) */}
      <polygon points="340,208 425,186 460,208 375,230" fill="#a5764b" stroke="#5b3b23" strokeWidth="2" />
      <polygon points="375,230 460,208 460,232 375,254" fill="#8b5e3c" stroke="#5b3b23" strokeWidth="2" />
      <polygon points="340,208 375,230 375,254 340,232" fill="#7b5235" stroke="#5b3b23" strokeWidth="2" />
      <polygon points="360,206 390,198 405,208 375,216" fill="#6FD3FF" stroke="#1d4ed8" strokeWidth="1" className="monitor-blink" />

      {/* Dev cluster left */}
      <polygon points="205,225 265,209 288,224 228,240" fill="#cfd8e3" stroke="#586476" strokeWidth="2" />
      <polygon points="244,247 304,231 327,246 267,262" fill="#cfd8e3" stroke="#586476" strokeWidth="2" />
      <polygon points="223,222 235,218 242,223 230,227" fill="#8CFFB5" stroke="#166534" strokeWidth="1" className="monitor-blink" />
      <polygon points="262,244 274,240 281,245 269,249" fill="#6FD3FF" stroke="#1d4ed8" strokeWidth="1" className="monitor-blink" />

      {/* Analysis wing right */}
      <polygon points="465,258 530,241 555,258 490,275" fill="#cfd8e3" stroke="#586476" strokeWidth="2" />
      <polygon points="500,278 565,261 590,278 525,295" fill="#cfd8e3" stroke="#586476" strokeWidth="2" />
      <polygon points="522,204 620,179 650,198 552,223" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />

      {/* Infra corner */}
      <polygon points="560,134 603,123 620,136 577,147" fill="#64748b" stroke="#111827" strokeWidth="2" />
      <polygon points="577,147 620,136 620,208 577,219" fill="#475569" stroke="#111827" strokeWidth="2" />
      <polygon points="560,134 577,147 577,219 560,206" fill="#334155" stroke="#111827" strokeWidth="2" />
      <circle cx="594" cy="152" r="2" fill="#8CFFB5" className="server-led" />
      <circle cx="594" cy="163" r="2" fill="#6FD3FF" className="server-led" />

      {/* Baron separate office (glass) */}
      <polygon points="470,112 542,93 606,134 534,153" fill="#b7d7ef" opacity="0.55" stroke="#5f7f99" strokeWidth="2" />
      <polygon points="470,112 534,153 534,90 470,49" fill="#b7d7ef" opacity="0.45" stroke="#5f7f99" strokeWidth="2" />
      <polygon points="542,93 606,134 606,71 542,30" fill="#b7d7ef" opacity="0.45" stroke="#5f7f99" strokeWidth="2" />

      {/* Break nook */}
      <polygon points="520,338 610,314 642,336 552,360" fill="#facc15" stroke="#a16207" strokeWidth="2" />
      <polygon points="535,312 565,304 576,314 546,322" fill="#A5764B" stroke="#5b3b23" strokeWidth="2" />
      <polygon points="550,309 558,307 562,310 554,312" fill="#f8fafc" stroke="#374151" strokeWidth="1" />
      <path d="M558 303 q3 -6 0 -12" stroke="#94a3b8" strokeWidth="2" fill="none" className="coffee-steam" />

      {/* Plants/bookshelves */}
      <polygon points="160,185 178,180 186,187 168,192" fill="#4F9B5C" stroke="#166534" strokeWidth="1" />
      <polygon points="625,196 643,191 651,198 633,203" fill="#79C784" stroke="#166534" strokeWidth="1" />
      <polygon points="145,112 190,100 205,110 160,122" fill="#A5764B" stroke="#5b3b23" strokeWidth="2" />

      {/* Data flow labels */}
      <text x="338" y="194" fontSize="11" fontWeight="700" fill="#374151">Command Core</text>
      <text x="196" y="204" fontSize="11" fontWeight="700" fill="#374151">Dev Cluster</text>
      <text x="470" y="239" fontSize="11" fontWeight="700" fill="#374151">Analysis Wing</text>
      <text x="561" y="121" fontSize="11" fontWeight="700" fill="#374151">Infra Corner</text>
      <text x="526" y="298" fontSize="11" fontWeight="700" fill="#374151">Break Nook</text>
      <text x="473" y="87" fontSize="11" fontWeight="700" fill="#374151">Baron Office</text>
    </svg>
  );
}

function DataLink({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#7dd3fc" strokeOpacity="0.45" strokeWidth="1" />
      </svg>
      <motion.div
        className="absolute w-1.5 h-1.5 bg-cyan-300 rounded-[1px] pointer-events-none"
        animate={{ left: [from.x, mid.x, to.x], top: [from.y, mid.y, to.y], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
      />
    </>
  );
}

function Avatar({ member, onClick }: { member: PositionedMember; onClick: () => void }) {
  const p = iso(member.gx, member.gy);
  const status = member.live?.status ?? 'idle';
  const statusIcon = status === 'working' ? '⌨' : status === 'offline' ? '✓' : '...';

  return (
    <motion.button
      onClick={onClick}
      className="absolute group"
      animate={{ left: p.x, top: p.y - 18 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      style={{ transform: 'translate(-50%, -50%)', animation: status === 'working' ? 'floatWork 1.3s ease-in-out infinite' : 'floatIdle 2.6s ease-in-out infinite' }}
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute -bottom-1 w-9 h-3 rounded-full bg-black/30 blur-[2px]" />
        <div className="w-10 h-10 border-2 border-black rounded-sm bg-[#f5d36d] shadow-[2px_2px_0_#000] flex items-center justify-center">
          <PixelSprite id={member.id} />
        </div>
        <div className="mt-1 text-[10px] font-bold text-white bg-black/65 px-1.5 py-0.5 rounded">{member.name}</div>
        <div className="mt-1 text-[10px] font-bold text-black bg-white/90 px-1 py-0.5 rounded border border-black animate-[messagePop_2.4s_ease-in-out_infinite]">{statusIcon}</div>
      </div>
    </motion.button>
  );
}

function PixelSprite({ id }: { id: string }) {
  const rows = SPRITES[id] ?? SPRITES.baron;

  return (
    <div className="grid grid-cols-6 gap-[1px] p-[2px] bg-black">
      {rows.join('').split('').map((ch, idx) => {
        const color = ch === 'b' ? '#4F7DF0'
          : ch === 'g' ? '#2FBF71'
          : ch === 'p' ? '#8A6FD1'
          : ch === 'c' ? '#3FA7FF'
          : ch === 'o' ? '#F29D38'
          : ch === 'r' ? '#E05A6E'
          : ch === 'w' ? '#f8fafc'
          : ch === 'k' ? '#111827'
          : ch === 'y' ? '#facc15'
          : 'transparent';

        return <span key={idx} className="w-1.5 h-1.5" style={{ backgroundColor: color }} />;
      })}
    </div>
  );
}
