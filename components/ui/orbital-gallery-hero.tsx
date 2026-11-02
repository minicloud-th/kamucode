"use client";

import * as React from "react";
import {animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue} from "motion/react";
import {ArrowUpRight, Code2, Gamepad2, Layers3, Pause, Play, RotateCcw, SkipForward} from "lucide-react";
import {BrandIntro} from './brand-intro';
import "./orbital-gallery-hero.css";

const stockImages = [
    "/assets/orbital/gaming-desk.webp",
    "/assets/orbital/controller.webp",
    "/assets/orbital/code.webp",
    "/assets/orbital/design.webp",
    "/assets/orbital/developer.webp",
] as const;
const defaultImages = [...stockImages, ...stockImages];
const features = [
    {icon: Gamepad2, title: "เกมที่ชอบ", description: "สำรวจคอลเลกชันไอดีเกม"},
    {icon: Code2, title: "โค้ดสำหรับก้าวต่อไป", description: "ดูรายละเอียดก่อนเริ่มโปรเจกต์"},
    {icon: Layers3, title: "ต่อได้ในบัญชีเดียว", description: "ติดตามคำสั่งซื้อและไฟล์ส่งมอบ"},
];

export type OrbitalGalleryHeroProps = {
    images?: readonly string[];
    duration?: number;
    intro?: boolean;
    className?: string;
    authenticated?: boolean;
    paused?: boolean;
    reduced?: boolean;
    onToggleMotion?: () => void;
    onExplore?: () => void;
};

type Playback = {play: () => void; pause: () => void; stop: () => void; time: number};

function OrbitalImage({src, index, count, rotation}: {src: string; index: number; count: number; rotation: MotionValue<number>}) {
    const [failed, setFailed] = React.useState(false);
    const phase = index * 360 / count;
    const x = useTransform(rotation, angle => "calc(var(--ogh-radius-x) * " + Math.cos((angle + phase) * Math.PI / 180) + ")");
    const y = useTransform(rotation, angle => "calc(var(--ogh-radius-y) * " + Math.sin((angle + phase) * Math.PI / 180) + ")");
    const counterRotation = useTransform(rotation, angle => -angle);

    return <div className="ogh-anchor absolute left-1/2 top-1/2">
        <motion.div className="ogh-orbit absolute" style={{x, y, rotate: rotation}} initial={false}>
            <motion.div className="ogh-counter absolute" style={{rotate: counterRotation}} initial={false}>
                <div className={'ogh-image-frame overflow-hidden rounded-xl border border-white/40 shadow-lg' + (failed ? ' is-fallback' : '')}>
                    <img src={failed ? '/assets/brand/mark.svg' : src} alt="" width="640" height="420" draggable={false} decoding="async" onError={() => setFailed(true)}/>
                </div>
            </motion.div>
        </motion.div>
    </div>;
}

