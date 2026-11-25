'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const NAV = [
  { href: '/', label: 'Dashboard', icon: '◈' },
  { href: '/office', label: 'Office', icon: '⌂' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><span className="logo">W</span> WorkAI</div>
        <nav aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`nav ${path === n.href ? 'active' : ''}`}>
              <span aria-hidden="true">{n.icon}</span> {n.label}
            </Link>
          ))}
        </nav>
        <button
          className="nav signout"
          onClick={async () => {
            await fetch('/bff/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
        >
          <span aria-hidden="true">⏻</span> Sign out
        </button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
