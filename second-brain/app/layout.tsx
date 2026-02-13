import type { Metadata } from 'next';
import AppShell from '../components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Second Brain — Mission Control',
  description: 'AI agent dashboard for OpenClaw. Monitor tasks, memory, cron jobs, and agent council.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-slate-200 antialiased overflow-hidden selection:bg-blue-500/30">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
