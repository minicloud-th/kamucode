import { eq } from 'drizzle-orm';
import { getStoreUser } from '@/lib/store-user';
import { getDb } from '@/db';
import { members,productInterests,partnerRequests,supportTickets } from '@/db/schema';
export const dynamic='force-dynamic';
export async function GET(){
 const user=await getStoreUser();if(!user)return Response.json({error:'กรุณาเข้าสู่ระบบ'},{status:401});
 const db=getDb();
 const [profile,interests,partners,support]=await Promise.all([
  db.select({displayName:members.displayName,email:members.email,createdAt:members.createdAt}).from(members).where(eq(members.userId,user.userId)).get(),
  db.select({productId:productInterests.productId,createdAt:productInterests.createdAt}).from(productInterests).where(eq(productInterests.userId,user.userId)).all(),
  db.select({shopName:partnerRequests.shopName,category:partnerRequests.category,contact:partnerRequests.contact,message:partnerRequests.message,status:partnerRequests.status,createdAt:partnerRequests.createdAt}).from(partnerRequests).where(eq(partnerRequests.userId,user.userId)).all(),
  db.select({subject:supportTickets.subject,category:supportTickets.category,message:supportTickets.message,status:supportTickets.status,createdAt:supportTickets.createdAt}).from(supportTickets).where(eq(supportTickets.userId,user.userId)).all(),
 ]);
 return new Response(JSON.stringify({exportedAt:new Date().toISOString(),profile,interests,partners,support},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Content-Disposition':'attachment; filename="kamucode-data.json"','Cache-Control':'private, no-store'}});
}
