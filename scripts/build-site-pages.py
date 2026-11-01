"""Build kamucode's branded pages and vector assets; no customer data is embedded."""
from pathlib import Path
from html import escape as e
from lxml import html
import json,base64
R=Path(__file__).resolve().parents[1];P=R/'public';A=P/'assets/brand';A.mkdir(parents=True,exist_ok=True)
from brand_assets import build_assets,symbol,word_path,letters,definitions
build_assets(A,P)
MARK='<img class="km-symbol" src="/assets/brand/mark.svg" alt="" width="128" height="128">'
BRAND='<img class="km-lockup" src="/assets/brand/logo.svg" alt="kamucode" width="840" height="128">'
CLASSIC_BRAND='<img class="kc-lockup kc-lockup-light" src="/assets/brand/logo.svg" alt="kamucode" width="840" height="128"><img class="kc-lockup kc-lockup-dark" src="/assets/brand/logo-dark.svg" alt="" aria-hidden="true" width="840" height="128">'
def replace_brand(node,dark=False):
 for child in list(node):node.remove(child)
 node.text=None
 content='<img class="kc-lockup" src="/assets/brand/logo-dark.svg" alt="kamucode" width="840" height="128">' if dark else CLASSIC_BRAND
 for part in html.fragments_fromstring(content):node.append(part)
paths={
'grid':'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
'game':'<path d="M6 7h12c3 0 4 10 3 11s-4-2-5-3H8c-1 1-4 4-5 3S3 7 6 7Z"/><path d="M6 10v4m-2-2h4m8-1h.01m3 2h.01"/>',
'code':'<path d="m8 8-5 4 5 4m8-8 5 4-5 4m-3-11-2 14"/>',
'bookmark':'<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
'bag':'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
'partner':'<path d="m3 10 5-5 4 2 4-2 5 5-6 9-4-2-3 1-5-8Z"/><path d="m8 5 4 2-4 5 3 2 4-4 6 3M11 17l-4-4"/>',
'shield':'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
'help':'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3h.01"/>',
'search':'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
'arrow':'<path d="M5 12h14m-5-5 5 5-5 5"/>',
'external':'<path d="M6 18 18 6M6 6h12v12"/>',
'lock':'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
'check':'<path d="m5 12 4 4L19 6"/>',
'eye':'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
'mail':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
'download':'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
}
def icon(name):return '<svg class="km-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths.get(name,paths['grid'])+'</svg>'
# An original banner composition, made from the shop's retrieved game artwork.
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="620" viewBox="0 0 1500 620"><defs><clipPath id="a"><rect width="340" height="440" rx="14"/></clipPath><pattern id="p" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#8996b4" opacity=".22"/></pattern></defs><rect width="1500" height="620" fill="#e9edf5"/><rect width="1500" height="620" fill="url(#p)"/><path d="M80 610 690 0h440L520 620Z" fill="#dce3ef"/><g fill="#c5cddd" transform="translate(120 150)scale(1.75)">'+symbol('#c5cddd','#c5cddd')+'</g>']
for file,x,y,angle in [('minecraft',535,72,-13),('valorant',845,20,7),('genshin',1140,160,18)]:
 b=base64.b64encode((P/f'assets/games/{file}.webp').read_bytes()).decode();svg.append(f'<g transform="translate({x} {y})rotate({angle} 170 220)"><rect x="-7" y="-7" width="354" height="454" rx="20" fill="white"/><g clip-path="url(#a)"><image href="data:image/webp;base64,{b}" width="340" height="440" preserveAspectRatio="xMidYMid slice"/></g></g>')
svg.append('</svg>');(A/'banner.svg').write_text(''.join(svg))
CAT=json.loads((P/'catalog.json').read_text())
# Product artwork should not imply real shop earnings or fabricated statistics.
p=P/'assets/code/dashboard.svg'
if p.exists():p.write_text(p.read_text().replace('24.8k','Overview').replace('+18%','Activity').replace('1,204','Reports'))
HEAD=lambda title:f'''<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{e(title)} · kamucode</title><meta name="description" content="kamucode ร้านไอดีเกมและซอร์สโค้ด"><link rel="icon" href="/favicon.svg?v=ribbon"><link rel="preload" href="/_app/immutable/assets/google-sans-latin-normal.BbZhqv4U.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/_app/immutable/assets/google-sans-thai-normal.CD79Hmaw.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/_app/immutable/assets/0.0gKxBXBV.css"><link rel="stylesheet" href="/_app/immutable/assets/60.RDBfGA5z.css"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/brand.css"></head>'''
PROTECTED={'shop','games','source-code','partners','account','saved','orders'}
PRIVATE=R/'generated/store-pages'
def brand(url='/welcome/'):return f'<a class="km-brand" href="{url}" aria-label="kamucode หน้าหลัก">{BRAND}</a>'
def header(active):
 bar=html.fromstring(classic_header())
 row=bar.xpath('./div')[0]
 row.xpath('./a')[0].set('href','/shop/')
 routes=[('shop','หน้าหลัก','grid'),('games','ไอดีเกม','game'),('source-code','ซอร์สโค้ด','code'),('saved','บันทึก','bookmark'),('partners','ร่วมขาย','partner')]
 current=next((i for i,(route,_,_) in enumerate(routes) if route==active),-1)
 fallback='<div id="kc-member-navigation" data-active="'+str(current)+'"><div class="kc-liquid-slot"><nav class="nimbus-nav" aria-label="ทางลัดร้าน kamucode">'+''.join(f'<a class="nimbus-item" href="/{route}/"'+(' aria-current="page"' if i==current else '')+'>'+icon(glyph)+f'<span class="nimbus-label">{label}</span></a>' for i,(route,label,glyph) in enumerate(routes))+'</nav></div><a class="kc-command-trigger" href="/sitemap/" aria-label="แผนผังเว็บไซต์">'+icon('search')+'</a></div>'
 row.insert(1,html.fromstring(fallback))
 return html.tostring(bar,encoding='unicode')
