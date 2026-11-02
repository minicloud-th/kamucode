'use client';

import {ArrowUpRight} from 'lucide-react';
import Link from '@/components/store/navigation-link';
import {HeroVideo} from '@/components/store/media';

export function ScrollShowcase({paused, reduced}: {paused: boolean; reduced: boolean}) {
    return <section className="kc-film kc-container" id="hero-film" aria-labelledby="kc-film-title">
        <div className="kc-section-heading kc-film-heading"><h2 id="kc-film-title">สิ่งที่ชอบ<br/>พาเราไปต่อได้.</h2><p>จากโลกที่คุณเล่น สู่สิ่งที่คุณสร้าง<br/>นี่คือพื้นที่สำหรับความเป็นไปได้ใหม่ ๆ</p></div>
        <div className="kc-film-frame" data-classic-dark>
            <HeroVideo paused={paused || reduced}/>
            <div className="kc-film-shade"/>
            <div className="kc-film-copy"><img src="/assets/brand/mark-dark.svg" alt="" width="48" height="48"/><h3>จุดเริ่มต้นเล็ก ๆ<br/>ไปได้อีกไกล.</h3><Link href="/showcase" className="kc-button kc-button-light">ดูภาพและวิดีโอ <ArrowUpRight size={18}/></Link></div>
        </div>
    </section>;
}
