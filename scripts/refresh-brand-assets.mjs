import {readFile, writeFile} from 'node:fs/promises';
import {renderSymbolDefs, renderSymbolMarkup} from '../lib/brand-symbol.mjs';

const publicRoot = new URL('../public/', import.meta.url);
const root = new URL('assets/brand/', publicRoot);
const variants = {'mark.svg': 'color', 'mark-dark.svg': 'dark', 'logo.svg': 'color', 'logo-dark.svg': 'dark', 'logo-mono.svg': 'mono', 'logo-white.svg': 'white'};
for (const [name, mode] of Object.entries(variants)) {
    const file = new URL(name, root);
    const original = await readFile(file, 'utf8');
    const defsStart = original.indexOf('<defs>') + '<defs>'.length;
    const defsEnd = original.indexOf('</defs>', defsStart);
    if (defsStart < 6 || defsEnd < 0) throw new Error('Missing SVG definitions: ' + name);
    const preservedDefs = original.slice(defsStart, defsEnd).replace(/<!-- kamucode-symbol-defs:start -->[\s\S]*?<!-- kamucode-symbol-defs:end -->/g, '');
    const wordmarkStart = original.indexOf('<g transform="translate(158 8)">', defsEnd);
    const suffix = wordmarkStart >= 0 ? original.slice(wordmarkStart) : original.slice(original.indexOf('</svg>', defsEnd));
    const svg = original.slice(0, defsStart) + preservedDefs + '<!-- kamucode-symbol-defs:start -->' + renderSymbolDefs() + '<!-- kamucode-symbol-defs:end --></defs>' + renderSymbolMarkup(mode) + suffix;
    await writeFile(file, svg);
}

const mark = await readFile(new URL('mark.svg', root), 'utf8');
await writeFile(new URL('favicon.svg', publicRoot), mark.replace('</defs>', '</defs><style>@media(prefers-color-scheme:dark){.brand-symbol-surface{stroke:#b8e9ff;stroke-opacity:.3}}</style>'));

function boardLogo(svg, prefix, y) {
    const prefixed = svg.replace(/id="([^"]+)"/g, (_, id) => 'id="' + prefix + id + '"').replace(/url\(#([^)]+)\)/g, (_, id) => 'url(#' + prefix + id + ')');
    return prefixed.replace(/<svg[^>]+>/, '<svg x="120" y="' + y + '" width="1040" height="159" viewBox="0 0 840 128">');
}
const logo = await readFile(new URL('logo.svg', root), 'utf8');
const dark = await readFile(new URL('logo-dark.svg', root), 'utf8');
const board = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 860"><rect width="1280" height="430" fill="#fcfdff"/><rect y="430" width="1280" height="430" fill="#111b2b"/><g font-family="Arial,sans-serif" font-size="13" letter-spacing="3"><text x="75" y="65" fill="#8793a6">KAMUCODE / RIBBON STAR</text><text x="75" y="495" fill="#8392ae">PLAY. BUILD. GROW.</text></g>' + boardLogo(logo, 'light-', 145) + boardLogo(dark, 'dark-', 575) + '</svg>';
await writeFile(new URL('identity-preview.svg', root), board);
console.log('Refreshed six SVG variants, favicon and identity preview; wordmark paths retained.');
