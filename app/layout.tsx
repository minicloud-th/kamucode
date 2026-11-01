import type { Metadata } from 'next';
import './globals.css';
import '@/components/store/classic.css';
import { StoreProvider } from '@/components/store/provider';
import { SiteHeader } from '@/components/store/header';
import { SiteFooter } from '@/components/store/footer';
import { currentMe } from '@/lib/commerce/session';
import { catalog } from '@/lib/commerce/data';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: { default: 'kamucode — Play. Build. Grow.', template: '%s · kamucode' }, description: 'พื้นที่สำหรับคนชอบเล่นและคนชอบสร้าง สำรวจเกม ซอร์สโค้ด และเริ่มก้าวต่อไปกับ kamucode', icons: { icon: '/favicon.svg' } };
export default async function RootLayout({ children }: {
    children: React.ReactNode;
}) { const [me, products] = await Promise.all([currentMe(), catalog()]); return <html lang="th"><body><StoreProvider initialMe={me} products={products}><a href="#main" className="skip-link">ข้ามไปเนื้อหา</a><SiteHeader /><main id="main">{children}</main><SiteFooter /></StoreProvider></body></html>; }