def footer():
 groups=[('สำรวจ',[('/shop/','หน้าหลัก'),('/games/','ไอดีเกม'),('/source-code/','ซอร์สโค้ด'),('/partners/','ร่วมขายสินค้า')]),('บัญชีและบริการ',[('/account/','บัญชีของฉัน'),('/saved/','รายการบันทึก'),('/orders/','คำสั่งซื้อ'),('/support/','ศูนย์ช่วยเหลือ')]),('ข้อมูลเว็บไซต์',[('/privacy/','นโยบายความเป็นส่วนตัว'),('/terms/','ข้อกำหนดการใช้งาน'),('/security/','ความปลอดภัย'),('/sitemap/','แผนผังเว็บไซต์')])]
 return '<footer class="km-footer"><div class="km-footer-main"><div>'+brand()+'<p>ไอดีเกมและซอร์สโค้ด<br>เลือกในแบบที่เป็นคุณ</p></div>'+''.join('<div><h3>'+title+'</h3>'+''.join(f'<a href="{u}">{l}</a>' for u,l in links)+'</div>' for title,links in groups)+'</div><div class="km-footer-bottom"><span>© 2026 kamucode</span><span>ข้อมูลสินค้าและราคาจริงจะแสดงเมื่อร้านเปิดขาย</span></div></footer>'
def classic_header():
 source=html.fromstring((R/'reference/landing-original.html').read_text())
 bar=source.xpath('//header')[0]
 replace_brand(bar.xpath('.//a')[0])
 return html.tostring(bar,encoding='unicode')
def public_footer():
 return '<footer class="km-public-footer">'+brand()+'<div><a href="/privacy/">นโยบายความเป็นส่วนตัว</a><a href="/terms/">ข้อกำหนดการใช้งาน</a><a href="/security/">ความปลอดภัย</a><a href="/support/">ช่วยเหลือ</a><a href="/sitemap/">แผนผังเว็บไซต์</a></div><small>© 2026 kamucode</small></footer>'
def write(path,title,body,kind='page',active='',auth=False):
 private=path in PROTECTED or path.startswith('product/')
 public_page=kind in ['policy','support','sitemap']
 f=(PRIVATE if private else P)/path/'index.html';f.parent.mkdir(parents=True,exist_ok=True)
 if private:
  old=P/path/'index.html'
  if old.exists():old.unlink()
  try:old.parent.rmdir()
  except OSError:pass
 head=HEAD(title)
 if private:head=head.replace('</head>','<link rel="stylesheet" href="/member-navigation.css"></head>')
 if not auth:head=head.replace('</head>','<link rel="stylesheet" href="/landing.css"></head>')
 if public_page:body=body.replace('href="/shop/"','href="/welcome/"')
 top=(f'<div class="km-auth-top">{brand()}<a href="/welcome/">กลับหน้าแรก {icon("arrow")}</a></div>' if auth else classic_header() if public_page else header(active))
 bottom=auth_footer() if auth else public_footer() if public_page else footer()
 f.write_text('<!doctype html><html lang="th">'+head+f'<body data-page="{kind}"'+(' class="km-original-topbar"' if not auth else '')+(' data-member-area' if private else '')+'>'+top+body+bottom+'<div class="km-toast" role="status" aria-live="polite"></div>'+('<script src="/topbar.js" defer></script>' if not auth else '')+'<script src="/site.js" defer></script>'+('<script type="module" src="/member-navigation.js"></script>' if private else '')+'</body></html>')
def auth_footer():return '<footer class="km-auth-footer"><a href="/privacy/">ความเป็นส่วนตัว</a><a href="/terms/">ข้อกำหนด</a><a href="/security/">ความปลอดภัย</a></footer>'
def intro(title,desc,section=''):
 return '<div class="km-page-intro"><div class="km-breadcrumb"><a href="/shop/">หน้าหลัก</a><span>/</span>'+e(section or title)+'</div><h1>'+title+'</h1><p>'+desc+'</p></div>'
def cards(items=CAT,save=False):
 return '<div class="km-product-grid">'+''.join(f'''<article class="km-product" data-kind="{p['kind']}" data-product-id="{p['id']}"><a href="/product/{p['id']}/" class="km-product-art"><img src="{p['image']}" alt="{e(p['name'])}" loading="lazy"><span>{'ไอดีเกม' if p['kind']=='game' else 'ซอร์สโค้ด'}</span></a><div class="km-product-info"><p>{e(p['tag'])}</p><h3><a href="/product/{p['id']}/">{e(p['name'])}</a></h3><div><span>คอลเลกชันตัวอย่าง</span><a href="/product/{p['id']}/" aria-label="ดู {e(p['name'])}">{icon('arrow')}</a></div></div>{f'<button class="km-remove-save" data-remove-save="{p["id"]}" type="button">นำออกจากรายการ</button>' if save else ''}</article>''' for p in items)+'</div>'
def quicklinks():
 return '<nav class="km-quicklinks" aria-label="ทางลัด">'+''.join(f'<a href="/{p}/">{icon(i)}<span><strong>{l}</strong><small>{s}</small></span>{icon("external")}</a>' for p,l,s,i in [('games','ไอดีเกม','เลือกเกมที่อยากเล่น','game'),('source-code','ซอร์สโค้ด','เริ่มโปรเจกต์ของคุณ','code'),('saved','รายการบันทึก','กลับมาดูสิ่งที่สนใจ','bookmark'),('partners','ร่วมขายสินค้า','ส่งสินค้าให้เรารู้จัก','partner')])+'</nav>'
