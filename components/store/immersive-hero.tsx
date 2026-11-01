'use client';

import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {ArrowUpRight, Pause, Play, RotateCcw, SkipForward} from 'lucide-react';
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

type OrbitSlot = {id: string; x: number; y: number; size: number; ratio: number; angle: number; tilt: number};
const orbit: OrbitSlot[] = [
    {id: 'valorant', x: 22, y: 19, size: 16, ratio: 1.06, angle: 13, tilt: -16},
    {id: 'storefront', x: 38.5, y: 22.5, size: 6.4, ratio: .76, angle: 5, tilt: -11},
    {id: 'minecraft', x: 51, y: 13, size: 9.7, ratio: .8, angle: -4, tilt: 13},
    {id: 'dashboard', x: 80.5, y: 20, size: 19, ratio: 1.3, angle: -14, tilt: -19},
    {id: 'roblox', x: 15.5, y: 48, size: 8.6, ratio: .78, angle: 2, tilt: 16},
    {id: 'genshin', x: 86, y: 48, size: 8.3, ratio: .72, angle: -4, tilt: -14},
    {id: 'discord-bot', x: 23, y: 79, size: 14.3, ratio: .92, angle: -13, tilt: 16},
    {id: 'saas-starter', x: 50.5, y: 88, size: 12.2, ratio: 1, angle: 2, tilt: -8},
    {id: 'space', x: 65.5, y: 73, size: 5.8, ratio: .69, angle: 8, tilt: -10},
    {id: 'film', x: 80, y: 82, size: 13.4, ratio: .86, angle: 12, tilt: -17},
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

    useEffect(() => {
        const frame = requestAnimationFrame(() => setStage(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'done' : 'playing'));
        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (stage !== 'playing') return;
        const timer = setTimeout(() => setStage('done'), still ? 0 : 2200);
        return () => clearTimeout(timer);
    }, [stage, still, replay]);

    useEffect(() => {
        const node = hero.current;
        if (!node || still) return;
        let frame = 0, x = 0, y = 0, visible = true;
        const render = () => {
            frame = 0;
            if (!visible || document.hidden) return;
            const rect = node.getBoundingClientRect();
            node.style.setProperty('--orbit-x', x * 18 + 'px');
            node.style.setProperty('--orbit-y', y * 12 + 'px');
            node.style.setProperty('--scene-progress', String(Math.max(0, Math.min(1, -rect.top / rect.height))));
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
        addEventListener('scroll', queue, {passive: true});
        addEventListener('resize', queue, {passive: true});
        document.addEventListener('visibilitychange', visibility);
        return () => {
            observer.disconnect(); cancelAnimationFrame(frame);
            node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', reset);
            removeEventListener('scroll', queue); removeEventListener('resize', queue);
            document.removeEventListener('visibilitychange', visibility);
            for (const key of ['--orbit-x', '--orbit-y', '--scene-progress']) node.style.removeProperty(key);
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
        <div className="orbit-stage">
            <div className="orbit-intro" key={'intro-' + replay} aria-hidden="true"><img src="/assets/brand/mark.svg" width="128" height="128" alt=""/><span>PLAY. BUILD. GROW.</span></div>
            <ul className="orbit-tiles" aria-label="ค้นพบเกม ซอร์สโค้ด และพื้นที่สร้างสรรค์">
                {orbit.map((slot, index) => {
                    const product = products.find(p => p.id === slot.id);
                    if (!product && slot.id !== 'space' && slot.id !== 'film') return null;
                    const name = product?.name || (slot.id === 'film' ? 'Play. Build. Grow.' : authenticated ? 'บัญชีของคุณ' : 'สมัครสมาชิก');
                    const image = product ? imageFor(product) : slot.id === 'film' ? '/media/hero.webp' : '/media/hero-avatar-kc-v2.webp';
                    const content = <><span className={'orbit-image is-' + (product?.kind || slot.id)}><img src={image} width="480" height="600" alt="" decoding="async" draggable={false}/>{slot.id === 'film' && <span className="orbit-film-play"><Play size={14} fill="currentColor"/></span>}</span><span className="orbit-caption">{name}</span>{product?.demo && <span className="sr-only">คอลเลกชันตัวอย่าง</span>}</>;
                    return <li className={'orbit-tile orbit-tile-' + slot.id} key={slot.id} style={{'--x': slot.x, '--y': slot.y, '--size': slot.size, '--ratio': slot.ratio, '--angle': slot.angle + 'deg', '--tilt': slot.tilt + 'deg', '--order': index, '--depth': .4 + slot.size / 12, '--scatter-x': (slot.x - 50) * 7 + 'px', '--scatter-y': (slot.y - 50) * 5 + 'px'} as CSSProperties}>
                        <div className="orbit-travel"><div className="orbit-entry" key={replay}><div className="orbit-drift">
                            {slot.id === 'film' ? <button type="button" className="orbit-product" onClick={onFilm} aria-label="ดูวิดีโอแนะนำ kamucode">{content}</button> : <Link href={product ? '/product/' + product.id : authenticated ? '/account' : '/signup'} className="orbit-product" aria-label={product ? 'ดูรายละเอียด ' + product.name : authenticated ? 'เปิดบัญชีของคุณ' : 'สมัครสมาชิก'}>{content}</Link>}
                        </div></div></div>
                    </li>;
                })}
            </ul>
            <div className="orbit-copy" key={'copy-' + replay}><div className="orbit-copy-content">
                <h1 id="studio-heading">เล่นให้สุด<span>สร้างให้ไกล</span><span>ในแบบของคุณ<span className="orbit-period">.</span></span></h1>
                <p>เกมที่อยากเล่น โค้ดที่อยากสร้าง<br/>และพื้นที่ให้ไอเดียของคุณเติบโตไปด้วยกัน</p>
                <div className="orbit-actions"><button type="button" onClick={onExplore}>สำรวจคอลเลกชัน <ArrowUpRight size={13}/></button><span aria-hidden="true">/</span><Link href={authenticated ? '/shop' : '/login'}>{authenticated ? 'เข้าสู่ร้านค้า' : 'เข้าสู่ระบบ'} <ArrowUpRight size={13}/></Link></div>
            </div></div>
        </div>
        <div className="orbit-controls">
            {opening ? <button type="button" className="orbit-replay" onClick={() => setStage('done')}><SkipForward size={12}/>ข้ามอนิเมชั่นเปิดตัว</button> : <button type="button" className="orbit-replay" onClick={replayIntro} disabled={reduced} title={reduced ? 'ปิดอนิเมชั่นตามการตั้งค่าอุปกรณ์' : undefined}><RotateCcw size={12}/>เล่นเปิดตัวอีกครั้ง</button>}
            <span className="orbit-collection-note">ภาพจากคอลเลกชันตัวอย่าง</span>
            <button className="orbit-motion" type="button" onClick={onToggleMotion} aria-pressed={paused} disabled={reduced} aria-label={reduced ? 'ปิดอนิเมชั่นตามการตั้งค่าอุปกรณ์' : paused ? 'เล่นอนิเมชั่น' : 'หยุดอนิเมชั่น'}>{still ? <Play size={12}/> : <Pause size={12}/>}<span>{reduced ? 'REDUCED MOTION' : paused ? 'MOTION OFF' : 'MOTION ON'}</span></button>
        </div>
    </section>;
}
