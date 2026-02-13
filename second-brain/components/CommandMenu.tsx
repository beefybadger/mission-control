'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  LayoutDashboard, ListTodo, Brain, Users,
  Calendar, Settings, Search, Plus, Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/40 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-[640px] bg-[#0c0c0c] border border-white/10 rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex items-center px-4 py-3 border-b border-white/5">
          <Search className="w-4 h-4 mr-3 text-slate-500" />
          <Command.Input
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-slate-200 placeholder:text-slate-600"
          />
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-[10px] font-bold text-slate-500">
            ESC
          </div>
        </div>

        <Command.List className="max-h-[360px] overflow-y-auto p-2 scrollbar-hide">
          <Command.Empty className="py-8 text-center text-sm text-slate-500">No results found.</Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-1 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
            <Item icon={<LayoutDashboard />} label="Dashboard" onSelect={() => runCommand(() => router.push('/'))} />
            <Item icon={<ListTodo />} label="Tasks" onSelect={() => runCommand(() => router.push('/tasks'))} />
            <Item icon={<Brain />} label="Memory" onSelect={() => runCommand(() => router.push('/memory'))} />
          </Command.Group>

          <Command.Separator className="h-[1px] bg-white/5 my-2" />

          <Command.Group heading="Knowledge" className="px-2 py-1 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
            <Item icon={<Users />} label="Council" onSelect={() => runCommand(() => router.push('/council'))} />
            <Item icon={<Calendar />} label="Briefs" onSelect={() => runCommand(() => router.push('/briefs'))} />
          </Command.Group>

          <Command.Separator className="h-[1px] bg-white/5 my-2" />

          <Command.Group heading="Actions" className="px-2 py-1 text-[11px] font-bold text-slate-600 uppercase tracking-widest">
            <Item icon={<Plus />} label="Create New Task" shortcut="N" onSelect={() => { }} />
            <Item icon={<Zap />} label="Quick Memory Log" shortcut="L" onSelect={() => { }} />
            <Item icon={<Settings />} label="Open Settings" onSelect={() => runCommand(() => router.push('/settings'))} />
          </Command.Group>
        </Command.List>

        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-t border-white/5">
          <div className="flex items-center gap-4">
            <FooterKey label="Enter" action="Select" />
            <FooterKey label="↑↓" action="Navigate" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 tracking-tight uppercase">Second Brain Engine</span>
        </div>
      </div>
    </Command.Dialog>
  )
}

function Item({ icon, label, shortcut, onSelect }: { icon: React.ReactNode, label: string, shortcut?: string, onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-white/[0.05] aria-selected:text-white text-slate-400 transition-colors group"
    >
      <span className="text-slate-500 group-aria-selected:text-blue-400 group-aria-selected:drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] [&>svg]:w-4 [&>svg]:h-4">
        {icon}
      </span>
      <span className="text-[13px] font-medium flex-1">{label}</span>
      {shortcut && (
        <span className="text-[10px] font-bold text-slate-600 bg-white/[0.02] border border-white/5 px-1.5 py-0.5 rounded uppercase">
          {shortcut}
        </span>
      )}
    </Command.Item>
  )
}

function FooterKey({ label, action }: { label: string, action: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold text-slate-500 bg-white/[0.04] border border-white/10 px-1 py-0.5 rounded leading-none">{label}</span>
      <span className="text-[10px] text-slate-600 font-medium">{action}</span>
    </div>
  )
}
