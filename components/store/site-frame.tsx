'use client';

import {usePathname} from 'next/navigation';
import type {ReactNode} from 'react';
import {SiteHeader} from './header';
import {SiteFooter} from './footer';

export function SiteFrame({children}: {children: ReactNode}) {
    const pathname = usePathname();
    const auth = pathname === '/login' || pathname === '/signup';
    return <><a href="#main" className="skip-link">ข้ามไปเนื้อหา</a>{!auth && <SiteHeader/>}<main id="main" className={auth ? 'auth-main' : undefined}>{children}</main>{!auth && <SiteFooter/>}</>;
}
