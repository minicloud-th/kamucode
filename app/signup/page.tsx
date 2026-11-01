import {metadataFor, renderStorePage, type StorePageProps} from '@/lib/store-page';
export const metadata = metadataFor('signup');
export default function Page({searchParams}: Pick<StorePageProps, 'searchParams'>) {return renderStorePage({params: Promise.resolve({path: ['signup']}), searchParams});}
