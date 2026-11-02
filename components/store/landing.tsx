'use client';

import {useEffect, useRef, useState} from 'react';
import Link from '@/components/store/navigation-link';
import {ArrowDown, ArrowRight, ArrowUpRight, Check, Code2, Gamepad2, PackageCheck, Plus, Users} from 'lucide-react';
import {PlaygroundHero} from '@/components/ui/playground-hero';
import {ScrollShowcase} from '@/components/ui/scroll-showcase';
import {useStore} from './provider';
import {money, type Product} from '@/lib/commerce/types';

type Filter = 'all' | 'game' | 'source';
const preferred = ['valorant', 'storefront', 'minecraft', 'dashboard', 'roblox', 'genshin'];
const gameArtwork = new Set(['valorant', 'minecraft', 'roblox', 'genshin']);
const codeArtwork = new Set(['storefront', 'dashboard', 'discord-bot', 'saas-starter']);

function coverFor(product: Product) {
    if (product.image === '/assets/catalog/' + product.id + '.svg') {
        if (product.kind === 'game' && gameArtwork.has(product.id)) return '/assets/landing/' + product.id + '.webp';
        if (product.kind === 'source' && codeArtwork.has(product.id)) return '/assets/code/' + product.id + '.svg';
    }
    return product.image;
}

const questions = [
    {question: 'ต้องเข้าสู่ระบบก่อนดูสินค้าหรือเปล่า?', answer: 'ดูคอลเลกชันตัวอย่างจากหน้านี้ได้เลย เมื่อต้องการเปิดร้านค้า ดูรายละเอียดสินค้า หรือจัดการคำสั่งซื้อ ระบบจะพาไปเข้าสู่ระบบก่อน'},
    {question: 'คอลเลกชันตัวอย่างซื้อได้ไหม?', answer: 'รายการที่ระบุว่า “ตัวอย่างคอลเลกชัน” ใช้แนะนำหมวดสินค้า ยังสั่งซื้อไม่ได้ สินค้าที่เปิดขายจะแสดงราคา สถานะ และรายละเอียดให้ตรวจสอบก่อนสั่งซื้อ'},
    {question: 'หลังสั่งซื้อ จะรับสินค้าได้ที่ไหน?', answer: 'ติดตามสถานะได้ในหน้าคำสั่งซื้อ เมื่อร้านยืนยันการชำระเงินแล้ว ข้อมูลส่งมอบจะเปิดให้ดูในบัญชีของผู้ซื้อ สำหรับซอร์สโค้ดให้ตรวจสอบรูปแบบไฟล์และสิทธิ์ใช้งานของแต่ละรายการด้วย'},
    {question: 'มีผลงานหรือสินค้า อยากร่วมงานด้วยทำอย่างไร?', answer: 'เปิดหน้าโปรแกรมพาร์ทเนอร์เพื่ออ่านรายละเอียด แล้วส่งข้อมูลร้านหรือผลงานผ่านแบบฟอร์ม คุณติดตามสถานะการพิจารณาได้จากบัญชีของตัวเอง'},
];

