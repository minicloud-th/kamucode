// Real built Worker + disposable D1. No production users, inventory or payments.
import {Miniflare} from 'miniflare';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {safeNextPath} from '../lib/navigation.ts';
import {hashPassword} from 'better-auth/crypto';
const root=resolve('dist/server');
const modules=(await readdir(root,{recursive:true})).filter(n=>/\.m?js$/.test(n)).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:a.localeCompare(b));
const mf=new Miniflare({modules:modules.map(name=>({type:'ESModule',path:resolve(root,name)})),modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{BETTER_AUTH_SECRET:'disposable-integration-secret-at-least-32-characters',BETTER_AUTH_URL:'https://integration.invalid',ADMIN_USER_IDS:'qa-owner'},cf:false});
let count=0;const eq=(a,b,msg)=>{count++;assert.equal(a,b,msg);};
try{
 const db=await mf.getD1Database('DB');
 for(const f of (await readdir('drizzle')).filter(n=>n.endsWith('.sql')).sort())for(const s of (await readFile('drizzle/'+f,'utf8')).split('--> statement-breakpoint'))if(s.trim())await db.prepare(s.trim()).run();
 async function req(path,body,who,extra={},method=body===undefined?'GET':'POST'){
 const headers={'Content-Type':'application/json',origin:'https://integration.invalid','cf-connecting-ip':'192.0.2.10',...extra};
 if(who){headers['oai-authenticated-user-id']='qa-'+who;headers['oai-authenticated-user-email']=who+'@example.invalid';}
 for(const key of Object.keys(headers))if(headers[key]===null)delete headers[key];
 const r=await mf.dispatchFetch('https://integration.invalid'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});const raw=await r.text();let data;try{data=JSON.parse(raw);}catch{data=raw;}return {status:r.status,data,headers:r.headers};
 }
 const cookies=r=>r.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 const post=(path,b,who='alice')=>req('/api/store/'+path,b,who);
 eq((await req('/api/me')).status,401);
 const publicPages=['/','/welcome','/login','/support','/faq','/about','/contact','/how-it-works','/showcase','/privacy','/terms','/security','/sitemap','/forgot-password','/reset-password'];
 for(const p of publicPages){const r=await req(p);eq(r.status,200,p+' must render');assert.match(r.data,/<main/);assert.ok(!r.data.includes('fastwork-Bold'));}
 const landing=await req('/');assert.match(landing.data,/classic-hero/);assert.match(landing.data,/มีของดีในมือ/);assert.match(landing.data,/ความเป็นไปได้ใหม่/);assert.match(landing.data,/hero-film/);assert.match(landing.data,/เล่นให้สุด สร้างให้ไกล/);assert.match(landing.data,/assets\/landing\/valorant.webp/);assert.match(landing.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.match(landing.data,/<script[^>]+nonce="[^"]+"/);eq(landing.headers.get('x-frame-options'),'DENY');eq(landing.headers.get('cache-control'),'private, no-store');
 eq((await req('/missing-page')).status,404);eq((await req('/constructor')).status,404);eq((await req('/admin',undefined,'alice')).status,404);
 const privatePages=['/shop','/games','/source-code','/collections','/saved','/cart','/checkout','/orders','/downloads','/notifications','/partners','/partners/apply','/partners/dashboard','/account','/account/security','/support/tickets','/product/valorant'];
 for(const p of privatePages){const guest=await req(p);assert.ok([302,307].includes(guest.status),p+' is private');assert.match(guest.headers.get('location'),/login\?next=/);eq((await req(p,undefined,'alice')).status,200,p+' must render for members');}
 for(const p of ['/admin','/admin/products','/admin/orders','/admin/support','/admin/partners','/admin/settings'])eq((await req(p,undefined,'owner')).status,200,p);
 for(const p of ['/signup','/shop/index.html','/welcome.html'])assert.ok([302,307,308].includes((await req(p)).status));
 for(const target of ['https://evil.invalid','//evil.invalid','/\\evil.invalid','/api/auth/sign-out','/login'])eq(safeNextPath(target),'/shop');eq(safeNextPath('/orders/abc-123'),'/orders/abc-123');
 const me=(await req('/api/me',undefined,'alice')).data;eq(me.registered,true);eq(me.admin,false);eq((await req('/api/me',undefined,'owner')).data.admin,true);
 eq((await req('/api/me',undefined,'alice',{cookie:'something=kamucode; not_kc_signed_out=1'})).status,200,'Unrelated cookies cannot shadow a native session');
 eq((await req('/api/me',undefined,'alice',{cookie:'kc_signed_out=1'})).status,401);
 eq((await req('/api/me',undefined,'alice',{cookie:'kamucode.session_token=invalid'})).status,401,'Invalid app session cannot fall back to native identity');
 eq((await req('/api/me',undefined,undefined,{'oai-authenticated-user-id':'auth:owner','oai-authenticated-user-email':'owner@example.invalid'})).status,401);
 eq((await req('/api/profile',{displayName:'Updated'},'alice',{origin:null})).status,403);
 eq((await req('/api/profile',{displayName:'Updated'},'alice',{origin:'https://other.invalid'})).status,403);
 eq((await req('/api/profile',{displayName:'x'.repeat(17000)},'alice')).status,413,'Actual streamed bytes must be bounded even without content-length');
 eq((await post('profile',{displayName:'Alice Updated'})).status,200);eq((await req('/api/me',undefined,'alice')).data.displayName,'Alice Updated');
 eq((await post('saved',{productId:'valorant'})).status,200);eq((await post('saved',{productId:'unknown'})).status,404);assert.deepEqual((await req('/api/me',undefined,'alice')).data.interests,['valorant']);assert.deepEqual((await req('/api/me',undefined,'bob')).data.interests,[]);
 eq((await post('cart',{productId:'valorant'})).status,409,'Demo cannot be sold');
 eq((await post('admin/products',{})).status,403,'Server admin guard');
 const partner={shopName:'Disposable QA',category:'source',contact:'qa@example.invalid',message:'Testing partner review in isolated D1.'};
 const applications=await Promise.all([post('partners',partner),post('partners',partner)]);assert.ok(applications.some(r=>r.status===200));eq((await db.prepare("SELECT COUNT(*) n FROM partner_requests WHERE user_id='qa-alice' AND status='pending'").first()).n,1);
 const app=(await post('partners',partner)).data;eq(app.alreadySubmitted,true);eq((await post('admin/partners',{id:app.id,status:'approved'},'owner')).status,200);eq((await req('/api/store/partners',undefined,'alice')).data.applications[0].status,'approved');
 const support={email:'qa@example.invalid',category:'general',subject:'Disposable QA request',message:'This is a test ticket in a disposable database.'};
 const ticket=await post('support',support);eq(ticket.status,200);eq((await req('/api/store/ticket?id='+ticket.data.id,undefined,'bob')).status,404);eq((await req('/support/tickets/'+ticket.data.id,undefined,'bob')).status,404);
 eq((await post('admin/support',{id:ticket.data.id,message:'QA reply persisted.',status:'closed'},'owner')).status,200);eq((await req('/api/store/ticket?id='+ticket.data.id,undefined,'alice')).data.replies[0].message,'QA reply persisted.');
 for(let i=0;i<5;i++)eq((await req('/api/store/support',{...support,email:'guest@example.invalid'})).status,200);eq((await req('/api/store/support',{...support,email:'guest@example.invalid'})).status,429);
 const avatarHeaders={origin:'https://integration.invalid','content-type':'image/png','oai-authenticated-user-id':'qa-alice','oai-authenticated-user-email':'alice@example.invalid'};
 const png=Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cANkAAAAASUVORK5CYII=','base64'));
 eq((await mf.dispatchFetch('https://integration.invalid/api/avatar',{method:'POST',headers:avatarHeaders,body:png})).status,200);eq((await req('/api/avatar',undefined,'alice')).status,200);eq((await req('/api/avatar',undefined,'bob')).status,404);assert.match((await req('/api/me',undefined,'alice')).data.avatarUrl,/api\/avatar/);
 eq((await mf.dispatchFetch('https://integration.invalid/api/avatar',{method:'POST',headers:avatarHeaders,body:new Uint8Array([1,2,3])})).status,415);
 const prod={id:'qa-product',name:'Disposable product',kind:'source',tag:'QA only',description:'Disposable synthetic product, never production.',priceCents:12500,demo:false,published:true};
 eq((await post('admin/products',prod,'owner')).status,200);
 eq((await post('admin/inventory',{productId:prod.id,delivery:'PRIVATE DELIVERY — QA LICENSE'},'owner')).status,200);
 const cipher=(await db.prepare('SELECT delivery_cipher FROM store_inventory WHERE product_id=?').bind(prod.id).first()).delivery_cipher;assert.ok(!cipher.includes('PRIVATE DELIVERY'));
 eq((await post('orders/create',{productId:prod.id})).status,503,'Payments must be configured');
 eq((await post('admin/settings',{paymentInstructions:'QA bank instructions only. No payment is sent.',contactEmail:'',contactLine:''},'owner')).status,200);
 eq((await post('cart',{productId:prod.id},'alice')).status,200);eq((await req('/api/store/cart',undefined,'alice')).data.items.length,1);
 const race=await Promise.all([post('orders/create',{productId:prod.id,priceCents:1},'alice'),post('orders/create',{productId:prod.id},'bob')]);eq(race.filter(r=>r.status===201).length,1,'Only one buyer reserves the last item');eq(race.filter(r=>r.status===409).length,1);
 const index=race.findIndex(r=>r.status===201),buyer=index===0?'alice':'bob',other=index===0?'bob':'alice',orderId=race[index].data.id;
 let order=(await req('/api/store/order?id='+orderId,undefined,buyer)).data.order;eq(order.price_cents,12500,'Ignore client price');eq(order.delivery,undefined,'Pending cannot read delivery');
 eq((await req('/api/store/order?id='+orderId,undefined,other)).status,404);eq((await req('/orders/'+orderId,undefined,other)).status,404);
 eq((await post('admin/orders',{id:orderId,status:'paid'},'owner')).status,200);eq((await post('admin/orders',{id:orderId,status:'paid'},'owner')).status,409);order=(await req('/api/store/order?id='+orderId,undefined,buyer)).data.order;eq(order.delivery,'PRIVATE DELIVERY — QA LICENSE');eq((await post('orders/cancel',{id:orderId},buyer)).status,409,'Delivered order cannot be cancelled');eq((await req('/orders/'+orderId,undefined,buyer)).status,200);
 await post('admin/inventory',{productId:prod.id,delivery:'SECOND DISPOSABLE DELIVERY'},'owner');const pending=await post('orders/create',{productId:prod.id},'alice');eq(pending.status,201);eq((await post('orders/cancel',{id:pending.data.id},'bob')).status,409);eq((await post('orders/cancel',{id:pending.data.id},'alice')).status,200);eq((await req('/api/store/catalog')).data.products.find(p=>p.id===prod.id).stock,1);
 assert.ok((await req('/api/store/notifications',undefined,buyer)).data.items.length>0);await post('notifications/read',{},buyer);eq((await req('/api/me',undefined,buyer)).data.unread,0);
 const pass='Disposable-password-for-tests-only!';const now=Date.now();await db.prepare('INSERT INTO auth_user (id,name,email,email_verified,created_at,updated_at) VALUES (?,?,?,1,?,?)').bind('email-qa','Email QA','email-qa@example.com',now,now).run();await db.prepare('INSERT INTO auth_account (id,account_id,provider_id,user_id,password,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').bind('email-account','email-qa','credential','email-qa',await hashPassword(pass),now,now).run();
 const disabled=await req('/api/auth/sign-up/email',{email:'new@example.com',name:'No Signup',password:pass});assert.notEqual(disabled.status,200);eq(await db.prepare("SELECT id FROM auth_user WHERE email='new@example.com'").first(),null);
 const login=await req('/api/auth/sign-in/email',{email:'email-qa@example.com',password:pass});eq(login.status,200,'Existing email accounts still sign in');const cookie=cookies(login);assert.match(cookie,/kamucode.session_token/);assert.match(login.headers.get('set-cookie'),/HttpOnly/);assert.match(login.headers.get('set-cookie'),/Secure/);eq((await req('/api/me',undefined,'alice',{cookie})).data.email,'email-qa@example.com');
 const out=await req('/api/logout',{},undefined,{cookie});eq(out.status,200);eq((await req('/api/me',undefined,undefined,{cookie})).status,401);eq((await req('/api/me',undefined,'alice',{cookie:cookies(out)})).status,401);
 const exported=await req('/api/data-export',undefined,'alice');eq(exported.status,200);assert.ok(!JSON.stringify(exported.data).includes('delivery_cipher'));assert.ok(!JSON.stringify(exported.data).includes('password'));
 console.log(`Passed ${count} assertions: 38+ SSR routes, real 404, CSP nonce, auth/cookie isolation, disabled signup, validation, concurrent reservations, encrypted paid delivery, support/admin/partner workflows, ownership and data export.`);
}finally{await mf.dispose();}
