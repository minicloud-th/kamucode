'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: {
    reset: () => void;
}) { return <section className="empty-state"><h1>โหลดหน้านี้ไม่สำเร็จ</h1><p>ลองอีกครั้ง หรือส่งรายละเอียดให้ทีมดูแล</p><button className="button button-dark" onClick={reset}>ลองอีกครั้ง</button><Link href="/support" className="text-link">ศูนย์ช่วยเหลือ ↗</Link></section>; }
