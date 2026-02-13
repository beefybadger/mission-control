'use client';

import { useState } from 'react';
import { Users, Brain, MessageSquare, MoreHorizontal, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import ChatModal from '@/components/ChatModal';
import { cn } from '@/lib/utils';
import type { CouncilMember, AgentColor } from '@/types';

const COLOR_MAP: Record<AgentColor, { iconBg: string; iconBorder: string; iconBorderHover: string }> = {
  blue: { iconBg: 'bg-blue-500/5', iconBorder: 'border-blue-500/10', iconBorderHover: 'group-hover:border-blue-500/40' },
  emerald: { iconBg: 'bg-emerald-500/5', iconBorder: 'border-emerald-500/10', iconBorderHover: 'group-hover:border-emerald-500/40' },
  purple: { iconBg: 'bg-purple-500/5', iconBorder: 'border-purple-500/10', iconBorderHover: 'group-hover:border-purple-500/40' },
};

const COUNCIL_MEMBERS = [
  {
    id: 'baron',
    name: 'Baron',
    role: 'Lead Strategist & Architect',
    level: 'Tier 1: Command',
    status: 'Active',
    description: 'Lead expert operator. Responsible for system architecture, strategic pivots, and project deployment.',
    capabilities: ['Architecture', 'Technical Deployment', 'Decision Engine'],
    color: 'blue'
  },
  {
    id: 'scotty',
    name: 'Scotty',
    role: 'Market Intelligence Scout',
    level: 'Tier 2: Intelligence',
    status: 'Standby',
    description: 'Deep-web researcher. Specialized in trend hunting, competitor auditing, and local lead scouting.',
    capabilities: ['Brave Search', 'Data Scraping', 'Market Audits'],
    color: 'emerald'
  },
  {
    id: 'maurice',
    name: 'Maurice',
    role: 'Creative Director',
    level: 'Tier 2: Creative',
    status: 'Standby',
    description: 'Revenue vibe architect. Responsible for offer crafting, marketing angles, and product design.',
    capabilities: ['Ideation', 'Offer Design', 'UX/UI Direction'],
    color: 'purple'
  }
] satisfies CouncilMember[];

export default function CouncilPage() {
  const [activeMember, setActiveMember] = useState<CouncilMember | null>(null);

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-16">
        <h2 className="text-4xl font-black tracking-tighter text-white mb-4 italic underline decoration-blue-500/30 text-shadow">Council Hierarchy</h2>
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
          The specialized task force driving your business automation.
          Managed by Baron, fueled by Intelligence and Creativity.
        </p>
      </header>

      {/* Hierarchy Visualization */}
      <div className="space-y-12 relative">
        {/* Connection Line */}
        <div className="absolute left-[50%] top-20 bottom-20 w-px bg-gradient-to-b from-blue-500/50 via-slate-800 to-transparent hidden lg:block" />

        {/* Tier 1: COMMAND */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="text-blue-500 w-5 h-5" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Command Level</h3>
          </div>
          <div className="flex justify-center">
            <MemberCard member={COUNCIL_MEMBERS[0]} onMessage={() => setActiveMember(COUNCIL_MEMBERS[0])} isLead />
          </div>
        </section>

        {/* Tier 2: EXECUTION */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Zap className="text-amber-500 w-5 h-5" />
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Execution & Support</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <MemberCard member={COUNCIL_MEMBERS[1]} onMessage={() => setActiveMember(COUNCIL_MEMBERS[1])} />
            <MemberCard member={COUNCIL_MEMBERS[2]} onMessage={() => setActiveMember(COUNCIL_MEMBERS[2])} />
          </div>
        </section>
      </div>

      <ChatModal
        member={activeMember}
        isOpen={!!activeMember}
        onClose={() => setActiveMember(null)}
      />
    </div>
  );
}

function MemberCard({ member, onMessage, isLead = false }: { member: CouncilMember, onMessage: () => void, isLead?: boolean }) {
  const colors = COLOR_MAP[member.color];
  return (
    <div className={cn(
      "bg-[#090909] border border-white/5 rounded-[2rem] overflow-hidden group transition-all duration-500 hover:border-blue-500/30 hover:bg-[#0c0c0c] flex flex-col",
      isLead ? "max-w-md w-full shadow-[0_0_50px_rgba(37,99,235,0.1)]" : "w-full"
    )}>
      <div className="p-8 flex-1">
        <div className="flex justify-between items-start mb-10">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
            colors.iconBg, `border ${colors.iconBorder}`, colors.iconBorderHover
          )}>
            {member.id === 'baron' && <Brain className="w-8 h-8 text-blue-500" />}
            {member.id === 'scotty' && <ShieldCheck className="w-8 h-8 text-emerald-500" />}
            {member.id === 'maurice' && <Sparkles className="w-8 h-8 text-purple-500" />}
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{member.level}</span>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
              member.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-white/5'
            )}>
              {member.status}
            </span>
          </div>
        </div>

        <h3 className="text-3xl font-black text-white tracking-tighter mb-2 italic">{member.name}</h3>
        <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-6">{member.role}</p>

        <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">
          {member.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {member.capabilities.map((cap: string) => (
            <span key={cap} className="text-[10px] font-bold bg-white/5 text-slate-500 px-3 py-1.5 rounded-xl group-hover:text-slate-300 transition-colors">
              {cap}
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
        <button
          onClick={onMessage}
          className="flex-1 bg-white/5 hover:bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 group"
        >
          <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" /> Initial Connection
        </button>
      </div>
    </div>
  );
}
