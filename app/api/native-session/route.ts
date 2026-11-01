import { getChatGPTUser, chatGPTSignInPath } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { members } from '@/db/schema';
import { readWrite } from '@/lib/shop-validation';
import { hasAuthCookie } from '@/lib/store-user';
import { authConfigured, getAuth } from '@/lib/auth';
export async function POST(request: Request) {
    const parsed = await readWrite(request);
    if (!parsed.ok)
        return parsed.response;
    const user = await getChatGPTUser();
    if (!user)
        return Response.json({ error: 'กรุณาเข้าสู่ระบบ', signInUrl: chatGPTSignInPath('/auth/native') }, { status: 401 });
    const name = (user.fullName || user.email.split('@')[0]).slice(0, 60);
    await getDb().insert(members).values({ userId: user.userId, email: user.email, displayName: name, partnerInterest: false, createdAt: Date.now() }).onConflictDoNothing().run();
    const response = Response.json({ ok: true, redirect: '/shop' }, { headers: { 'Set-Cookie': 'kc_signed_out=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' + (new URL(request.url).protocol === 'https:' ? '; Secure' : '') } });
    // An explicit identity switch must clear the previous app session first.
    if (authConfigured() && hasAuthCookie(request.headers.get('cookie'))) {
        const previous = await getAuth().handler(new Request(new URL('/api/auth/sign-out', request.url), { method: 'POST', headers: request.headers, body: '{}' }));
        for (const cookie of previous.headers.getSetCookie())
            response.headers.append('Set-Cookie', cookie);
    }
    return response;
}
