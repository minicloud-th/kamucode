import { authConfigured, providerStatus } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export function GET() { return Response.json({ email: authConfigured(), signup: authConfigured(), providers: providerStatus(), native: true }, { headers: { 'Cache-Control': 'no-store' } }); }
