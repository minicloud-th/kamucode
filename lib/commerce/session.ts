import { getStoreUser, type StoreUser } from '@/lib/store-user';
import { database, isAdmin } from './data';
import type { Me } from './types';
export async function member(user: StoreUser) { await database().prepare('INSERT INTO members (user_id,email,display_name,partner_interest,created_at) VALUES (?,?,?,0,?) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email').bind(user.userId, user.email, (user.fullName || user.displayName || user.email.split('@')[0]).slice(0, 60), Date.now()).run(); }
export async function currentMe(): Promise<Me> { const u = await getStoreUser(); if (!u)
    return { authenticated: false, registered: false }; await member(u); const db = database(); const [profile, interests, apps, avatar, unread] = await Promise.all([db.prepare('SELECT display_name FROM members WHERE user_id=?').bind(u.userId).first<{
        display_name: string;
    }>(), db.prepare('SELECT product_id FROM product_interests WHERE user_id=?').bind(u.userId).all<{
        product_id: string;
    }>(), db.prepare('SELECT id,status,shop_name AS shopName FROM partner_requests WHERE user_id=? ORDER BY created_at DESC').bind(u.userId).all<{
        id: string;
        status: string;
        shopName: string;
    }>(), db.prepare('SELECT updated_at FROM member_avatars WHERE user_id=?').bind(u.userId).first<{
        updated_at: number;
    }>(), db.prepare('SELECT COUNT(*) AS count FROM store_notifications WHERE user_id=? AND is_read=0').bind(u.userId).first<{
        count: number;
    }>()]); return { authenticated: true, registered: true, userId: u.userId, displayName: profile?.display_name || u.displayName, email: u.email, method: u.method, emailVerified: u.emailVerified, admin: isAdmin(u), avatarUrl: avatar ? '/api/avatar?v=' + avatar.updated_at : undefined, interests: interests.results.map(x => x.product_id), applications: apps.results, unread: unread?.count || 0 }; }
