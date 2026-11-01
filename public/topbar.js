/* Original top bar: brand, language, and a single membership action. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const nav=$('.start-selling-top-nav');if(!nav)return;
nav.classList.add('is-hero-chrome-ready');
const languageButton=$('.start-selling-language-switch',nav),accountButton=$('.start-selling-top-nav-btn',nav);
const memberArea=document.body.hasAttribute('data-member-area');
let member=false,locale='th';try{locale=localStorage.getItem('kc-locale')||'th';}catch{}
const t=(th,en)=>locale==='th'?th:en;
function render(){accountButton.textContent=member?(memberArea?t('บัญชีของฉัน','My account'):t('เข้าหน้าหลัก','Enter store')):t('สมัครใช้งาน','Sign up');$('.start-selling-language-switch__code',nav).textContent=locale.toUpperCase();languageButton.setAttribute('aria-label',t('ภาษา: ไทย','Language: English'));}
const ready=fetch('/api/me',{credentials:'same-origin',cache:'no-store'}).then(r=>r.json()).then(data=>{member=!!data.registered;render();}).catch(()=>{});
$$('[data-signup]').forEach(button=>{button.removeAttribute('aria-hidden');button.removeAttribute('tabindex');button.onclick=async()=>{await ready;location.assign(member?(memberArea?'/account/':'/shop/'):'/signup/');};});
$$('[data-partner]').forEach(button=>button.onclick=async()=>{await ready;location.assign(member?'/partners/':'/signup/?partner=1');});
function closeLanguage(){$('.clone-language-menu',nav)?.remove();nav.classList.remove('has-language-menu');languageButton.setAttribute('aria-expanded','false');}
languageButton.onclick=event=>{event.stopPropagation();if($('.clone-language-menu',nav))return closeLanguage();const menu=document.createElement('div');menu.className='clone-language-menu';menu.id='kc-language-menu';menu.setAttribute('role','listbox');menu.setAttribute('aria-label','ภาษา');menu.innerHTML='<button type="button" role="option" data-lang="th">ไทย <span>TH</span></button><button type="button" role="option" data-lang="en">English <span>EN</span></button>';$('.start-selling-language-switch-wrap',nav).append(menu);nav.classList.add('has-language-menu');languageButton.setAttribute('aria-expanded','true');languageButton.setAttribute('aria-controls',menu.id);$$('button',menu).forEach(button=>{button.setAttribute('aria-selected',String(button.dataset.lang===locale));button.onclick=()=>{locale=button.dataset.lang;try{localStorage.setItem('kc-locale',locale);}catch{}render();document.dispatchEvent(new CustomEvent('kamucode:language',{detail:locale}));closeLanguage();languageButton.focus();};});};
addEventListener('click',closeLanguage);addEventListener('keydown',event=>{if(event.key==='Escape')closeLanguage();});
if(document.body.dataset.page!=='landing')nav.classList.remove('is-hero-pill');
render();
})();
