import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import TaskBoard from '@/components/TaskBoard';
import { TOKEN_COOKIE } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export default function ProjectPage({ params }: { params: { id: string } }) {
  if (!cookies().get(TOKEN_COOKIE)) redirect('/login');
  return (
    <AppShell>
      <div className="page">
        <p><Link href="/">← Dashboard</Link></p>
        <TaskBoard projectId={params.id} />
      </div>
    </AppShell>
  );
}
