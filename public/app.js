const $=id=>document.getElementById(id);
let widgetId=null;
function notice(t){$('toast').textContent=t;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),6500)}
async function api(route,body){
  const r=await fetch('/api/'+route,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  const j=await r.json();if(!r.ok)throw new Error(j.error||'Request failed.');return j;
}
async function start(){
  try {
    const conf=await api('config');
    if(!window.turnstile)throw new Error('Security check could not load. Refresh this page.');
    widgetId=window.turnstile.render('#turnstile-box',{sitekey:conf.turnstileSiteKey,theme:'light'});
  }catch(e){notice(e.message);$('generateBtn').disabled=true;}
}
$('buildForm').addEventListener('submit',async e=>{
  e.preventDefault();const btn=$('generateBtn');
  const token=window.turnstile?.getResponse(widgetId);
  if(!token)return notice('Complete the security check before generating your sheet.');
  btn.disabled=true;btn.textContent='Building your Excel download…';$('result').classList.add('hidden');
  try{
    const f=new FormData(e.target);const body=Object.fromEntries(f.entries());
    body.reps=String(body.reps||'').split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean);
    body.turnstileToken=token;
    const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!response.ok){let message='Unable to generate the spreadsheet.';try{message=(await response.json()).error||message}catch{}throw new Error(message)}
    const blob=await response.blob();
    const name='Cash-Out-KPI-'+String(body.company||'Business').replace(/[^a-z0-9-_ ]/gi,'').trim().replace(/\s+/g,'-').slice(0,45)+'.xlsx';
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),60000);
    $('result').classList.remove('hidden');$('result').textContent='Your Excel KPI scorecard has downloaded. Open it in Excel, or upload it to Google Sheets.';
  }catch(err){notice(err.message)}finally{
    btn.disabled=false;btn.innerHTML='Build my KPI scorecard <span>→</span>';
    if(widgetId!==null)window.turnstile?.reset(widgetId);
  }
});
window.addEventListener('load',()=>{
  if(window.turnstile)start();else notice('Security check could not load. Refresh this page.');
});
