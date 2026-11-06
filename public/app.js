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
  btn.disabled=true;btn.textContent='Creating your Google Sheet…';$('result').classList.add('hidden');
  try{
    const f=new FormData(e.target);const body=Object.fromEntries(f.entries());
    body.reps=String(body.reps||'').split(/\r?\n|,/).map(x=>x.trim()).filter(Boolean);
    body.turnstileToken=token;
    const r=await api('generate',body);
    $('result').classList.remove('hidden');$('result').textContent='Your private Google Sheet is ready! ';
    const a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Open your KPI scorecard →';$('result').appendChild(a);
  }catch(err){notice(err.message)}finally{
    btn.disabled=false;btn.innerHTML='Build my KPI scorecard <span>→</span>';
    if(widgetId!==null)window.turnstile?.reset(widgetId);
  }
});
window.addEventListener('load',()=>{
  if(window.turnstile)start();else notice('Security check could not load. Refresh this page.');
});
