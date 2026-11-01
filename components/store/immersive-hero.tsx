'use client';

import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {ArrowDown, ArrowUpRight, Pause, Play, RotateCcw, SkipForward} from 'lucide-react';
import type {Product} from '@/lib/commerce/types';
import Link from './navigation-link';

type HeroProps = {
    products: Product[];
    authenticated: boolean;
    paused: boolean;
    reduced: boolean;
    onToggleMotion: () => void;
    onExplore: () => void;
    onFilm: () => void;
};

const orbit = [
    {id: 'valorant', x: 15, y: 24, size: 13.2, angle: -13},
    {id: 'storefront', x: 38, y: 17, size: 8.4, angle: 7},
    {id: 'minecraft', x: 65, y: 17, size: 10.1, angle: -7},
    {id: 'dashboard', x: 86, y: 25, size: 14.3, angle: 12},
    {id: 'roblox', x: 9, y: 57, size: 8.6, angle: -6},
    {id: 'genshin', x: 91, y: 60, size: 10, angle: 7},
    {id: 'discord-bot', x: 28, y: 82, size: 12.2, angle: 11},
    {id: 'saas-starter', x: 76, y: 83, size: 12.5, angle: -10},
];

const imageFor = (p: Product) => p.kind === 'game' && ['valorant', 'roblox', 'minecraft', 'genshin'].includes(p.id)
    ? '/assets/landing/' + p.id + '.webp'
    : p.kind === 'source' && p.image.startsWith('/assets/catalog/') ? '/assets/code/' + p.id + '.svg' : p.image;

