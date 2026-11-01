'use client';
import { useEffect, useState } from 'react';
import Link from '@/components/store/navigation-link';
import { ArrowUpRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { safeNextPath } from '@/lib/navigation';
import { ActionForm, Field, value } from './forms';
import { useStore } from './provider';
type Options = {
    email: boolean;
    providers: {
        id: string;
        name: string;
        enabled: boolean;
    }[];
};
const providerNames = [['google', 'Google'], ['discord', 'Discord'], ['line', 'LINE'], ['github', 'GitHub'], ['microsoft', 'Microsoft'], ['gitlab', 'GitLab']];
export function Login({ next = '/shop' }: {
    next?: string;
}) {
    const [options, setOptions] = useState<Options>({ email: false, providers: providerNames.map(([id, name]) => ({ id, name, enabled: false })) }), [show, setShow] = useState(false), [error, setError] = useState(''), { me } = useStore();
    const target = safeNextPath(next);
    useEffect(() => { let live = true; fetch('/api/auth-options').then(r => r.json()).then(d => { if (live)
        setOptions(d as Options); }).catch(() => { if (live)
        setError('โหลดช่องทางเข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่'); }); return () => { live = false; }; }, []);
    return <section className="login-page"><div className="login-card"><span className="eyebrow">GOOD TO HAVE YOU HERE</span><h1>เข้าสู่ระบบ kamucode<span className="blue">.</span></h1><p className="login-description">พื้นที่ของคุณ สำหรับการเล่นและการสร้าง</p>{me.authenticated && <div className="info-note">คุณเข้าสู่ระบบแล้ว <Link href={target}>ไปหน้าที่ต้องการ ↗</Link></div>}<a target="_top" className="button native-login" href={'/signin-with-chatgpt?return_to=' + encodeURIComponent('/auth/native?next=' + encodeURIComponent(target))}><img src="/assets/brand/mark.svg" alt="" width="20" height="20"/>ดำเนินการด้วย ChatGPT <ArrowUpRight size={15}/></a><div className="social-grid">{options.providers.map(p => <button key={p.id} type="button" className="social-button" disabled={!p.enabled} title={p.enabled ? 'เข้าสู่ระบบด้วย ' + p.name : 'เจ้าของร้านยังไม่ได้เชื่อมต่อ ' + p.name} onClick={async () => { try {
        const r = await fetch('/api/auth/sign-in/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: p.id, callbackURL: window.location.origin + '/auth/complete?next=' + encodeURIComponent(target) }) });
        const d = await r.json() as {
            url?: string;
            message?: string;
        };
        if (!r.ok || !d.url)
            throw Error(d.message || 'เชื่อมต่อไม่สำเร็จ');
        window.location.assign(d.url);
    }
    catch (e) {
        setError((e as Error).message);
    } }}><img className="provider-icon" src={'/assets/providers/' + p.id + '.svg'} width="18" height="18" alt=""/>{p.name}{!p.enabled && <span className="provider-off">ยังไม่เชื่อมต่อ</span>}</button>)}</div><div className="form-divider"><span>หรือใช้บัญชีอีเมลเดิม</span></div><ActionForm submit="เข้าสู่ระบบด้วยอีเมล" action={async (d) => { if (!options.email)
        throw Error('ระบบอีเมลยังไม่พร้อม ใช้ ChatGPT ได้จากปุ่มด้านบน'); const r = await fetch('/api/auth/sign-in/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: value(d, 'email'), password: value(d, 'password') }) }); if (!r.ok)
        throw Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือทำรายการถี่เกินไป'); window.location.assign(target); }}><Field name="email" label="อีเมล" type="email" maxLength={254}/><label className="field"><span>รหัสผ่าน <Link href="/forgot-password">ลืมรหัสผ่าน?</Link></span><div className="password-field"><input type={show ? 'text' : 'password'} name="password" required maxLength={128} autoComplete="current-password"/><button type="button" aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'} onClick={() => setShow(v => !v)}>{show ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label></ActionForm>{error && <p className="error-text" role="alert">{error}</p>}<p className="login-legal"><LockKeyhole size={12}/> การดำเนินการต่ออยู่ภายใต้ <Link href="/terms">ข้อกำหนด</Link> และ <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link></p></div></section>;
}
export function AuthComplete({ native = false, next = '/shop' }: {
    native?: boolean;
    next?: string;
}) { const [error, setError] = useState(''); useEffect(() => { let live = true; async function complete() { try {
    const r = await fetch(native ? '/api/native-session' : '/api/me', { method: native ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: native ? '{}' : undefined, cache: 'no-store' });
    if (!r.ok)
        throw Error('ไม่พบเซสชันที่ใช้งานได้ กรุณาเข้าสู่ระบบอีกครั้ง');
    if (live)
        window.location.replace(safeNextPath(next));
}
catch (e) {
    if (live)
        setError((e as Error).message);
} } void complete(); return () => { live = false; }; }, [native, next]); return <div className="empty-state"><img src="/assets/brand/mark.svg" width="60" height="60" alt="kamucode"/><h1>{error ? 'เข้าสู่ระบบไม่สำเร็จ' : 'กำลังเปิดพื้นที่ของคุณ…'}</h1>{error && <><p role="alert">{error}</p><Link className="button button-dark" href="/login">กลับไปเข้าสู่ระบบ</Link></>}</div>; }
