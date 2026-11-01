import { renderStorePage, metadataFor, type StorePageProps } from '@/lib/store-page';
export const metadata = metadataFor('auth/complete');
export default function Page({ searchParams }: Pick<StorePageProps, 'searchParams'>) { return renderStorePage({ params: Promise.resolve({ path: ["auth", "complete"] }), searchParams }); }

export const dynamic = 'force-dynamic';
