import { eq,and } from 'drizzle-orm';
import { getStoreUser } from '@/lib/store-user';
import { getDb } from '@/db';
import { members, productInterests } from '@/db/schema';
import { validateWrite } from '@/lib/shop-validation';
const productIds=new Set(['valorant','roblox','minecraft','genshin','storefront','dashboard','discord-bot','saas-starter']);
export async function POST(request:Request) {
  const guard=validateWrite(request);if(guard)return guard;
  const user=await getStoreUser();
  if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบ'},{status:401});
  const db=getDb();
  const member=await db.select().from(members).where(eq(members.userId,user.userId)).get();
  if(!member)return Response.json({error:'กรุณาสมัครสมาชิกก่อน',register:true},{status:403});
  const body=await request.json().catch(()=>null) as {productId?:string}|null;
  if(!body?.productId||!productIds.has(body.productId))return Response.json({error:'ไม่พบสินค้า'},{status:400});
  await db.insert(productInterests).values({id:user.userId+':'+body.productId,userId:user.userId,productId:body.productId,createdAt:Date.now()}).onConflictDoNothing().run();
  return Response.json({ok:true,productId:body.productId});
}
export async function DELETE(request:Request){
 const guard=validateWrite(request);if(guard)return guard;
 const user=await getStoreUser();if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบ'},{status:401});
 const body=await request.json().catch(()=>null) as {productId?:string}|null;
 if(!body?.productId||!productIds.has(body.productId))return Response.json({error:'ไม่พบสินค้า'},{status:400});
 await getDb().delete(productInterests).where(and(eq(productInterests.userId,user.userId),eq(productInterests.productId,body.productId))).run();
 return Response.json({ok:true});
}
