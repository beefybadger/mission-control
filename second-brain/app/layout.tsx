'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, ListTodo, FileText, Brain, 
  Users, Calendar, Briefcase, Settings, Search, Pause, Play, Bell, HardDrive, Clock
} from 'lucide-react';
import './globals.css';
import { CommandMenu } from '../components/CommandMenu';
import { cn } from '../lib/utils';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [pinging, setPinging] = useState(false);
  const pathname = usePathname();

  const handlePing = () => {
    setPinging(true);
    setTimeout(() => setPinging(false), 2000);
  };

  return (
    <html lang="en">
      <body className="bg-black text-slate-200 antialiased overflow-hidden selection:bg-blue-500/30">
        <CommandMenu />
        
        <div className="flex h-screen w-full font-sans">
          {/* Sidebar */}
          <aside className={cn(
            "w-16 md:w-56 flex-shrink-0 bg-[#060606] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out",
            isPaused && "opacity-50 grayscale-[0.5]"
          )}>
            <div className="p-4 md:p-6 flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="hidden md:block text-[14px] font-bold tracking-tight text-white">Second Brain</span>
            </div>

            <nav className="flex-1 px-3 space-y-6 overflow-y-auto pt-4 scrollbar-hide">
              <NavGroup label="Main">
                <NavItem href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === '/'} />
                <NavItem href="/tasks" icon={<ListTodo size={18} />} label="Tasks" active={pathname === '/tasks'} />
                <NavItem href="/memory" icon={<Brain size={18} />} label="Memory" active={pathname === '/memory'} />
              </NavGroup>

              <NavGroup label="Automation">
                <NavItem href="/cron" icon={<Clock size={18} />} label="Cron Ops" active={pathname === '/cron'} />
                <NavItem href="/briefs" icon={<Calendar size={18} />} label="Briefs" active={pathname === '/briefs'} />
              </NavGroup>

              <NavGroup label="Knowledge">
                <NavItem href="/explorer" icon={<HardDrive size={18} />} label="Explorer" active={pathname === '/explorer'} />
                <NavItem href="/council" icon={<Users size={18} />} label="Council" active={pathname === '/council'} />
              </NavGroup>
            </nav>

            <div className="p-3 border-t border-white/5 bg-black/20">
              <NavItem href="/settings" icon={<Settings size={18} />} label="Settings" active={pathname === '/settings'} />
            </div>
          </aside>

          {/* Main Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black relative">
            <AnimatePresence>
              {isPaused && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[1px] pointer-events-none flex items-center justify-center"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full flex items-center gap-2"
                  >
                    <Pause size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">System Paused</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top Bar */}
            <header className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#060606]/80 backdrop-blur-xl z-30">
              <div className="flex items-center gap-4 flex-1 max-w-xl">
                <button 
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                  className="w-full flex items-center gap-3 bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] rounded-lg py-2 px-4 transition-all group"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400" />
                  <span className="text-[12px] text-slate-500 group-hover:text-slate-400 flex-1 text-left">Search or run command...</span>
                  <div className="flex items-center gap-1">
                    <kbd className="text-[10px] font-bold text-slate-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/5 tracking-tighter">⌘</kbd>
                    <kbd className="text-[10px] font-bold text-slate-600 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/5">K</kbd>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-8 ml-6">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsPaused(!isPaused)}
                  className={cn(
                    "flex items-center gap-2.5 text-[11px] font-bold tracking-wide transition-all px-3 py-1.5 rounded-md",
                    isPaused 
                      ? "text-amber-500 bg-amber-500/5 border border-amber-500/10" 
                      : "text-slate-500 hover:text-white bg-transparent"
                  )}
                >
                  {isPaused ? <Play size={14} className="fill-amber-500" /> : <Pause size={14} />} 
                  <span className="hidden sm:inline">{isPaused ? 'RESUME' : 'PAUSE'}</span>
                </motion.button>
                
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePing}
                  disabled={pinging}
                  className="flex items-center gap-3 group relative"
                >
                  <span className={cn(
                    "text-[11px] font-bold tracking-wide transition-colors",
                    pinging ? "text-blue-400" : "text-slate-500 group-hover:text-white"
                  )}>
                    {pinging ? 'PING SENT' : 'PING BARON'}
                  </span>
                  <div className="relative">
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-all duration-500",
                      pinging ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" : "bg-slate-800"
                    )} />
                    {pinging && (
                      <motion.div 
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500 rounded-full"
                      />
                    )}
                  </div>
                </motion.button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto bg-[#040404]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

function NavGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="hidden md:block px-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1 opacity-60">{label}</p>
      <div className="flex flex-col gap-0.5">
        {children}
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 md:py-2 transition-all duration-200 group relative",
        active 
          ? "text-slate-100" 
          : "text-slate-500 hover:text-slate-300"
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
        />
      )}
      <span className={cn(
        "transition-all duration-200",
        active ? "text-blue-500" : "group-hover:text-blue-400"
      )}>
        {icon}
      </span>
      <span className="hidden md:block text-[13px] font-semibold tracking-tight">{label}</span>
    </Link>
  );
}