def banner():return '<a class="km-banner" href="/games/"><img src="/assets/brand/banner.svg" alt="แบนเนอร์คอลเลกชันเกม kamucode"><div><span>GAME COLLECTION</span><h2>เกมที่ชอบ <br>อยู่ตรงนี้</h2><p>ดูคอลเลกชัน เลือกให้เข้ากับสไตล์คุณ</p><b>สำรวจไอดีเกม '+icon('arrow')+'</b></div></a>'
def catalog_section(items,title='เลือกดูคอลเลกชัน',filters=False):
 return '<section class="km-catalog"><div class="km-section-heading"><h2>'+title+'</h2><label class="km-search">'+icon('search')+'<input type="search" aria-label="ค้นหาสินค้า" placeholder="ค้นหาเกมหรือซอร์สโค้ด"></label></div>'+('<div class="km-filter-row" role="group" aria-label="ประเภทสินค้า"><button data-filter="all" class="is-active" aria-pressed="true">ทั้งหมด</button><button data-filter="game" aria-pressed="false">ไอดีเกม</button><button data-filter="source" aria-pressed="false">ซอร์สโค้ด</button><span data-result-count>'+str(len(items))+' คอลเลกชัน</span></div>' if filters else '<div class="km-results-line"><span data-result-count>'+str(len(items))+' คอลเลกชัน</span></div>')+cards(items)+'<p class="km-empty-search" hidden>ไม่พบสินค้าที่ตรงกับคำค้น ลองค้นหาด้วยคำอื่น</p><p class="km-catalog-note">ภาพและรายการนี้เป็นคอลเลกชันตัวอย่าง ยังไม่มีการเรียกเก็บเงินหรือรับคำสั่งซื้อ</p></section>'
shop='<main class="km-main"><div class="km-store-heading"><div><span>kamucode / store</span><h1>เกมที่ชอบ โค้ดที่ใช่</h1></div><p>ไอดีเกมและซอร์สโค้ด<br>สำหรับสิ่งที่คุณอยากทำต่อ</p></div>'+banner()+catalog_section(CAT,filters=True)+'<section class="km-partner-strip"><div><span>สำหรับคนที่มีของอยากขาย</span><h2>ร่วมขายกับ kamucode</h2><p>มีไอดีเกมหรือซอร์สโค้ดของตัวเอง? ส่งรายละเอียดร้านให้เรารู้จัก</p></div><a href="/partners/" class="km-button">ดูรายละเอียดพาร์ทเนอร์ '+icon('arrow')+'</a></section></main>'
write('shop','หน้าหลัก',shop,'shop','shop')
for route,kind,title,desc in [('games','game','ไอดีเกม','เลือกเกมที่สนใจ แล้วตรวจสอบรายละเอียดของแต่ละรายการ'),('source-code','source','ซอร์สโค้ด','เริ่มจากสิ่งที่อยากสร้าง แล้วเลือกเทคโนโลยีที่เหมาะกับคุณ')]:
 write(route,title,'<main class="km-main">'+intro(title,desc)+catalog_section([p for p in CAT if p['kind']==kind],title='คอลเลกชัน'+title)+'</main>','catalog',route)
# Restore the complete accepted landing, including its original floating top bar.
landing=html.fromstring((R/'reference/landing-original.html').read_text())
landing.xpath('//title')[0].text='kamucode — ไอดีเกมและซอร์สโค้ด'
for anchor in landing.xpath('//a[contains(concat(" ",@class," ")," kc-brand ")]'):
 replace_brand(anchor,bool(anchor.xpath('ancestor::*[contains(concat(" ",@class," ")," kc-closing ")]')))
for cover in landing.xpath('//*[contains(concat(" ",@class," ")," avatar ")]//img'):cover.set('src','/assets/brand/mark-dark.svg')
for line in landing.xpath('//em[contains(@class,"clone-word")]'):
 for child in list(line):line.remove(child)
 line.text=None;line.append(html.fromstring('<img class="kc-wordmark-image" src="/assets/brand/wordmark.svg" alt="kamucode" width="674" height="112">'))
for title in landing.xpath('//*[contains(@class,"kc-partner-ticket")]/strong'):
 for child in list(title):title.remove(child)
 title.text=None;title.append(html.fromstring('<img class="kc-ticket-wordmark" src="/assets/brand/wordmark.svg" alt="kamucode" width="674" height="112">'))
landing.xpath('//head')[0].append(html.fromstring('<link rel="stylesheet" href="/brand.css">'))
for link in landing.xpath('//link[@rel="icon"]'):link.set('href','/favicon.svg?v=ribbon')

for link in landing.xpath('//link[@href="/kamucode.css"]'):link.set('href','/landing.css')
for script in landing.xpath('//script'):script.getparent().remove(script)
for button in landing.xpath('//button[@data-privacy]'):
 anchor=html.Element('a',href='/privacy/');anchor.text='ความเป็นส่วนตัว';button.getparent().replace(button,anchor)
legal=landing.xpath('//footer[contains(@class,"kc-footer")]')[0]
for target,label in [('terms','ข้อกำหนด'),('security','ความปลอดภัย'),('sitemap','แผนผังเว็บไซต์')]:
 anchor=html.Element('a',href='/'+target+'/');anchor.text=label;legal.append(anchor)
for script in ['topbar','landing']:
 node=html.Element('script',src='/'+script+'.js',defer='');landing.xpath('//body')[0].append(node)
