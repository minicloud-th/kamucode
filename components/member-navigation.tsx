"use client"

import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { Home, Gamepad2, Code2, Bookmark, Handshake, Search, ArrowUpRight, UserRound, ShoppingBag, CircleHelp, ShieldCheck, FileText, Network, X } from 'lucide-react'
import { LiquidNavbar, type LiquidNavItem } from './ui/liquid-glass-navbar'

const destinations = [
  { href: '/shop/', th: 'หน้าหลัก', en: 'Home', detail: 'ร้านค้าและคอลเลกชันทั้งหมด', keywords: 'home store shop ร้าน หลัก', icon: Home, fx: 'glow' },
  { href: '/games/', th: 'ไอดีเกม', en: 'Games', detail: 'VALORANT, Roblox, Minecraft และ Genshin Impact', keywords: 'game valorant roblox minecraft genshin', icon: Gamepad2, fx: 'pop' },
  { href: '/source-code/', th: 'ซอร์สโค้ด', en: 'Code', detail: 'เว็บไซต์ แดชบอร์ด และเครื่องมือสำหรับนักพัฒนา', keywords: 'source code dev โค้ด ซอร์ส', icon: Code2, fx: 'spin' },
  { href: '/saved/', th: 'บันทึก', en: 'Saved', detail: 'รายการสินค้าที่คุณเก็บไว้', keywords: 'saved bookmark favorite รายการบันทึก', icon: Bookmark, fx: 'drop' },
  { href: '/partners/', th: 'ร่วมขาย', en: 'Partners', detail: 'สมัครและติดตามการร่วมขายสินค้า', keywords: 'partner sell พาร์ทเนอร์ ขาย', icon: Handshake, fx: 'wave' },
  { href: '/account/', th: 'บัญชีของฉัน', en: 'My account', detail: 'โปรไฟล์และข้อมูลสมาชิก', keywords: 'account profile user บัญชี', icon: UserRound },
  { href: '/orders/', th: 'คำสั่งซื้อ', en: 'Orders', detail: 'ตรวจสอบรายการสั่งซื้อของคุณ', keywords: 'orders purchase ซื้อ', icon: ShoppingBag },
  { href: '/support/', th: 'ศูนย์ช่วยเหลือ', en: 'Support', detail: 'คำถามที่พบบ่อยและติดต่อร้าน', keywords: 'support help contact ติดต่อ', icon: CircleHelp },
  { href: '/privacy/', th: 'ความเป็นส่วนตัว', en: 'Privacy', detail: 'นโยบายการใช้ข้อมูลส่วนบุคคล', keywords: 'privacy data policy นโยบาย', icon: ShieldCheck },
  { href: '/terms/', th: 'ข้อกำหนดการใช้งาน', en: 'Terms', detail: 'เงื่อนไขการใช้บริการ kamucode', keywords: 'terms เงื่อนไข', icon: FileText },
  { href: '/security/', th: 'ความปลอดภัย', en: 'Security', detail: 'การดูแลบัญชีและข้อมูลของคุณ', keywords: 'security safe password ปลอดภัย', icon: ShieldCheck },
  { href: '/sitemap/', th: 'แผนผังเว็บไซต์', en: 'Sitemap', detail: 'ดูหน้าทั้งหมดของเว็บไซต์', keywords: 'sitemap map website แมพ', icon: Network },
] as const

