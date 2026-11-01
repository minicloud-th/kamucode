import { storeApi } from '@/lib/commerce/api';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) { return storeApi(request, ['saved']); }
export async function DELETE(request: Request) { return storeApi(request, ['saved']); }