export function ImmersiveHero({products, authenticated, paused, reduced, onToggleMotion, onExplore, onFilm}: HeroProps) {
    const hero = useRef<HTMLElement>(null);
    const [stage, setStage] = useState<'idle' | 'playing' | 'done'>('idle');
    const [replay, setReplay] = useState(0);
    const still = paused || reduced;
    const opening = stage === 'playing' && !still;
    const tiles = orbit.map(slot => ({...slot, product: products.find(p => p.id === slot.id)})).filter(slot => slot.product);

    // The server-rendered hero stays usable before hydration and without JavaScript.
    useEffect(() => {
        const frame = requestAnimationFrame(() => setStage(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'playing'));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (stage !== 'playing') return;
        const timer = setTimeout(() => setStage('done'), still ? 0 : 2050);
        return () => clearTimeout(timer);
    }, [stage, still, replay]);

    useEffect(() => {
        const node = hero.current;
        if (!node || still) return;
        let frame = 0, x = 0, y = 0, visible = true;
        const render = () => {
            frame = 0;
            if (!visible || document.hidden) return;
            node.style.setProperty('--orbit-x', x * 14 + 'px');
            node.style.setProperty('--orbit-y', y * 10 + 'px');
        };
        const queue = () => {if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);};
        const move = (event: PointerEvent) => {
            const rect = node.getBoundingClientRect();
            x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
            y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
            queue();
        };
        const reset = () => {x = 0; y = 0; queue();};
        const visibility = () => {
            node.dataset.active = String(visible && !document.hidden);
            if (!visible || document.hidden) {cancelAnimationFrame(frame); frame = 0;} else queue();
        };
        const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; visibility();});
        observer.observe(node);
        const fine = matchMedia('(pointer: fine)').matches;
        if (fine) {node.addEventListener('pointermove', move, {passive: true}); node.addEventListener('pointerleave', reset, {passive: true});}
        document.addEventListener('visibilitychange', visibility);
        return () => {
            observer.disconnect(); cancelAnimationFrame(frame);
            node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', reset);
            document.removeEventListener('visibilitychange', visibility);
            node.style.removeProperty('--orbit-x'); node.style.removeProperty('--orbit-y');
            delete node.dataset.active;
        };
    }, [still]);

    function replayIntro() {
        if (reduced) return;
        if (paused) onToggleMotion();
        setStage('playing');
        setReplay(v => v + 1);
    }

    return <section ref={hero} className="orbit-hero" aria-labelledby="studio-heading" data-intro={opening} data-still={still}>
        <div className="orbit-intro" key={'intro-' + replay} aria-hidden="true"><img src="/assets/brand/mark.svg" width="128" height="128" alt=""/><span>PLAY. BUILD. GROW.</span></div>
        <ul className="orbit-tiles" aria-label="ค้นพบเกมและซอร์สโค้ด">
            {tiles.map(slot => {
                const p = slot.product!;
                const index = orbit.findIndex(item => item.id === slot.id);
                return <li className={'orbit-tile orbit-tile-' + slot.id} key={slot.id} style={{'--x': slot.x, '--y': slot.y, '--size': slot.size, '--angle': slot.angle + 'deg', '--order': index} as CSSProperties}>
                    <div className="orbit-entry" key={replay}><div className="orbit-drift"><Link href={'/product/' + p.id} className="orbit-product" aria-label={'ดูรายละเอียด ' + p.name}>
                        <div className={'orbit-image is-' + p.kind}><img src={imageFor(p)} width="480" height="480" alt="" decoding="async" draggable={false}/><span><ArrowUpRight size={16}/></span></div>
                        <strong>{p.name}</strong><small>{p.demo ? 'คอลเลกชันตัวอย่าง' : p.kind === 'game' ? 'ไอดีเกม' : 'ซอร์สโค้ด'}</small>
                    </Link></div></div>
                </li>;
            })}
        </ul>
        <div className="orbit-copy" key={'copy-' + replay}>
            <span className="orbit-eyebrow">A LITTLE PLAY. A BIG POSSIBILITY.</span>
            <h1 id="studio-heading">เล่นให้สุด<span>สร้างให้ไกล<span className="orbit-period">.</span></span></h1>
            <p>เกมที่อยากเล่น โค้ดที่อยากสร้าง<br/>และพื้นที่ให้ไอเดียของคุณเติบโตไปด้วยกัน</p>
            <div className="orbit-actions"><button type="button" className="orbit-explore" onClick={onExplore}>ค้นพบสิ่งที่ชอบ <ArrowUpRight size={16}/></button><Link href={authenticated ? '/shop' : '/login'} className="orbit-signin">{authenticated ? 'เข้าสู่ร้านค้า' : 'เข้าสู่ระบบ'} <ArrowUpRight size={15}/></Link></div>
            {!authenticated && <p className="orbit-signup">เริ่มต้นพื้นที่ของคุณ <Link href="/signup">สมัครสมาชิก <ArrowUpRight size={11}/></Link></p>}
        </div>
        <div className="orbit-controls">
            {opening ? <button type="button" className="orbit-replay" onClick={() => setStage('done')}><SkipForward size={13}/>ข้ามอนิเมชั่นเปิดตัว</button> : <button type="button" className="orbit-replay" onClick={replayIntro} disabled={reduced} title={reduced ? 'ปิดอนิเมชั่นตามการตั้งค่าอุปกรณ์' : undefined}><RotateCcw size={13}/>เล่นเปิดตัวอีกครั้ง</button>}
            <button type="button" className="orbit-scroll" onClick={onFilm} aria-label="เลื่อนไปวิดีโอ"><ArrowDown size={16}/><span>SCROLL TO DISCOVER</span></button>
            <button className="orbit-motion" type="button" onClick={onToggleMotion} aria-pressed={paused} disabled={reduced} aria-label={reduced ? 'ปิดอนิเมชั่นตามการตั้งค่าอุปกรณ์' : paused ? 'เล่นอนิเมชั่น' : 'หยุดอนิเมชั่น'}>{still ? <Play size={12}/> : <Pause size={12}/>}<span>{reduced ? 'REDUCED MOTION' : paused ? 'MOTION OFF' : 'MOTION ON'}</span></button>
        </div>
    </section>;
}
