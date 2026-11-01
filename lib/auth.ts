import { betterAuth } from 'better-auth/minimal';
import type { BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { authUser,authSession,authAccount,authVerification,authRateLimit } from '@/db/schema';

export const providerDefinitions=[
  {id:'google',name:'Google',prefix:'GOOGLE'}, {id:'line',name:'LINE',prefix:'LINE'},
  {id:'github',name:'GitHub',prefix:'GITHUB'}, {id:'microsoft',name:'Microsoft',prefix:'MICROSOFT'},
  {id:'discord',name:'Discord',prefix:'DISCORD'},
] as const;
function value(key:string):string|undefined{return (env as unknown as Record<string,string|undefined>)[key];}
export function providerStatus(){return providerDefinitions.map(p=>({id:p.id,name:p.name,enabled:!!(value(p.prefix+'_CLIENT_ID')&&value(p.prefix+'_CLIENT_SECRET'))}));}
export function authConfigured(){return !!env.BETTER_AUTH_SECRET||import.meta.env.DEV;}
export function getAuth(){
  const secret=env.BETTER_AUTH_SECRET||(import.meta.env.DEV?'kamucode-local-preview-secret-not-used-in-production':undefined);
  if(!secret)throw new Error('Authentication secret is not configured');
  const baseURL=env.BETTER_AUTH_URL||(import.meta.env.DEV?'http://terminal.local:4173':'https://kamucode.kawertyff-2.chatgpt.site');
  const socialProviders:NonNullable<BetterAuthOptions['socialProviders']>={};
  for(const p of providerDefinitions){const clientId=value(p.prefix+'_CLIENT_ID'),clientSecret=value(p.prefix+'_CLIENT_SECRET');if(clientId&&clientSecret){if(p.id==='microsoft')socialProviders.microsoft={clientId,clientSecret,tenantId:'common',disableProfilePhoto:true};else socialProviders[p.id]={clientId,clientSecret};}}
  return betterAuth({
    appName:'kamucode',secret,baseURL,trustedOrigins:[baseURL],basePath:'/api/auth',
    database:drizzleAdapter(getDb(),{provider:'sqlite',schema:{user:authUser,session:authSession,account:authAccount,verification:authVerification,rateLimit:authRateLimit},transaction:false}),
    emailAndPassword:{enabled:true,disableSignUp:false,minPasswordLength:10,maxPasswordLength:128,autoSignIn:true},
    socialProviders, account:{accountLinking:{enabled:false},encryptOAuthTokens:true},
    session:{expiresIn:60*60*24*7,updateAge:60*60*24},
    rateLimit:{enabled:true,storage:'database',window:60,max:100,customRules:{'/sign-in/email':{window:60,max:8},'/sign-up/email':{window:60,max:5}}},
    advanced:{cookiePrefix:'kamucode',ipAddress:{ipAddressHeaders:['cf-connecting-ip']},defaultCookieAttributes:{httpOnly:true,sameSite:'lax',secure:baseURL.startsWith('https:')}},
    logger:{level:'error'},
  });
}
