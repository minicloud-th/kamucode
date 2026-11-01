import { renderStorePage, type StorePageProps } from '@/lib/store-page';
export const metadata = { title: 'รายละเอียดสินค้า', robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: {
    params: Promise<{
        slug: string;
    }>;
    searchParams: StorePageProps['searchParams'];
}) { const p = await params; return renderStorePage({ params: Promise.resolve({ path: [...["product"], p.slug] }), searchParams }); }

export const dynamic = 'force-dynamic';
