import { storeApi } from '@/lib/commerce/api';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { return storeApi(request, ['tickets']); }
export async function POST(request: Request) { return storeApi(request, ['support']); }
