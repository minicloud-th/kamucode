import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { authConfigured, getAuth } from './auth';
export type StoreUser = {
    userId: string;
    email: string;
    displayName: string;
    fullName: string | null;
    method: 'email-or-social' | 'chatgpt';
    emailVerified: boolean;
};
export function cookiesOf(value:string|null):Map<string,string>{
 const out=new Map<string,string>();
 for(const piece of (value||'').split(';')){const at=piece.indexOf('=');if(at<1)continue;out.set(piece.slice(0,at).trim(),piece.slice(at+1).trim());}
 return out;
}
export function hasAuthCookie(value: string | null) { return [...cookiesOf(value).keys()].some(k => k === 'kamucode.session_token' || k === '__Secure-kamucode.session_token'); }
export async function getStoreUser(): Promise<StoreUser | null> {
    const h = await headers();
    if (authConfigured() && hasAuthCookie(h.get('cookie'))) {
        const s = await getAuth().api.getSession({ headers: h });
        return s ? { userId: 'auth:' + s.user.id, email: s.user.email, displayName: s.user.name, fullName: s.user.name, method: 'email-or-social', emailVerified: s.user.emailVerified } : null;
    }
    if (cookiesOf(h.get('cookie')).get('kc_signed_out') === '1')
        return null;
    const n = await getChatGPTUser();
    return n ? { ...n, method: 'chatgpt', emailVerified: true } : null;
}
export async function requireStoreUser(returnTo = '/shop') { const u = await getStoreUser(); if (u)
    return u; redirect('/login?next=' + encodeURIComponent(returnTo)); }
