'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ListTodo, Brain,
  Users, Calendar, Settings, Search, Pause, Play, HardDrive, Clock, Radar, FileStack, Activity, Menu
} from 'lucide-react';
import { CommandMenu } from './CommandMenu';
import { cn } from '../lib/utils';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isPaused, setIsPaused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <CommandMenu />
      <div className="flex h-screen w-full">
        {sidebarOpen && (
          <button
            className="fixed inset-0 z-30 bg-black/35 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          />
        )}

        <aside className={cn(
          'fixed md:static inset-y-0 left-0 z-40 w-64 md:w-60 flex-shrink-0 bg-[#ecebe6] border-r-2 border-black flex flex-col transform transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isPaused && 'opacity-70'
        )}>
          <div className="p-4 md:p-5 flex items-center gap-3 mb-2 border-b-2 border-black">
            <div className="w-7 h-7 bg-[#ffd84d] border-2 border-black rounded-md flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-black" />
            </div>
            <span className="text-[14px] font-extrabold tracking-tight text-black">Baron OS</span>
          </div>

          <nav className="flex-1 px-3 space-y-6 overflow-y-auto pt-4 scrollbar-hide">
            <NavGroup label="Main">
              <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Freedom Scoreboard" active={pathname === '/'} onNavigate={() => setSidebarOpen(false)} />
              <NavItem href="/opportunities" icon={<Radar size={18} />} label="Opportunity Radar" active={pathname === '/opportunities'} onNavigate={() => setSidebarOpen(false)} />
              <NavItem href="/offers" icon={<FileStack size={18} />} label="Offer Sprint" active={pathname === '/offers'} onNavigate={() => setSidebarOpen(false)} />
              <NavItem href="/tasks" icon={<ListTodo size={18} />} label="Tasks" active={pathname === '/tasks'} onNavigate={() => setSidebarOpen(false)} />
              <NavItem href="/memory" icon={<Brain size={18} />} label="Memory" active={pathname === '/memory'} onNavigate={() => setSidebarOpen(false)} />
            </NavGroup>

            <NavGroup label="Automation">
              <NavItem href="/cron" icon={<Clock size={18} />} label="Cron Ops" active={pathname === '/cron'} onNavigate={() => setSidebarOpen(false)} />
              <NavItem href="/ops" icon={<Activity size={18} />} label="Ops Log" active={pathname === '/ops'} onNavigate={() => setSidebarOpen(false)} />
              <NavItem href="/briefs" icon={<Calendar size={18} />} label="Briefs" active={pathname === '/briefs'} onNavigate={() => setSidebarOpen(false)} />
            </NavGroup>

            <NavGroup label="Knowledge">
              <NavItem href="/explorer" icon={<HardDrive size={18} />} label="Explorer" active={pathname === '/explorer'} onNavigate={() => setSidebarOpen(false)} />
              <NavItem href="/council" icon={<Users size={18} />} label="Council" active={pathname === '/council'} onNavigate={() => setSidebarOpen(false)} />
            </NavGroup>
          </nav>

          <div className="p-3 border-t-2 border-black">
            <NavItem href="/settings" icon={<Settings size={18} />} label="Settings" active={pathname === '/settings'} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#f2f1ec] md:ml-0">
          <header className="h-14 border-b-2 border-black flex items-center gap-2 px-3 md:px-6 bg-[#ecebe6] z-20">
            <button
              className="md:hidden w-9 h-9 border-2 border-black rounded-lg flex items-center justify-center bg-white"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="w-4 h-4 text-black" />
            </button>

            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="flex-1 min-w-0 flex items-center gap-2 md:gap-3 bg-white border-2 border-black rounded-lg py-2 px-3 md:px-4 transition-all"
            >
              <Search className="w-3.5 h-3.5 text-black" />
              <span className="text-[12px] text-zinc-700 flex-1 text-left truncate">Search or run command...</span>
              <div className="hidden sm:flex items-center gap-1">
                <kbd className="text-[10px] font-bold text-black bg-[#ecebe6] px-1.5 py-0.5 rounded border border-black tracking-tighter">⌘</kbd>
                <kbd className="text-[10px] font-bold text-black bg-[#ecebe6] px-1.5 py-0.5 rounded border border-black">K</kbd>
              </div>
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-1 md:gap-2 text-[11px] font-bold tracking-wide px-2.5 md:px-3 py-1.5 rounded-md border-2 border-black bg-white"
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
              <span className="hidden sm:inline">{isPaused ? 'RESUME' : 'PAUSE'}</span>
            </button>
          </header>

          <main className="workspace-dark flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

function NavGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="px-4 text-[10px] font-extrabold text-zinc-600 uppercase tracking-[0.2em] mb-1">{label}</p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function NavItem({ href, icon, label, active, onNavigate }: { href: string, icon: React.ReactNode, label: string, active?: boolean, onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 transition-all duration-150 group rounded-lg border-2',
        active ? 'text-black border-black bg-[#ffd84d]' : 'text-zinc-700 border-transparent hover:border-black hover:bg-white'
      )}
    >
      <span>{icon}</span>
      <span className="text-[13px] font-semibold tracking-tight">{label}</span>
    </Link>
  );
}
