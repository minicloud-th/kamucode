'use client';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Pause, Play } from 'lucide-react';
const Reveal = lazy(() => import('@/components/ui/liquid-glass-logo-reveal').then(m => ({ default: m.GlassIconReveal })));
export function HeroVideo({ className = '', paused = false }: {
    className?: string;
    paused?: boolean;
}) {
    const video = useRef<HTMLVideoElement>(null), [playing, setPlaying] = useState(false), [started, setStarted] = useState(false), manual = useRef(false);
    useEffect(() => { const v = video.current; if (!v)
        return; const motion = matchMedia('(prefers-reduced-motion: reduce)'), connection = (navigator as Navigator & {
        connection?: {
            saveData?: boolean;
        };
    }).connection; const sync = async (visible: boolean) => { if (visible && !document.hidden && !motion.matches && !paused && !connection?.saveData && !manual.current) {
        setStarted(true);
        if (!v.getAttribute("src")) {
            v.src = "/media/hero-motion.mp4";
            v.load();
        }
        try {
            await v.play();
            setPlaying(true);
        }
        catch {
            setPlaying(false);
        }
    }
    else {
        v.pause();
        setPlaying(false);
    } }; let visible = false; const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting; void sync(visible); }, { threshold: .1 }); observer.observe(v); const change = () => void sync(visible); document.addEventListener('visibilitychange', change); motion.addEventListener('change', change); return () => { observer.disconnect(); document.removeEventListener('visibilitychange', change); motion.removeEventListener('change', change); v.pause(); }; }, [paused]);
    return <div className={'hero-video ' + className}><video ref={video} src={started ? '/media/hero-motion.mp4' : undefined} poster="/media/hero.webp" muted loop playsInline preload="none" aria-label="วิดีโอแบนเนอร์ kamucode จอยเกมและรูปทรงดิจิทัล"/><button className="video-control" aria-label={playing ? 'หยุดวิดีโอชั่วคราว' : 'เล่นวิดีโอ'} onClick={async () => { const v = video.current; if (!v)
        return; if (playing) {
        manual.current = true;
        v.pause();
        setPlaying(false);
    }
    else {
        manual.current = false;
        setStarted(true);
        try {
            if (!v.src) {
                v.src = '/media/hero-motion.mp4';
                v.load();
            }
            await v.play();
            setPlaying(true);
        }
        catch {
            setPlaying(false);
        }
    } }}>{playing ? <Pause size={15}/> : <Play size={15}/>}<span>{playing ? 'หยุด' : 'เล่น'}</span></button></div>;
}
export function BrandReveal() { return <div className="brand-reveal"><Suspense fallback={<img src="/assets/brand/mark.svg" width="120" height="120" alt="kamucode"/>}><Reveal logo="/assets/brand/mark.svg" label="kamucode" loop={false} originalColors tileSize={170} finalScale={.85} background="#eef1f8"/></Suspense></div>; }
