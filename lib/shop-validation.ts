export const MAX_BODY_BYTES = 16384;
export function validateWrite(request: Request): Response | null {
    if (request.headers.get('origin') !== new URL(request.url).origin)
        return Response.json({ error: 'ไม่อนุญาตคำขอจากต้นทางนี้' }, { status: 403 });
    if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))
        return Response.json({ error: 'กรุณาส่งข้อมูลแบบ JSON' }, { status: 415 });
    if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES)
        return Response.json({ error: 'ข้อมูลมีขนาดใหญ่เกินไป' }, { status: 413 });
    return null;
}
export async function readBoundedBody(request: Request, limit = MAX_BODY_BYTES): Promise<Uint8Array> {
    const reader = request.body?.getReader();
    if (!reader)
        return new Uint8Array();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
        const { done, value } = await reader.read();
        if (done)
            break;
        total += value.byteLength;
        if (total > limit) {
            void reader.cancel().catch(() => { });
            throw new BodyError('ข้อมูลมีขนาดใหญ่เกินไป', 413);
        }
        chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
        bytes.set(c, offset);
        offset += c.byteLength;
    }
    return bytes;
}
export class BodyError extends Error {
    constructor(message: string, public status: number) { super(message); }
}
export async function readWrite(request: Request): Promise<{
    ok: true;
    body: unknown;
} | {
    ok: false;
    response: Response;
}> {
    const guard = validateWrite(request);
    if (guard)
        return { ok: false, response: guard };
    try {
        return { ok: true, body: JSON.parse(new TextDecoder().decode(await readBoundedBody(request))) };
    }
    catch (e) {
        return { ok: false, response: Response.json({ error: e instanceof BodyError ? e.message : 'รูปแบบข้อมูลไม่ถูกต้อง' }, { status: e instanceof BodyError ? e.status : 400 }) };
    }
}
