import type { Metadata } from 'next';
import AppShell from '../components/AppShell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Baron OS — Mission Control',
  description: 'Revenue operations cockpit for Robert: scoreboard, opportunities, offers, tasks, and execution loop.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="pixel-bg bg-[#f2f1ec] text-[#101010] antialiased overflow-hidden selection:bg-yellow-300/60">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
