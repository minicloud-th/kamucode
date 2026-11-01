import { renderStorePage, type StorePageProps } from '@/lib/store-page';
export const metadata = { title: 'รายละเอียดรายการ', robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: {
    params: Promise<{
        id: string;
    }>;
    searchParams: StorePageProps['searchParams'];
}) { const p = await params; return renderStorePage({ params: Promise.resolve({ path: [...["orders"], p.id] }), searchParams }); }

export const dynamic = 'force-dynamic';
