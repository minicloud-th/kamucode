"""Kamucode's vector identity. Letterforms are drawn paths, not a font dependency."""
from pathlib import Path

UPPER='M20 18Q17 14 23 18C50 39 65 46 83 37L119 8L63 72L18 112C34 87 39 73 34 57C31 43 25 30 20 18Z'
LOWER='M111 30Q116 25 113 32C96 59 94 76 110 98Q116 107 109 103C81 85 64 81 39 97L8 120Z'

def symbol(upper='#17191f',lower='url(#ribbon)'):
 return f'<path class="brand-ink" d="{UPPER}" fill="{upper}"/><path d="{LOWER}" fill="{lower}"/>'

def word_path():
 # Compiled into a single path so the gradient crosses the whole word once.
 from fontTools.pens.svgPathPen import SVGPathPen
 from fontTools.pens.transformPen import TransformPen
 from fontTools.svgLib.path import parse_path
 glyphs=[
  (0,'M11 12V89M61 33L13 68M31 54L65 89'),
  (82,'M60 60A29 29 0 1 0 2 60A29 29 0 1 0 60 60M60 60V89'),
  (162,'M8 88V53C8 20 48 20 48 53V88M48 53C48 20 88 20 88 53V88'),
  (271,'M8 34V66C8 98 62 98 62 66V34'),
  (354,'M58 40C43 20 9 23 9 61C9 95 40 103 59 83'),
  (435,'M60 60A29 29 0 1 0 2 60A29 29 0 1 0 60 60'),
  (516,'M60 60A29 29 0 1 0 2 60A29 29 0 1 0 60 60M60 60V12'),
  (597,'M58 82C42 104 7 94 7 61C7 22 64 22 64 60H8'),
 ]
 pen=SVGPathPen(None)
 for x,d in glyphs:parse_path(d,TransformPen(pen,(1,0,0,1,x,0)))
 return pen.getCommands()

def definitions(dark=False):
 first,middle,last=('#8990ff','#43b9ff','#2af2d7') if dark else ('#2842e8','#3187fa','#00d7d7')
 return f'<defs><linearGradient id="ribbon" x1="12" y1="120" x2="112" y2="30" gradientUnits="userSpaceOnUse"><stop stop-color="#6754f6"/><stop offset=".48" stop-color="#318aff"/><stop offset="1" stop-color="#00e2d5"/></linearGradient><linearGradient id="word" x1="0" y1="60" x2="674" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="{first}"/><stop offset=".55" stop-color="{middle}"/><stop offset="1" stop-color="{last}"/></linearGradient></defs>'

def letters(path,color='url(#word)'):
 return f'<path d="{path}" fill="none" stroke="{color}" stroke-width="17.5" stroke-linecap="round" stroke-linejoin="round"/>'

def svg(viewbox,content,dark=False):
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+viewbox+'"><title>kamucode</title>'+definitions(dark)+content+'</svg>'

def build_assets(directory:Path,public:Path):
 directory.mkdir(parents=True,exist_ok=True);path=word_path()
 for dark in [False,True]:
  suffix='-dark' if dark else '';ink='#fff' if dark else '#17191f'
  (directory/f'mark{suffix}.svg').write_text(svg('0 0 128 128',symbol(ink),dark))
  (directory/f'wordmark{suffix}.svg').write_text(svg('0 0 674 112',letters(path),dark))
  lockup=symbol(ink)+f'<g transform="translate(158 8)">{letters(path)}</g>'
  (directory/f'logo{suffix}.svg').write_text(svg('0 0 840 128',lockup,dark))
 for name,color in [('logo-mono','#17191f'),('logo-white','#fff')]:
  (directory/f'{name}.svg').write_text(svg('0 0 840 128',symbol(color,color)+f'<g transform="translate(158 8)">{letters(path,color)}</g>'))
 (public/'favicon.svg').write_text(svg('0 0 128 128','<style>@media(prefers-color-scheme:dark){.brand-ink{fill:white}}</style>'+symbol()))
 # A separate presentation sheet; all source logo files retain transparency.
 light=symbol()+f'<g transform="translate(158 8)">{letters(path)}</g>'
 dark=symbol('#fff')+f'<g transform="translate(158 8)">{letters(path)}</g>'
 board='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 860">'+definitions()+'<rect width="1280" height="430" fill="#fcfdff"/><rect y="430" width="1280" height="430" fill="#101216"/><text x="75" y="65" font-family="Arial,sans-serif" font-size="13" letter-spacing="3" fill="#a2a8b1">KAMUCODE / BRAND IDENTITY</text><g transform="translate(120 145) scale(1.24)">'+light+'</g><svg x="120" y="575" width="1042" height="159" viewBox="0 0 840 128">'+definitions(True).replace('id="word"','id="word-dark"').replace('id="ribbon"','id="ribbon-dark"')+dark.replace('url(#word)','url(#word-dark)').replace('url(#ribbon)','url(#ribbon-dark)')+'</svg></svg>'
 (directory/'identity-preview.svg').write_text(board)

def package_brand_kit(directory:Path,public:Path):
 from zipfile import ZipFile,ZipInfo,ZIP_DEFLATED
 names=['logo','logo-dark','mark','mark-dark','wordmark','wordmark-dark','logo-mono','logo-white']
 usage='kamucode\n\nAll logo artwork has a transparent background.\nlogo: for light backgrounds\nlogo-dark: for dark backgrounds\nmark: standalone symbol\nwordmark: lettering only\nlogo-mono / logo-white: single-color versions\nSVG: scalable vector paths, no font installation required\nPNG: transparent exports, 2520 px wide; symbols 1024 px\n'
 files={f'{name}.{ext}':(directory/f'{name}.{ext}').read_bytes() for name in names for ext in ['svg','png']}
 files['favicon.svg']=(public/'favicon.svg').read_bytes();files['README.txt']=usage.encode()
 with ZipFile(directory/'kamucode-brand-kit.zip','w',compression=ZIP_DEFLATED) as archive:
  for name,data in files.items():
   info=ZipInfo(name,(2026,10,31,0,0,0));info.compress_type=ZIP_DEFLATED;info.external_attr=0o644<<16;archive.writestr(info,data)

if __name__=='__main__':
 import sys
 root=Path(__file__).resolve().parents[1]
 if '--zip' in sys.argv:package_brand_kit(root/'public/assets/brand',root/'public')
 else:build_assets(root/'public/assets/brand',root/'public')
