import {createHash} from 'node:crypto';
import {getStore} from '@netlify/blobs';
import {json,verifyTurnstile,clientIp} from './_shared.mjs';
import {validate,buildWorkbook,aiAdvice,createGoogleWorkbook} from './_builder.mjs';

const MAX_IP_DAILY = Math.max(1,Math.min(30,Number(process.env.DAILY_PER_IP_LIMIT)||3));
const MAX_GLOBAL_DAILY = Math.max(1,Math.min(10000,Number(process.env.DAILY_GLOBAL_LIMIT)||200));
// Best-effort daily limits; blob read/modify/write is not an atomic counter.
// These limits mitigate casual abuse, but are not a per-paying-member entitlement system.
export default async request => {
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  try {
    const body=await request.json();
    if(!await verifyTurnstile(body.turnstileToken,request)) return json({error:'Please complete the security check and try again.'},403);
    const input=validate(body);
    const store=getStore('kpi-generation-limits');
    const today=new Date().toISOString().slice(0,10);
    const ipHash=createHash('sha256').update(clientIp(request)).digest('hex');
    const ipKey=`ip-${today}-${ipHash}`;
    const globalKey=`global-${today}`;
    const [ipCurrent,globalCurrent]=await Promise.all([store.get(ipKey,{type:'json'}),store.get(globalKey,{type:'json'})]);
    if((ipCurrent?.count||0)>=MAX_IP_DAILY || (globalCurrent?.count||0)>=MAX_GLOBAL_DAILY) return json({error:'Daily generation limit reached. Please try again tomorrow or contact support.'},429);
    const advice=await aiAdvice(input);
    const workbook=buildWorkbook(input,advice);
    const file=await createGoogleWorkbook(workbook,input);
    await Promise.all([
      store.setJSON(ipKey,{count:(ipCurrent?.count||0)+1}),
      store.setJSON(globalKey,{count:(globalCurrent?.count||0)+1})
    ]).catch(err=>console.error('Limit counter update failed after successful generation',err));
    return json({ok:true,url:file.url,title:workbook.title});
  } catch (e) {
    console.error('generate request',e);
    return json({error:e.message?.startsWith('Enter ') ? e.message : 'Unable to generate the sheet. Please try again or contact support.'},502);
  }
};
