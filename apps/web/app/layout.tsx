import type { ReactNode } from 'react';
import './globals.css';

export const metadata = { title: 'WorkAI', description: 'Multi-agent AI workforce platform' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
