import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import TaskBoard from '@/components/TaskBoard';
import { TOKEN_COOKIE } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

export default function ProjectPage({ params }: { params: { id: string } }) {
  if (!cookies().get(TOKEN_COOKIE)) redirect('/login');
  return (
    <main className="wide">
      <header className="topbar">
        <Link href="/">← All projects</Link>
        <LogoutButton />
      </header>
      <TaskBoard projectId={params.id} />
    </main>
  );
}
