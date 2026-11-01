import { eq,desc,and,gte } from 'drizzle-orm';
import { z } from 'zod';
import { env } from 'cloudflare:workers';
import { getStoreUser } from '@/lib/store-user';
import { getDb } from '@/db';
import { supportTickets } from '@/db/schema';
import { validateWrite } from '@/lib/shop-validation';
export const dynamic='force-dynamic';
export async function GET(){const user=await getStoreUser();if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบ'},{status:401});const tickets=await getDb().select().from(supportTickets).where(eq(supportTickets.userId,user.userId)).orderBy(desc(supportTickets.createdAt)).limit(30).all();return Response.json({tickets},{headers:{'Cache-Control':'private, no-store'}});}
export async function POST(request:Request){
 const guard=validateWrite(request);if(guard)return guard;
 const user=await getStoreUser();
 const parsed=z.object({email:z.string().trim().email().max(254),category:z.enum(['general','security','privacy','partner']),subject:z.string().trim().min(3).max(120),message:z.string().trim().min(10).max(3000)}).safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return Response.json({error:'กรอกหัวข้อและรายละเอียดอย่างน้อย 10 ตัวอักษร'},{status:400});
 // An anonymous visitor can ask for account help without already being signed in.
 // A salted digest limits repeated submissions without storing the visitor's IP.
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode((env.BETTER_AUTH_SECRET||'local-preview')+':support:'+request.headers.get('cf-connecting-ip')));
 const visitorId='guest:'+Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
 const userId=user?.userId||visitorId,db=getDb();
 const recent=await db.select({id:supportTickets.id}).from(supportTickets).where(and(eq(supportTickets.userId,userId),gte(supportTickets.createdAt,Date.now()-3600000))).limit(5).all();
 if(recent.length>=5)return Response.json({error:'ส่งเรื่องหลายครั้งเกินไป กรุณารอแล้วลองใหม่'},{status:429});
 const id=crypto.randomUUID();await db.insert(supportTickets).values({...parsed.data,id,userId,email:user?.email||parsed.data.email,status:'open',createdAt:Date.now()}).run();
 return Response.json({ok:true,id});
}
