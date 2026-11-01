'use client';

import {useEffect, useRef, useState, type CSSProperties} from 'react';
import Link from '@/components/store/navigation-link';
import {ArrowUpRight, ChevronRight, Code2, Gamepad2, Plus} from 'lucide-react';
import {HeroVideo, BrandReveal} from './media';
import {ImmersiveHero} from './immersive-hero';
import {useStore} from './provider';
import type {Product} from '@/lib/commerce/types';

type Filter = 'all' | 'game' | 'source';
const selection = ['valorant', 'storefront', 'minecraft', 'dashboard', 'roblox', 'genshin'];
const imageFor = (p: Product) => p.kind === 'game' && ['valorant', 'roblox', 'minecraft', 'genshin'].includes(p.id)
    ? '/assets/landing/' + p.id + '.webp'
    : p.image.startsWith('/assets/catalog/') && p.kind === 'source' ? '/assets/code/' + p.id + '.svg' : p.image;

export function Landing() {
    const {products, me} = useStore();
    const root = useRef<HTMLDivElement>(null);
    const [filter, setFilter] = useState<Filter>('all');
    const [paused, setPaused] = useState(false);
    const [reduced, setReduced] = useState(false);
    const featured = selection.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
    const displayed = featured.filter(p => filter === 'all' || p.kind === filter);
    const still = paused || reduced;

    useEffect(() => {
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setReduced(motion.matches);
        sync();
        motion.addEventListener('change', sync);
        return () => motion.removeEventListener('change', sync);
    }, []);

    useEffect(() => {
        const element = root.current;
        if (!element || still) return;
        const nodes = [...element.querySelectorAll<HTMLElement>('[data-reveal]')];
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        }, {threshold: .08, rootMargin: '0px 0px -30px 0px'});
        for (const node of nodes) {
            if (node.getBoundingClientRect().top < innerHeight - 30) node.classList.add('is-visible');
            else {node.classList.add('will-reveal'); observer.observe(node);}
        }
        return () => {observer.disconnect(); for (const node of nodes) node.classList.remove('will-reveal');};
    }, [still, filter]);

    function scrollTo(id: string) {document.getElementById(id)?.scrollIntoView({behavior: still ? 'instant' : 'smooth'});}

    return <div className="studio-landing" ref={root} data-motion-paused={still}>
        <ImmersiveHero products={products} authenticated={me.authenticated} paused={paused} reduced={reduced} onToggleMotion={() => setPaused(v => !v)} onExplore={() => scrollTo('collections')} onFilm={() => scrollTo('hero-film')}/>

        <div className="studio-ticker" aria-hidden="true"><div className="studio-ticker-track">{[0, 1].map(n => <div key={n}>{['PLAY YOUR WAY', 'BUILD SOMETHING YOURS', 'GROW TOGETHER'].map(word => <span key={word}>{word}<img src="/assets/brand/mark.svg" width="30" height="30" alt=""/></span>)}</div>)}</div></div>

        <section className="studio-film studio-wrap" id="hero-film" aria-labelledby="studio-film-title">
            <div className="studio-section-label" data-reveal><span>01 / FIND YOUR NEXT</span><span>GAMES · CODE · POSSIBILITIES</span></div>
            <div className="studio-film-title" data-reveal><h2 id="studio-film-title">สิ่งที่คุณชอบ<br/><span>พาคุณไปได้อีกไกล.</span></h2><p>จากเกมโปรดในวันพักผ่อน<br/>สู่โปรเจกต์ถัดไปที่คุณอยากลงมือทำ</p></div>
            <div className="studio-film-frame" data-reveal data-classic-dark><HeroVideo paused={still}/><div className="studio-film-overlay"><span>KAMUCODE / IN MOTION</span><h3>ก้าวต่อไป<br/>เริ่มได้ที่นี่<span>↗</span></h3><Link href="/showcase">เปิดพื้นที่สร้างสรรค์ <ArrowUpRight size={16}/></Link></div><div className="studio-film-credit">ORIGINAL VISUAL — PLAY. BUILD. GROW.</div></div>
        </section>

        <section className="studio-collections studio-wrap" id="collections" aria-labelledby="studio-collections-title">
            <div className="studio-section-label" data-reveal><span>02 / THE SELECTION</span><Link href="/collections">ดูคอลเลกชันทั้งหมด <ArrowUpRight size={14}/></Link></div>
            <div className="studio-collection-heading" data-reveal><h2 id="studio-collections-title">เลือกโลก<br/>ที่เป็นคุณ<span>.</span></h2><div><p>มีทั้งโลกให้เล่น และเครื่องมือให้สร้าง<br/>เริ่มจากสิ่งที่คุณสนใจ</p><div className="studio-filters" role="group" aria-label="กรองคอลเลกชัน">{([['all', 'ทั้งหมด'], ['game', 'ไอดีเกม'], ['source', 'ซอร์สโค้ด']] as const).map(([key, label]) => <button type="button" key={key} onClick={() => setFilter(key)} aria-pressed={filter === key}>{key === 'game' ? <Gamepad2 size={15}/> : key === 'source' ? <Code2 size={15}/> : <Plus size={14}/>} {label}</button>)}</div></div></div>
            <p className="studio-filter-status" role="status" aria-live="polite">{displayed.length} คอลเลกชัน{filter === 'game' ? 'ไอดีเกม' : filter === 'source' ? 'ซอร์สโค้ด' : 'สำหรับคุณ'}</p>
            <div className="studio-project-grid">{displayed.map((p, index) => <article className={'studio-project project-' + p.id} key={p.id} data-reveal style={{'--reveal-delay': (index % 2) * 70 + 'ms'} as CSSProperties}>
                <Link href={'/product/' + p.id} aria-label={'ดูรายละเอียด ' + p.name}><div className="studio-project-image"><img src={imageFor(p)} alt={p.name} width="1000" height="750" loading="lazy"/><span className="studio-project-number">{String(selection.indexOf(p.id) + 1).padStart(2, '0')} / {p.kind === 'game' ? 'PLAY' : 'BUILD'}</span><span className="studio-project-open"><ArrowUpRight size={22}/></span></div><div className="studio-project-info"><div><h3>{p.name}</h3><p>{p.tag}</p></div><span>{p.demo ? 'คอลเลกชันตัวอย่าง' : 'ดูรายละเอียดสินค้า'}</span></div></Link>
            </article>)}</div>
            {displayed.length === 0 && <p className="studio-empty">ยังไม่มีคอลเลกชันในหมวดนี้ ลองเลือกหมวดอื่นได้เลย</p>}
            <div className="studio-collection-foot"><p>เลือกอย่างเข้าใจ — อ่านรายละเอียด เงื่อนไข และสถานะของแต่ละรายการก่อนสั่งซื้อ</p><Link href="/shop">สำรวจร้านค้า <ArrowUpRight size={16}/></Link></div>
        </section>

        <section className="studio-manifesto" aria-labelledby="studio-manifesto-title" data-classic-dark><div className="studio-wrap"><div className="studio-section-label"><span>MADE FOR YOUR NEXT CHAPTER</span><span>PLAY / BUILD / GROW</span></div><div className="studio-manifesto-grid"><h2 id="studio-manifesto-title" data-reveal>ความสนใจวันนี้<br/>อาจเป็น<span>สิ่งที่ยิ่งใหญ่</span><br/>ของคุณในวันพรุ่งนี้.</h2><div className="studio-manifesto-art" aria-hidden="true"><div/><img src="/assets/brand/mark-dark.svg" width="240" height="240" alt=""/><span>KEEP MAKING<br/>YOUR NEXT MOVE.</span></div></div><p data-reveal>เราเชื่อในพื้นที่ที่การเล่นกับการสร้างสรรค์อยู่ด้วยกันได้<br/>kamucode จึงรวมเกม ซอร์สโค้ด และโอกาสสำหรับพาร์ทเนอร์ไว้ในที่เดียว</p></div></section>

        <section className="studio-how studio-wrap" id="how-it-works" aria-labelledby="studio-how-title"><div className="studio-section-label" data-reveal><span>03 / A SIMPLE START</span><Link href="/how-it-works">ดูวิธีใช้งาน <ArrowUpRight size={14}/></Link></div><div className="studio-how-heading" data-reveal><h2 id="studio-how-title">เริ่มง่าย ๆ<br/>แล้วไปต่อในแบบคุณ.</h2><p>ทุกอย่างที่คุณเลือก<br/>ติดตามต่อได้ในบัญชีเดียว</p></div><div className="studio-steps">{[['01', 'เปิดพื้นที่ของคุณ', 'สมัครสมาชิกหรือเข้าสู่ระบบ เพื่อบันทึกสิ่งที่ชอบและติดตามคำสั่งซื้อ', me.authenticated ? '/account' : '/signup'], ['02', 'ค้นพบสิ่งที่ใช่', 'เลือกเกมหรือซอร์สโค้ด อ่านรายละเอียด แพลตฟอร์ม และเงื่อนไขให้ครบ', '/shop'], ['03', 'พร้อมก้าวต่อไป', 'ดูสถานะคำสั่งซื้อ และเปิดข้อมูลส่งมอบเมื่อร้านยืนยันการชำระเงินแล้ว', '/orders']].map(([number, title, description, href]) => <Link href={href} key={number} data-reveal><span>{number}<ArrowUpRight size={18}/></span><h3>{title}</h3><p>{description}</p></Link>)}</div></section>

        <section className="partner-banner wrap studio-partner" id="partner" data-reveal><div><span className="eyebrow">GOOD THINGS GROW TOGETHER</span><h2>มีของดีในมือ?<br/>มาเติบโตไปด้วยกัน</h2><p>ส่งรายละเอียดร้านหรือผลงานของคุณ<br/>ให้ทีม kamucode รู้จัก และติดตามผลได้ในบัญชี</p><Link href="/partners" className="button button-dark">รู้จักโปรแกรมพาร์ทเนอร์ <ChevronRight size={17}/></Link></div><BrandReveal/></section>
        <section className="closing wrap studio-closing"><div data-reveal><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>ความเป็นไปได้ใหม่ ๆ<br/>ใกล้กว่าที่คิด<span className="blue">.</span></h2><Link href={me.authenticated ? '/shop' : '/signup'} className="studio-button">เริ่มก้าวถัดไปของคุณ <ArrowUpRight size={18}/></Link></div><div className="closing-word" aria-hidden="true">kamucode.</div></section>
    </div>;
}
