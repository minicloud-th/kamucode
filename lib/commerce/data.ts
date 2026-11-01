import { env } from 'cloudflare:workers';
import { defaultCatalog } from './default-catalog';
import type { Product } from './types';
export const database = () => { if (!env.DB)
    throw new Error("Database is not configured"); return env.DB; };
export const runtimeValue = (key: string) => (env as unknown as Record<string, string | undefined>)[key];
export function isAdmin(user: {
    userId: string;
    email: string;
    emailVerified?: boolean;
} | null) { if (!user)
    return false; const ids = (runtimeValue('ADMIN_USER_IDS') || '').split(',').map(x => x.trim()).filter(Boolean), emails = (runtimeValue('ADMIN_EMAILS') || '').toLowerCase().split(',').map(x => x.trim()).filter(Boolean); return ids.includes(user.userId) || !!(user.emailVerified && emails.includes(user.email.toLowerCase())); }
export async function catalog(includeDrafts = false): Promise<Product[]> {
    const rows = await database().prepare('SELECT p.*, (SELECT COUNT(*) FROM store_inventory i WHERE i.product_id=p.id AND i.order_id IS NULL) AS stock FROM store_products p').all<Record<string, unknown>>();
    const overrides = new Map(rows.results.map(r => [String(r.id), { id: String(r.id), name: String(r.name), kind: r.kind as 'game' | 'source', tag: String(r.tag), description: String(r.description), image: String(r.image), priceCents: Number(r.price_cents), demo: !!r.demo, published: !!r.published, stock: Number(r.stock), createdAt: Number(r.created_at) }]));
    return [...defaultCatalog.map(p => overrides.get(p.id) || p), ...Array.from(overrides.values()).filter(p => !defaultCatalog.some(d => d.id === p.id))].filter(p => includeDrafts || p.published);
}
export async function product(id: string) { return (await catalog()).find(p => p.id === id); }
export async function rateLimit(key: string, max: number, windowMs: number) { const now = Date.now(), expiry = now + windowMs; const r = await database().prepare('INSERT INTO request_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at<=? THEN 1 ELSE count+1 END, expires_at=CASE WHEN expires_at<=? THEN ? ELSE expires_at END WHERE expires_at<=? OR count<? RETURNING count').bind(key, expiry, now, now, expiry, now, max).first(); return !!r; }
export async function digest(value: string) { const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode((runtimeValue('BETTER_AUTH_SECRET') || 'local') + ':' + value)); return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join(''); }
export async function notify(userId: string, title: string, body: string, href: string) { await database().prepare('INSERT INTO store_notifications (id,user_id,title,body,href,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(), userId, title, body, href, Date.now()).run(); }
async function deliveryKey() { const secret = runtimeValue('BETTER_AUTH_SECRET'); if (!secret)
    throw Error('ยังไม่ได้กำหนดคีย์ความปลอดภัย'); const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret + ':kamucode:delivery:v1')); return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['encrypt', 'decrypt']); }
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (value: string) => Uint8Array.from(atob(value), c => c.charCodeAt(0));
export async function encryptDelivery(value: string) { const iv = crypto.getRandomValues(new Uint8Array(12)); const bytes = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await deliveryKey(), new TextEncoder().encode(value)); return b64(iv) + '.' + b64(new Uint8Array(bytes)); }
export async function decryptDelivery(value: string) { const [iv, data] = value.split('.'); const bytes = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(iv) }, await deliveryKey(), unb64(data)); return new TextDecoder().decode(bytes); }
export async function settings() { const row = await database().prepare('SELECT value FROM store_settings WHERE key=?').bind('store').first<{
    value: string;
}>(); return row ? JSON.parse(row.value) as {
    paymentInstructions?: string;
    contactEmail?: string;
    contactLine?: string;
} : {}; }
