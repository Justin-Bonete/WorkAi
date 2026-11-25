import { authProxy } from '@/lib/auth-proxy';

export const dynamic = 'force-dynamic';
export const POST = (req: Request) => authProxy(req, 'auth/login');
