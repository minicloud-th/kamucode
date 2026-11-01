import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { pages } from '@/lib/pages';
import { requireStoreUser } from '@/lib/store-user';
import { database, isAdmin, product } from '@/lib/commerce/data';
import { Screen } from '@/components/store/screens';
import { Landing } from '@/components/store/landing';
import { Login, AuthComplete } from '@/components/store/login';
export type StorePageProps = {
    params: Promise<{
        path: string[];
    }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};
export function metadataFor(path: string): Metadata { const cfg = Object.hasOwn(pages, path) ? pages[path] : undefined; return { title: cfg?.title || (path === 'login' ? 'เข้าสู่ระบบ' : path.startsWith('product/') ? 'รายละเอียดสินค้า' : 'kamucode'), robots: cfg?.public || path === 'welcome' ? undefined : { index: false, follow: false }, alternates: path === 'welcome' ? { canonical: 'https://kamucode.kawertyff-2.chatgpt.site/' } : undefined }; }
export async function generateMetadata({ params }: StorePageProps) { return metadataFor((await params).path.join('/')); }
export async function renderStorePage({ params, searchParams }: StorePageProps) {
    const segments = (await params).path, path = segments.join('/'), query = await searchParams;
    const str = (k: string) => typeof query[k] === 'string' ? query[k] as string : '';
    const legacy = path.replace(/\/index\.html$/, '').replace(/\.html$/, '');
    if (path !== legacy)
        redirect('/' + legacy);
    if (path === 'signup')
        redirect('/login');
    if (path === 'welcome')
        return <Landing />;
    if (path === 'login')
        return <Login next={str('next') || '/shop'}/>;
    if (path === 'auth/native' || path === 'auth/complete')
        return <AuthComplete native={path === 'auth/native'} next={str('next') || '/shop'}/>;
    if (segments[0] === 'product' && segments.length === 2) {
        await requireStoreUser('/' + path);
        const p = await product(segments[1]);
        if (!p)
            notFound();
        return <Screen page="product" product={p}/>;
    }
    if (segments[0] === 'orders' && segments.length === 2 || segments[0] === 'support' && segments[1] === 'tickets' && segments.length === 3) {
        const user = await requireStoreUser('/' + path), id = segments.at(-1)!, order = segments[0] === 'orders';
        const row = await database().prepare(`SELECT id FROM ${order ? 'store_orders' : 'support_tickets'} WHERE id=? AND user_id=?`).bind(id, user.userId).first();
        if (!row)
            notFound();
        return <Screen page={order ? 'order' : 'ticket'} query={id}/>;
    }
    const cfg = Object.hasOwn(pages, path) ? pages[path] : undefined;
    if (!cfg)
        notFound();
    if (!cfg.public) {
        const user = await requireStoreUser('/' + path + (path === 'checkout' ? '?product=' + encodeURIComponent(str('product')) : ''));
        if (path.startsWith('admin') && !isAdmin(user))
            notFound();
    }
    return <Screen page={path} query={path === 'checkout' ? str('product') : str('q')}/>;
}
