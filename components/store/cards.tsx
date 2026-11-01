'use client';
import Link from '@/components/store/navigation-link';
import { Heart, ArrowUpRight } from 'lucide-react';
import type { Product } from '@/lib/commerce/types';
import { money } from '@/lib/commerce/types';
import { api, useStore } from './provider';
import { useState } from 'react';
export function ProductCard({ product: p, index = 0 }: {
    product: Product;
    index?: number;
}) { const { me, refresh } = useStore(), [error, setError] = useState(''), [busy, setBusy] = useState(false), saved = me.interests?.includes(p.id); return <article className="product-card" style={{ animationDelay: `${index * 45}ms` }}><Link href={'/product/' + p.id} className="product-image"><img src={p.image} alt={'ภาพประกอบ ' + p.name} width="640" height="480" loading="lazy"/><span className="product-kind">{p.kind === 'game' ? 'GAME' : 'SOURCE CODE'}</span><span className="card-arrow"><ArrowUpRight size={18}/></span></Link><div className="product-info"><div className="product-heading"><Link href={'/product/' + p.id}><h3>{p.name}</h3></Link><button className={'save-button' + (saved ? ' is-saved' : '')} aria-label={(saved ? 'นำออกจากรายการบันทึก ' : 'บันทึก ') + p.name} aria-pressed={!!saved} disabled={busy} onClick={async () => { if (!me.authenticated) {
    window.location.assign('/login?next=' + encodeURIComponent('/product/' + p.id));
    return;
} setBusy(true); try {
    await api('saved', { productId: p.id }, saved ? 'DELETE' : 'POST');
    await refresh();
}
catch (e) {
    setError((e as Error).message);
}
finally {
    setBusy(false);
} }}><Heart size={18} fill={saved ? 'currentColor' : 'none'}/></button></div><p>{p.tag}</p><div className="product-meta"><span>{p.demo ? 'คอลเลกชันตัวอย่าง' : p.stock ? 'พร้อมจำหน่าย' : 'สินค้าหมด'}</span><strong>{p.demo ? 'ดูแนวทาง' : money(p.priceCents)}</strong></div>{error && <span role="alert" className="error-text">{error}</span>}</div></article>; }
