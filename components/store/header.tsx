'use client';
import Link from '@/components/store/navigation-link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Search, ChevronDown, Globe, Check, ShoppingBag, Gamepad2, Code2, Heart, Users, ArrowUpRight, Bell, LogOut, UserRound, Package, Download, ShieldCheck } from 'lucide-react';
import { useStore } from './provider';
const LiquidNavbar = lazy(() => import('@/components/ui/liquid-glass-navbar'));
const shortcuts = [{ label: 'ร้านค้า', href: '/shop', icon: <ShoppingBag size={18}/>, fx: 'pop' as const }, { label: 'เกม', href: '/games', icon: <Gamepad2 size={19}/>, fx: 'spin' as const }, { label: 'ซอร์สโค้ด', href: '/source-code', icon: <Code2 size={19}/>, fx: 'glow' as const }, { label: 'บันทึก', href: '/saved', icon: <Heart size={18}/>, fx: 'drop' as const }, { label: 'พาร์ทเนอร์', href: '/partners', icon: <Users size={18}/>, fx: 'wave' as const }];
export function SiteHeader() {
    const { me } = useStore(), path = usePathname(), landing = path === '/' || path === '/welcome', memberNav = me.authenticated && !landing;
    const [scrolled, setScrolled] = useState(false), [dark, setDark] = useState(false), [open, setOpen] = useState(false), [languageOpen, setLanguageOpen] = useState(false), [loggingOut, setLoggingOut] = useState(false), [logoutError, setLogoutError] = useState('');
    const profile = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null), locale = useRef<HTMLDivElement>(null), languageTrigger = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        let frame = 0;
        const update = () => {
            frame = 0;
            setScrolled(window.scrollY > (landing ? innerHeight * .35 : 14));
            const surfaces = [...document.querySelectorAll('[data-classic-dark]')].map(n => n.getBoundingClientRect());
            setDark(landing && surfaces.some(r => r.top < 70 && r.bottom > 70));
        };
        const queue = () => {if (!frame) frame = requestAnimationFrame(update);};
        const observer = landing ? new ResizeObserver(queue) : null;
        observer?.observe(document.body);
        update(); queue();
        addEventListener('scroll', queue, {passive: true});
        addEventListener('resize', queue, {passive: true});
        return () => {observer?.disconnect(); cancelAnimationFrame(frame); removeEventListener('scroll', queue); removeEventListener('resize', queue);};
    }, [landing]);
    useEffect(() => { const frame = requestAnimationFrame(() => { setOpen(false); setLanguageOpen(false); }); return () => cancelAnimationFrame(frame); }, [path]);
    useEffect(() => { if (!open && !languageOpen)
        return; const outside = (e: PointerEvent) => { if (!profile.current?.contains(e.target as Node))
        setOpen(false); if (!locale.current?.contains(e.target as Node))
        setLanguageOpen(false); }; const key = (e: KeyboardEvent) => { if (e.key === 'Escape') {
        if (open)
            trigger.current?.focus();
        else
            languageTrigger.current?.focus();
        setOpen(false);
        setLanguageOpen(false);
    } }; document.addEventListener('pointerdown', outside); document.addEventListener('keydown', key); return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key); }; }, [open, languageOpen]);
    async function logout() { setLoggingOut(true); setLogoutError(''); try {
        const r = await fetch('/api/logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        if (!r.ok)
            throw Error('ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
        window.location.assign('/');
    }
    catch (e) {
        setLogoutError((e as Error).message);
    }
    finally {
        setLoggingOut(false);
    } }
    return <div className={'classic-header-space' + (landing ? ' is-landing' : '') + (memberNav ? ' has-member-nav' : '')}><header className={'site-header classic-topbar' + (scrolled ? ' is-scrolled' : ' is-hero-pill') + (dark ? ' is-on-dark' : '') + (memberNav ? ' has-member-nav' : '')}><div className="classic-topbar-main"><Link prefetch={false} href="/" className="classic-brand" aria-label="kamucode หน้าแรก"><img src={'/assets/brand/' + (dark ? 'logo-dark.svg' : 'logo.svg')} width="188" height="29" alt="kamucode"/></Link><div className="classic-topbar-actions"><div className="classic-locale-wrap" ref={locale}><button className="classic-locale" type="button" ref={languageTrigger} aria-label="ภาษา: ไทย" aria-expanded={languageOpen} aria-controls="classic-language-menu" onClick={() => { setLanguageOpen(v => !v); setOpen(false); }}><Globe size={16}/><span>TH</span><ChevronDown size={12}/></button>{languageOpen && <div className="classic-language-menu" id="classic-language-menu"><button type="button" onClick={() => { setLanguageOpen(false); languageTrigger.current?.focus(); }}><Check size={15}/>ไทย <span>TH</span></button></div>}</div>{me.authenticated ? <div className="profile-wrap" ref={profile}><button className="profile-trigger" ref={trigger} aria-label="เปิดเมนูโปรไฟล์" aria-expanded={open} aria-controls="profile-dropdown" onClick={() => { setOpen(v => !v); setLanguageOpen(false); }}><img className="avatar" src={me.avatarUrl || '/assets/brand/mark.svg'} width="36" height="36" alt="รูปโปรไฟล์"/><ChevronDown size={13}/></button>{open && <div id="profile-dropdown" className="profile-menu"><div className="profile-heading"><strong>{me.displayName}</strong><span>{me.email}</span></div>{[[UserRound, 'โปรไฟล์', '/account'], [ShoppingBag, 'ร้านค้า', '/shop'], [ShoppingBag, 'ตะกร้าสินค้า', '/cart'], [Package, 'คำสั่งซื้อ', '/orders'], [Download, 'คลังดาวน์โหลด', '/downloads'], [Heart, 'รายการที่บันทึก', '/saved'], [Bell, 'การแจ้งเตือน' + (me.unread ? ' (' + me.unread + ')' : ''), '/notifications'], [ShieldCheck, 'ความปลอดภัย', '/account/security']].map(([Icon, title, href]) => { const I = Icon as typeof UserRound; return <Link prefetch={false} href={String(href)} key={String(href)}><I size={16}/>{String(title)}</Link>; })}{me.admin && <Link prefetch={false} href="/admin"><ShieldCheck size={16}/>จัดการร้าน</Link>}<button disabled={loggingOut} onClick={logout}><LogOut size={16}/>{loggingOut ? 'กำลังออกจากระบบ…' : 'ออกจากระบบ'}</button>{logoutError && <p role="alert" className="error-text">{logoutError}</p>}</div>}</div> : <Link prefetch={false} href="/login" className="classic-login-button">เข้าสู่ระบบ</Link>}</div></div>{memberNav && <div className="classic-member-bar"><div className="liquid-slot"><Suspense fallback={<nav className="shortcut-fallback" aria-label="ทางลัดร้าน">{shortcuts.map(s => <Link prefetch={false} href={s.href} key={s.href}>{s.icon}{s.label}</Link>)}</nav>}><LiquidNavbar items={shortcuts} active={shortcuts.findIndex(s => path === s.href)} tone="light" compact={false} sound={false}/></Suspense></div><form action="/shop" className="header-search" role="search"><Search size={16}/><input type="search" name="q" aria-label="ค้นหาสินค้า" placeholder="ค้นหาเกม หรือซอร์สโค้ด" maxLength={100}/><button type="submit" aria-label="ค้นหา"><ArrowUpRight size={16}/></button></form></div>}</header></div>;
}
