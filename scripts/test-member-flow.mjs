// Exercises the built Worker with synthetic identities and a disposable D1 database.
import { Miniflare } from 'miniflare';
import { readFile,readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const serverRoot=resolve('dist/server');
const modules=(await readdir(serverRoot,{recursive:true})).filter(n=>/\.m?js$/.test(n)).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:a.localeCompare(b));
const mf=new Miniflare({modules:modules.map(name=>({type:'ESModule',path:resolve(serverRoot,name)})),modulesRoot:serverRoot,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{BETTER_AUTH_SECRET:'disposable-integration-secret-with-at-least-32-characters',BETTER_AUTH_URL:'https://integration.invalid'},cf:false});
try{
 const db=await mf.getD1Database('DB');
 for(const file of (await readdir('drizzle')).filter(n=>n.endsWith('.sql')).sort())for(const statement of (await readFile('drizzle/'+file,'utf8')).split('--> statement-breakpoint'))if(statement.trim())await db.prepare(statement.trim()).run();
 async function request(path,body,who,extra={},method=body===undefined?'GET':'POST'){
  const headers={'content-type':'application/json',origin:'https://integration.invalid','cf-connecting-ip':'192.0.2.10',...extra};
  if(who){headers['oai-authenticated-user-id']='qa-'+who;headers['oai-authenticated-user-email']=who+'@example.invalid';}
  const response=await mf.dispatchFetch('https://integration.invalid'+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});
  const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{data=raw;}
  return {status:response.status,data,headers:response.headers};
 }
 const cookies=result=>result.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 assert.equal((await request('/api/me')).status,401);
 assert.equal((await request('/')).headers.get('location'),'/welcome/','The root URL must open the original landing');
 const canonical=await request('/shop/');assert.equal(canonical.status,308);assert.equal(new URL(canonical.headers.get('location'),'https://integration.invalid').pathname,'/shop');
 const storePaths=['/shop','/games','/source-code','/partners','/account','/saved','/orders','/product/valorant','/shop/index.html'];
 for(const path of storePaths){const guest=await request(path);assert.equal(guest.status,302,path+' must require sign-in');assert.match(guest.headers.get('location'),/\/login\/\?next=/);}
 assert.equal((await request('/shop',undefined,'bob')).headers.get('location'),'https://integration.invalid/login/');
 for(const path of ['/signup','/signup/index.html']){
  const legacy=await request(path);assert.equal(legacy.status,302);assert.equal(legacy.headers.get('location'),'https://integration.invalid/login/');
 }
 assert.equal((await request('/api/register',{displayName:'Anonymous'})).status,401);
 assert.equal((await request('/api/register',{displayName:'A'},'alice')).status,400);
 assert.equal((await request('/api/profile',{displayName:'Not registered'},'bob')).status,403,'Unregistered identities must not receive a successful profile update');
 const registered=await request('/api/register',{displayName:'Alice QA',partnerInterest:true},'alice');
 assert.equal(registered.status,200);assert.equal(registered.data.redirect,'/shop/');
 assert.equal((await request('/home',undefined,'alice')).headers.get('location'),'/shop/');
 assert.equal((await request('/',undefined,'alice')).headers.get('location'),'/welcome/');
 for(const path of storePaths){const store=await request(path,undefined,'alice');assert.equal(store.status,200,path+' must open for a member');assert.equal(store.headers.get('cache-control'),'private, no-store');assert.ok(store.data.includes('start-selling-top-nav')&&!store.data.includes('km-desktop-nav'));}
 assert.ok((await request('/shop',undefined,'alice')).data.includes('kc-member-navigation'));
 assert.equal((await request('/api/interests',{productId:'unknown'},'alice')).status,400);
 for(let i=0;i<2;i++)assert.equal((await request('/api/interests',{productId:'valorant'},'alice')).status,200);
 assert.deepEqual((await request('/api/me',undefined,'alice')).data.interests,['valorant']);
 const application={shopName:'QA Code Studio',category:'source',contact:'test@example.invalid',message:'Disposable integration test only.'};
 assert.equal((await request('/api/partners',{...application,category:'invalid'},'alice')).status,400);
 assert.equal((await request('/api/partners',application,'alice')).data.status,'pending');
 assert.equal((await request('/api/partners',application,'alice')).data.alreadySubmitted,true);
 assert.equal((await request('/api/me',undefined,'bob')).data.registered,false);
 assert.equal((await request('/api/interests',{productId:'valorant'},'bob')).status,403);
 await request('/api/register',{displayName:'Bob QA'},'bob');
 const bob=(await request('/api/me',undefined,'bob')).data;assert.deepEqual(bob.interests,[]);assert.deepEqual(bob.applications,[]);
 assert.equal((await request('/api/register',{displayName:'Blocked'},'alice',{origin:'https://other.invalid'})).status,403);
 assert.equal((await request('/api/profile',{displayName:'Alice Updated'},'alice')).status,200);
 assert.equal((await request('/api/me',undefined,'alice')).data.displayName,'Alice Updated');
 assert.equal((await request('/api/interests',{productId:'valorant'},'bob',{},'DELETE')).status,200);
 assert.deepEqual((await request('/api/me',undefined,'alice')).data.interests,['valorant']);
 const options=(await request('/api/auth-options')).data;assert.equal(options.email,true);assert.equal(options.providers.length,6);assert.ok(options.providers.every(p=>p.enabled===false));
 const pass='Synthetic-test-password-2026!';
 const signup=await request('/api/auth/sign-up/email',{name:'Email QA',email:'email-qa@example.com',password:pass});
 assert.equal(signup.status,200,'Email signup should work in the built Worker');
 const cookie=cookies(signup);assert.match(cookie,/kamucode/);assert.match(signup.headers.get('set-cookie'),/HttpOnly/i);assert.match(signup.headers.get('set-cookie'),/Secure/i);assert.match(signup.headers.get('set-cookie'),/SameSite=Lax/i);
 assert.equal((await request('/api/me',undefined,'alice',{cookie})).data.email,'email-qa@example.com','Email session must take priority over native identity');
 assert.equal((await request('/api/register',{displayName:'Email QA'},undefined,{cookie})).data.redirect,'/shop/');
 await request('/api/interests',{productId:'minecraft'},undefined,{cookie});
 const own=(await request('/api/me',undefined,undefined,{cookie})).data;assert.deepEqual(own.interests,['minecraft']);assert.deepEqual(own.applications,[]);
 const stored=await db.prepare("SELECT password FROM auth_account WHERE provider_id='credential'").first();assert.ok(stored.password&&stored.password!==pass&&!stored.password.includes(pass),'Password must be hashed');
 const ticket={email:'ignored@example.com',category:'privacy',subject:'Disposable help request',message:'Please treat this as an integration test only.'};
 const support=await request('/api/support',ticket,undefined,{cookie});assert.equal(support.status,200);
 const history=(await request('/api/support',undefined,undefined,{cookie})).data.tickets;assert.equal(history.length,1);assert.equal(history[0].email,'email-qa@example.com');
 assert.deepEqual((await request('/api/support',undefined,'bob')).data.tickets,[]);
 const exported=await request('/api/data-export',undefined,undefined,{cookie});assert.equal(exported.status,200);const exportText=JSON.stringify(exported.data);assert.ok(!exportText.includes('password')&&!exportText.includes('Alice Updated')&&!exportText.includes('session_token'));
 assert.equal((await request('/api/auth/sign-in/social',{provider:'google',callbackURL:'https://integration.invalid/auth/complete/'})).status,404);
 assert.equal((await request('/api/auth/sign-up/email',{name:'Blocked',email:'blocked@example.com',password:pass},undefined,{origin:'https://other.invalid'})).status,403);
 const logout=await request('/api/logout',{},undefined,{cookie});assert.equal(logout.status,200);
 assert.equal((await request('/api/me',undefined,undefined,{cookie})).status,401,'Logout must invalidate the server session');
 assert.equal((await request('/shop',undefined,undefined,{cookie})).status,302,'Logged-out visitors must not see the member shortcuts');
 const optedOut=cookies(logout);assert.equal((await request('/api/me',undefined,'alice',{cookie:optedOut})).status,401,'Native identity must not silently restore a signed-out session');
 assert.equal((await request('/api/auth/sign-in/email',{email:'email-qa@example.com',password:'Incorrect-password!'})).status,401);
 const signin=await request('/api/auth/sign-in/email',{email:'email-qa@example.com',password:pass});assert.equal(signin.status,200);assert.equal((await request('/api/me',undefined,undefined,{cookie:cookies(signin)})).data.registered,true);
 const switched=await request('/api/native-session',{},'alice',{cookie:cookies(signin)});assert.equal(switched.status,200);assert.match(switched.headers.get('set-cookie'),/kamucode/);
 assert.equal((await request('/api/me',undefined,undefined,{cookie:cookies(signin)})).status,401,'Switching to native identity must invalidate the previous email session');
 assert.equal((await request('/api/support')).status,401);
 assert.equal((await request('/api/support',{...ticket,email:'invalid'})).status,400);
 for(let i=0;i<5;i++)assert.equal((await request('/api/support',{...ticket,email:'guest@example.com'})).status,200);
 assert.equal((await request('/api/support',{...ticket,email:'guest@example.com'})).status,429);
 assert.equal((await request('/api/native-session',{},'alice',{cookie:'kc_signed_out=1'})).status,200);
 console.log('Passed: native and email signup → store, login/logout, password hashing, secure cookies, provider availability, profile edits, saved items, partners, support limits, exports, user isolation, and cross-origin guards.');
}finally{await mf.dispose();}
