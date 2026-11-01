/* The original motion landing; membership routes live after sign-in. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,nav=$('.start-selling-top-nav');
let catalog=[],collectionIndex=0,collectionLocked=false,locale='th';
try{locale=localStorage.getItem('kc-locale')||'th';}catch{}
const t=(th,en)=>locale==='th'?th:en;
function productDetail(id){location.assign('/product/'+encodeURIComponent(id)+'/');}
$$('[data-product]').forEach(n=>{n.onclick=()=>productDetail(n.dataset.product);n.onkeydown=e=>{if(n.tagName!=='BUTTON'&&(e.key==='Enter'||e.key===' ')){e.preventDefault();n.click();}};});
fetch('/catalog.json').then(r=>r.json()).then(data=>{catalog=data;showCollection(0);}).catch(()=>{});
function applyLanguage(){
document.documentElement.lang=locale;
const pairs=[['.heading-line','เล่นให้สุด สร้างให้ไกล','Play more. Build more.'],['.hero-title>span','เริ่มที่','Start with'],['.hero-copy-main>p','ไอดีเกม ซอร์สโค้ด และโอกาสเติบโตของพาร์ทเนอร์ รวมไว้ในที่เดียว','Game accounts, source code, and your next opportunity. All in one place.'],['.scroll-label','เลื่อนดูคอลเลกชัน','Explore the collection']];
pairs.forEach(([s,th,en])=>{const n=$(s);if(n)n.textContent=t(th,en);});
if(catalog.length)showCollection(collectionIndex);
}
document.addEventListener('kamucode:language',event=>{locale=event.detail;applyLanguage();});
applyLanguage();
// Landing opening: orbit to floating product cards, followed by a scroll blur.
const hero=$('.hero'),orbit=$('.orbit');
if(hero){hero.classList.remove('is-preparing');orbit.classList.remove('is-preparing');const finish=()=>{orbit.classList.add('is-splash-done');hero.classList.add('is-ring-splash-done');};if(reduced||innerWidth<=600)finish();else{const start=performance.now(),stage=$('.orbit-stage'),cards=$$('.orbit-stage-3d>.orbit-card');function spin(now){const elapsed=now-start,phase=clamp(elapsed/1180);if(elapsed>=1130)orbit.classList.add('is-expanding');cards.forEach((card,i)=>{const a=i/cards.length*Math.PI*2-Math.PI*.5+phase*Math.PI*1.2;card.style.setProperty('--orbit-enter-x',`${stage.clientWidth/2+Math.cos(a)*210-card.offsetLeft-card.offsetWidth/2}px`);card.style.setProperty('--orbit-enter-y',`${stage.clientHeight/2+Math.sin(a)*151-card.offsetTop-card.offsetHeight/2}px`);card.style.setProperty('--orbit-start-rot',`${Math.cos(a)*35}deg`);});if(elapsed<1800)requestAnimationFrame(spin);else finish();}requestAnimationFrame(spin);}
$('.scroll-cue').onclick=()=>$('#collections').scrollIntoView({behavior:reduced?'instant':'smooth'});}
function showCollection(index){if(!catalog.length)return;collectionIndex=index;const item=catalog[[0,1,2,3,4,5][index]],panel=$('#collection-panel');if(!panel)return;
$$('[data-collection]').forEach((n,i)=>n.setAttribute('aria-selected',String(i===index)));
panel.innerHTML=`<div class="kc-collection-inner"><div class="kc-collection-visual"><img src="${esc(item.image)}" alt="${esc(item.name)}"><span>${item.kind==='game'?'PLAY YOUR NEXT CHAPTER':'BUILD SOMETHING YOURS'}</span><h3>${index===4?'Source Code':index===5?'Developer Tools':esc(item.name)}</h3></div><div class="kc-collection-content"><div><small>${esc(item.tag)}</small><p>${esc(item.description)}</p></div><button class="kc-round-link" type="button" aria-label="${t('ดูรายละเอียด','View details')} ${esc(item.name)}">↗</button></div><div class="kc-collection-meta"><span>${t('คอลเลกชันตัวอย่าง','Collection preview')}</span><span>kamucode · ${item.kind==='game'?'play.':'build.'}</span></div></div>`;$('.kc-round-link',panel).onclick=()=>productDetail(item.id);}
$$('[data-collection]').forEach((button,index)=>{button.onclick=()=>{collectionLocked=true;showCollection(index);};button.onkeydown=e=>{if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();const next=$$('[data-collection]')[(index+1)%6];next.focus();next.click();}if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();const next=$$('[data-collection]')[(index+5)%6];next.focus();next.click();}};});
$('.kc-collection-pin')?.addEventListener('focusin',()=>collectionLocked=true);
addEventListener('wheel',()=>collectionLocked=false,{passive:true});addEventListener('touchmove',()=>collectionLocked=false,{passive:true});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.12});$$('.kc-reveal').forEach(n=>observer.observe(n));
let queued=false;function onScroll(){queued=false;const vh=innerHeight;if(hero){const p=clamp(scrollY/(vh*.95));hero.style.setProperty('--exit-opacity',String(1-p));hero.style.pointerEvents=p>.97?'none':'';nav.classList.toggle('is-hero-pill',scrollY<vh*.35);const track=$('.kc-collection-track');if(track&&innerWidth>860&&!reduced&&!collectionLocked){const progress=clamp((110-track.getBoundingClientRect().top)/(track.offsetHeight-vh));const i=Math.min(5,Math.floor(progress*6));if(i!==collectionIndex)showCollection(i);}}else nav.classList.remove('is-hero-pill');
const dark=$$('.kc-partner,.kc-closing').some(n=>{const r=n.getBoundingClientRect();return r.top<70&&r.bottom>70;});nav.classList.toggle('is-on-dark',dark);}
addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(onScroll);}},{passive:true});addEventListener('resize',onScroll,{passive:true});onScroll();

})();
