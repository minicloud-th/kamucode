import { renderStorePage, metadataFor, type StorePageProps } from '@/lib/store-page';
export const metadata = metadataFor('how-it-works');
export default function Page({ searchParams }: Pick<StorePageProps, 'searchParams'>) { return renderStorePage({ params: Promise.resolve({ path: ["how-it-works"] }), searchParams }); }

export const dynamic = 'force-dynamic';
