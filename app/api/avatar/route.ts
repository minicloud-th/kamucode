import { getStoreUser } from '@/lib/store-user';
import { database, rateLimit } from '@/lib/commerce/data';
import { readBoundedBody } from '@/lib/shop-validation';
export const dynamic = 'force-dynamic';
export async function GET() { const u = await getStoreUser(); if (!u)
    return new Response(null, { status: 401 }); const row = await database().prepare('SELECT data,mime FROM member_avatars WHERE user_id=?').bind(u.userId).first<{
    data: string;
    mime: string;
}>(); if (!row)
    return new Response(null, { status: 404 }); return new Response(Uint8Array.from(atob(row.data), c => c.charCodeAt(0)), { headers: { 'Content-Type': row.mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } }); }
export async function POST(request: Request) {
    const u = await getStoreUser();
    if (!u)
        return Response.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    if (request.headers.get('origin') !== new URL(request.url).origin)
        return new Response(null, { status: 403 });
    if (!await rateLimit('avatar:' + u.userId, 10, 3600000))
        return Response.json({ error: 'เปลี่ยนรูปหลายครั้งเกินไป กรุณารอแล้วลองใหม่' }, { status: 429 });
    let bytes: Uint8Array;
    try {
        bytes = await readBoundedBody(request, 131072);
    }
    catch {
        return Response.json({ error: 'รูปต้องมีขนาดไม่เกิน 128 KB' }, { status: 413 });
    }
    const mime = request.headers.get('content-type'), hex = Array.from(bytes.slice(0, 12), x => x.toString(16).padStart(2, '0')).join('');
    if (!(mime === 'image/png' && hex.startsWith('89504e470d0a1a0a') || mime === 'image/jpeg' && hex.startsWith('ffd8ff') || mime === 'image/webp' && hex.startsWith('52494646') && hex.slice(16) === '57454250'))
        return Response.json({ error: 'ใช้รูป PNG, JPEG หรือ WebP เท่านั้น' }, { status: 415 });
    await database().prepare('INSERT INTO member_avatars VALUES (?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET data=excluded.data,mime=excluded.mime,updated_at=excluded.updated_at').bind(u.userId, btoa(Array.from({ length: Math.ceil(bytes.length / 8192) }, (_, i) => String.fromCharCode(...bytes.slice(i * 8192, (i + 1) * 8192))).join('')), mime, Date.now()).run();
    return Response.json({ ok: true });
}
