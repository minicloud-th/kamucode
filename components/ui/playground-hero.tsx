'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowUpRight, Pause, Play, RotateCcw, SkipForward} from 'lucide-react';
import {BrandSymbol} from './brand-symbol';

type HeroTile = {src: string; label: string; kind: 'game' | 'source'};
type PlaygroundHeroProps = {
    tiles: readonly HeroTile[];
    authenticated: boolean;
    paused: boolean;
    reduced: boolean;
    onToggleMotion: () => void;
    onExplore: () => void;
};

export function PlaygroundHero({tiles, authenticated, paused, reduced, onToggleMotion, onExplore}: PlaygroundHeroProps) {
    const [phase, setPhase] = useState<'idle' | 'opening' | 'ready'>('idle');
    const [cycle, setCycle] = useState(0);
    const initialized = useRef(false);
    const reduce = reduced;
    const still = paused || reduce;
    const opening = phase === 'opening' && !still;

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
        if (reduce) return;
        if (paused) onToggleMotion();
        setCycle(value => value + 1);
        setPhase('opening');
    }

    return <section className="kc-hero" aria-labelledby="kc-hero-title" data-intro={opening} onFocusCapture={event => {if (opening && (event.target as HTMLElement).closest('.kc-hero-copy')) setPhase('ready');}}>
        <div className="kc-hero-scene">
            <div className="kc-hero-tiles" aria-hidden="true">{tiles.map((tile, index) => <figure key={tile.label + '-' + index} className={'kc-hero-tile kc-tile-' + index + ' kc-tile-' + tile.kind}><div><img src={tile.src} alt="" width="640" height="480" draggable={false} decoding="async" fetchPriority={index === 0 ? 'high' : 'auto'}/></div><figcaption>{tile.label}</figcaption></figure>)}</div>
            <div className="kc-hero-copy">
                <p className="kc-hero-note">ไอดีเกมและซอร์สโค้ด ในพื้นที่เดียว</p>
                <h1 id="kc-hero-title">พื้นที่ของคนเล่น<br/>และคนสร้าง.</h1>
                <p className="kc-hero-description">เกมที่อยากเล่น โปรเจกต์ที่อยากสร้าง<br/>ค้นพบจุดเริ่มต้นถัดไปของคุณที่ kamucode</p>
                <div className="kc-hero-actions"><a className="kc-button kc-button-dark" href="#collections" onClick={event => {event.preventDefault(); onExplore();}}>สำรวจคอลเลกชัน <ArrowUpRight size={17}/></a><a href={authenticated ? '/account' : '/login'} className="kc-hero-login">{authenticated ? 'ไปที่บัญชีของฉัน' : 'เข้าสู่ระบบ'}<ArrowUpRight size={16}/></a></div>
            </div>
        </div>

        <div className="kc-brand-entry" key={cycle} aria-hidden="true"><div className="kc-entry-mark"><BrandSymbol/></div><img src="/assets/brand/wordmark.svg" alt="" width="190" height="29"/><p>พื้นที่ของความเป็นไปได้</p></div>

        <div className="kc-hero-controls kc-container"><button type="button" onClick={opening ? () => setPhase('ready') : replay} disabled={!opening && reduce}>{opening ? <SkipForward size={14}/> : <RotateCcw size={14}/>}<span>{opening ? 'ข้ามเปิดตัว' : 'เล่นเปิดตัวอีกครั้ง'}</span></button><a className="kc-hero-scroll" href="#collections" onClick={event => {event.preventDefault(); onExplore();}}>เลื่อนลงเพื่อค้นพบ <ArrowDown size={15}/></a><button type="button" onClick={onToggleMotion} disabled={reduce} aria-pressed={still} aria-label={reduce ? 'ลดการเคลื่อนไหวตามการตั้งค่าอุปกรณ์' : paused ? 'เปิดการเคลื่อนไหว' : 'หยุดการเคลื่อนไหว'}>{still ? <Play size={14}/> : <Pause size={14}/>}<span>{reduce ? 'ลดการเคลื่อนไหว' : paused ? 'เปิดการเคลื่อนไหว' : 'หยุดการเคลื่อนไหว'}</span></button></div>
    </section>;
}
