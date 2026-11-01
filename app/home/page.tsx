import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireStoreUser } from '@/lib/store-user';
import { getDb } from '@/db';
import { members } from '@/db/schema';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await requireStoreUser('/home');
  const member = await getDb().select().from(members).where(eq(members.userId,user.userId)).get();
  redirect(member ? '/shop/' : '/signup/');
}
