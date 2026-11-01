import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getStoreUser } from '@/lib/store-user';
import { getDb } from '@/db';
import { members, partnerRequests } from '@/db/schema';
import { validateWrite } from '@/lib/shop-validation';
const schema=z.object({shopName:z.string().trim().min(2).max(80),category:z.enum(['game','source','both']),contact:z.string().trim().min(3).max(200),message:z.string().trim().min(10).max(2000)});
export async function POST(request:Request) {
  const guard=validateWrite(request); if(guard)return guard;
  const user=await getStoreUser();
  if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบ'},{status:401});
  const db=getDb();
  const member=await db.select().from(members).where(eq(members.userId,user.userId)).get();
  if(!member)return Response.json({error:'กรุณาสมัครสมาชิกก่อน',register:true},{status:403});
  const body=schema.safeParse(await request.json().catch(()=>null));
  if(!body.success)return Response.json({error:'กรุณากรอกชื่อร้าน ช่องทางติดต่อ และรายละเอียดสินค้าอย่างน้อย 10 ตัวอักษร'},{status:400});
  const previous=await db.select().from(partnerRequests).where(eq(partnerRequests.userId,user.userId)).all();
  if(previous.some(x=>x.status==='pending'))return Response.json({ok:true,alreadySubmitted:true,status:'pending'});
  const id=crypto.randomUUID();
  await db.insert(partnerRequests).values({id,userId:user.userId,...body.data,status:'pending',createdAt:Date.now()}).run();
  return Response.json({ok:true,id,status:'pending'});
}
