import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { authConfigured,getAuth } from './auth';

export type StoreUser={userId:string,email:string,displayName:string,fullName:string|null,method:'email-or-social'|'chatgpt',emailVerified:boolean};
export async function getStoreUser():Promise<StoreUser|null>{
  const requestHeaders=await headers();
  if(authConfigured()&&requestHeaders.get('cookie')?.includes('kamucode')){
    const session=await getAuth().api.getSession({headers:requestHeaders});
    if(session)return {userId:'auth:'+session.user.id,email:session.user.email,displayName:session.user.name,fullName:session.user.name,method:'email-or-social',emailVerified:session.user.emailVerified};
    return null;
  }
  if(requestHeaders.get('cookie')?.includes('kc_signed_out=1'))return null;
  const native=await getChatGPTUser();
  return native?{...native,method:'chatgpt',emailVerified:true}:null;
}
export async function requireStoreUser(returnTo='/home'):Promise<StoreUser>{const user=await getStoreUser();if(user)return user;redirect('/login/?next='+encodeURIComponent(returnTo));}
