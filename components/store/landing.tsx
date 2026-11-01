'use client';
import Link from '@/components/store/navigation-link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight, ChevronRight } from 'lucide-react';
import { HeroVideo, BrandReveal } from './media';
import { useStore } from './provider';
import type { Product } from '@/lib/commerce/types';
const positions = [
    ['valorant', -1.7857, 9.1913, 195, 243, 3.05], ['roblox', 76.3955, -8.4724, 193, 240, 4],
    ['minecraft', 8.4722, -6.932, 193, 240, 4], ['genshin', 13.0423, 27.1759, 203, 252, -2],
    ['storefront', -.7209, 44.4929, 238, 297, 4], ['dashboard', 5.3373, 67.4711, 258, 322, 3.05],
    ['discord-bot', 76.3492, 77.8177, 214, 266, 3.81], ['saas-starter', 86.3161, 6.4185, 193, 240, 4],
    ['valorant', 89.0807, 65.1476, 190, 235, -4], ['roblox', 84.1931, 34.018, 230, 287, -5.18],
] as const;
const collectionTitles = ['VALORANT', 'Roblox', 'Minecraft', 'Genshin Impact', 'Source Code', 'Developer Tools'];
const imageFor = (p: Product) => p.kind === 'game' && ['valorant', 'roblox', 'minecraft', 'genshin'].includes(p.id) ? '/assets/landing/' + p.id + '.webp' : p.image.startsWith('/assets/catalog/') ? '/assets/code/' + p.id + '.svg' : p.image;
function OrbitCard({ item, style, className = '', index = 0 }: {
    item: Product;
    style?: CSSProperties;
    className?: string;
    index?: number;
}) {
    return <Link prefetch={false} className={'classic-orbit-card ' + className} href={'/product/' + item.id} style={style} aria-label={item.name} tabIndex={index < 8 ? 0 : -1}><span className="classic-card-cover"><img src={imageFor(item)} alt="" width="302" height="227" draggable={false}/></span><span className="classic-card-body"><span className="classic-card-avatar"><img src="/assets/brand/mark-dark.svg" width="34" height="34" alt=""/></span><strong>{item.name}</strong><small>{item.kind === 'game' ? 'GAME ID' : 'SOURCE CODE'} · {item.tag}</small></span></Link>;
}
export function Landing() {
    const { products, me } = useStore(), root = useRef<HTMLDivElement>(null), hero = useRef<HTMLElement>(null), track = useRef<HTMLDivElement>(null), [active, setActive] = useState(0), locked = useRef(false), tabs = useRef<(HTMLButtonElement | null)[]>([]);
    const items = ['valorant', 'roblox', 'minecraft', 'genshin', 'storefront', 'dashboard'].map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p), item = items[active] || items[0];
    useEffect(() => {
        const motion = matchMedia('(prefers-reduced-motion: reduce)');
        let raf = 0;
        const update = () => {
            raf = 0;
            const h = hero.current, t = track.current;
            if (!h)
                return;
            const progress = motion.matches ? 0 : Math.max(0, Math.min(1, window.scrollY / (innerHeight * .95)));
            h.style.setProperty('--classic-exit', String(progress));
            if (t && innerWidth > 860 && !motion.matches && !locked.current) {
                const r = t.getBoundingClientRect(), length = t.offsetHeight - innerHeight, position = Math.max(0, Math.min(1, (110 - r.top) / Math.max(1, length)));
                setActive(Math.min(5, Math.floor(position * 6)));
            }
        };
        const queue = () => { if (!raf)
            raf = requestAnimationFrame(update); };
        const unlock = () => { locked.current = false; };
        addEventListener('scroll', queue, { passive: true });
        addEventListener('resize', queue, { passive: true });
        addEventListener('wheel', unlock, { passive: true });
        addEventListener('touchmove', unlock, { passive: true });
        motion.addEventListener('change', queue);
        update();
        return () => { cancelAnimationFrame(raf); removeEventListener('scroll', queue); removeEventListener('resize', queue); removeEventListener('wheel', unlock); removeEventListener('touchmove', unlock); motion.removeEventListener('change', queue); };
    }, []);
    const enter = me.authenticated ? '/shop' : '/login';
    return <div className="classic-landing" ref={root}>
 <section className="classic-hero-track" aria-labelledby="classic-heading"><section className="classic-hero" ref={hero}><div className="classic-hero-kicker"><span>01 / KAMUCODE</span><span>PLAY. BUILD. GROW.</span></div><div className="classic-hero-ruler" aria-hidden="true"><span>00</span><i /><i /><span>05</span><i /><i /><span>10</span></div>
  <div className="classic-orbit" aria-label="สินค้าเด่นจาก kamucode"><div className="classic-orbit-stage">{positions.map(([id, x, y, w, h, rotation], i) => { const p = products.find(p => p.id === id); if (!p)
        return null; const angle = i / positions.length * Math.PI * 2 - Math.PI * .5; return <OrbitCard key={id + i} item={p} index={i} style={{ left: x + '%', top: y + '%', width: w, height: h, '--card-rotation': rotation + 'deg', '--card-delay': i * 28 + 'ms', '--card-start-x': 756 + Math.cos(angle) * 210 - x / 100 * 1512 - w / 2 + 'px', '--card-start-y': 389.5 + Math.sin(angle) * 151 - y / 100 * 779 - h / 2 + 'px', '--card-scatter-x': x < 50 ? '-48vw' : '48vw', '--card-scatter-y': y < 20 ? '-22vh' : y > 60 ? '32vh' : '10vh' } as CSSProperties}/>; })}</div></div>
  <div className="classic-mobile-deck" aria-hidden="true">{['minecraft', 'genshin', 'saas-starter', 'dashboard'].map((id, i) => { const p = products.find(p => p.id === id); return p ? <OrbitCard key={id} item={p} index={99} className={'classic-mobile-card card-' + i}/> : null; })}</div>
  <div className="classic-hero-copy"><div className="classic-hero-intro"><h1 id="classic-heading"><span>เล่นให้สุด สร้างให้ไกล</span><span className="classic-hero-title">เริ่มที่ <img src="/assets/brand/wordmark.svg" width="674" height="112" alt="kamucode"/></span></h1><p>ไอดีเกม ซอร์สโค้ด และโอกาสเติบโตของพาร์ทเนอร์ รวมไว้ในที่เดียว</p><div className="classic-pillars">{[['play.', 'ไอดีเกม'], ['build.', 'ซอร์สโค้ด'], ['grow.', 'พาร์ทเนอร์']].map(([title, description]) => <div key={title}><strong>{title}</strong><span>{description}</span></div>)}</div><Link prefetch={false} href={enter} className="classic-hero-cta"><span>{me.authenticated ? 'เข้าหน้าหลัก' : 'เข้าสู่ระบบ'}</span></Link></div></div>
  <button className="classic-scroll-cue" onClick={() => document.getElementById('hero-film')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })}><span>เลื่อนสำรวจ</span><ArrowDown size={18}/></button>
 </section></section>
 <section id="hero-film" className="classic-film-section wrap" aria-label="ภาพและวิดีโอของ kamucode"><div className="classic-film-heading"><span>02 / A NEW SPACE TO PLAY & BUILD</span><Link prefetch={false} href="/showcase">ภาพและวิดีโอ <ArrowUpRight size={14}/></Link></div><div className="cinema-inner" data-classic-dark><HeroVideo /><div className="cinema-copy"><span className="eyebrow">KAMUCODE ORIGINAL VISUAL</span><h2>ทุกสิ่งที่ชอบ<br />เริ่มต่อได้ที่นี่</h2><p>จากเกมโปรด สู่โปรเจกต์ถัดไปของคุณ</p><Link prefetch={false} className="button button-white" href="/collections">ค้นพบคอลเลกชัน <ArrowUpRight size={17}/></Link></div><span className="cinema-caption">PLAY. BUILD. GROW. — MOTION 01</span></div><div className="classic-film-foot"><span>GAMES / CODE / POSSIBILITIES</span><span>SCROLL TO DISCOVER ↓</span></div></section>
 <section className="kc-collections" id="collections"><div className="kc-section-intro"><span className="kc-eyebrow">CURATED FOR YOUR NEXT MOVE</span><h2>อยากเล่น หรืออยากสร้าง<br />เลือกโลกที่เป็นคุณ<span>.</span></h2><p>ไอดีเกมสำหรับการเริ่มต้นครั้งใหม่ และซอร์สโค้ดสำหรับไอเดียถัดไป</p></div><div className="kc-collection-track" ref={track}><div className="kc-collection-pin"><div className="kc-category-rail" role="tablist" aria-label="คอลเลกชัน" onFocusCapture={() => { locked.current = true; }}>{items.map((p, i) => <button key={p.id} ref={el => { tabs.current[i] = el; }} id={'collection-tab-' + i} type="button" role="tab" aria-selected={i === active} aria-controls="collection-panel" tabIndex={i === active ? 0 : -1} onClick={() => { locked.current = true; setActive(i); }} onKeyDown={e => { const delta = ['ArrowRight', 'ArrowDown'].includes(e.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(e.key) ? -1 : 0; const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : delta ? (i + delta + items.length) % items.length : -1; if (next >= 0) {
        e.preventDefault();
        locked.current = true;
        setActive(next);
        tabs.current[next]?.focus();
    } }}><small>{String(i + 1).padStart(2, '0')}</small><span>{collectionTitles[i]}</span></button>)}</div>{item && <article className="kc-collection-panel" id="collection-panel" role="tabpanel" aria-labelledby={'collection-tab-' + active} tabIndex={0}><div className="kc-collection-inner" key={item.id}><div className="kc-collection-visual"><img src={imageFor(item)} alt={item.name} width="1280" height="720" loading="lazy"/><span>{item.kind === 'game' ? 'PLAY YOUR NEXT CHAPTER' : 'BUILD SOMETHING YOURS'}</span><h3>{collectionTitles[active]}</h3></div><div className="kc-collection-content"><div><small>{item.tag}</small><p>{item.description}</p></div><Link prefetch={false} className="kc-round-link" href={'/product/' + item.id} aria-label={'ดูรายละเอียด ' + item.name}><ArrowUpRight size={21}/></Link></div><div className="kc-collection-meta"><span>{item.demo ? 'คอลเลกชันตัวอย่าง' : 'ดูรายละเอียดและสถานะสินค้า'}</span><span>kamucode · {item.kind === 'game' ? 'play.' : 'build.'}</span></div></div></article>}</div></div></section>
 <section className="kc-principles"><span className="kc-eyebrow">LESS FRICTION. MORE POSSIBILITIES.</span><div className="kc-principle-grid">{[['01 / DISCOVER', 'หาเจอสิ่งที่ใช่', 'สำรวจเกมที่ชอบหรือเทคโนโลยีที่อยากใช้ เริ่มจากความสนใจของคุณ'], ['02 / KNOW', 'ดูรายละเอียดให้ครบ', 'ข้อมูลบัญชี สิทธิ์การใช้งาน และเงื่อนไข อยู่ในรายละเอียดของสินค้าแต่ละรายการ'], ['03 / GROW', 'พร้อมไปต่อด้วยกัน', 'ซื้อเพื่อเริ่มต้น หรือร่วมขายในฐานะพาร์ทเนอร์ เลือกเส้นทางที่เหมาะกับคุณ']].map(([n, title, desc]) => <div key={n}><span>{n}</span><h3>{title}</h3><p>{desc}</p></div>)}</div></section>
 <section className="partner-banner wrap"><div><span className="eyebrow">GOOD THINGS GROW TOGETHER</span><h2>มีของดีในมือ?<br />มาเติบโตไปด้วยกัน</h2><p>ส่งรายละเอียดร้านหรือผลงานของคุณ<br />ให้ทีม kamucode รู้จัก และติดตามผลได้ในบัญชี</p><Link prefetch={false} href="/partners" className="button button-dark">รู้จักโปรแกรมพาร์ทเนอร์ <ChevronRight size={17}/></Link></div><BrandReveal /></section><section className="closing wrap"><span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h2>ความเป็นไปได้ใหม่ ๆ<br />ใกล้กว่าที่คิด<span className="blue">.</span></h2><Link prefetch={false} href="/shop" className="text-link">เริ่มสำรวจเลย <ArrowUpRight size={20}/></Link><div className="closing-word" aria-hidden>kamucode.</div></section>
 </div>;
}
