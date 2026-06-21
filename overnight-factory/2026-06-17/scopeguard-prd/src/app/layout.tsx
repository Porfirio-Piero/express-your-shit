import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScopeGuard — Freelancer Scope Creep Protection',
  description: 'Define project scope, get client approval, and generate change orders when scope creep happens. Protect your revenue.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}