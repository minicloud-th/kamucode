import { renderStorePage, metadataFor, type StorePageProps } from '@/lib/store-page';
export const metadata = metadataFor('admin/orders');
export default function Page({ searchParams }: Pick<StorePageProps, 'searchParams'>) { return renderStorePage({ params: Promise.resolve({ path: ["admin", "orders"] }), searchParams }); }

export const dynamic = 'force-dynamic';