export function Landing() {
    const {products, me} = useStore();
    const collectionTitle = useRef<HTMLHeadingElement>(null);
    const [filter, setFilter] = useState<Filter>('all');
    const [paused, setPaused] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [sourceId, setSourceId] = useState('storefront');
    const published = products.filter(product => product.published);
    const ordered = [...published].sort((a, b) => {
        const first = preferred.indexOf(a.id), second = preferred.indexOf(b.id);
        return (first < 0 ? preferred.length : first) - (second < 0 ? preferred.length : second);
    });
    const featured = ordered.slice(0, 6);
    const displayed = featured.filter(product => filter === 'all' || product.kind === filter);
    const sources = published.filter(product => product.kind === 'source').slice(0, 4);
    const source = sources.find(product => product.id === sourceId) ?? sources[0];
    const still = paused || reduced;

    useEffect(() => {
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        const sync = () => setReduced(media.matches);
        sync();
        media.addEventListener('change', sync);
        return () => media.removeEventListener('change', sync);
    }, []);

    function explore() {
        collectionTitle.current?.focus({preventScroll: true});
        document.getElementById('collections')?.scrollIntoView({behavior: still ? 'instant' : 'smooth'});
    }

    return <div className="kc-landing" data-motion-paused={still}>
        <PlaygroundHero tiles={ordered.slice(0, 8).map(product => ({src: coverFor(product), label: product.name, kind: product.kind, href: '/product/' + product.id, demo: product.demo === true}))} authenticated={me.authenticated} paused={paused} reduced={reduced} onToggleMotion={() => setPaused(value => !value)} onExplore={explore}/>

        <nav className="kc-paths kc-container" aria-label="เลือกพื้นที่ของคุณ">
            <Link href="/games"><Gamepad2 size={23}/><span><strong>เลือกโลกที่อยากเล่น</strong><small>คอลเลกชันไอดีเกม</small></span><ArrowUpRight size={18}/></Link>
            <Link href="/source-code"><Code2 size={23}/><span><strong>ลงมือสร้างสิ่งถัดไป</strong><small>ซอร์สโค้ดสำหรับต่อยอด</small></span><ArrowUpRight size={18}/></Link>
            <Link href="/partners"><Users size={23}/><span><strong>พาของดีมาเจอกัน</strong><small>โปรแกรมพาร์ทเนอร์</small></span><ArrowUpRight size={18}/></Link>
        </nav>

        <section className="kc-collection kc-container kc-section" id="collections" aria-labelledby="kc-collection-title">
            <div className="kc-section-heading"><div><p className="kc-section-caption">คอลเลกชันของ kamucode</p><h2 id="kc-collection-title" ref={collectionTitle} tabIndex={-1}>เจอสิ่งที่ใช่<br/>แล้วไปให้สุด.</h2></div><div className="kc-collection-tools"><p>เลือกดูเกมที่ชอบ หรือโค้ดที่อยากต่อยอด<br/>แต่ละรายการมีรายละเอียดให้คุณทำความรู้จัก</p><div className="kc-filters" role="group" aria-label="กรองคอลเลกชัน">{([['all', 'ทั้งหมด'], ['game', 'ไอดีเกม'], ['source', 'ซอร์สโค้ด']] as const).map(([key, label]) => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div></div></div>
            <p className="kc-result-count" role="status" aria-live="polite">{displayed.length} คอลเลกชัน{filter === 'game' ? 'ไอดีเกม' : filter === 'source' ? 'ซอร์สโค้ด' : 'ที่คัดมาให้คุณ'}</p>
            <div className="kc-product-grid">{displayed.map(product => <article className={'kc-product kc-product-' + product.kind} key={product.id}>
                <Link href={'/product/' + product.id} aria-label={'ดูรายละเอียด ' + product.name}>
                    <div className="kc-product-cover"><img src={coverFor(product)} alt={product.name} width="1000" height="750" loading="lazy" decoding="async"/><span className="kc-product-category">{product.kind === 'game' ? <Gamepad2 size={14}/> : <Code2 size={14}/>} {product.kind === 'game' ? 'ไอดีเกม' : 'ซอร์สโค้ด'}</span><span className="kc-product-open"><ArrowUpRight size={20}/></span></div>
                    <div className="kc-product-info"><div><h3>{product.name}</h3><p>{product.tag}</p></div><span>{product.demo ? 'ตัวอย่างคอลเลกชัน' : money(product.priceCents)}</span></div>
                </Link>
            </article>)}</div>
            {displayed.length === 0 && <div className="kc-empty"><PackageCheck size={32}/><h3>ยังไม่มีคอลเลกชันในหมวดนี้</h3><p>ลองเลือกหมวดอื่น หรือกลับมาดูรายการใหม่ได้ภายหลัง</p><button type="button" onClick={() => setFilter('all')}>ดูทั้งหมด</button></div>}
            <div className="kc-collection-bottom"><p>ภาพประกอบคอลเลกชัน อ่านรายละเอียดและเงื่อนไขของสินค้าก่อนสั่งซื้อ</p><Link className="kc-text-link" href="/shop">เปิดร้านค้า <ArrowRight size={17}/></Link></div>
        </section>

        {source && <section className="kc-source kc-section kc-container" aria-labelledby="kc-source-title"><div className="kc-source-copy"><p className="kc-section-caption">สำหรับคนชอบสร้าง</p><h2 id="kc-source-title">ไม่ต้องเริ่ม<br/>จากหน้าว่าง.</h2><p>ดูแนวทางซอร์สโค้ดที่คุณสนใจ<br/>เลือกพื้นฐาน แล้วพัฒนาให้เป็นงานของคุณ</p><ul><li><Check size={17}/>ดูเทคโนโลยีและขอบเขตของแต่ละชุด</li><li><Check size={17}/>อ่านรายละเอียดไฟล์และสิทธิ์ใช้งาน</li><li><Check size={17}/>ติดตามข้อมูลส่งมอบในบัญชีของคุณ</li></ul><Link className="kc-text-link" href="/source-code">สำรวจซอร์สโค้ด <ArrowRight size={17}/></Link></div><div className="kc-source-demo"><div className="kc-source-choices" role="group" aria-label="เลือกตัวอย่างซอร์สโค้ด">{sources.map(product => <button type="button" key={product.id} aria-pressed={source.id === product.id} onClick={() => setSourceId(product.id)}>{product.name}</button>)}</div><div className="kc-preview-browser" role="region" aria-label={'ภาพตัวอย่าง ' + source.name}><div className="kc-preview-toolbar" aria-hidden="true"><span/><span/><span/><p>{source.name}</p><Code2 size={14}/></div><div className="kc-preview-art"><img src={coverFor(source)} alt={'ภาพประกอบ ' + source.name} width="1000" height="750" loading="lazy" decoding="async"/></div></div><div className="kc-preview-info"><div aria-live="polite"><h3>{source.name}</h3><p>{source.tag} / {source.demo ? 'ภาพตัวอย่างคอลเลกชัน' : 'อ่านรายละเอียดสินค้า'}</p></div><Link href={'/product/' + source.id} className="kc-round-link" aria-label={'ดูรายละเอียด ' + source.name}><ArrowUpRight size={20}/></Link></div></div></section>}

        <ScrollShowcase paused={paused} reduced={reduced}/>

        <section className="kc-how kc-section" id="how-it-works" aria-labelledby="kc-how-title"><div className="kc-container"><div className="kc-section-heading"><div><p className="kc-section-caption">จากการเลือก ถึงการเริ่มต้น</p><h2 id="kc-how-title">ทุกขั้นตอน<br/>อยู่ในบัญชีของคุณ.</h2></div><Link href="/how-it-works" className="kc-text-link">อ่านวิธีใช้งาน <ArrowUpRight size={17}/></Link></div><ol className="kc-steps">{[
                {title: 'เปิดพื้นที่ของคุณ', description: 'เข้าสู่ระบบหรือสร้างบัญชี เพื่อบันทึกสิ่งที่สนใจและติดตามคำสั่งซื้อ', href: me.authenticated ? '/account' : '/login', action: me.authenticated ? 'ไปที่บัญชี' : 'เข้าสู่ระบบ'},
                {title: 'เลือกให้ตรงใจ', description: 'อ่านรายละเอียด แพลตฟอร์ม ราคา และเงื่อนไขของรายการที่เปิดขายก่อนสั่งซื้อ', href: '/shop', action: 'สำรวจร้านค้า'},
                {title: 'ติดตาม แล้วเริ่มได้เลย', description: 'ดูสถานะคำสั่งซื้อ และเปิดข้อมูลส่งมอบเมื่อร้านยืนยันการชำระเงินแล้ว', href: '/orders', action: 'ดูคำสั่งซื้อ'},
            ].map((step, index) => <li key={step.title}><span className="kc-step-number">0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p><Link href={step.href}>{step.action}<ArrowRight size={16}/></Link></li>)}</ol></div></section>

        <section className="kc-partner kc-container" id="partner" aria-labelledby="kc-partner-title"><div className="kc-partner-copy"><p className="kc-section-caption">เติบโตไปด้วยกัน</p><h2 id="kc-partner-title">มีของดีในมือ?<br/>ให้คนอื่นได้ค้นพบ.</h2><p>มีร้าน มีสินค้า หรือมีผลงานที่อยากแบ่งปัน<br/>ส่งเรื่องราวของคุณให้เรารู้จัก<br/>แล้วเริ่มก้าวถัดไปไปด้วยกัน</p><Link className="kc-button kc-button-dark" href="/partners">รู้จักโปรแกรมพาร์ทเนอร์ <ArrowUpRight size={17}/></Link></div><div className="kc-partner-art" aria-hidden="true"><span className="kc-partner-orbit"/><img src="/assets/brand/mark.svg" alt="" width="360" height="360" loading="lazy"/><div className="kc-partner-note"><Users size={18}/><span>พื้นที่สำหรับ<br/><strong>ความเป็นไปได้ใหม่ ๆ</strong></span></div></div></section>

        <section className="kc-faq kc-container kc-section" aria-labelledby="kc-faq-title"><div><p className="kc-section-caption">ก่อนเริ่มต้น</p><h2 id="kc-faq-title">สงสัยตรงไหน<br/>เราช่วยได้.</h2><p>อ่านคำตอบที่พบบ่อย<br/>หรือติดต่อทีมดูแลได้โดยตรง</p><Link className="kc-text-link" href="/support">ศูนย์ช่วยเหลือ <ArrowUpRight size={17}/></Link></div><div className="kc-questions">{questions.map(item => <details key={item.question} name="landing-questions"><summary>{item.question}<Plus size={20}/></summary><p>{item.answer}</p></details>)}<Link href="/faq" className="kc-all-questions">ดูคำถามทั้งหมด <ArrowRight size={16}/></Link></div></section>

        <section className="kc-closing" aria-labelledby="kc-closing-title"><div className="kc-container"><div className="kc-closing-top"><h2 id="kc-closing-title">สิ่งที่คุณชอบ<br/>เริ่มได้ที่นี่.</h2><div><Link className="kc-button kc-button-light" href={me.authenticated ? '/shop' : '/login'}>{me.authenticated ? 'เข้าสู่ร้านค้า' : 'เข้าสู่ระบบเพื่อเริ่มต้น'}<ArrowUpRight size={18}/></Link>{!me.authenticated && <p>ยังไม่มีบัญชี? <Link href="/signup">สร้างบัญชีของคุณ</Link></p>}</div></div><img className="kc-closing-wordmark" src="/assets/brand/wordmark-dark.svg" alt="kamucode" width="1100" height="168" loading="lazy"/><div className="kc-closing-bottom"><span>พื้นที่สำหรับคนชอบเล่นและคนชอบสร้าง</span><a href="#main" aria-label="กลับขึ้นด้านบน">กลับขึ้นด้านบน <ArrowDown size={16}/></a></div></div></section>
    </div>;
}
