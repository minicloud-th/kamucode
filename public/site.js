/* kamucode: each page has its own URL; forms write to the store's database. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const page=document.body.dataset.page,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
let account=null,catalog=[],filter='all';
function toast(message){const n=$('.km-toast');if(!n)return;n.textContent=message;n.classList.add('is-visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>n.classList.remove('is-visible'),3500);}
async function api(path,body,method=body===undefined?'GET':'POST'){
 const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await response.json().catch(()=>({error:'ระบบยังไม่พร้อม กรุณาลองอีกครั้ง'}));
 return {...data,ok:response.ok,status:response.status};
}
const sessionReady=api('/api/me').then(data=>{account={...data,unavailable:data.status>=500};renderSession();return account;}).catch(()=>{account={authenticated:false,registered:false,unavailable:true};renderSession();return account;});
const catalogReady=fetch('/catalog.json').then(r=>r.json()).then(data=>{catalog=data;return data;}).catch(()=>[]);
function statusName(s){return ({pending:'รอการพิจารณา',approved:'อนุมัติแล้ว',rejected:'ไม่ผ่านการพิจารณา',open:'บันทึกเรื่องแล้ว',closed:'ปิดเรื่องแล้ว'})[s]||s;}
function applicationRows(){return (account?.applications||[]).map(a=>`<div class="km-application-row"><span>${esc(a.shopName)}</span><span class="km-status">${esc(statusName(a.status))}</span></div>`).join('');}
function renderSession(){
 const member=account?.registered;
 $$('[data-member-only]').forEach(node=>node.hidden=!member);
 $$('[data-session-link]').forEach(link=>{link.href=member?'/account/':'/login/';$('span',link).textContent=member?account.displayName:'เข้าสู่ระบบ';link.setAttribute('aria-label',member?'บัญชีของฉัน':'เข้าสู่ระบบ');});
 $$('.km-auth-required:not([data-partner-gate])').forEach(n=>n.hidden=!!member);
 $$('[data-private-content]').forEach(n=>n.hidden=!member);
 $$('[data-display-name]').forEach(n=>n.textContent=account?.displayName||'');
 $$('[data-email]').forEach(n=>n.textContent=account?.email||'');
 if($('#profile-name'))$('#profile-name').value=account?.displayName||'';
 if($('#profile-email'))$('#profile-email').value=account?.email||'';
 if($('[data-email-status]'))$('[data-email-status]').textContent=account?.emailVerified?'ยืนยันอีเมลผ่านผู้ให้บริการแล้ว':'อีเมลนี้ยังไม่ได้ยืนยัน ร้านยังไม่ได้เปิดบริการส่งอีเมลยืนยัน';
 if($('[data-avatar]'))$('[data-avatar]').textContent=(account?.displayName||'KC').slice(0,2).toUpperCase();
 if($('[data-partner-status]'))$('[data-partner-status]').innerHTML=applicationRows()||'<p>ยังไม่มีใบสมัครพาร์ทเนอร์</p>';
 if($('#support-email')&&member){$('#support-email').value=account.email;$('#support-email').readOnly=true;}
 if(page==='saved')renderSaved();
 if(page==='partners')renderPartner();
 $$('[data-save-product]').forEach(button=>{const saved=account?.interests?.includes(button.dataset.saveProduct);button.disabled=!!saved;if(saved)button.textContent='บันทึกไว้แล้ว ✓';});
 if(member&&page==='support')loadTickets();
 if(account?.unavailable&&['account','saved','orders','partners'].includes(page))toast('เชื่อมต่อบัญชีไม่สำเร็จ กรุณาโหลดหน้าอีกครั้ง');
}
function renderSaved(){
 const ids=new Set(account?.interests||[]);let count=0;
 $$('[data-saved-grid] .km-product').forEach(card=>{const saved=ids.has(card.dataset.productId);card.hidden=!saved;if(saved)count++;});
 if($('[data-saved-empty]'))$('[data-saved-empty]').hidden=count>0;
 if($('[data-saved-grid]'))$('[data-saved-grid]').hidden=count===0;
}
function renderPartner(){
 const pending=account?.applications?.find(a=>a.status==='pending');
 $('[data-partner-gate]').hidden=!!account?.registered;
 $('[data-partner-form]').hidden=!account?.registered||!!pending;
 const existing=$('[data-existing-application]');existing.hidden=!pending;
 if(pending)existing.innerHTML='<div class="km-auth-required"><h2>ได้รับใบสมัครแล้ว</h2><p>ร้าน '+esc(pending.shopName)+' อยู่ระหว่างรอการพิจารณา ติดตามสถานะได้ในบัญชีของคุณ</p><a class="km-button" href="/account/">ดูบัญชีของฉัน →</a></div>';
}
// Native dialog supplies focus management and Escape support on small screens.
const menu=$('#km-menu'),menuButton=$('.km-menu-button');
if(menu&&menuButton){menuButton.onclick=()=>{menu.showModal();menuButton.setAttribute('aria-expanded','true');};$('[data-close-menu]',menu).onclick=()=>menu.close();menu.addEventListener('close',()=>{menuButton.setAttribute('aria-expanded','false');menuButton.focus({preventScroll:true});});menu.addEventListener('click',event=>{if(event.target===menu&&event.clientX<menu.getBoundingClientRect().left)menu.close();});}
$$('[data-go-signup]').forEach(button=>{button.removeAttribute('aria-hidden');button.removeAttribute('tabindex');button.onclick=()=>location.assign('/signup/');});
$$('.orbit-card[data-product]').forEach(card=>{card.setAttribute('role','link');card.setAttribute('tabindex','0');card.setAttribute('aria-label','ดูรายละเอียด '+(card.dataset.product||''));card.onclick=()=>location.assign('/product/'+encodeURIComponent(card.dataset.product)+'/');card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}};});
// A single reveal per section, followed by ordinary scrolling.
if(!reduced&&'IntersectionObserver'in window){document.body.classList.add('km-motion-ready');const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}});},{threshold:.07});$$('.km-catalog,.km-partner-strip,.km-source-feature,.km-banner').forEach((n,i)=>{n.dataset.reveal='';n.style.setProperty('--km-delay',Math.min(i,2)*45+'ms');observer.observe(n);});}
const hero=$('.hero'),orbit=$('.orbit');
if(hero&&orbit){
 hero.classList.remove('is-preparing');orbit.classList.remove('is-preparing');
 const finish=()=>{orbit.classList.add('is-splash-done');hero.classList.add('is-ring-splash-done');};
 if(reduced||innerWidth<=600)finish();else{const start=performance.now(),stage=$('.orbit-stage'),cards=$$('.orbit-stage-3d>.orbit-card');function spin(now){const elapsed=now-start,phase=clamp(elapsed/1180);if(elapsed>=1130)orbit.classList.add('is-expanding');cards.forEach((card,i)=>{const a=i/cards.length*Math.PI*2-Math.PI*.5+phase*Math.PI*1.2;card.style.setProperty('--orbit-enter-x',`${stage.clientWidth/2+Math.cos(a)*210-card.offsetLeft-card.offsetWidth/2}px`);card.style.setProperty('--orbit-enter-y',`${stage.clientHeight/2+Math.sin(a)*151-card.offsetTop-card.offsetHeight/2}px`);card.style.setProperty('--orbit-start-rot',`${Math.cos(a)*35}deg`);});if(elapsed<1800)requestAnimationFrame(spin);else finish();}requestAnimationFrame(spin);}
 $('.scroll-cue').onclick=()=>$('#explore').scrollIntoView({behavior:reduced?'instant':'smooth'});
 if(!reduced){let ticking=false;function update(){const progress=clamp(scrollY/(innerHeight*.8));hero.style.setProperty('--hero-scroll',progress);$('.hero-copy').style.opacity=String(1-clamp(progress*1.6));$('.hero-copy').style.filter=`blur(${progress*8}px)`;hero.style.setProperty('--orbit-scroll',progress);ticking=false;}addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(update);ticking=true;}},{passive:true});update();}
}
// Catalogue search and category controls operate on the cards already in HTML.
function filterCatalog(){
 const section=$('.km-catalog');if(!section)return;const query=($('input[type=search]',section)?.value||'').trim().toLocaleLowerCase('th');let count=0;
 $$('.km-product',section).forEach(card=>{const item=catalog.find(p=>p.id===card.dataset.productId),text=(item?[item.name,item.tag,item.description].join(' '):card.textContent).toLocaleLowerCase('th');const visible=(filter==='all'||card.dataset.kind===filter)&&(!query||text.includes(query));card.hidden=!visible;if(visible)count++;});
 const result=$('[data-result-count]',section);if(result)result.textContent=count+' คอลเลกชัน';const empty=$('.km-empty-search',section);if(empty)empty.hidden=count!==0;
}
$$('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;$$('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});filterCatalog();});
$$('.km-search input').forEach(input=>input.addEventListener('input',filterCatalog));catalogReady.then(filterCatalog);
function formMessage(form,message,success=false){const n=$('.km-form-message',form);n.textContent=message;n.classList.toggle('is-success',success);}
function busy(form,state){const button=$('button[type=submit]',form);button.disabled=state;button.setAttribute('aria-busy',String(state));}
function bindForm(id,handler){const form=$(id);if(!form)return;form.addEventListener('submit',async event=>{event.preventDefault();if(!form.reportValidity())return;busy(form,true);formMessage(form,'');try{await handler(form);}catch{formMessage(form,'เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง');}finally{busy(form,false);}});}
async function finishRegistration(name){let me=await api('/api/me');if(!me.authenticated)throw new Error('No session');if(!me.registered){const result=await api('/api/register',{displayName:((name||me.displayName||'').trim().length>=2?(name||me.displayName).trim().slice(0,60):'สมาชิก kamucode'),partnerInterest:new URLSearchParams(location.search).has('partner')});if(!result.ok)throw new Error('Registration failed');}location.replace('/shop/');}
bindForm('#auth-form',async form=>{
 const signup=form.dataset.mode==='signup',body={email:$('#auth-email').value.trim(),password:$('#auth-password').value};if(signup)body.name=$('#auth-name').value.trim();
 const result=await api('/api/auth/'+(signup?'sign-up/email':'sign-in/email'),body);
 if(!result.ok){const message=result.status===429?'ลองหลายครั้งเกินไป กรุณารอสักครู่':signup?(result.code==='USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'?'อีเมลนี้มีบัญชีแล้ว กรุณาเข้าสู่ระบบ':'สร้างบัญชีไม่สำเร็จ ตรวจสอบอีเมลและรหัสผ่าน หรือลองเข้าสู่ระบบหากเคยสมัครแล้ว'):'อีเมลหรือรหัสผ่านไม่ถูกต้อง';formMessage(form,message);return;}
 formMessage(form,'กำลังพาเข้าหน้าหลัก…',true);await finishRegistration(signup?body.name:undefined);
});
if($('#auth-form')){
 api('/api/auth-options').then(options=>{
  if(!options.email){const form=$('#auth-form');$('button[type=submit]',form).disabled=true;formMessage(form,'ระบบสมัครด้วยอีเมลยังไม่พร้อม กรุณาลองใหม่ภายหลัง');}
  (options.providers||[]).forEach(provider=>{const button=$(`[data-social="${provider.id}"]`);if(!button)return;button.disabled=!provider.enabled;button.title=provider.enabled?'ดำเนินการต่อด้วย '+provider.name:'ร้านยังไม่ได้เชื่อมต่อ '+provider.name;$('[data-provider-state]',button).hidden=provider.enabled;});
 }).catch(()=>{formMessage($('#auth-form'),'ตรวจสอบการเชื่อมต่อไม่สำเร็จ กรุณาลองโหลดหน้าใหม่');});
 $$('[data-social]').forEach(button=>button.addEventListener('click',async()=>{if(button.disabled)return;button.disabled=true;try{const result=await api('/api/auth/sign-in/social',{provider:button.dataset.social,callbackURL:location.origin+'/auth/complete/',errorCallbackURL:location.origin+'/login/'});if(!result.ok||!result.url){formMessage($('#auth-form'),'เชื่อมต่อผู้ให้บริการไม่สำเร็จ กรุณาลองอีกครั้ง');return;}const dest=new URL(result.url);if(!['https:','http:'].includes(dest.protocol))throw new Error('Invalid redirect');location.assign(dest.href);}catch{formMessage($('#auth-form'),'เชื่อมต่อผู้ให้บริการไม่สำเร็จ กรุณาลองอีกครั้ง');}finally{button.disabled=false;}}));
 const toggle=$('[data-toggle-password]');toggle.onclick=()=>{const field=$('#auth-password'),show=field.type==='password';field.type=show?'text':'password';toggle.setAttribute('aria-label',show?'ซ่อนรหัสผ่าน':'แสดงรหัสผ่าน');toggle.setAttribute('aria-pressed',String(show));};
 if(new URLSearchParams(location.search).has('error'))formMessage($('#auth-form'),'เข้าสู่ระบบผ่านผู้ให้บริการไม่สำเร็จ ลองอีกครั้งหรือใช้อีเมล');
}
if(page==='auth-native'||page==='auth-complete'){
 (async()=>{try{if(page==='auth-native'){const result=await api('/api/native-session',{});if(!result.ok)throw new Error('Native session unavailable');location.replace('/shop/');}else await finishRegistration();}catch{$('.km-loader').hidden=true;$('[data-auth-result]').textContent='ยังเข้าสู่ระบบไม่สำเร็จ กรุณากลับไปลองอีกครั้ง';$('[data-auth-retry]').hidden=false;}})();
}
$$('[data-logout]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{const result=await api('/api/logout',{});if(result.ok)location.assign('/login/');else toast('ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง');}catch{toast('เชื่อมต่อไม่สำเร็จ');}finally{button.disabled=false;}});
bindForm('#profile-form',async form=>{const result=await api('/api/profile',{displayName:$('#profile-name').value.trim()});if(!result.ok){formMessage(form,result.error||'บันทึกไม่สำเร็จ');return;}account.displayName=$('#profile-name').value.trim();renderSession();formMessage(form,'บันทึกข้อมูลแล้ว',true);});
$$('[data-save-product]').forEach(button=>button.onclick=async()=>{await sessionReady;if(!account?.registered){location.assign('/login/');return;}button.disabled=true;try{const id=button.dataset.saveProduct,result=await api('/api/interests',{productId:id});if(!result.ok){toast(result.error||'บันทึกไม่สำเร็จ');button.disabled=false;return;}account.interests=[...new Set([...(account.interests||[]),id])];button.textContent='บันทึกไว้แล้ว ✓';toast('บันทึกแล้ว ดูได้ในรายการบันทึก');}catch{button.disabled=false;toast('เชื่อมต่อไม่สำเร็จ กรุณาลองอีกครั้ง');}});
$$('[data-remove-save]').forEach(button=>button.onclick=async()=>{button.disabled=true;try{const id=button.dataset.removeSave,result=await api('/api/interests',{productId:id},'DELETE');if(!result.ok){toast(result.error||'นำออกไม่สำเร็จ');return;}account.interests=account.interests.filter(x=>x!==id);renderSaved();toast('นำออกจากรายการบันทึกแล้ว');}catch{toast('เชื่อมต่อไม่สำเร็จ');}finally{button.disabled=false;}});
bindForm('#partner-form',async form=>{const body={shopName:$('#partner-shop').value.trim(),category:$('#partner-category').value,contact:$('#partner-contact').value.trim(),message:$('#partner-message').value.trim()},result=await api('/api/partners',body);if(!result.ok){formMessage(form,result.error||'ส่งใบสมัครไม่สำเร็จ');return;}account.applications=[...(account.applications||[]),{shopName:body.shopName,status:'pending'}];renderPartner();toast('บันทึกใบสมัครแล้ว');});
async function loadTickets(){try{const result=await api('/api/support');const target=$('[data-support-history]');if(!result.ok||!target)return;target.innerHTML=result.tickets?.length?result.tickets.map(t=>`<div class="km-ticket"><strong>${esc(t.subject)}</strong><p>${esc(statusName(t.status))} · ${new Date(t.createdAt).toLocaleDateString('th-TH')}</p></div>`).join(''):'<p>ยังไม่มีเรื่องติดต่อในบัญชีนี้</p>';}catch{/* The contact form remains usable if history is temporarily unavailable. */}}
if($('#support-category')){const topic=new URLSearchParams(location.search).get('topic');if(['general','partner','privacy','security'].includes(topic))$('#support-category').value=topic;}
bindForm('#support-form',async form=>{const result=await api('/api/support',{email:$('#support-email').value.trim(),category:$('#support-category').value,subject:$('#support-subject').value.trim(),message:$('#support-message').value.trim()});if(!result.ok){formMessage(form,result.error||'บันทึกเรื่องไม่สำเร็จ');return;}formMessage(form,'บันทึกเรื่องแล้ว เลขอ้างอิง '+result.id.slice(0,8),true);$('#support-subject').value='';$('#support-message').value='';if(account?.registered)loadTickets();});
})();
