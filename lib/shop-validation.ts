export function validateWrite(request:Request):Response|null {
  const origin=request.headers.get('origin');
  if(origin && origin!==new URL(request.url).origin)return Response.json({error:'Origin not allowed'},{status:403});
  if(!request.headers.get('content-type')?.startsWith('application/json'))return Response.json({error:'JSON required'},{status:415});
  if(Number(request.headers.get('content-length')||0)>16384)return Response.json({error:'Request too large'},{status:413});
  return null;
}
