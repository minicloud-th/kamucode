import { authConfigured,getAuth } from '@/lib/auth';
export const dynamic='force-dynamic';
function handle(request:Request){if(!authConfigured())return Response.json({message:'ระบบสมาชิกยังไม่พร้อมใช้งาน'},{status:503});return getAuth().handler(request);}
export const GET=handle;
export const POST=handle;