export function HeroSection({images = defaultImages, duration = 35, intro = true, className = '', authenticated = false, paused, reduced = false, onToggleMotion, onExplore}: OrbitalGalleryHeroProps) {
    const section = React.useRef<HTMLElement>(null);
    const playback = React.useRef<Playback | null>(null);
    const rotation = useMotionValue(0);
    const inView = useInView(section, {amount: .05});
    const systemReduced = useReducedMotion();
    const [localPaused, setLocalPaused] = React.useState(false);
    const [introState, setIntroState] = React.useState<'idle' | 'playing' | 'done'>('idle');
    const [introCycle, setIntroCycle] = React.useState(0);
    const introStarted = React.useRef(false);
    const isPaused = paused ?? localPaused;
    const reducedMotion = reduced || Boolean(systemReduced);
    const cycleDuration = Number.isFinite(duration) && duration > 0 ? duration : 35;
    const opening = intro && introState === 'playing' && !isPaused && !reducedMotion;
    const readOnlyMotion = paused !== undefined && !onToggleMotion;

    React.useEffect(() => {
        if (introStarted.current) return;
        const frame = requestAnimationFrame(() => {
            introStarted.current = true;
            setIntroState(intro && !isPaused && !reducedMotion && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'playing' : 'done');
        });
        return () => cancelAnimationFrame(frame);
    }, [intro, isPaused, reducedMotion]);

    React.useEffect(() => {
        if (introState !== 'playing') return;
        const timer = setTimeout(() => setIntroState('done'), !intro || isPaused || reducedMotion ? 0 : 1850);
        return () => clearTimeout(timer);
    }, [introState, introCycle, intro, isPaused, reducedMotion]);

    React.useEffect(() => {
        const start = rotation.get();
        const controls = animate(rotation, [start, start + 360], {duration: cycleDuration, repeat: Infinity, ease: 'linear'});
        controls.pause();
        playback.current = controls;
        return () => {controls.stop(); playback.current = null;};
    }, [rotation, cycleDuration]);

    React.useEffect(() => {
        const sync = () => {
            if (introState === 'done' && inView && !isPaused && !reducedMotion && !document.hidden && !matchMedia('(prefers-reduced-motion: reduce)').matches) playback.current?.play();
            else playback.current?.pause();
        };
        sync();
        document.addEventListener('visibilitychange', sync);
        return () => document.removeEventListener('visibilitychange', sync);
    }, [inView, isPaused, reducedMotion, cycleDuration, introState]);

    function toggleMotion() {
        if (onToggleMotion) onToggleMotion();
        else setLocalPaused(value => !value);
    }

    function replayIntro() {
        if (reducedMotion || readOnlyMotion) return;
        if (playback.current) playback.current.time = 0;
        if (!intro) return;
        if (isPaused) toggleMotion();
        setIntroCycle(value => value + 1);
        setIntroState('playing');
    }

    return <section ref={section} className={'orbital-gallery-hero relative w-full overflow-hidden bg-white ' + className} aria-labelledby="studio-heading" data-orbit-duration={cycleDuration} data-motion-paused={isPaused || reducedMotion} data-brand-intro={opening}>
        <div className="ogh-stage absolute">
            <div className="ogh-artwork absolute inset-0 pointer-events-none" aria-hidden="true">
                {images.map((src, index) => <OrbitalImage key={src + '-' + index} src={src} index={index} count={images.length} rotation={rotation}/>)}
            </div>

            <div className="ogh-copy relative z-20 flex flex-col items-center justify-center text-center">
                <div className="ogh-badge inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-4 text-slate-500">
                    <span className="ogh-badge-dot rounded-full bg-blue-500"/>
                    PLAY / BUILD / GROW
                </div>
                <h1 id="studio-heading" className="ogh-title font-normal">เล่นให้สุด<br/>สร้างให้ไกล<span className="ogh-period">.</span></h1>
                <p className="ogh-description">เกมที่อยากเล่น โค้ดที่อยากสร้าง<br/>และพื้นที่สำหรับไอเดียใหม่ของคุณ</p>
                <div className="ogh-actions flex flex-col items-center gap-3 sm:flex-row">
                    <a href={authenticated ? '/shop' : '/login'} className="ogh-primary inline-flex items-center justify-center gap-2 rounded-full transition-transform active:scale-95">{authenticated ? 'เข้าสู่ร้านค้า' : 'เข้าสู่ระบบ'}<ArrowUpRight size={15}/></a>
                    {onExplore ? <button type="button" className="ogh-secondary inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white transition-colors hover:bg-slate-50" onClick={onExplore}>ดูคอลเลกชัน<ArrowUpRight size={15}/></button> : <a href="/collections" className="ogh-secondary inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white transition-colors hover:bg-slate-50">ดูคอลเลกชัน<ArrowUpRight size={15}/></a>}
                </div>
            </div>
        </div>

        <div className="ogh-features grid grid-cols-3 border-t border-slate-200/70">
            {features.map(({icon: Icon, title, description}) => <div className="ogh-feature text-center" key={title}><h2 className="flex items-center justify-center gap-2"><Icon size={14}/>{title}</h2><p>{description}</p></div>)}
        </div>

        <BrandIntro key={introCycle}/>

        <div className="ogh-controls flex items-center justify-between">
            {opening ? <button type="button" onClick={() => setIntroState('done')} className="inline-flex items-center gap-2"><SkipForward size={12}/><span>ข้ามเปิดตัว</span></button> : <button type="button" onClick={replayIntro} disabled={reducedMotion || readOnlyMotion} className="inline-flex items-center gap-2"><RotateCcw size={12}/><span>{intro ? 'เล่นเปิดตัวอีกครั้ง' : 'เริ่มวงโคจรใหม่'}</span></button>}
            <span className="ogh-credit">ภาพประกอบจาก Unsplash</span>
            <button type="button" onClick={toggleMotion} aria-pressed={isPaused} aria-label={reducedMotion ? 'ปิดอนิเมชั่นตามการตั้งค่าอุปกรณ์' : isPaused ? 'เล่นอนิเมชั่น' : 'หยุดอนิเมชั่น'} disabled={reducedMotion || readOnlyMotion} className="inline-flex items-center gap-2">{isPaused || reducedMotion ? <Play size={12}/> : <Pause size={12}/>}<span>{reducedMotion ? 'REDUCED MOTION' : isPaused ? 'MOTION OFF' : cycleDuration + 's / ORBIT'}</span></button>
        </div>
    </section>;
}

export default HeroSection;
