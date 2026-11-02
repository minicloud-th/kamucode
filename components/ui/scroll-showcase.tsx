'use client';

import {useRef} from 'react';
import {ArrowUpRight} from 'lucide-react';
import Link from '@/components/store/navigation-link';
import {HeroVideo} from '@/components/store/media';
import {useScrollPresentation} from '@/hooks/use-scroll-presentation';

export function ScrollShowcase({paused, reduced}: {paused: boolean; reduced: boolean}) {
    const sequence = useRef<HTMLElement>(null);
    const still = paused || reduced;
    useScrollPresentation(sequence, !still);

    return <section ref={sequence} className="kc-showcase-sequence" id="hero-film" aria-labelledby="kc-film-title" data-scene-ready="false" data-scene-motion="false" data-scene-disabled={still}>
        <div className="kc-showcase-stage">
            <div className="kc-showcase-heading"><p className="kc-section-caption">สิ่งที่ชอบ พาเราไปต่อได้</p><h2 id="kc-film-title">จากโลกที่คุณเล่น<br/>สู่สิ่งที่คุณสร้าง.</h2><p>เริ่มจากความสนใจ แล้วค้นพบความเป็นไปได้ถัดไปของคุณ</p></div>
            <div className="kc-showcase-frame" data-classic-dark>
                <HeroVideo paused={still}/>
                <div className="kc-showcase-shade"/>
                <div className="kc-showcase-overlay"><img src="/assets/brand/mark-dark.svg" alt="" width="42" height="42" loading="lazy"/><h3>ความสนใจเดียว<br/>ไปได้หลายทาง.</h3><p>เกมที่คุณชอบ และโปรเจกต์ที่คุณอยากลงมือทำ</p><Link href="/showcase">ดูภาพและวิดีโอ <ArrowUpRight size={16}/></Link></div>
            </div>
        </div>
    </section>;
}
