import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getStoreUser } from '@/lib/store-user';
import { getDb } from '@/db';
import { members } from '@/db/schema';
import { validateWrite } from '@/lib/shop-validation';
export async function POST(request:Request){
 const guard=validateWrite(request);if(guard)return guard;
 const user=await getStoreUser();if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบ'},{status:401});
 const member=await getDb().select({id:members.userId}).from(members).where(eq(members.userId,user.userId)).get();
 if(!member)return Response.json({error:'กรุณาสมัครสมาชิกก่อนแก้ไขโปรไฟล์'},{status:403});
 const body=z.object({displayName:z.string().trim().min(2).max(60)}).safeParse(await request.json().catch(()=>null));
 if(!body.success)return Response.json({error:'ใช้ชื่อ 2–60 ตัวอักษร'},{status:400});
 await getDb().update(members).set({displayName:body.data.displayName}).where(eq(members.userId,user.userId)).run();
 return Response.json({ok:true,displayName:body.data.displayName});
}
