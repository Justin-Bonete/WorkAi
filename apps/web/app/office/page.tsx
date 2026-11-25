import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import OfficeScene from '@/components/OfficeScene';
import { TOKEN_COOKIE } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export default function OfficePage() {
  if (!cookies().get(TOKEN_COOKIE)) redirect('/login');
  return (
    <AppShell>
      <OfficeScene />
    </AppShell>
  );
}