(P/'welcome').mkdir(exist_ok=True)
(P/'welcome/index.html').write_text('<!doctype html>'+html.tostring(landing,encoding='unicode'))
# Product pages have real, shareable URLs instead of relying on modal state.
for p in CAT:
 body='<main class="km-main">'+intro(p['name'],'รายละเอียดคอลเลกชัน','สินค้า / '+p['name'])+f'''<div class="km-product-detail"><img src="{p['image']}" alt="{e(p['name'])}"><section><span class="km-label">{'ไอดีเกม' if p['kind']=='game' else 'ซอร์สโค้ด'}</span><h2>{e(p['name'])}</h2><p>{e(p['description'])}</p><dl><div><dt>แพลตฟอร์ม / เทคโนโลยี</dt><dd>{e(p['tag'])}</dd></div><div><dt>สถานะ</dt><dd>คอลเลกชันตัวอย่าง</dd></div></dl><p class="km-detail-notice">ยังไม่ใช่สินค้าที่เปิดขาย ราคาและเงื่อนไขจะระบุในรายการจริง ไม่มีการเรียกเก็บเงินจากหน้านี้</p><button class="km-button km-full" type="button" data-save-product="{p['id']}">{icon('bookmark')} บันทึกไว้ดูก่อน</button><a class="km-detail-support" href="/support/">สอบถามหรือแจ้งปัญหา {icon('arrow')}</a></section></div></main>'''
 write('product/'+p['id'],p['name'],body,'product', 'games' if p['kind']=='game' else 'source-code')
