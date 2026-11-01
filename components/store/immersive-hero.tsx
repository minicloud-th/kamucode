'use client';

import {useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowUpRight, Pause, Play} from 'lucide-react';
import Link from './navigation-link';

type HeroProps = {
    authenticated: boolean;
    paused: boolean;
    reduced: boolean;
    onToggleMotion: () => void;
    onExplore: () => void;
    onFilm: () => void;
};

export function ImmersiveHero({authenticated, paused, reduced, onToggleMotion, onExplore, onFilm}: HeroProps) {
    const hero = useRef<HTMLElement>(null);
    const [imageFailed, setImageFailed] = useState(false);
    const still = paused || reduced;

    useEffect(() => {
        const node = hero.current;
        if (!node || still) return;
        let frame = 0, x = 0, y = 0, visible = true;
        const fine = matchMedia('(pointer: fine)').matches;
        const render = () => {
            frame = 0;
            if (!visible || document.hidden) return;
            const rect = node.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height)));
            node.style.setProperty('--hero-x', x * 20 + 'px');
            node.style.setProperty('--hero-y', y * 14 - progress * 48 + 'px');
            node.style.setProperty('--hero-rx', -y * 4 + 'deg');
            node.style.setProperty('--hero-ry', x * 6 + 'deg');
            node.style.setProperty('--hero-zoom', String(1 + progress * .12));
        };
        const queue = () => {if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);};
        const move = (event: PointerEvent) => {
            const rect = node.getBoundingClientRect();
            x = Math.max(-.5, Math.min(.5, (event.clientX - rect.left) / rect.width - .5));
            y = Math.max(-.5, Math.min(.5, (event.clientY - rect.top) / rect.height - .5));
            queue();
        };
        const reset = () => {x = 0; y = 0; queue();};
        const visibility = () => {node.dataset.active = String(visible && !document.hidden); if (document.hidden) {cancelAnimationFrame(frame); frame = 0;} else queue();};
        const observer = new IntersectionObserver(([entry]) => {visible = entry.isIntersecting; visibility();}, {threshold: 0});
        observer.observe(node);
        if (fine) {node.addEventListener('pointermove', move, {passive: true}); node.addEventListener('pointerleave', reset, {passive: true});}
        addEventListener('scroll', queue, {passive: true});
        addEventListener('resize', queue, {passive: true});
        document.addEventListener('visibilitychange', visibility);
        queue();
        return () => {
            observer.disconnect(); cancelAnimationFrame(frame);
            node.removeEventListener('pointermove', move); node.removeEventListener('pointerleave', reset);
            removeEventListener('scroll', queue); removeEventListener('resize', queue);
            document.removeEventListener('visibilitychange', visibility);
            for (const key of ['--hero-x', '--hero-y', '--hero-rx', '--hero-ry', '--hero-zoom']) node.style.removeProperty(key);
            delete node.dataset.active;
        };
    }, [still]);

    return <section ref={hero} className="yu-hero" aria-labelledby="studio-heading" data-still={still}>
        <div className="yu-paper" aria-hidden="true"/>
        <div className="yu-scene" data-classic-dark>
            <div className="yu-scene-glow" aria-hidden="true"/>
            <div className="yu-grain" aria-hidden="true"/>
            <div className="yu-wordmark" aria-hidden="true"><img src="/assets/brand/wordmark-dark.svg" width="674" height="112" alt=""/></div>
            <div className="yu-halo" aria-hidden="true"><span/><span/><span/></div>
            <div className="yu-spark spark-a" aria-hidden="true">+</div><div className="yu-spark spark-b" aria-hidden="true">+</div><div className="yu-spark spark-c" aria-hidden="true">+</div>
            <div className="yu-figure" aria-hidden="true"><div className="yu-levitate">{imageFailed ? <img className="yu-fallback" src="/assets/brand/mark-dark.svg" width="400" height="400" alt=""/> : <img className="yu-character" src="/media/hero-avatar-kc-v2.webp" width="1024" height="1536" alt="" fetchPriority="high" decoding="async" draggable={false} onError={() => setImageFailed(true)}/>}</div></div>
            <div className="yu-hero-copy"><span className="yu-eyebrow">YOUR NEXT CHAPTER</span><h1 id="studio-heading">เล่นให้สุด<span>สร้างให้ไกล</span></h1><p>เกมที่อยากเล่น โค้ดที่อยากสร้าง<br/>และพื้นที่ให้ไอเดียของคุณเติบโตไปด้วยกัน</p><div className="yu-entry-links"><Link href={authenticated ? '/shop' : '/login'} className="yu-signin">{authenticated ? 'เข้าสู่ร้านค้า' : 'เข้าสู่ระบบ'} <ArrowUpRight size={15}/></Link>{!authenticated && <Link href="/signup" className="yu-start">สมัครสมาชิก <ArrowUpRight size={14}/></Link>}</div></div>
            <aside className="yu-side-copy" aria-label="รู้จัก kamucode"><span>PLAY / BUILD / GROW</span><p>เกมที่อยากเล่น<br/>โค้ดที่อยากสร้าง<br/><strong>เริ่มต่อได้ที่นี่</strong></p><img src="/assets/brand/mark-dark.svg" width="39" height="39" alt=""/></aside>
            <div className="yu-hero-bottom"><span className="yu-bottom-label">KAMUCODE — DIGITAL PLAYGROUND</span><button type="button" className="yu-explore" onClick={onExplore}>ค้นพบสิ่งที่ชอบ <ArrowDown size={15}/></button><button className="yu-motion" type="button" onClick={onToggleMotion} aria-pressed={paused} disabled={reduced} aria-label={reduced ? 'ปิดอนิเมชั่นตามการตั้งค่าอุปกรณ์' : paused ? 'เล่นอนิเมชั่น' : 'หยุดอนิเมชั่น'}>{still ? <Play size={12}/> : <Pause size={12}/>}<span>{reduced ? 'REDUCED MOTION' : paused ? 'MOTION OFF' : 'MOTION ON'}</span></button></div>
            <button type="button" className="yu-film-cue" onClick={onFilm} aria-label="เลื่อนไปวิดีโอ"><span>SCROLL TO DISCOVER</span><span className="yu-scroll-line"/></button>
        </div>
    </section>;
}
