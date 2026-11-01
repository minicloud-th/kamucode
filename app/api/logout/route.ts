import { getAuth, authConfigured } from '@/lib/auth';
import { readWrite } from '@/lib/shop-validation';
import { hasAuthCookie } from '@/lib/store-user';
export async function POST(request: Request) {
    const parsed = await readWrite(request);
    if (!parsed.ok)
        return parsed.response;
    const response = authConfigured() ? await getAuth().handler(new Request(new URL('/api/auth/sign-out', request.url), { method: 'POST', headers: request.headers, body: '{}' })) : Response.json({ success: true });
    response.headers.append('Set-Cookie', 'kc_signed_out=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800' + (new URL(request.url).protocol === 'https:' ? '; Secure' : ''));
    return response;
}
