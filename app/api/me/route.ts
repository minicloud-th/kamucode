import { eq } from 'drizzle-orm';
import { getStoreUser } from '@/lib/store-user';
import { getDb } from '@/db';
import { members, productInterests, partnerRequests } from '@/db/schema';
export const dynamic = 'force-dynamic';
export async function GET() {
  const user = await getStoreUser();
  const headers = {'Cache-Control':'private, no-store'};
  if (!user) return Response.json({authenticated:false,registered:false,signInUrl:'/login/'},{status:401,headers});
  const db = getDb();
  const member = await db.select().from(members).where(eq(members.userId,user.userId)).get();
  if (!member) return Response.json({authenticated:true,registered:false,method:user.method,emailVerified:user.emailVerified,displayName:user.fullName||'',email:user.email},{headers});
  const interests = await db.select({productId:productInterests.productId}).from(productInterests).where(eq(productInterests.userId,user.userId)).all();
  const applications = await db.select({id:partnerRequests.id,status:partnerRequests.status,shopName:partnerRequests.shopName}).from(partnerRequests).where(eq(partnerRequests.userId,user.userId)).all();
  return Response.json({authenticated:true,registered:true,method:user.method,emailVerified:user.emailVerified,displayName:member.displayName,email:member.email,partnerInterest:member.partnerInterest,interests:interests.map(x=>x.productId),applications},{headers});
}
