import { redirect } from 'next/navigation';
import { getStoreUser } from '@/lib/store-user';
export default async function Home() { redirect(await getStoreUser() ? '/shop' : '/login'); }

export const dynamic = 'force-dynamic';