def account_nav(current):return '<nav class="km-account-nav" aria-label="เมนูบัญชี">'+''.join(f'<a href="/{route}/"'+(' aria-current="page"' if route==current else '')+f'>{icon(i)}{label}</a>' for route,label,i in [('account','บัญชีของฉัน','user'),('saved','รายการบันทึก','bookmark'),('orders','คำสั่งซื้อ','bag'),('support','ช่วยเหลือ','help')])+'</nav>'
private_gate='<div class="km-auth-required" hidden>'+icon('lock')+'<h2>เข้าสู่ระบบเพื่อดูหน้านี้</h2><p>ข้อมูลส่วนตัวและรายการบันทึกจะแสดงเฉพาะบัญชีของคุณ</p><a class="km-button" href="/login/">เข้าสู่ระบบ '+icon('arrow')+'</a></div>'
account_body='''<section class="km-account-content" data-private-content hidden><div class="km-profile-heading"><div class="km-avatar" data-avatar>KC</div><div><h2 data-display-name>บัญชีของฉัน</h2><p data-email></p></div><button class="km-text-link" type="button" data-logout>ออกจากระบบ</button></div><form id="profile-form" class="km-form km-settings-form"><h3>ข้อมูลบัญชี</h3><label for="profile-name">ชื่อที่แสดง</label><input id="profile-name" name="displayName" minlength="2" maxlength="60" required><label for="profile-email">อีเมล</label><input id="profile-email" type="email" readonly><span class="km-field-note" data-email-status></span><p class="km-form-message" role="status"></p><button class="km-button" type="submit">บันทึกข้อมูล</button></form><section class="km-account-section"><h3>ข้อมูลของคุณ</h3><p>ดาวน์โหลดข้อมูลสมาชิก รายการบันทึก ใบสมัครพาร์ทเนอร์ และเรื่องที่เคยติดต่อเราได้จากบัญชีนี้</p><a class="km-outline-button" href="/api/data-export">'''+icon('download')+''' ดาวน์โหลดข้อมูลของฉัน</a></section><section class="km-account-section"><h3>สถานะพาร์ทเนอร์</h3><div data-partner-status></div><a class="km-text-link" href="/partners/">ไปหน้าพาร์ทเนอร์ '''+icon('arrow')+'''</a></section></section>'''
write('account','บัญชีของฉัน','<main class="km-main">'+intro('บัญชีของฉัน','จัดการข้อมูลของคุณใน kamucode')+account_nav('account')+private_gate+account_body+'</main>','account')
write('saved','รายการบันทึก','<main class="km-main">'+intro('รายการบันทึก','สิ่งที่คุณสนใจ เก็บไว้กลับมาดูได้ทุกเวลา')+account_nav('saved')+private_gate+'<section data-private-content hidden><div data-saved-grid>'+cards(CAT,True)+'</div><div class="km-empty-state" data-saved-empty hidden>'+icon('bookmark')+'<h2>ยังไม่มีรายการบันทึก</h2><p>เลือกคอลเลกชันที่สนใจ แล้วกด “บันทึกไว้ดูก่อน”</p><a class="km-button" href="/shop/">สำรวจร้าน '+icon('arrow')+'</a></div></section></main>','saved')
write('orders','คำสั่งซื้อ','<main class="km-main">'+intro('คำสั่งซื้อ','ตรวจสอบรายการสั่งซื้อของคุณ')+account_nav('orders')+private_gate+'<section data-private-content hidden><div class="km-empty-state">'+icon('bag')+'<h2>ยังไม่มีคำสั่งซื้อ</h2><p>ขณะนี้ร้านแสดงคอลเลกชันตัวอย่างและยังไม่เปิดระบบสั่งซื้อ<br>คุณสามารถสำรวจสินค้าและบันทึกสิ่งที่สนใจไว้ก่อนได้</p><a class="km-button" href="/shop/">กลับหน้าร้าน '+icon('arrow')+'</a></div></section></main>','orders')
partnerform='''<form id="partner-form" class="km-form"><h2>แนะนำร้านของคุณ</h2><label for="partner-shop">ชื่อร้าน / ชื่อผู้ขาย</label><input id="partner-shop" name="shopName" minlength="2" maxlength="80" required placeholder="ชื่อที่ต้องการให้เราเรียก"><label for="partner-category">ประเภทสินค้า</label><select id="partner-category" name="category"><option value="game">ไอดีเกม</option><option value="source">ซอร์สโค้ด</option><option value="both">ไอดีเกมและซอร์สโค้ด</option></select><label for="partner-contact">ช่องทางติดต่อ</label><input id="partner-contact" name="contact" minlength="3" maxlength="200" required placeholder="LINE / Discord / อีเมล"><label for="partner-message">รายละเอียดสินค้า</label><textarea id="partner-message" name="message" minlength="10" maxlength="2000" required placeholder="ประเภทสินค้า ตัวอย่างผลงาน และสิ่งที่อยากให้เรารู้"></textarea><p class="km-field-note">ไม่ต้องส่งรหัสผ่านบัญชีเกมหรือคีย์ลับใด ๆ ผ่านแบบฟอร์ม</p><p class="km-form-message" role="status"></p><button class="km-button km-full" type="submit">ส่งใบสมัคร '''+icon('arrow')+'''</button></form>'''
write('partners','ร่วมขายสินค้า','<main class="km-main">'+intro('ร่วมขายกับ kamucode','สำหรับผู้ขายไอดีเกมและผู้พัฒนาซอร์สโค้ดที่มีสินค้าของตัวเอง')+'<div class="km-partner-layout"><section class="km-partner-description"><div class="km-partner-monogram">'+MARK+'</div><h2>มีของดี<br>อยากให้คนรู้จัก?</h2><p>บอกเราว่าคุณขายอะไร พร้อมตัวอย่างสินค้าและช่องทางติดต่อ เราจะใช้ข้อมูลนี้เพื่อพิจารณาการร่วมขาย</p><ol><li><span>01</span><div><h3>แนะนำสินค้า</h3><p>เล่าประเภทสินค้าและรายละเอียดร้านของคุณ</p></div></li><li><span>02</span><div><h3>รอการพิจารณา</h3><p>ติดตามสถานะใบสมัครจากบัญชีของคุณ</p></div></li><li><span>03</span><div><h3>ตกลงรายละเอียดก่อนเริ่มขาย</h3><p>เงื่อนไขการร่วมขายจะแจ้งก่อนยืนยัน</p></div></li></ol></section><section class="km-partner-form-wrap"><div class="km-auth-required" data-partner-gate hidden><h2>สมัครสมาชิกก่อนส่งใบสมัคร</h2><p>เพื่อให้คุณติดตามสถานะและกลับมาดูข้อมูลได้</p><a class="km-button" href="/signup/?partner=1">สมัครสมาชิก '+icon('arrow')+'</a><a class="km-text-link" href="/login/">มีบัญชีแล้ว เข้าสู่ระบบ</a></div><div data-partner-form hidden>'+partnerform+'</div><div data-existing-application hidden></div></section></div></main>','partners','partners')
faq=[('สมัครสมาชิกอย่างไร?','เลือก “สมัครสมาชิก” กรอกชื่อ อีเมล และรหัสผ่านอย่างน้อย 10 ตัวอักษร เมื่อสมัครสำเร็จจะเข้าหน้าร้านทันที'),('เข้าสู่ระบบโซเชียลได้หรือยัง?','ใช้ได้เฉพาะผู้ให้บริการที่เปิดเชื่อมต่อแล้ว ตัวเลือกที่ยังไม่เปิดจะแสดงสถานะไว้ คุณสามารถสมัครด้วยอีเมลได้'),('ทำไมยังไม่มีราคา?','รายการปัจจุบันเป็นคอลเลกชันตัวอย่าง ร้านยังไม่เปิดรับคำสั่งซื้อและไม่มีการเรียกเก็บเงิน'),('บันทึกสินค้าไว้ที่ไหน?','เปิดรายละเอียดคอลเลกชันแล้วกด “บันทึกไว้ดูก่อน” รายการจะอยู่ในหน้า “รายการบันทึก” ของบัญชีคุณ'),('ลืมรหัสผ่านควรทำอย่างไร?','ขณะนี้ยังไม่เปิดบริการส่งอีเมลรีเซ็ตรหัสผ่าน คุณสามารถส่งเรื่องติดต่อจากหน้านี้ได้ อย่าส่งรหัสผ่านเดิมหรือรหัส OTP ให้เรา'),('ต้องการแก้ไขหรือลบข้อมูลส่วนตัว?','แก้ชื่อที่แสดงได้ในหน้าบัญชี และดาวน์โหลดข้อมูลของตัวเองได้ หากต้องการลบหรือขอใช้สิทธิอื่น ให้เลือกหัวข้อ “ข้อมูลส่วนบุคคล” ในแบบฟอร์ม')]
supportform='''<form id="support-form" class="km-form"><h2>ติดต่อเรา</h2><label for="support-email">อีเมลติดต่อ</label><input id="support-email" name="email" type="email" maxlength="254" required autocomplete="email"><label for="support-category">เรื่องที่ต้องการติดต่อ</label><select id="support-category" name="category"><option value="general">คำถามทั่วไป / บัญชี</option><option value="partner">การสมัครพาร์ทเนอร์</option><option value="privacy">ข้อมูลส่วนบุคคล</option><option value="security">แจ้งปัญหาความปลอดภัย</option></select><label for="support-subject">หัวข้อ</label><input id="support-subject" name="subject" minlength="3" maxlength="120" required><label for="support-message">รายละเอียด</label><textarea id="support-message" name="message" minlength="10" maxlength="3000" required></textarea><p class="km-field-note">อย่าส่งรหัสผ่าน คุกกี้ คีย์ลับ หรือข้อมูลการชำระเงิน</p><p class="km-form-message" role="status"></p><button class="km-button km-full" type="submit">บันทึกเรื่องติดต่อ '''+icon('arrow')+'''</button></form>'''
write('support','ศูนย์ช่วยเหลือ','<main class="km-main">'+intro('ศูนย์ช่วยเหลือ','คำถามที่พบบ่อย และช่องทางติดต่อเกี่ยวกับบัญชีหรือสินค้า')+'<div class="km-support-layout"><section class="km-faq"><h2>คำถามที่พบบ่อย</h2>'+''.join('<details><summary>'+q+'</summary><p>'+a+'</p></details>' for q,a in faq)+'<section class="km-account-section"><h3>เรื่องที่คุณเคยติดต่อ</h3><div data-support-history><p>เข้าสู่ระบบเพื่อดูประวัติเรื่องที่ติดต่อ</p></div></section></section><section>'+supportform+'</section></div></main>','support')
policies={
'privacy':('นโยบายความเป็นส่วนตัว','เราเก็บข้อมูลเท่าที่จำเป็นต่อการให้บริการและการรักษาความปลอดภัยของบัญชี',[
('ข้อมูลที่เราเก็บ','<p>เมื่อสมัครสมาชิก เราเก็บชื่อที่แสดง อีเมล และค่ารหัสผ่านที่ผ่านการแฮช สำหรับการเข้าสู่ระบบด้วยผู้ให้บริการภายนอก เราอาจได้รับรหัสบัญชี ชื่อ อีเมล สถานะยืนยันอีเมล และข้อมูลที่ผู้ใช้อนุญาต</p><p>เรายังเก็บรายการสินค้าที่บันทึก ใบสมัครพาร์ทเนอร์ ข้อความติดต่อ และข้อมูลเซสชัน เช่น IP และชนิดเบราว์เซอร์ เพื่อให้บริการและป้องกันการใช้งานผิดปกติ ผู้ที่ติดต่อโดยไม่เข้าสู่ระบบจะมีรหัสจำกัดการส่งซ้ำที่สร้างจาก IP แบบแฮชร่วมกับค่าลับของระบบ</p>'),
('ใช้ข้อมูลเพื่ออะไร','<ul><li>สร้างและดูแลบัญชี ยืนยันตัวตน และจัดการเซสชัน</li><li>แสดงรายการบันทึกและประวัติที่เป็นของบัญชีคุณ</li><li>พิจารณาใบสมัครพาร์ทเนอร์และจัดการเรื่องที่ติดต่อ</li><li>ป้องกันการเข้าสู่ระบบโดยไม่ได้รับอนุญาตและตรวจสอบปัญหาความปลอดภัย</li></ul>'),
('ผู้ให้บริการและการเปิดเผย','<p>เว็บไซต์ใช้งานโครงสร้างพื้นฐานของ ChatGPT Sites และ Cloudflare ส่วนการเข้าสู่ระบบโซเชียลจะติดต่อผู้ให้บริการที่คุณเลือก ข้อมูลอาจถูกประมวลผลในประเทศที่ผู้ให้บริการดำเนินงาน โปรดอ่านนโยบายของผู้ให้บริการนั้นด้วย</p><p>เราไม่ขายข้อมูลสมาชิก ข้อมูลติดต่อในใบสมัครใช้เพื่อพิจารณาการร่วมขายและติดต่อเกี่ยวกับเรื่องนั้น</p>'),
('คุกกี้และการจัดเก็บในอุปกรณ์','<p>ใช้คุกกี้ที่จำเป็นสำหรับเซสชันเข้าสู่ระบบและความปลอดภัย รหัสผ่านไม่ได้ถูกบันทึกไว้ใน Local Storage</p>'),
('การเก็บรักษาและสิทธิของคุณ','<p>เก็บข้อมูลในช่วงที่จำเป็นต่อการให้บริการ การตรวจสอบความปลอดภัย หรือหน้าที่ตามกฎหมาย เมื่อหมดความจำเป็นจะพิจารณาลบหรือทำให้ไม่สามารถระบุตัวบุคคลได้</p><p>คุณสามารถแก้ชื่อที่แสดงและดาวน์โหลดข้อมูลจากหน้าบัญชี หากต้องการขอเข้าถึง แก้ไข ลบ จำกัดการใช้ คัดค้าน หรือใช้สิทธิที่กฎหมายให้ไว้ โปรดส่งคำขอผ่านหน้าศูนย์ช่วยเหลือ เราอาจต้องตรวจสอบตัวตนก่อนดำเนินการ</p>'),
('ติดต่อเรื่องข้อมูลส่วนบุคคล','<p>ผู้ให้บริการเว็บไซต์: ร้าน kamucode</p><p>ส่งคำขอผ่าน <a href="/support/?topic=privacy">ศูนย์ช่วยเหลือ — ข้อมูลส่วนบุคคล</a> โดยไม่ต้องแนบรหัสผ่านหรือข้อมูลลับ</p>')]),
 'terms':('ข้อกำหนดการใช้งาน','อ่านข้อมูลและเงื่อนไขของเว็บไซต์ก่อนใช้งาน',[
('ขอบเขตบริการ','<p>kamucode เป็นเว็บไซต์สำหรับสำรวจคอลเลกชันไอดีเกม ซอร์สโค้ด และการสมัครร่วมขายสินค้า ขณะนี้รายการที่แสดงเป็นตัวอย่าง ยังไม่มีระบบรับคำสั่งซื้อหรือเรียกเก็บเงิน</p>'),
('บัญชีของคุณ','<p>ให้ข้อมูลที่ถูกต้อง ใช้บัญชีและอีเมลที่คุณมีสิทธิ์ใช้งาน ดูแลรหัสผ่านและการเข้าถึงบัญชี ห้ามสวมรอยผู้อื่นหรือใช้บัญชีเพื่อทำให้ระบบและผู้ใช้อื่นเสียหาย</p>'),
('รายละเอียดสินค้าและสิทธิ์','<p>เมื่อมีการเปิดขายจริง ราคา สถานะสินค้า วิธีส่งมอบ เงื่อนไขบริการ และสิทธิ์ใช้งานจะระบุในรายการนั้น ต้องตรวจสอบข้อมูลก่อนตัดสินใจ</p><p>การใช้เกม บัญชี และซอร์สโค้ดยังอยู่ภายใต้ข้อกำหนดของเจ้าของแพลตฟอร์มและไลเซนส์ที่เกี่ยวข้อง ห้ามเสนอสินค้าที่ได้มาโดยไม่มีสิทธิ์ หรือเนื้อหาที่ละเมิดสิทธิ์ของผู้อื่น</p>'),
('พาร์ทเนอร์','<p>การส่งใบสมัครไม่ใช่การอนุมัติให้ขายโดยอัตโนมัติ ร้านจะพิจารณาข้อมูลและแจ้งเงื่อนไขการร่วมขายก่อนเริ่มดำเนินการ ผู้สมัครต้องมีสิทธิ์ในสินค้าที่เสนอ</p>'),
('การใช้งานที่ไม่อนุญาต','<p>ห้ามเข้าถึงข้อมูลของผู้อื่นโดยไม่ได้รับอนุญาต แจกจ่ายมัลแวร์ ส่งข้อความหลอกลวง โจมตีระบบ หรือใช้เว็บไซต์เพื่อกิจกรรมที่ผิดกฎหมาย เราอาจจำกัดการใช้งานที่ก่อให้เกิดความเสียหายและตรวจสอบเหตุการณ์นั้น</p>'),
('ความถูกต้องและการเปลี่ยนแปลง','<p>ภาพประกอบและคอลเลกชันตัวอย่างไม่ได้ยืนยันว่ามีสินค้าเปิดขายหรือมีความเกี่ยวข้องกับเจ้าของเครื่องหมายการค้า ข้อมูลและเงื่อนไขอาจเปลี่ยนตามบริการที่เปิดใช้จริง การปรับเงื่อนไขจะแสดงบนหน้านี้</p>'),
('ติดต่อเกี่ยวกับข้อกำหนด','<p>หากมีคำถามหรือพบข้อมูลไม่ถูกต้อง ส่งรายละเอียดผ่าน <a href="/support/">ศูนย์ช่วยเหลือ</a> พร้อมระบุหน้าที่เกี่ยวข้อง</p>')]),
 'security':('ความปลอดภัย','สิ่งที่ระบบทำ และสิ่งที่คุณควรรู้เพื่อดูแลบัญชี',[
('รหัสผ่านและเซสชัน','<p>รหัสผ่านถูกแฮชด้วย scrypt ก่อนจัดเก็บ เซสชันเข้าสู่ระบบใช้คุกกี้ HttpOnly และ SameSite พร้อม Secure เมื่อใช้งานผ่าน HTTPS รหัสผ่านไม่ถูกเก็บไว้ในเบราว์เซอร์โดยเว็บไซต์</p>'),
('การควบคุมการเข้าถึง','<p>ระบบตรวจสอบผู้ใช้ฝั่งเซิร์ฟเวอร์ก่อนอ่านหรือเปลี่ยนข้อมูลสมาชิก รายการบันทึก ใบสมัคร และประวัติติดต่อ ไม่อาศัยการซ่อนปุ่มเพียงอย่างเดียว</p>'),
('การป้องกันการใช้งานผิดปกติ','<p>ระบบเข้าสู่ระบบจำกัดความถี่คำขอ ตรวจสอบ Origin และใช้กลไก State/PKCE สำหรับ OAuth การเข้าสู่ระบบโซเชียลจะเปิดเฉพาะผู้ให้บริการที่ร้านตั้งค่าแล้ว</p>'),
('สถานะอีเมลและการกู้บัญชี','<p>การสมัครด้วยอีเมลในระยะนี้ยังไม่มีอีเมลยืนยันหรืออีเมลรีเซ็ตรหัสผ่านอัตโนมัติ สถานะอีเมลจะแสดงตามจริงในหน้าบัญชี และไม่เชื่อมบัญชีโซเชียลเข้าหากันโดยอัตโนมัติ</p><p>หากลืมรหัสผ่าน ให้ส่งเรื่องผ่านศูนย์ช่วยเหลือ การเปลี่ยนการเข้าถึงบัญชีต้องผ่านการตรวจสอบตัวตน</p>'),
('ดูแลบัญชีของคุณ','<ul><li>ใช้รหัสผ่านยาวและไม่ซ้ำกับบริการอื่น</li><li>ตรวจสอบ URL ก่อนเข้าสู่ระบบ</li><li>ออกจากระบบเมื่อใช้เครื่องร่วมกับผู้อื่น</li><li>เปิดการยืนยันตัวตนเพิ่มเติมในบัญชีโซเชียลของคุณ หากผู้ให้บริการรองรับ</li></ul>'),
('แจ้งปัญหาความปลอดภัย','<p>หากพบปัญหา ให้ส่งหน้าที่เกี่ยวข้อง ขั้นตอนที่พบ และผลกระทบที่สังเกตได้ผ่าน <a href="/support/?topic=security">แบบฟอร์มแจ้งปัญหาความปลอดภัย</a></p><p>อย่าส่งรหัสผ่าน คุกกี้ คีย์ลับ ข้อมูลการชำระเงิน หรือข้อมูลส่วนตัวของบุคคลอื่น</p>')])}
for route,(title,description,sections) in policies.items():
 toc='<nav aria-label="หัวข้อในหน้านี้">'+''.join(f'<a href="#section-{i}">{h}</a>' for i,(h,b) in enumerate(sections))+'</nav>'
 article='<article class="km-prose"><p class="km-policy-date">อัปเดต 31 ตุลาคม 2569</p>'+''.join(f'<section id="section-{i}"><h2>{h}</h2>{b}</section>' for i,(h,b) in enumerate(sections))+'</article>'
 write(route,title,'<main class="km-main">'+intro(title,description)+'<div class="km-policy-layout">'+toc+article+'</div></main>','policy')