function Navigation({ active }: { active: number }) {
  const [locale, setLocale] = React.useState('th')
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState(0)
  const [open, setOpen] = React.useState(false)
  const [shortcut, setShortcut] = React.useState('Ctrl K')
  const dialog = React.useRef<HTMLDialogElement>(null)
  const search = React.useRef<HTMLInputElement>(null)
  const trigger = React.useRef<HTMLButtonElement>(null)
  const navigateTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const th = locale === 'th'
  const text = (a: string, b: string) => th ? a : b
  const results = destinations.filter(d => `${d.th} ${d.en} ${d.detail} ${d.keywords}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))

  const showSearch = React.useCallback(() => {
    if (!dialog.current?.open) { setQuery(''); setSelected(0); dialog.current?.showModal(); setOpen(true); search.current?.focus() }
  }, [])

  React.useEffect(() => {
    try { setLocale(localStorage.getItem('kc-locale') || 'th') } catch {}
    setShortcut(/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K')
    const language = (event: Event) => setLocale((event as CustomEvent<string>).detail)
    const keyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (dialog.current?.open) dialog.current.close(); else showSearch()
      }
    }
    document.addEventListener('kamucode:language', language)
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('kamucode:language', language); document.removeEventListener('keydown', keyboard); clearTimeout(navigateTimer.current) }
  }, [showSearch])

  function follow(event: React.MouseEvent) {
    const anchor = (event.target as HTMLElement).closest('a')
    if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    clearTimeout(navigateTimer.current)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    navigateTimer.current = setTimeout(() => location.assign(anchor.href), reduced ? 0 : 300)
  }

  return <>
    <div className="kc-liquid-slot" onClickCapture={follow}>
      <LiquidNavbar compact={false} sound={false} defaultActive={active} items={destinations.slice(0, 5).map(d => ({ href: d.href, label: th ? d.th : d.en, icon: <d.icon size={18} strokeWidth={1.7} />, fx: 'fx' in d ? d.fx : 'pop' })) as LiquidNavItem[]} />
    </div>
    <button ref={trigger} type="button" className="kc-command-trigger" onClick={showSearch} aria-label={text('ค้นหาหน้าและทางลัด', 'Search pages and shortcuts')} aria-keyshortcuts="Control+k Meta+k" aria-haspopup="dialog" aria-expanded={open} aria-controls="kc-command-dialog">
      <Search size={17} aria-hidden="true" /><span>{text('ไปที่…', 'Go to…')}</span><kbd>{shortcut}</kbd>
    </button>
    <dialog ref={dialog} id="kc-command-dialog" className="kc-command-dialog" aria-labelledby="kc-command-title" onClose={() => { setOpen(false); trigger.current?.focus({ preventScroll: true }) }} onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.currentTarget.close() } }}>
      <div className="kc-command-search"><Search size={20} aria-hidden="true" /><label id="kc-command-title" htmlFor="kc-command-input" className="kc-sr-only">{text('ค้นหาหน้าเว็บ', 'Search pages')}</label>
        <input ref={search} id="kc-command-input" type="text" role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls="kc-command-results" aria-activedescendant={results.length ? `kc-result-${selected}` : undefined} autoComplete="off" placeholder={text('อยากไปหน้าไหน?', 'Where would you like to go?')} value={query} onChange={event => { setQuery(event.target.value); setSelected(0) }} onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); if (results.length) { const next = (selected + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length; setSelected(next); document.getElementById(`kc-result-${next}`)?.scrollIntoView({ block: 'nearest' }) } }
          if (event.key === 'Enter' && results[selected]) { event.preventDefault(); location.assign(results[selected].href) }
        }} />
        <button className="kc-command-close" type="button" aria-label={text('ปิดการค้นหา', 'Close search')} onClick={() => dialog.current?.close()}><X size={17} /></button>
      </div>
      <div className="kc-command-list" role="listbox" id="kc-command-results" aria-label={text('หน้าที่พบ', 'Matching pages')}>
        <p className="kc-command-eyebrow">{text(query ? 'ผลการค้นหา' : 'สำรวจ kamucode', query ? 'RESULTS' : 'EXPLORE KAMUCODE')}</p>
        {results.map((d, index) => <a id={`kc-result-${index}`} key={d.href} href={d.href} role="option" aria-selected={selected === index} onPointerMove={() => setSelected(index)} className="kc-command-result"><span className="kc-command-icon"><d.icon size={19} strokeWidth={1.6} /></span><span><strong>{th ? d.th : d.en}</strong><small>{th ? d.detail : d.href}</small></span><ArrowUpRight size={15} aria-hidden="true" /></a>)}
        {!results.length && <p className="kc-command-empty" role="status">{text('ไม่พบหน้านี้ ลองพิมพ์ชื่อเกมหรือชื่อเมนู', 'No pages found. Try another page name.')}</p>}
      </div>
      <div className="kc-command-footer"><span>↑ ↓ {text('เลือก', 'Select')} <kbd>↵</kbd> {text('เปิดหน้า', 'Open')}</span><span><kbd>esc</kbd> {text('ปิด', 'Close')}</span></div>
    </dialog>
  </>
}

const root = document.getElementById('kc-member-navigation')
if (root && document.body.hasAttribute('data-member-area')) createRoot(root).render(<Navigation active={Number(root.dataset.active ?? -1)} />)
