import { z } from 'zod';
import { getStoreUser } from '@/lib/store-user';
import { readWrite } from '@/lib/shop-validation';
import { database, catalog, product, isAdmin, rateLimit, digest, notify, encryptDelivery, decryptDelivery, settings } from './data';
import { currentMe, member } from './session';
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
const fail = (message: string, status = 400) => json({ error: message }, status);
const idSchema = z.string().regex(/^[a-zA-Z0-9-]{1,100}$/);
export async function storeApi(request: Request, path: string[]): Promise<Response> {
    try {
        const route = path.join('/'), u = await getStoreUser(), db = database(), url = new URL(request.url);
        if (request.method === 'GET') {
            if (route === 'catalog')
                return json({ products: await catalog(), settings: await settings() });
            if (route === 'me')
                return json(await currentMe(), u ? 200 : 401);
            if (!u)
                return fail('กรุณาเข้าสู่ระบบ', 401);
            await member(u);
            if (route === 'cart')
                return json({ items: (await db.prepare('SELECT product_id FROM store_cart WHERE user_id=? ORDER BY created_at DESC').bind(u.userId).all<{
                        product_id: string;
                    }>()).results.map(x => x.product_id) });
            if (route === 'orders')
                return json({ orders: (await db.prepare('SELECT * FROM store_orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(u.userId).all()).results, settings: await settings() });
            if (route === 'order') {
                const o = await db.prepare('SELECT * FROM store_orders WHERE id=? AND user_id=?').bind(url.searchParams.get('id'), u.userId).first<Record<string, unknown>>();
                if (!o)
                    return fail('ไม่พบคำสั่งซื้อ', 404);
                const delivery = o.status === 'paid' ? await db.prepare('SELECT delivery_cipher FROM store_inventory WHERE order_id=?').bind(o.id).first<{
                    delivery_cipher: string;
                }>() : null;
                return json({ order: { ...o, delivery: delivery ? await decryptDelivery(delivery.delivery_cipher) : undefined }, settings: await settings() });
            }
            if (route === 'notifications')
                return json({ items: (await db.prepare('SELECT * FROM store_notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(u.userId).all()).results });
            if (route === 'tickets')
                return json({ tickets: (await db.prepare('SELECT * FROM support_tickets WHERE user_id=? ORDER BY created_at DESC LIMIT 50').bind(u.userId).all()).results });
            if (route === 'ticket') {
                const t = await db.prepare('SELECT * FROM support_tickets WHERE id=? AND user_id=?').bind(url.searchParams.get('id'), u.userId).first();
                if (!t)
                    return fail('ไม่พบคำร้อง', 404);
                return json({ ticket: t, replies: (await db.prepare('SELECT id,message,created_at FROM support_replies WHERE ticket_id=? ORDER BY created_at').bind(t.id).all()).results });
            }
            if (route === 'partners')
                return json({ applications: (await db.prepare('SELECT * FROM partner_requests WHERE user_id=? ORDER BY created_at DESC').bind(u.userId).all()).results });
            if (route.startsWith('admin/')) {
                if (!isAdmin(u))
                    return fail('เฉพาะผู้ดูแลระบบ', 403);
                if (route === 'admin/products')
                    return json({ products: await catalog(true) });
                if (route === 'admin/orders')
                    return json({ orders: (await db.prepare('SELECT o.*,m.email AS customer FROM store_orders o LEFT JOIN members m ON m.user_id=o.user_id ORDER BY o.created_at DESC LIMIT 200').all()).results });
                if (route === 'admin/support')
                    return json({ tickets: (await db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC LIMIT 200').all()).results });
                if (route === 'admin/partners')
                    return json({ applications: (await db.prepare('SELECT * FROM partner_requests ORDER BY created_at DESC LIMIT 200').all()).results });
                if (route === 'admin/settings')
                    return json({ settings: await settings() });
            }
            return fail('ไม่พบข้อมูล', 404);
        }
        if (request.method !== 'POST' && !(request.method === 'DELETE' && ['saved', 'cart'].includes(route)))
            return fail('ไม่รองรับวิธีนี้', 405);
        const parsed = await readWrite(request);
        if (!parsed.ok)
            return parsed.response;
        const b = parsed.body;
        if (route === 'support' && request.method === 'POST') {
            const p = z.object({ email: z.string().trim().email().max(254), category: z.enum(['general', 'security', 'privacy', 'partner']), subject: z.string().trim().min(3).max(120), message: z.string().trim().min(10).max(3000) }).safeParse(b);
            if (!p.success)
                return fail('กรอกอีเมล หัวข้อ และรายละเอียดอย่างน้อย 10 ตัวอักษร');
            const ip = request.headers.get('cf-connecting-ip');
            if (!u && !ip)
                return fail('ไม่สามารถตรวจสอบคำขอนี้ได้ กรุณาเข้าสู่ระบบ', 403);
            if (ip && !await rateLimit('support-network:' + await digest(ip), 20, 3600000))
                return fail('มีคำร้องจากเครือข่ายนี้มากเกินไป กรุณารอแล้วลองใหม่', 429);
            const uid = u?.userId || 'guest:' + await digest(ip!);
            if (!await rateLimit('support:' + uid, 5, 3600000) || !await rateLimit('support-email:' + await digest(u?.email || p.data.email), 10, 86400000))
                return fail('ส่งคำร้องหลายครั้งเกินไป กรุณารอแล้วลองใหม่', 429);
            if (u)
                await member(u);
            const id = crypto.randomUUID();
            await db.prepare('INSERT INTO support_tickets (id,user_id,email,category,subject,message,status,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(id, uid, u?.email || p.data.email, p.data.category, p.data.subject, p.data.message, 'open', Date.now()).run();
            return json({ ok: true, id });
        }
        if (!u)
            return fail('กรุณาเข้าสู่ระบบ', 401);
        await member(u);
        if (!await rateLimit('write:' + u.userId, 100, 60000))
            return fail('ทำรายการเร็วเกินไป กรุณารอสักครู่', 429);
        if (route === 'profile') {
            const p = z.object({ displayName: z.string().trim().min(2).max(60) }).safeParse(b);
            if (!p.success)
                return fail('ชื่อควรมี 2–60 ตัวอักษร');
            await db.prepare('UPDATE members SET display_name=? WHERE user_id=?').bind(p.data.displayName, u.userId).run();
            return json({ ok: true });
        }
        if (route === 'saved' || route === 'cart') {
            const p = z.object({ productId: idSchema }).safeParse(b);
            if (!p.success || !await product(p.data.productId))
                return fail('ไม่พบสินค้า', 404);
            const table = route === 'saved' ? 'product_interests' : 'store_cart';
            if (request.method === 'DELETE')
                await db.prepare(`DELETE FROM ${table} WHERE user_id=? AND product_id=?`).bind(u.userId, p.data.productId).run();
            else if (route === 'saved')
                await db.prepare('INSERT INTO product_interests (id,user_id,product_id,created_at) VALUES (?,?,?,?) ON CONFLICT DO NOTHING').bind(u.userId + ':' + p.data.productId, u.userId, p.data.productId, Date.now()).run();
            else {
                const prod = await product(p.data.productId);
                if (prod?.demo || !prod?.stock || !prod.priceCents)
                    return fail('สินค้านี้ยังไม่เปิดขาย', 409);
                await db.prepare('INSERT INTO store_cart VALUES (?,?,?) ON CONFLICT DO NOTHING').bind(u.userId, p.data.productId, Date.now()).run();
            }
            return json({ ok: true });
        }
        if (route === 'partners') {
            const p = z.object({ shopName: z.string().trim().min(2).max(80), category: z.enum(['game', 'source', 'both']), contact: z.string().trim().min(3).max(200), message: z.string().trim().min(10).max(2000) }).safeParse(b);
            if (!p.success)
                return fail('กรอกข้อมูลร้าน ช่องทางติดต่อ และรายละเอียดอย่างน้อย 10 ตัวอักษร');
            const pending = await db.prepare("SELECT id FROM partner_requests WHERE user_id=? AND status='pending'").bind(u.userId).first();
            if (pending)
                return json({ ok: true, alreadySubmitted: true, id: pending.id, status: 'pending' });
            if (!await rateLimit('partner:' + u.userId, 1, 86400000))
                return fail('ส่งคำขอได้วันละหนึ่งครั้ง', 429);
            const id = crypto.randomUUID();
            await db.prepare("INSERT OR IGNORE INTO partner_requests (id,user_id,shop_name,category,contact,message,status,created_at) VALUES (?,?,?,?,?,?,'pending',?)").bind(id, u.userId, p.data.shopName, p.data.category, p.data.contact, p.data.message, Date.now()).run();
            return json({ ok: true, id, status: 'pending' });
        }
        if (route === 'notifications/read') {
            await db.prepare('UPDATE store_notifications SET is_read=1 WHERE user_id=?').bind(u.userId).run();
            return json({ ok: true });
        }
        if (route === 'orders/create') {
            if (!u.emailVerified)
                return fail('กรุณาใช้บัญชีที่ยืนยันอีเมลแล้ว', 403);
            const p = z.object({ productId: idSchema }).safeParse(b);
            if (!p.success)
                return fail('เลือกสินค้าอีกครั้ง');
            const item = await product(p.data.productId);
            if (!item || item.demo || !item.stock || !item.priceCents)
                return fail('สินค้าไม่พร้อมจำหน่าย', 409);
            if (!(await settings()).paymentInstructions?.trim())
                return fail('ร้านยังไม่ได้ตั้งค่ารับชำระเงิน', 503);
            if (!await rateLimit('order:' + u.userId, 5, 3600000))
                return fail('สร้างคำสั่งซื้อหลายครั้งเกินไป', 429);
            const id = crypto.randomUUID();
            const results = await db.batch([
                db.prepare("INSERT INTO store_orders SELECT ?,?,?,?,?,'pending',? WHERE EXISTS(SELECT 1 FROM store_inventory WHERE product_id=? AND order_id IS NULL)").bind(id, u.userId, item.id, item.name, item.priceCents, Date.now(), item.id),
                db.prepare('UPDATE store_inventory SET order_id=? WHERE id=(SELECT id FROM store_inventory WHERE product_id=? AND order_id IS NULL LIMIT 1) AND EXISTS(SELECT 1 FROM store_orders WHERE id=?)').bind(id, item.id, id),
                db.prepare('DELETE FROM store_cart WHERE user_id=? AND product_id=? AND EXISTS(SELECT 1 FROM store_orders WHERE id=?)').bind(u.userId, item.id, id)
            ]);
            if (!results[0].meta.changes)
                return fail('สินค้าหมดแล้ว กรุณาเลือกใหม่', 409);
            return json({ ok: true, id }, 201);
        }
        if (route === 'orders/cancel') {
            const p = z.object({ id: idSchema }).safeParse(b);
            if (!p.success)
                return fail('ไม่พบคำสั่งซื้อ');
            const res = await db.batch([db.prepare("UPDATE store_orders SET status='cancelled' WHERE id=? AND user_id=? AND status='pending'").bind(p.data.id, u.userId), db.prepare("UPDATE store_inventory SET order_id=NULL WHERE order_id=? AND EXISTS(SELECT 1 FROM store_orders WHERE id=? AND user_id=? AND status='cancelled')").bind(p.data.id, p.data.id, u.userId)]);
            return res[0].meta.changes ? json({ ok: true }) : fail('ยกเลิกไม่ได้ หรือคำสั่งซื้อได้รับการยืนยันแล้ว', 409);
        }
        if (route.startsWith('admin/')) {
            if (!isAdmin(u))
                return fail('เฉพาะผู้ดูแลระบบ', 403);
            if (route === 'admin/products') {
                const p = z.object({ id: idSchema, name: z.string().trim().min(2).max(100), kind: z.enum(['game', 'source']), tag: z.string().trim().max(100), description: z.string().trim().min(10).max(3000), priceCents: z.number().int().min(0).max(100000000), demo: z.boolean(), published: z.boolean() }).safeParse(b);
                if (!p.success)
                    return fail('ข้อมูลสินค้าไม่ครบหรือราคาไม่ถูกต้อง');
                const d = p.data;
                await db.prepare('INSERT INTO store_products (id,name,kind,tag,description,image,price_cents,demo,published,created_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,kind=excluded.kind,tag=excluded.tag,description=excluded.description,price_cents=excluded.price_cents,demo=excluded.demo,published=excluded.published').bind(d.id, d.name, d.kind, d.tag, d.description, '/assets/catalog/' + (d.kind === 'source' ? 'storefront' : 'valorant') + '.svg', d.priceCents, +d.demo, +d.published, Date.now()).run();
                return json({ ok: true });
            }
            if (route === 'admin/inventory') {
                const p = z.object({ productId: idSchema, delivery: z.string().trim().min(5).max(8000) }).safeParse(b);
                if (!p.success)
                    return fail('กรอกข้อมูลส่งมอบ 5–8,000 ตัวอักษร');
                if (!(await catalog(true)).some(x => x.id === p.data.productId))
                    return fail('บันทึกสินค้าก่อนเพิ่มสต็อก', 404);
                await db.prepare('INSERT INTO store_inventory (id,product_id,delivery_cipher,created_at) VALUES (?,?,?,?)').bind(crypto.randomUUID(), p.data.productId, await encryptDelivery(p.data.delivery), Date.now()).run();
                return json({ ok: true });
            }
            if (route === 'admin/orders') {
                const p = z.object({ id: idSchema, status: z.enum(['paid', 'cancelled']) }).safeParse(b);
                if (!p.success)
                    return fail('สถานะไม่ถูกต้อง');
                const d = p.data;
                const results = await db.batch([db.prepare("UPDATE store_orders SET status=? WHERE id=? AND status='pending' AND EXISTS(SELECT 1 FROM store_inventory WHERE order_id=store_orders.id)").bind(d.status, d.id), db.prepare("UPDATE store_inventory SET order_id=NULL WHERE order_id=? AND EXISTS(SELECT 1 FROM store_orders WHERE id=? AND status='cancelled')").bind(d.id, d.id)]);
                if (!results[0].meta.changes)
                    return fail('รายการเปลี่ยนสถานะแล้วหรือไม่มีสต็อกที่จองไว้', 409);
                const order = await db.prepare('SELECT user_id FROM store_orders WHERE id=?').bind(d.id).first<{
                    user_id: string;
                }>();
                await notify(order!.user_id, d.status === 'paid' ? 'คำสั่งซื้อได้รับการยืนยัน' : 'คำสั่งซื้อถูกยกเลิก', d.status === 'paid' ? 'เปิดดูข้อมูลส่งมอบได้ในรายละเอียดคำสั่งซื้อ' : 'ติดต่อทีมดูแลหากคุณชำระเงินแล้ว', '/orders/' + d.id);
                return json({ ok: true });
            }
            if (route === 'admin/support') {
                const p = z.object({ id: idSchema, message: z.string().trim().min(3).max(3000), status: z.enum(['open', 'closed']) }).safeParse(b);
                if (!p.success)
                    return fail('กรอกคำตอบอย่างน้อย 3 ตัวอักษร');
                const t = await db.prepare('SELECT user_id FROM support_tickets WHERE id=?').bind(p.data.id).first<{
                    user_id: string;
                }>();
                if (!t)
                    return fail('ไม่พบคำร้อง', 404);
                await db.batch([db.prepare('INSERT INTO support_replies VALUES (?,?,?,?,?)').bind(crypto.randomUUID(), p.data.id, u.userId, p.data.message, Date.now()), db.prepare('UPDATE support_tickets SET status=? WHERE id=?').bind(p.data.status, p.data.id)]);
                if (!t.user_id.startsWith('guest:'))
                    await notify(t.user_id, 'ทีมดูแลตอบคำร้องแล้ว', p.data.message.slice(0, 160), '/support/tickets/' + p.data.id);
                return json({ ok: true });
            }
            if (route === 'admin/partners') {
                const p = z.object({ id: idSchema, status: z.enum(['approved', 'rejected']) }).safeParse(b);
                if (!p.success)
                    return fail('สถานะไม่ถูกต้อง');
                const row = await db.prepare("UPDATE partner_requests SET status=? WHERE id=? AND status='pending' RETURNING user_id").bind(p.data.status, p.data.id).first<{
                    user_id: string;
                }>();
                if (!row)
                    return fail('คำขอได้รับการตรวจแล้ว', 409);
                await notify(row.user_id, 'อัปเดตคำขอพาร์ทเนอร์', p.data.status === 'approved' ? 'คำขอของคุณได้รับอนุมัติแล้ว' : 'คำขอยังไม่ผ่านการพิจารณา ติดต่อทีมดูแลเพื่อขอรายละเอียด', '/partners/dashboard');
                return json({ ok: true });
            }
            if (route === 'admin/settings') {
                const p = z.object({ paymentInstructions: z.string().max(3000), contactEmail: z.union([z.literal(''), z.string().email().max(254)]), contactLine: z.string().max(100) }).safeParse(b);
                if (!p.success)
                    return fail('ตรวจสอบอีเมลและข้อมูลร้าน');
                await db.prepare('INSERT INTO store_settings VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').bind('store', JSON.stringify(p.data)).run();
                return json({ ok: true });
            }
        }
        return fail('ไม่พบการทำรายการ', 404);
    }
    catch (error) {
        console.error('Store API failure', error instanceof Error ? error.message : 'Unknown');
        return fail('ไม่สามารถทำรายการได้ กรุณาลองอีกครั้ง', 500);
    }
}
