'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowUpRight, Code2, Gamepad2, Pause, Play, RotateCcw, SkipForward} from 'lucide-react';
import Link from '@/components/store/navigation-link';
import {useScrollPresentation} from '@/hooks/use-scroll-presentation';
import {BrandSymbol} from './brand-symbol';

type HeroTile = {src: string; label: string; kind: 'game' | 'source'; href: string; demo: boolean};
type PlaygroundHeroProps = {
    tiles: readonly HeroTile[];
    authenticated: boolean;
    paused: boolean;
    reduced: boolean;
    onToggleMotion: () => void;
    onExplore: () => void;
};

export function PlaygroundHero({tiles, authenticated, paused, reduced, onToggleMotion, onExplore}: PlaygroundHeroProps) {
    const sequence = useRef<HTMLElement>(null);
    const initialized = useRef(false);
    const [phase, setPhase] = useState<'idle' | 'opening' | 'ready'>('idle');
    const [cycle, setCycle] = useState(0);
    const [view, setView] = useState<'game' | 'source'>('game');
    const still = paused || reduced;
    const opening = phase === 'opening' && !still;
    const primary = tiles.find(tile => tile.kind === view) ?? tiles[0];
    const secondary = tiles.filter(tile => tile !== primary);
    const left = secondary.find(tile => tile.kind === 'game') ?? secondary[0];
    const right = secondary.find(tile => tile.kind === 'source' && tile !== left) ?? secondary.find(tile => tile !== left);
    useScrollPresentation(sequence, !still);

    useEffect(() => {
        if (initialized.current) return;
        const frame = requestAnimationFrame(() => {
            initialized.current = true;
            setPhase(still || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'ready' : 'opening');
        });
        return () => cancelAnimationFrame(frame);
    }, [still]);

    useEffect(() => {
        if (phase !== 'opening') return;
        const timer = setTimeout(() => setPhase('ready'), still ? 0 : 1850);
        return () => clearTimeout(timer);
    }, [phase, still, cycle]);

    function replay() {
        if (reduced) return;
        sequence.current?.scrollIntoView({behavior: 'instant', block: 'start'});
        if (paused) onToggleMotion();
        setCycle(value => value + 1);
        setPhase('opening');
    }

    return <section ref={sequence} className="kc-hero" aria-labelledby="kc-hero-title" data-intro={opening} data-scene-motion="false" onFocusCapture={event => {if (opening && (event.target as HTMLElement).closest('.kc-hero-heading,.kc-studio-canvas,.kc-studio-switch')) setPhase('ready');}}>
        <div className="kc-hero-heading kc-container">
            <h1 id="kc-hero-title">พื้นที่ของคนเล่น<br/>และคนสร้าง.</h1>
            <div className="kc-hero-intro">
                <p>เกมที่อยากเล่น โค้ดที่อยากต่อยอด<br/>เลือกจุดเริ่มต้นถัดไปของคุณที่ kamucode</p>
                <div className="kc-hero-actions">
                    <a href="#collections" className="kc-button kc-button-dark" onClick={event => {event.preventDefault(); onExplore();}}>สำรวจคอลเลกชัน <ArrowUpRight size={18}/></a>
                    <Link href={authenticated ? '/account' : '/login'} className="kc-text-link">{authenticated ? 'บัญชีของฉัน' : 'เข้าสู่ระบบ'} <ArrowUpRight size={16}/></Link>
                </div>
            </div>
        </div>

        <div className="kc-studio kc-container">
            <div className="kc-studio-bar">
                <span className="kc-studio-label"><img src="/assets/brand/mark.svg" alt="" width="22" height="22"/>เล่น สร้าง แล้วไปต่อ</span>
                <div className="kc-hero-controls">
                    <button type="button" onClick={opening ? () => setPhase('ready') : replay} disabled={reduced} aria-label={opening ? 'ข้ามเปิดตัว' : 'เล่นเปิดตัวอีกครั้ง'}>{opening ? <SkipForward size={15}/> : <RotateCcw size={15}/>}<span>{opening ? 'ข้ามเปิดตัว' : 'เล่นเปิดตัว'}</span></button>
                    <button type="button" onClick={onToggleMotion} disabled={reduced} aria-pressed={still} aria-label={reduced ? 'ลดการเคลื่อนไหวตามการตั้งค่าอุปกรณ์' : paused ? 'เปิดการเคลื่อนไหว' : 'หยุดการเคลื่อนไหว'}>{still ? <Play size={15}/> : <Pause size={15}/>}<span>{reduced ? 'ลดการเคลื่อนไหว' : paused ? 'เปิดการเคลื่อนไหว' : 'หยุดการเคลื่อนไหว'}</span></button>
                </div>
            </div>
            <div className="kc-studio-canvas" data-view={view}>
                <img className="kc-studio-wordmark" src="/assets/brand/wordmark.svg" alt="" width="1000" height="153" aria-hidden="true"/>
                {left && <div className="kc-studio-side kc-studio-left"><div className="kc-card-enter"><div className="kc-card-drift"><Link href={left.href} aria-label={'ดูรายละเอียด ' + left.label}><img src={left.src} alt="" width="640" height="480" decoding="async"/><div><strong>{left.label}</strong><span>{left.demo ? 'ตัวอย่างคอลเลกชัน' : 'ดูรายละเอียดสินค้า'}</span></div></Link></div></div></div>}
                {primary && <div className="kc-studio-primary"><div className="kc-card-enter"><div className="kc-card-drift">
                    <Link href={primary.href} aria-label={'ดูรายละเอียด ' + primary.label}>
                        <div className="kc-window-bar"><span aria-hidden="true"><i/><i/><i/></span><span>{primary.kind === 'game' ? 'โลกที่อยากเล่น' : 'โปรเจกต์ที่อยากสร้าง'}</span><ArrowUpRight size={15}/></div>
                        <div className={'kc-primary-art kc-primary-' + primary.kind}><img key={primary.src} src={primary.src} alt="" width="1000" height="750" fetchPriority="high" decoding="async"/></div>
                        <div className="kc-primary-caption"><div><strong>{primary.label}</strong><span>{primary.demo ? 'ภาพตัวอย่างคอลเลกชัน' : 'อ่านรายละเอียดก่อนสั่งซื้อ'}</span></div><span className="kc-art-open"><ArrowUpRight size={20}/></span></div>
                    </Link>
                </div></div></div>}
                {right && <div className="kc-studio-side kc-studio-right"><div className="kc-card-enter"><div className="kc-card-drift"><Link href={right.href} aria-label={'ดูรายละเอียด ' + right.label}><img src={right.src} alt="" width="640" height="480" decoding="async"/><div><strong>{right.label}</strong><span>{right.demo ? 'ตัวอย่างคอลเลกชัน' : 'ดูรายละเอียดสินค้า'}</span></div></Link></div></div></div>}
                {!primary && <div className="kc-hero-empty"><BrandSymbol/><p>ค้นพบรายการใหม่จากร้านค้า</p><Link href="/shop" className="kc-text-link">เปิดร้านค้า <ArrowUpRight size={16}/></Link></div>}
            </div>
            <div className="kc-studio-bottom">
                <div className="kc-studio-switch" role="group" aria-label="เลือกมุมมองตัวอย่าง">
                    <button type="button" aria-pressed={view === 'game'} onClick={() => setView('game')}><Gamepad2 size={17}/>มุมคนเล่น</button>
                    <button type="button" aria-pressed={view === 'source'} onClick={() => setView('source')}><Code2 size={17}/>มุมคนสร้าง</button>
                </div>
                <Link href={view === 'game' ? '/games' : '/source-code'} className="kc-studio-browse">{view === 'game' ? 'สำรวจไอดีเกม' : 'สำรวจซอร์สโค้ด'} <ArrowUpRight size={16}/></Link>
            </div>
        </div>
        <div className="kc-brand-entry" key={cycle} aria-hidden="true"><div className="kc-entry-mark"><BrandSymbol/></div><img src="/assets/brand/wordmark.svg" alt="" width="190" height="29"/><p>พื้นที่ของความเป็นไปได้</p></div>
    </section>;
}
