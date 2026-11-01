import { storeApi } from '@/lib/commerce/api';
export const dynamic = 'force-dynamic';
async function handle(request: Request, { params }: {
    params: Promise<{
        action: string[];
    }>;
}) { return storeApi(request, (await params).action); }
export const GET = handle;
export const POST = handle;
export const DELETE = handle;
