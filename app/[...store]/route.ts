/// <reference types="vite/client" />
import { eq } from 'drizzle-orm';
import { getStoreUser } from '@/lib/store-user';
import { getDb } from '@/db';
import { members } from '@/db/schema';

// These documents are bundled into the Worker, never exposed as public assets.
const documents=import.meta.glob('../../generated/store-pages/**/index.html',{eager:true,query:'?raw',import:'default'}) as unknown as Record<string,string>;
const pages=new Map(Object.entries(documents).map(([path,html])=>[path.replace('../../generated/store-pages/','').replace(/\/index\.html$/,''),html]));
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const url=new URL(request.url),path=url.pathname.replace(/^\/+|\/+$/g,'').replace(/\/index\.html$/,'');
 if(path==='signup')return Response.redirect(new URL('/login/'+url.search,url),302);
 const html=pages.get(path);
 if(!html)return new Response('ไม่พบหน้านี้',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 const user=await getStoreUser();
 if(!user)return Response.redirect(new URL('/login/?next='+encodeURIComponent('/'+path+'/'),url),302);
 const member=await getDb().select({id:members.userId}).from(members).where(eq(members.userId,user.userId)).get();
 if(!member)return Response.redirect(new URL('/login/',url),302);
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex'}});
}