allroutes=[('shop','หน้าหลัก'),('welcome','แนะนำ kamucode'),('games','ไอดีเกม'),('source-code','ซอร์สโค้ด'),('partners','พาร์ทเนอร์'),('account','บัญชีของฉัน'),('saved','รายการบันทึก'),('orders','คำสั่งซื้อ'),('support','ศูนย์ช่วยเหลือ'),('signup','สมัครสมาชิก'),('login','เข้าสู่ระบบ'),('privacy','นโยบายความเป็นส่วนตัว'),('terms','ข้อกำหนดการใช้งาน'),('security','ความปลอดภัย')]+[('product/'+p['id'],p['name']) for p in CAT]
write('sitemap','แผนผังเว็บไซต์','<main class="km-main">'+intro('แผนผังเว็บไซต์','ทุกหน้าของ kamucode ในที่เดียว')+'<div class="km-sitemap-grid">'+''.join(f'<a href="/{path}/"'+(' data-member-only hidden' if path in PROTECTED or path.startswith('product/') else '')+f'><span>{title}</span>{icon("arrow")}</a>' for path,title in allroutes)+'</div><p class="km-sitemap-xml"><a href="/sitemap.xml">ดู XML sitemap</a></p></main>','sitemap')
providers=[('google','Google'),('discord','Discord'),('line','LINE'),('github','GitHub'),('microsoft','Microsoft'),('gitlab','GitLab')]
for mode in ['signup','login']:
 signup=mode=='signup';title='สร้างบัญชี kamucode' if signup else 'ยินดีต้อนรับกลับ'
 social='<div class="km-social-grid">'+''.join(f'<button type="button" data-social="{id}" disabled title="ยังไม่เปิดเชื่อมต่อ"><img src="/assets/providers/{id}.svg" alt="">{name}<span data-provider-state>ยังไม่เปิด</span></button>' for id,name in providers)+'</div><p class="km-provider-note">สมัครด้วยอีเมลได้ทันที ตัวเลือกโซเชียลจะเปิดเมื่อร้านเชื่อมต่อแล้ว</p>'
 fields=('<label for="auth-name">ชื่อที่แสดง</label><input id="auth-name" name="name" autocomplete="nickname" minlength="2" maxlength="60" required placeholder="ชื่อของคุณ">' if signup else '')+'<label for="auth-email">อีเมล</label><input id="auth-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com"><label for="auth-password">รหัสผ่าน</label><div class="km-password-field"><input id="auth-password" name="password" type="password" autocomplete="'+('new-password' if signup else 'current-password')+'" minlength="10" maxlength="128" required placeholder="'+('อย่างน้อย 10 ตัวอักษร' if signup else 'รหัสผ่านของคุณ')+'"><button type="button" data-toggle-password aria-label="แสดงรหัสผ่าน">'+icon('eye')+'</button></div>'
 content='<main class="km-auth-main"><div class="km-auth-box"><div class="km-auth-mark">'+MARK+'</div><h1>'+title+'</h1><p class="km-auth-subtitle">'+('เก็บรายการที่สนใจ และเริ่มต้นกับร้านของเรา' if signup else 'เข้าสู่ระบบเพื่อดูบัญชีและรายการของคุณ')+'</p>'+social+'<div class="km-auth-divider"><span>หรือใช้อีเมล</span></div><form class="km-form km-auth-form" id="auth-form" data-mode="'+mode+'">'+fields+'<p class="km-form-message" role="alert"></p><button class="km-button km-full" type="submit">'+('สร้างบัญชี' if signup else 'เข้าสู่ระบบ')+' '+icon('arrow')+'</button></form>'+('<p class="km-auth-legal">อ่าน <a href="/terms/">ข้อกำหนดการใช้งาน</a> และ <a href="/privacy/">นโยบายความเป็นส่วนตัว</a> ก่อนสมัคร</p>' if signup else '<a class="km-forgot-link" href="/support/?topic=general">ลืมรหัสผ่าน / ต้องการความช่วยเหลือ</a>')+'<p class="km-auth-switch">'+('มีบัญชีแล้ว? <a href="/login/">เข้าสู่ระบบ</a>' if signup else 'ยังไม่มีบัญชี? <a href="/signup/">สมัครสมาชิก</a>')+'</p><a class="km-native-signin" href="/signin-with-chatgpt?return_to=%2Fauth%2Fnative%2F" target="_top">ใช้บัญชี ChatGPT '+icon('external')+'</a></div></main>'
 write(mode,title,content,mode,auth=True)
