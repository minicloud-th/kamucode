import { renderStorePage, metadataFor, type StorePageProps } from '@/lib/store-page';
export const metadata = metadataFor('admin/products');
export default function Page({ searchParams }: Pick<StorePageProps, 'searchParams'>) { return renderStorePage({ params: Promise.resolve({ path: ["admin", "products"] }), searchParams }); }

export const dynamic = 'force-dynamic';
