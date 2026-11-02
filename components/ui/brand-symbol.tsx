"use client";

import {useId, type SVGProps} from 'react';
import {symbolLayers, symbolGradients, symbolGlowStops, symbolEdges} from '@/lib/brand-symbol.mjs';

export function BrandSymbol({className = '', ...props}: SVGProps<SVGSVGElement>) {
    const prefix = 'brand-' + useId().replace(/:/g, '') + '-';
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" className={className} role="img" aria-label="สัญลักษณ์ kamucode" {...props}>
        <defs>
            {symbolGradients.map(g => <linearGradient key={g.name} id={prefix + g.name} gradientUnits="userSpaceOnUse" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>{g.stops.map(s => <stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity}/>)}</linearGradient>)}
            <radialGradient id={prefix + 'glow'} gradientUnits="userSpaceOnUse" cx="64" cy="64" r="29">{symbolGlowStops.map(s => <stop key={s.offset} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity}/>)}</radialGradient>
        </defs>
        {symbolLayers.map(layer => <path key={layer.name} className={'brand-symbol-surface brand-symbol-' + layer.name} d={layer.d} fill={'url(#' + prefix + layer.paint + ')'} fillOpacity={layer.opacity} stroke="#3374d6" strokeOpacity=".16" strokeWidth=".65"/>)}
        {symbolEdges.map((d, index) => <path key={d} className={'brand-symbol-edge brand-symbol-edge-' + index} d={d} fill="none" stroke={'url(#' + prefix + 'edge)'} strokeWidth="1.2" strokeLinecap="round" pathLength="1"/>)}
    </svg>;
}
