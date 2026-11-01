import { authConfigured, getAuth } from '@/lib/auth';
import { readBoundedBody, BodyError } from '@/lib/shop-validation';
export const dynamic = 'force-dynamic';
async function handle(request: Request) {
    if (!authConfigured())
        return Response.json({ message: 'ระบบสมาชิกยังไม่พร้อมใช้งาน' }, { status: 503 });
    if (request.method === 'POST') {
        if (request.headers.get('origin') !== new URL(request.url).origin)
            return Response.json({ message: 'ไม่อนุญาตต้นทางนี้' }, { status: 403 });
        try {
            const body = await readBoundedBody(request);
            request = new Request(request.url, { method: 'POST', headers: request.headers, body: body.buffer as ArrayBuffer });
        }
        catch (e) {
            return Response.json({ message: 'คำขอมีขนาดใหญ่เกินไป' }, { status: e instanceof BodyError ? e.status : 400 });
        }
    }
    return getAuth().handler(request);
}
export const GET = handle;
export const POST = handle;
