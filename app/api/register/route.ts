import { z } from 'zod';
import { getStoreUser } from '@/lib/store-user';
import { chatGPTSignInPath } from '../../chatgpt-auth';
import { getDb } from '@/db';
import { members } from '@/db/schema';
import { validateWrite } from '@/lib/shop-validation';
const schema = z.object({displayName:z.string().trim().min(2).max(60),partnerInterest:z.boolean().optional().default(false)});
export async function POST(request:Request) {
  const guard=validateWrite(request); if(guard)return guard;
  const user=await getStoreUser();
  if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบก่อนสมัครสมาชิก',signInUrl:chatGPTSignInPath('/welcome.html?register=1')},{status:401});
  const body=schema.safeParse(await request.json().catch(()=>null));
  if(!body.success)return Response.json({error:'กรุณาระบุชื่อ 2–60 ตัวอักษร'},{status:400});
  await getDb().insert(members).values({userId:user.userId,email:user.email,displayName:body.data.displayName,partnerInterest:body.data.partnerInterest,createdAt:Date.now()}).onConflictDoUpdate({target:members.userId,set:{email:user.email,displayName:body.data.displayName,partnerInterest:body.data.partnerInterest}}).run();
  return Response.json({ok:true,redirect:'/shop/'},{headers:{'Cache-Control':'no-store'}});
}
