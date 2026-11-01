import { renderStorePage, metadataFor, type StorePageProps } from '@/lib/store-page';
export const metadata = metadataFor('login');
export default function Page({ searchParams }: Pick<StorePageProps, 'searchParams'>) { return renderStorePage({ params: Promise.resolve({ path: ["login"] }), searchParams }); }

export const dynamic = 'force-dynamic';
