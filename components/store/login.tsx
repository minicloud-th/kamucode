'use client';

import {useEffect, useId, useRef, useState, type FormEvent} from 'react';
import Link from '@/components/store/navigation-link';
import {ArrowLeft, ArrowRight, ArrowUpRight, Check, Eye, EyeOff, LoaderCircle} from 'lucide-react';
import {safeNextPath} from '@/lib/navigation';
import {useStore} from './provider';

type Provider = {id: string; name: string; enabled: boolean};
type Options = {email: boolean; signup: boolean; providers: Provider[]};
const providers: Provider[] = [
    {id: 'google', name: 'Google', enabled: false},
    {id: 'line', name: 'LINE', enabled: false},
    {id: 'github', name: 'GitHub', enabled: false},
    {id: 'microsoft', name: 'Microsoft', enabled: false},
    {id: 'discord', name: 'Discord', enabled: false},
];

export function Login({next = '/shop', signup = false}: {next?: string; signup?: boolean}) {
    const {me} = useStore();
    const [options, setOptions] = useState<Options | null>(null);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [optionsAttempt, setOptionsAttempt] = useState(0);
    const [email, setEmail] = useState('');
    const [details, setDetails] = useState(false);
    const [show, setShow] = useState(false);
    const [busy, setBusy] = useState(false);
    const [socialBusy, setSocialBusy] = useState('');
    const [error, setError] = useState('');
    const password = useRef<HTMLInputElement>(null);
    const displayName = useRef<HTMLInputElement>(null);
    const id = useId();
    const target = safeNextPath(next);
    const switchHref = (signup ? '/login' : '/signup') + (target === '/shop' ? '' : '?next=' + encodeURIComponent(target));
    const choices = providers.map(p => ({...p, enabled: options?.providers.some(o => o.id === p.id && o.enabled) || false}));

    useEffect(() => {
        const controller = new AbortController();
        setLoadingOptions(true);
        setError('');
        fetch('/api/auth-options', {signal: controller.signal, cache: 'no-store'})
            .then(async r => {if (!r.ok) throw Error(); return r.json() as Promise<Options>;})
            .then(d => {if (!controller.signal.aborted) setOptions(d);})
            .catch(() => {if (!controller.signal.aborted) setError('โหลดช่องทางเข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');})
            .finally(() => {if (!controller.signal.aborted) setLoadingOptions(false);});
        return () => controller.abort();
    }, [optionsAttempt]);

    useEffect(() => {if (details) (signup ? displayName.current : password.current)?.focus();}, [details, signup]);

    async function social(provider: Provider) {
        if (!provider.enabled || socialBusy || busy) return;
        setSocialBusy(provider.id);
        setError('');
        try {
            const response = await fetch('/api/auth/sign-in/social', {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({provider: provider.id, callbackURL: window.location.origin + '/auth/complete?next=' + encodeURIComponent(target)}),
            });
            const data = await response.json() as {url?: string};
            if (!response.ok || !data.url) throw Error('เชื่อมต่อ ' + provider.name + ' ไม่สำเร็จ กรุณาลองอีกครั้ง');
            const url = new URL(data.url);
            if (url.protocol !== 'https:') throw Error('ไม่สามารถเปิดช่องทางเข้าสู่ระบบนี้ได้');
            window.location.assign(url.href);
        } catch (e) {setError(e instanceof Error ? e.message : 'เชื่อมต่อไม่สำเร็จ'); setSocialBusy('');}
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || socialBusy) return;
        setError('');
        if (!details) {setEmail(email.trim()); setDetails(true); return;}
        if (!options?.email || (signup && !options.signup)) {setError('ระบบสมาชิกยังไม่พร้อมใช้งาน กรุณาลองอีกครั้ง'); return;}
        const data = new FormData(event.currentTarget);
        setBusy(true);
        try {
            const response = await fetch('/api/auth/' + (signup ? 'sign-up/email' : 'sign-in/email'), {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email: email.trim(), password: String(data.get('password') || ''),
                    ...(signup ? {name: String(data.get('name') || '').trim()} : {rememberMe: data.get('remember') === 'on'})}),
            });
            if (!response.ok) {
                if (response.status === 429) throw Error('ทำรายการถี่เกินไป กรุณารอสักครู่แล้วลองใหม่');
                throw Error(signup ? 'สมัครสมาชิกไม่สำเร็จ ตรวจสอบข้อมูล หรือเข้าสู่ระบบหากคุณมีบัญชีแล้ว' : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง');
            }
            window.location.assign(target);
        } catch (e) {setError(e instanceof Error ? e.message : 'เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง'); setBusy(false);}
    }

    return <section className="auth-page" aria-labelledby={id + '-title'}>
        <header className="auth-header">
            <Link href="/" aria-label="kamucode หน้าแรก" className="auth-brand"><img src="/assets/brand/logo.svg" width="169" height="27" alt="kamucode"/></Link>
            <Link href="/" className="auth-home"><ArrowLeft size={14}/>กลับหน้าแรก</Link>
        </header>
        <div className={'auth-content' + (details ? ' is-details' : '')}>
            <div className="auth-heading"><span className="auth-eyebrow">YOUR SPACE TO PLAY. BUILD. GROW.</span>
                <h1 id={id + '-title'}>{signup ? 'เริ่มต้นกับ kamucode' : 'ยินดีต้อนรับกลับ' }<span>.</span></h1>
                <p>{signup ? 'สร้างบัญชีเดียว สำหรับทุกสิ่งที่คุณชอบ' : 'เข้าสู่ระบบ แล้วไปต่อกับสิ่งที่คุณชอบ'}</p>
            </div>
            {me.authenticated && <p className="auth-signed-in"><Check size={15}/>คุณเข้าสู่ระบบแล้ว <Link href={target}>ไปยังพื้นที่ของคุณ <ArrowUpRight size={13}/></Link></p>}
            {!details && <>
                <div className="auth-socials" role="group" aria-label={signup ? 'สมัครสมาชิกด้วยบัญชีโซเชียล' : 'เข้าสู่ระบบด้วยบัญชีโซเชียล'}>
                    {choices.map(p => <button type="button" key={p.id} disabled={!p.enabled || !!socialBusy || busy} onClick={() => void social(p)}
                        aria-label={p.name + (p.enabled ? '' : ' ยังไม่พร้อมใช้งาน')} title={p.name + (p.enabled ? '' : ' — ยังไม่พร้อมใช้งาน')}>
                        {socialBusy === p.id ? <LoaderCircle size={20} className="spin"/> : <img src={'/assets/providers/' + p.id + '.svg'} alt="" width="22" height="22"/>}
                        <span>{p.name}</span>
                    </button>)}
                </div>
                {!loadingOptions && options && !choices.some(p => p.enabled) && <p className="auth-provider-note">ช่องทางโซเชียลยังไม่เปิดใช้งาน ใช้อีเมลได้ด้านล่าง</p>}
                <div className="auth-divider"><span>หรือดำเนินการด้วยอีเมล</span></div>
            </>}
            <form className="auth-form" onSubmit={submit} aria-busy={busy}>
                {details ? <div className="auth-email-summary"><input type="hidden" name="email" value={email} autoComplete="username"/><span>{email}</span><button type="button" disabled={busy || !!socialBusy} onClick={() => {setDetails(false); setShow(false); setError('');}}>เปลี่ยน</button></div> :
                    <div className="auth-input"><input id={id + '-email'} name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder=" " required maxLength={254} autoComplete="email" autoCapitalize="none" spellCheck={false}/><label htmlFor={id + '-email'}>อีเมลของคุณ</label></div>}
                {details && <>
                    {signup && <div className="auth-input"><input ref={displayName} id={id + '-name'} name="name" placeholder=" " required minLength={2} maxLength={60} autoComplete="nickname" pattern=".*\S.*"/><label htmlFor={id + '-name'}>ชื่อที่แสดง</label></div>}
                    <div className="auth-input auth-password"><input ref={password} id={id + '-password'} name="password" type={show ? 'text' : 'password'} placeholder=" " required minLength={signup ? 10 : undefined} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} aria-describedby={signup ? id + '-hint' : undefined}/><label htmlFor={id + '-password'}>{signup ? 'สร้างรหัสผ่าน' : 'รหัสผ่าน'}</label><button type="button" aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} aria-pressed={show} onClick={() => setShow(v => !v)}>{show ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
                    {signup ? <><p id={id + '-hint'} className="auth-hint">ใช้รหัสผ่าน 10–128 ตัวอักษร</p><label className="auth-check auth-consent"><input name="consent" type="checkbox" required/><span>ฉันยอมรับ <Link href="/terms" target="_blank" rel="noopener noreferrer">ข้อกำหนดการใช้งาน</Link> และ <Link href="/privacy" target="_blank" rel="noopener noreferrer">นโยบายความเป็นส่วนตัว</Link></span></label></> :
                        <div className="auth-options"><label className="auth-check"><input name="remember" type="checkbox"/><span>จดจำฉันไว้</span></label><Link href="/forgot-password">ลืมรหัสผ่าน?</Link></div>}
                </>}
                <button className="auth-submit" type="submit" disabled={busy || !!socialBusy || loadingOptions || !options?.email || (signup && !options?.signup)}>
                    {(busy || loadingOptions) && <LoaderCircle size={17} className="spin"/>}<span>{busy ? 'กำลังดำเนินการ…' : loadingOptions ? 'กำลังเตรียม…' : details ? signup ? 'สร้างบัญชี' : 'เข้าสู่ระบบ' : 'ดำเนินการต่อด้วยอีเมล'}</span>{!busy && !loadingOptions && <ArrowRight size={17}/>}
                </button>
                <div aria-live="polite">{error && <p className="auth-error" role="alert">{error}</p>}{!loadingOptions && !options && <button className="auth-retry" type="button" onClick={() => setOptionsAttempt(v => v + 1)}>ลองอีกครั้ง</button>}</div>
            </form>
            <p className="auth-switch">{signup ? 'มีบัญชีอยู่แล้ว?' : 'ยังไม่มีบัญชี?'} <Link href={switchHref}>{signup ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'} <ArrowUpRight size={13}/></Link></p>
            {!signup && !details && <Link className="auth-recovery" href="/forgot-password">ลืมรหัสผ่านหรือเข้าใช้งานไม่ได้?</Link>}
        </div>
        <footer className="auth-footer"><span>© {new Date().getFullYear()} kamucode</span><nav aria-label="ข้อมูลการใช้งาน"><Link href="/terms">ข้อกำหนดการใช้งาน</Link><span aria-hidden="true">·</span><Link href="/privacy">นโยบายความเป็นส่วนตัว</Link></nav></footer>
    </section>;
}

export function AuthComplete({native = false, next = '/shop'}: {native?: boolean; next?: string}) {
    const [error, setError] = useState('');
    useEffect(() => {
        let live = true;
        async function complete() {
            try {
                const r = await fetch(native ? '/api/native-session' : '/api/me', {method: native ? 'POST' : 'GET', headers: {'Content-Type': 'application/json'}, body: native ? '{}' : undefined, cache: 'no-store'});
                if (!r.ok) throw Error('ไม่พบเซสชันที่ใช้งานได้ กรุณาเข้าสู่ระบบอีกครั้ง');
                if (live) window.location.replace(safeNextPath(next));
            } catch (e) {if (live) setError((e as Error).message);}
        }
        void complete();
        return () => {live = false;};
    }, [native, next]);
    return <div className="empty-state"><img src="/assets/brand/mark.svg" width="60" height="60" alt="kamucode"/><h1>{error ? 'เข้าสู่ระบบไม่สำเร็จ' : 'กำลังเปิดพื้นที่ของคุณ…'}</h1>{error && <><p role="alert">{error}</p><Link className="button button-dark" href="/login">กลับไปเข้าสู่ระบบ</Link></>}</div>;
}
