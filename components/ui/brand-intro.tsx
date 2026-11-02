"use client";

import {BrandSymbol} from './brand-symbol';

export function BrandIntro() {
    return <div className="ogh-brand-intro" aria-hidden="true">
        <div className="ogh-intro-mark"><BrandSymbol/></div>
        <img className="ogh-intro-wordmark" src="/assets/brand/wordmark.svg" width="180" height="30" alt=""/>
        <span className="ogh-intro-tagline">PLAY. BUILD. GROW.</span>
    </div>;
}
