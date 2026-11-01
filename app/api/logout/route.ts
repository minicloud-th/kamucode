import { getAuth,authConfigured } from '@/lib/auth';
import { validateWrite } from '@/lib/shop-validation';
export async function POST(request:Request){
 const guard=validateWrite(request);if(guard)return guard;
 const response=authConfigured()?await getAuth().handler(new Request(new URL('/api/auth/sign-out',request.url),{method:'POST',headers:request.headers,body:'{}'})):Response.json({success:true});
 response.headers.append('Set-Cookie','kc_signed_out=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800'+(new URL(request.url).protocol==='https:'?'; Secure':''));
 return response;
}