for route in ['complete','native']:
 write('auth/'+route,'กำลังเข้าสู่ระบบ','<main class="km-auth-main"><div class="km-auth-box km-auth-completing"><div class="km-auth-mark">'+MARK+'</div><div class="km-loader" aria-hidden="true"></div><h1>กำลังพาเข้าหน้าร้าน</h1><p data-auth-result>รอสักครู่…</p><a class="km-text-link" href="/login/" data-auth-retry hidden>กลับหน้าเข้าสู่ระบบ '+icon('arrow')+'</a></div></main>','auth-'+route,auth=True)
for legacy,dest in [('home.html','/shop/'),('welcome.html','/welcome/')]:
 (P/legacy).write_text('<!doctype html><html lang="th"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url='+dest+'"><title>kamucode</title></head><body><a href="'+dest+'">ไปที่ kamucode</a></body></html>')
public_routes=['welcome','shop','games','source-code','partners','support','privacy','terms','security','sitemap']
(P/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>https://kamucode.kawertyff-2.chatgpt.site/'+p+'/</loc></url>' for p in public_routes if p not in PROTECTED)+'</urlset>')
(P/'robots.txt').write_text('User-agent: *\nDisallow: /api/\nDisallow: /shop/\nDisallow: /games/\nDisallow: /source-code/\nDisallow: /partners/\nDisallow: /product/\nDisallow: /account/\nDisallow: /saved/\nDisallow: /orders/\nDisallow: /auth/\nDisallow: /signup/\nDisallow: /login/\nSitemap: https://kamucode.kawertyff-2.chatgpt.site/sitemap.xml\n')
(R/'reference/routes.json').write_text(json.dumps([p+'/index.html' for p in [*public_routes,'account','saved','orders','signup','login','auth/complete','auth/native',*['product/'+p['id'] for p in CAT]]],ensure_ascii=False,indent=2))
print('Built 25 branded pages, ribbon logo, banner, authentication, account and policy surfaces.')
