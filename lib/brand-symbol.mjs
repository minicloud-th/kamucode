// Canonical native-vector geometry shared by the static brand assets and intro.
export const symbolLayers = [
    {name: 'back', paint: 'sail', opacity: 1, d: 'M61.5 10.5Q64 2.5 66.5 10.5C73 37 84 57 115 76Q121 80 114 81C84 82 73 96 67 116Q64 124 61.5 116C54 91 42 71 13 55Q6 51 14 50C41 52 55 36 61.5 10.5Z'},
    {name: 'front', paint: 'weft', opacity: .9, d: 'M14 50C43 53 72 43 102 28Q107 25 105 31C96 52 98 64 115 76Q122 81 114 81C86 79 58 90 31 104Q25 107 27 101C36 80 32 64 14 55Q7 50 14 50Z'},
    {name: 'glow', paint: 'glow', opacity: .85, d: 'M64 42C68 55 74 61 88 65C74 69 68 75 63 89C59 75 53 69 40 64C54 60 60 54 64 42Z'},
];

export const symbolGradients = [
    {name: 'sail', x1: 43, y1: 8, x2: 85, y2: 119, stops: [
        {offset: '0', color: '#29cbe7', opacity: 1},
        {offset: '.28', color: '#b6ffff', opacity: 1},
        {offset: '.57', color: '#3475ef', opacity: 1},
        {offset: '.82', color: '#2299f4', opacity: 1},
        {offset: '1', color: '#43e6df', opacity: 1},
    ]},
    {name: 'weft', x1: 18, y1: 43, x2: 104, y2: 94, stops: [
        {offset: '0', color: '#b4b8ff', opacity: 1},
        {offset: '.36', color: '#d5b8ff', opacity: 1},
        {offset: '.7', color: '#fc7dca', opacity: 1},
        {offset: '1', color: '#9a64ef', opacity: 1},
    ]},
    {name: 'edge', x1: 18, y1: 47, x2: 113, y2: 82, stops: [
        {offset: '0', color: '#dbffff', opacity: .35},
        {offset: '.45', color: '#ffffff', opacity: .95},
        {offset: '1', color: '#effaff', opacity: .7},
    ]},
];

export const symbolGlowStops = [
    {offset: '0', color: '#ffffff', opacity: .96},
    {offset: '.45', color: '#eeffff', opacity: .5},
    {offset: '1', color: '#ffffff', opacity: 0},
];

export const symbolEdges = [
    'M14 51C43 54 73 42 104 29',
    'M15 54C47 65 76 71 115 78',
    'M30 102C57 88 86 79 115 79',
    'M64 12C60 40 46 53 16 52',
];

export function renderSymbolDefs(prefix = 'brand-star-') {
    const stops = values => values.map(s => '<stop offset="' + s.offset + '" stop-color="' + s.color + '" stop-opacity="' + s.opacity + '"/>').join('');
    return symbolGradients.map(g => '<linearGradient id="' + prefix + g.name + '" gradientUnits="userSpaceOnUse" x1="' + g.x1 + '" y1="' + g.y1 + '" x2="' + g.x2 + '" y2="' + g.y2 + '">' + stops(g.stops) + '</linearGradient>').join('')
        + '<radialGradient id="' + prefix + 'glow" gradientUnits="userSpaceOnUse" cx="64" cy="64" r="29">' + stops(symbolGlowStops) + '</radialGradient>';
}

export function renderSymbolMarkup(mode = 'color', prefix = 'brand-star-') {
    const flat = mode === 'mono' || mode === 'white';
    const ink = mode === 'white' ? '#ffffff' : '#17191f';
    const layers = symbolLayers.filter(layer => !flat || layer.name !== 'glow').map(layer => '<path class="brand-symbol-surface brand-symbol-' + layer.name + '" d="' + layer.d + '" fill="' + (flat ? ink : 'url(#' + prefix + layer.paint + ')') + '" fill-opacity="' + (flat ? 1 : layer.opacity) + '"' + (flat ? '' : ' stroke="' + (mode === 'dark' ? '#b8e9ff' : '#3374d6') + '" stroke-opacity=".16" stroke-width=".65"') + '/>').join('');
    return '<g data-brand-symbol="ribbon-star">' + layers + (flat ? '' : symbolEdges.map(d => '<path class="brand-symbol-edge" d="' + d + '" fill="none" stroke="url(#' + prefix + 'edge)" stroke-width="1.2" stroke-linecap="round"/>').join('')) + '</g>';
}
