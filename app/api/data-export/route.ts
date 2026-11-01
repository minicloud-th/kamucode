import { getStoreUser } from '@/lib/store-user';
import { database } from '@/lib/commerce/data';
export const dynamic = 'force-dynamic';
export async function GET() {
    const user = await getStoreUser();
    if (!user)
        return Response.json({ error: 'กรุณาเข้าสู่ระบบ' }, { status: 401 });
    const db = database(), id = user.userId;
    const [profile, saved, partners, tickets, replies, orders, cart, notifications, avatar] = await Promise.all([
        db.prepare('SELECT email,display_name,partner_interest,created_at FROM members WHERE user_id=?').bind(id).first(),
        db.prepare('SELECT product_id,created_at FROM product_interests WHERE user_id=?').bind(id).all(),
        db.prepare('SELECT id,shop_name,category,contact,message,status,created_at FROM partner_requests WHERE user_id=?').bind(id).all(),
        db.prepare('SELECT id,email,category,subject,message,status,created_at FROM support_tickets WHERE user_id=?').bind(id).all(),
        db.prepare('SELECT r.id,r.ticket_id,r.message,r.created_at FROM support_replies r JOIN support_tickets t ON t.id=r.ticket_id WHERE t.user_id=?').bind(id).all(),
        db.prepare('SELECT id,product_id,product_name,price_cents,status,created_at FROM store_orders WHERE user_id=?').bind(id).all(),
        db.prepare('SELECT product_id,created_at FROM store_cart WHERE user_id=?').bind(id).all(),
        db.prepare('SELECT title,body,href,is_read,created_at FROM store_notifications WHERE user_id=?').bind(id).all(),
        db.prepare('SELECT mime,data AS base64,updated_at FROM member_avatars WHERE user_id=?').bind(id).first(),
    ]);
    return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), profile, saved: saved.results, partners: partners.results, tickets: tickets.results, replies: replies.results, orders: orders.results, cart: cart.results, notifications: notifications.results, avatar }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="kamucode-data.json"', 'Cache-Control': 'private, no-store' } });
}
