const limit=(s,n=150)=>typeof s==='string'?s.trim().slice(0,n):'';

export function validate(body){
  const company=limit(body.company,100), industry=limit(body.industry,100);
  const names=[...new Set((Array.isArray(body.reps)?body.reps:[]).map(n=>limit(n,40)).filter(Boolean))].slice(0,15);
  const rev=Number(body.annualRevenue),goal=Number(body.revenueGoal),deal=Number(body.averageDeal);
  if(!company||!industry||names.length<1||!Number.isFinite(rev)||rev<0||rev>1e11||!Number.isFinite(goal)||goal<0||goal>1e11||!Number.isFinite(deal)||deal<0||deal>1e9) throw new Error('Enter valid business details, revenue figures and at least one salesperson.');
  return {company,industry,names,annualRevenue:rev,revenueGoal:goal,averageDeal:deal,model:limit(body.model,80)||'Appointments / consultations',funnelType:limit(body.funnelType,40)||'Custom / other',notes:limit(body.notes,500)};
}
const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s};
const safeText=v=>{const s=String(v??'');return /^[=+@\-]/.test(s)?"'"+s:s;};
export function buildWorkbook(p,advice=[]){
  const date=new Date().toISOString().slice(0,10);
  const tabNames=['START HERE','EXECUTIVE DASHBOARD','DAILY SALES KPI','GROWTH ROADMAP'];
  const tabIds=[100,101,102,103];
  const sheets=tabNames.map((title,i)=>({properties:{sheetId:tabIds[i],title,gridProperties:{rowCount:i===2?1200:150,columnCount:i===2?25:14,frozenRowCount:i===2?4:0}}}));
  const title=`Cash Out Challenge | ${p.company} | Sales KPI | ${date}`;
  const setup=[
    ['CASH OUT CHALLENGE — SALES KPI BUILDER'],
    ['Company',safeText(p.company)],['Industry',safeText(p.industry)],['Tracking start',date],['Annual revenue',p.annualRevenue],['Annual revenue goal',p.revenueGoal],['Average transaction',p.averageDeal],['Sales model',safeText(p.model)],['Salespeople',safeText(p.names.join(', '))],['Owner notes',safeText(p.notes)],[],
    ['HOW TO USE'],
    ['1. Fill in one DAILY SALES KPI row per rep per day.'],
    ['2. The dashboard and growth roadmap update automatically.'],
    ['3. Never edit blue header cells or formula cells.'],
    ['4. To add reps, use the current list (up to 15).'],
    ['5. Your figures are planning inputs, not independently verified financial data.']
  ];
  const data=[['CASH OUT CHALLENGE • DAILY SALES KPIs'],['Enter raw counts and revenue; rates are calculated automatically.'],[],['Date','Salesperson','Leads','Booked','Showed','Offers','Closed','Cash Collected','Revenue Sold','Show Rate','Close Rate','Revenue / Lead','Notes']];
  for(let i=5;i<=504;i++){
    data.push(['','','','','','','','','',`=IFERROR(E${i}/D${i},0)`,`=IFERROR(G${i}/E${i},0)`,`=IFERROR(I${i}/C${i},0)`,'']);
  }
  const namesEsc=p.names.map(n=>n.replace(/"/g,'""'));
  const d=[
    ['CASH OUT CHALLENGE • EXECUTIVE SALES DASHBOARD'],
    ['Company',safeText(p.company)],['Revenue Target',p.revenueGoal],[],
    ['KPI','Current Entered Total / Rate'],
    ['Leads',"=SUM('DAILY SALES KPI'!C5:C504)"],
    ['Appointments Booked',"=SUM('DAILY SALES KPI'!D5:D504)"],
    ['Appointments Showed',"=SUM('DAILY SALES KPI'!E5:E504)"],
    ['Offers',"=SUM('DAILY SALES KPI'!F5:F504)"],
    ['Deals Closed',"=SUM('DAILY SALES KPI'!G5:G504)"],
    ['Cash Collected',"=SUM('DAILY SALES KPI'!H5:H504)"],
    ['Revenue Sold',"=SUM('DAILY SALES KPI'!I5:I504)"],
    ['Show Rate','=IFERROR(B8/B7,0)'],
    ['Close Rate','=IFERROR(B10/B8,0)'],
    ['Booked / Lead','=IFERROR(B7/B6,0)'],
    ['Average Sold Deal','=IFERROR(B12/B10,0)'],
    [],['SALESPERSON SCORECARD'],['Salesperson','Leads','Booked','Showed','Closed','Cash','Revenue','Close Rate']
  ];
  for(let i=0;i<p.names.length;i++){
    const r=20+i, n=p.names[i];
    d.push([safeText(n),`=SUMIF('DAILY SALES KPI'!B5:B504,A${r},'DAILY SALES KPI'!C5:C504)`,`=SUMIF('DAILY SALES KPI'!B5:B504,A${r},'DAILY SALES KPI'!D5:D504)`,`=SUMIF('DAILY SALES KPI'!B5:B504,A${r},'DAILY SALES KPI'!E5:E504)`,`=SUMIF('DAILY SALES KPI'!B5:B504,A${r},'DAILY SALES KPI'!G5:G504)`,`=SUMIF('DAILY SALES KPI'!B5:B504,A${r},'DAILY SALES KPI'!H5:H504)`,`=SUMIF('DAILY SALES KPI'!B5:B504,A${r},'DAILY SALES KPI'!I5:I504)`,`=IFERROR(E${r}/D${r},0)`]);
  }
  const gr=[
    ['CASH OUT CHALLENGE • GROWTH ROADMAP'],
    ['Company',safeText(p.company)],['Industry',safeText(p.industry)],[],
    ['Annual Revenue (owner estimate)',p.annualRevenue],
    ['Annual Revenue Goal',p.revenueGoal],
    ['Annual Growth Gap','=B6-B5'],
    ['Monthly Growth Gap','=B7/12'],
    ['Average Sale',p.averageDeal],
    ['Additional Annual Sales Needed','=IFERROR(ROUNDUP(MAX(0,B7)/B9,0),0)'],
    ['Additional Monthly Sales Needed','=IFERROR(ROUNDUP(B10/12,0),0)'],
    [],['PRIORITY ACTIONS'],
    ...((advice.length?advice:[
      'Measure lead-to-booking and show rates weekly',
      'Review close rate by salesperson and lead source',
      'Document the repeatable sales process before sale diligence',
      'Verify all revenue data against your CRM and accounting records'
    ]).slice(0,5).map((x,i)=>[safeText(`${i+1}. ${x}`)])),
    [],['Note','Targets are planning assumptions, not a valuation, sale guarantee, or forecast.']
  ];
  const values=[setup,d,data,gr].map((rows,i)=>({range:`'${tabNames[i]}'!A1`,majorDimension:'ROWS',values:rows}));
  // Format strategically rather than issuing hundreds of API calls.
  const color={red:0.11,green:0.16,blue:0.24};const white={red:1,green:1,blue:1};
  const req=[];
  for(const id of tabIds){
    req.push({repeatCell:{range:{sheetId:id,startRowIndex:0,endRowIndex:1},cell:{userEnteredFormat:{backgroundColor:color,textFormat:{foregroundColor:white,bold:true,fontSize:15}}},fields:'userEnteredFormat'}});
    req.push({updateDimensionProperties:{range:{sheetId:id,dimension:'COLUMNS',startIndex:0,endIndex:1},properties:{pixelSize:245},fields:'pixelSize'}});
  }
  for(const id of [101,102]) req.push({repeatCell:{range:{sheetId:id,startRowIndex:id===102?3:4,endRowIndex:id===102?4:5},cell:{userEnteredFormat:{backgroundColor:{red:0.9,green:0.94,blue:0.98},textFormat:{bold:true}}},fields:'userEnteredFormat'}});
  req.push({setDataValidation:{range:{sheetId:102,startRowIndex:4,endRowIndex:504,startColumnIndex:1,endColumnIndex:2},rule:{condition:{type:'ONE_OF_LIST',values:namesEsc.map(userEnteredValue=>({userEnteredValue}))},strict:true,showCustomUi:true}}});
  req.push({repeatCell:{range:{sheetId:102,startRowIndex:4,endRowIndex:504,startColumnIndex:9,endColumnIndex:11},cell:{userEnteredFormat:{numberFormat:{type:'PERCENT',pattern:'0.0%'}}},fields:'userEnteredFormat.numberFormat'}});
  req.push({repeatCell:{range:{sheetId:101,startRowIndex:12,endRowIndex:15,startColumnIndex:1,endColumnIndex:2},cell:{userEnteredFormat:{numberFormat:{type:'PERCENT',pattern:'0.0%'}}},fields:'userEnteredFormat.numberFormat'}});
  req.push({repeatCell:{range:{sheetId:101,startRowIndex:19,endRowIndex:19+p.names.length,startColumnIndex:7,endColumnIndex:8},cell:{userEnteredFormat:{numberFormat:{type:'PERCENT',pattern:'0.0%'}}},fields:'userEnteredFormat.numberFormat'}});
  req.push({updateDimensionProperties:{range:{sheetId:102,dimension:'COLUMNS',startIndex:0,endIndex:1},properties:{pixelSize:125},fields:'pixelSize'}});
  req.push({updateDimensionProperties:{range:{sheetId:102,dimension:'COLUMNS',startIndex:12,endIndex:13},properties:{pixelSize:280},fields:'pixelSize'}});
  return {title,sheets,values,requests:req};
}
export async function aiAdvice(p){
  if(!process.env.OPENAI_API_KEY) return [];
  const prompt=`Return ONLY a JSON object with a property "actions", an array of exactly 4 short, practical sales KPI and exit-readiness actions for this company. No speculative valuations. Industry: ${p.industry}; model: ${p.model}; business revenue: ${p.annualRevenue}; goal: ${p.revenueGoal}; notes: ${p.notes}. Keep each action under 100 characters.`;
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);
  try {
    const r=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-4.1-mini',messages:[{role:'system',content:'You create conservative, actionable business KPI implementation guidance.'},{role:'user',content:prompt}],temperature:0.3,max_completion_tokens:260,response_format:{type:'json_object'}})});
    if(!r.ok)throw new Error(`AI returned ${r.status}`);
    const j=await r.json();const obj=JSON.parse(j.choices?.[0]?.message?.content||'{}');
    return Array.isArray(obj.actions)?obj.actions.filter(x=>typeof x==='string').slice(0,4).map(x=>limit(x,110)):[];
  }catch(e){console.warn('AI skipped; deterministic fallback',e.message);return []}finally{clearTimeout(timer)}
}

// Turn the existing four-tab, formula-driven workbook specification into a local Excel download.
// No Google OAuth, Cloud project, shared service account, or member email required.
export async function createExcelWorkbook(w,p){
  const {default: ExcelJS}=await import('exceljs');
  const book=new ExcelJS.Workbook();
  addVisualDashboard(book,p);
  addMarketingFunnel(book,p);
  book.creator='Cash Out Challenge';
  book.title=w.title;
  book.calcProperties.fullCalcOnLoad=true;
  book.calcProperties.forceFullCalc=true;
  const dark='1C2A3D',light='EAF0F7',gold='C5A36A';
  for(let i=0;i<w.sheets.length;i++){
    const {title}=w.sheets[i].properties;
    const sh=book.addWorksheet(title,title==='DAILY SALES KPI'?{views:[{state:'frozen',ySplit:4}]}:{});
    sh.properties.defaultRowHeight=19;
    sh.getColumn(1).width=34;
    for(let c=2;c<=14;c++)sh.getColumn(c).width=18;
    if(title==='DAILY SALES KPI'){ sh.getColumn(1).width=15;sh.getColumn(2).width=24;sh.getColumn(13).width=42;}
    if(title==='EXECUTIVE DASHBOARD'){ sh.getColumn(1).width=29;sh.getColumn(2).width=23; sh.getCell('J2').value='START ON THE KPI DASHBOARD TAB →';sh.getCell('J2').font={bold:true,color:{argb:'FF176D52'}}; }
    if(title==='GROWTH ROADMAP'){sh.getColumn(1).width=45;sh.getColumn(2).width=25;}
    for(const [ri,row] of w.values[i].values.entries()){
      const excelRow=sh.getRow(ri+1);
      for(const [ci,val] of row.entries()){
        if(val===undefined||val===null||val==='')continue;
        const cell=excelRow.getCell(ci+1);
        if(typeof val==='string'&&val.startsWith('=')){
          cell.value={formula:val.slice(1)};
        } else if(typeof val==='string'&&val.startsWith("'")){
          // ExcelJS uses typed text; no injection is possible for these members' strings.
          cell.value=val.slice(1);
          cell.numFmt='@';
        }else cell.value=val;
        if(ri>0)cell.alignment={vertical:'middle'};
      }
    }
    const headline=sh.getRow(1);
    headline.height=34;
    for(let c=1;c<=Math.max(8,title==='DAILY SALES KPI'?13:8);c++){
      const cell=headline.getCell(c);cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+dark}};
      cell.font={name:'Aptos Display',size:c===1?16:11,bold:true,color:{argb:'FFFFFFFF'}};
    }
    for(const headerRow of (title==='DAILY SALES KPI'?[4]:title==='EXECUTIVE DASHBOARD'?[5,19]:[])){
      const row=sh.getRow(headerRow);row.height=25;
      for(let col=1;col<=(title==='DAILY SALES KPI'?13:8);col++){
        const cell=row.getCell(col);
        cell.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF'+light}};
        cell.font={name:'Aptos',bold:true,color:{argb:'FF'+dark}};
        cell.alignment={vertical:'middle',wrapText:true};
      }
    }
    sh.getCell('A1').font={name:'Aptos Display',size:15,bold:true,color:{argb:'FFFFFFFF'}};
    if(title==='DAILY SALES KPI'){
      sh.autoFilter='A4:M504';
      for(let r=5;r<=504;r++){
        const date=sh.getCell('A'+r);date.numFmt='yyyy-mm-dd';
        const salesperson=sh.getCell('B'+r);
        salesperson.dataValidation={type:'list',allowBlank:true,formulae:['"'+p.names.map(n=>n.replace(/"/g,'')).join(',')+'"']};
        for(const col of ['J','K'])sh.getCell(col+r).numFmt='0.0%';
        for(const col of ['H','I','L'])sh.getCell(col+r).numFmt='#,##0.00';
      }
    }
    if(title==='EXECUTIVE DASHBOARD'){
      for(const r of [13,14,15])sh.getCell('B'+r).numFmt='0.0%';
      for(let r=20;r<20+p.names.length;r++)sh.getCell('H'+r).numFmt='0.0%';
      for(const r of [11,12,16])sh.getCell('B'+r).numFmt='#,##0.00';
    }
    if(title==='GROWTH ROADMAP'){
      for(let r=5;r<=9;r++)sh.getCell('B'+r).numFmt='#,##0.00';
    }
    sh.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1};
  }
  const buffer=await book.xlsx.writeBuffer();
  return Buffer.from(buffer);
}


// Presentation layer. Original four-sheet calculation engine remains untouched.
// Marketing acquisition inputs live in a separate, date/source-level worksheet,
// avoiding accidental double-counting when several reps share one ad campaign.
const NAVY='162A42',GREEN='176D52',PALE='E9F3EE',GOLD='C2A06A',GRAY='64748B',WHITE='FFFFFF',INK='243447',BG='F4F7FA';
const fill=hex=>({type:'pattern',pattern:'solid',fgColor:{argb:'FF'+hex}});
const line=(color='DFE5EC')=>({style:'thin',color:{argb:'FF'+color}});
const curr='"$"#,##0.00;[Red]("$"#,##0.00)',pct='0.0%',num='#,##0';
function banner(ws,title,subtitle,lastCol=18){
  ws.mergeCells(1,1,1,lastCol);let a=ws.getCell('A1');a.value=title;a.fill=fill(NAVY);a.font={name:'Aptos Display',size:21,bold:true,color:{argb:'FF'+WHITE}};a.alignment={vertical:'middle',indent:1};ws.getRow(1).height=43;
  ws.mergeCells(2,1,2,lastCol);a=ws.getCell('A2');a.value=subtitle;a.fill=fill(BG);a.font={name:'Aptos',size:10,italic:true,color:{argb:'FF'+GRAY}};a.alignment={vertical:'middle',indent:1};ws.getRow(2).height=26;
}
function card(ws,range,title,formula,format='num',negative=false){
  const [r1,c1,r2,c2]=range;ws.mergeCells(r1,c1,r1,c2);ws.mergeCells(r1+1,c1,r2,c2);
  const t=ws.getCell(r1,c1);t.value=title.toUpperCase();t.font={name:'Aptos',size:10,bold:true,color:{argb:'FF'+GRAY}};t.fill=fill(PALE);t.alignment={vertical:'middle',indent:1};ws.getRow(r1).height=23;
  const v=ws.getCell(r1+1,c1);v.value={formula};v.numFmt=format==='currency'?curr:format==='percent'?pct:format==='ratio'?'0.00\"x\"':num;v.font={name:'Aptos Display',size:22,bold:true,color:{argb:'FF'+(negative?'B14B52':GREEN)}};v.fill=fill(PALE);v.alignment={vertical:'middle',indent:1};ws.getRow(r1+1).height=35;ws.getRow(r2).height=21;
  for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){const x=ws.getCell(r,c);x.fill=fill(PALE);x.border={bottom:line('CBD8D1')}}
}
function section(ws,row,text,end=18){ws.mergeCells(row,1,row,end);const c=ws.getCell(row,1);c.value=text.toUpperCase();c.font={name:'Aptos',size:12,bold:true,color:{argb:'FF'+WHITE}};c.fill=fill(NAVY);c.alignment={indent:1,vertical:'middle'};ws.getRow(row).height=28;}
function setTable(ws,row,entries){for(let i=0;i<entries.length;i++){const r=row+i;const [label,formula,format='num']=entries[i];ws.mergeCells(r,1,r,5);ws.getCell(r,1).value=label;ws.getCell(r,1).font={name:'Aptos',size:11,color:{argb:'FF'+INK},bold:i%2===0};ws.mergeCells(r,6,r,8);const v=ws.getCell(r,6);v.value={formula};v.numFmt=format==='currency'?curr:format==='percent'?pct:format==='ratio'?'0.00\"x\"':num;v.font={name:'Aptos',bold:true,color:{argb:'FF'+GREEN}};v.alignment={horizontal:'right'};for(let c=1;c<=8;c++){ws.getCell(r,c).fill=fill(i%2===0?'F5F8FB':'FFFFFF');ws.getCell(r,c).border={bottom:line('EEF2F6')}}ws.getRow(r).height=23}}
function addMarketingFunnel(book,p){
  const sh=book.addWorksheet('MARKETING FUNNEL',{views:[{state:'frozen',ySplit:5}]});
  sh.properties.defaultRowHeight=20;sh.getColumn(1).width=16;sh.getColumn(2).width=23;sh.getColumn(3).width=27;
  for(let c=4;c<=23;c++)sh.getColumn(c).width=17;
  sh.mergeCells('A1:W1');sh.getCell('A1').value='CASH OUT CHALLENGE  |  MARKETING FUNNEL TRACKER';sh.getCell('A1').fill=fill(NAVY);sh.getCell('A1').font={name:'Aptos Display',size:17,bold:true,color:{argb:'FF'+WHITE}};sh.getRow(1).height=35;
  sh.mergeCells('A2:W2');sh.getCell('A2').value='One row per day AND lead source/campaign. Enter acquisition metrics here; enter rep activity in DAILY SALES KPI. Do not add campaign spend to multiple rep rows.';sh.getCell('A2').font={italic:true,color:{argb:'FF'+GRAY}};sh.getRow(2).height=25;
  sh.mergeCells('A3:W3');sh.getCell('A3').value='Blank = unreported; zero = confirmed none. ROAS uses cash collected / ad spend. Contracted value is NOT cash. Benchmark ranges below are illustrative only.';sh.getCell('A3').font={italic:true,color:{argb:'FF'+GRAY}};
  const headers=['Date','Channel','Campaign / Source','Ad Spend','Impressions','Clicks','New Leads','Registrations','Front-End Buyers','Appts Booked','On Calendar','Calls Taken','Offers Made','Deals Won','Contracted Value','Cash Collected','Refunds','Cost / Lead','Lead → Booked','Show Rate','Close Rate','Cash ROAS','Contract ROAS'];
  const hr=sh.getRow(5);headers.forEach((h,i)=>{let c=hr.getCell(i+1);c.value=h;c.fill=fill(NAVY);c.font={name:'Aptos',size:10,bold:true,color:{argb:'FF'+WHITE}};c.alignment={vertical:'middle',wrapText:true}});hr.height=34;
  for(let r=6;r<=505;r++){
    sh.getCell('R'+r).value={formula:`IFERROR(D${r}/G${r},0)`};
    sh.getCell('S'+r).value={formula:`IFERROR(J${r}/G${r},0)`};
    sh.getCell('T'+r).value={formula:`IFERROR(L${r}/K${r},0)`};
    sh.getCell('U'+r).value={formula:`IFERROR(N${r}/L${r},0)`};
    sh.getCell('V'+r).value={formula:`IFERROR((P${r}-Q${r})/D${r},0)`};
    sh.getCell('W'+r).value={formula:`IFERROR(O${r}/D${r},0)`};
    for(let c=1;c<=23;c++){
      const cell=sh.getRow(r).getCell(c);cell.fill=fill(r%2===0?'F5F8FB':'FFFFFF');
      if(c>=18){cell.font={color:{argb:'FF'+GREEN}};cell.protection={locked:true};}
      else cell.protection={locked:false};
    }
    sh.getCell('A'+r).numFmt='yyyy-mm-dd';
    for(const c of ['D','O','P','Q','R'])sh.getCell(c+r).numFmt=curr;
    for(const c of ['S','T','U'])sh.getCell(c+r).numFmt=pct;
    for(const c of ['V','W'])sh.getCell(c+r).numFmt='0.00"x"';
  }
  sh.autoFilter='A5:W505';sh.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1};
  // Avoid formula caching fake numbers; Excel/Sheets recalculates on opening.
}
function addVisualDashboard(book,p){
  const sh=book.addWorksheet('KPI DASHBOARD',{views:[{showGridLines:false,zoomScale:80}]});
  for(let c=1;c<=18;c++)sh.getColumn(c).width=12;
  sh.getColumn(1).width=17;sh.getColumn(18).width=17;
  banner(sh,'CASH OUT  |  KPI COMMAND CENTER',`${p.company}  •  ${p.industry}  •  ${p.funnelType}  •  Edit marketing figures in MARKETING FUNNEL and rep results in DAILY SALES KPI`);
  card(sh,[4,1,6,6],'Cash collected (net of refunds)',"SUM('MARKETING FUNNEL'!P6:P505)-SUM('MARKETING FUNNEL'!Q6:Q505)",'currency');
  card(sh,[4,7,6,12],'Contracted revenue',"SUM('MARKETING FUNNEL'!O6:O505)",'currency');
  card(sh,[4,13,6,18],'Cash ROAS',"IFERROR((SUM('MARKETING FUNNEL'!P6:P505)-SUM('MARKETING FUNNEL'!Q6:Q505))/SUM('MARKETING FUNNEL'!D6:D505),0)",'ratio');
  card(sh,[8,1,10,6],'Ad spend',"SUM('MARKETING FUNNEL'!D6:D505)",'currency');
  card(sh,[8,7,10,12],'Deals won',"SUM('MARKETING FUNNEL'!N6:N505)");
  card(sh,[8,13,10,18],'Average contract value',"IFERROR(SUM('MARKETING FUNNEL'!O6:O505)/SUM('MARKETING FUNNEL'!N6:N505),0)",'currency');
  section(sh,12,'THE SALES FUNNEL');
  card(sh,[14,1,16,6],'Leads',"SUM('MARKETING FUNNEL'!G6:G505)");
  card(sh,[14,7,16,12],'Appointments booked',"SUM('MARKETING FUNNEL'!J6:J505)");
  card(sh,[14,13,16,18],'Calls taken',"SUM('MARKETING FUNNEL'!L6:L505)");
  card(sh,[18,1,20,6],'Lead → appointment rate',"IFERROR(SUM('MARKETING FUNNEL'!J6:J505)/SUM('MARKETING FUNNEL'!G6:G505),0)",'percent');
  card(sh,[18,7,20,12],'Show rate',"IFERROR(SUM('MARKETING FUNNEL'!L6:L505)/SUM('MARKETING FUNNEL'!K6:K505),0)",'percent');
  card(sh,[18,13,20,18],'Close rate',"IFERROR(SUM('MARKETING FUNNEL'!N6:N505)/SUM('MARKETING FUNNEL'!L6:L505),0)",'percent');
  section(sh,22,'ACQUISITION EFFICIENCY');
  card(sh,[24,1,26,6],'Cost per lead',"IFERROR(SUM('MARKETING FUNNEL'!D6:D505)/SUM('MARKETING FUNNEL'!G6:G505),0)",'currency');
  card(sh,[24,7,26,12],'Cost per call taken',"IFERROR(SUM('MARKETING FUNNEL'!D6:D505)/SUM('MARKETING FUNNEL'!L6:L505),0)",'currency');
  card(sh,[24,13,26,18],'Customer acquisition cost',"IFERROR(SUM('MARKETING FUNNEL'!D6:D505)/SUM('MARKETING FUNNEL'!N6:N505),0)",'currency');
  card(sh,[28,1,30,6],'Cash collected / call',"IFERROR((SUM('MARKETING FUNNEL'!P6:P505)-SUM('MARKETING FUNNEL'!Q6:Q505))/SUM('MARKETING FUNNEL'!L6:L505),0)",'currency');
  card(sh,[28,7,30,12],'Cost per booking',"IFERROR(SUM('MARKETING FUNNEL'!D6:D505)/SUM('MARKETING FUNNEL'!J6:J505),0)",'currency');
  card(sh,[28,13,30,18],'Contracted ROAS',"IFERROR(SUM('MARKETING FUNNEL'!O6:O505)/SUM('MARKETING FUNNEL'!D6:D505),0)",'ratio');
  section(sh,32,'ADDITIONAL CONVERSION + CASH QUALITY METRICS');
  setTable(sh,34,[
    ['Cash not yet collected',"MAX(0,SUM('MARKETING FUNNEL'!O6:O505)-SUM('MARKETING FUNNEL'!P6:P505))",'currency'],
    ['No-show rate',"IFERROR(1-SUM('MARKETING FUNNEL'!L6:L505)/SUM('MARKETING FUNNEL'!K6:K505),0)",'percent'],
    ['Lead → won deal rate',"IFERROR(SUM('MARKETING FUNNEL'!N6:N505)/SUM('MARKETING FUNNEL'!G6:G505),0)",'percent'],
    ['Offer → won deal rate',"IFERROR(SUM('MARKETING FUNNEL'!N6:N505)/SUM('MARKETING FUNNEL'!M6:M505),0)",'percent'],
    ['Average collected / deal',"IFERROR((SUM('MARKETING FUNNEL'!P6:P505)-SUM('MARKETING FUNNEL'!Q6:Q505))/SUM('MARKETING FUNNEL'!N6:N505),0)",'currency'],
    ['Cost / registration',"IFERROR(SUM('MARKETING FUNNEL'!D6:D505)/SUM('MARKETING FUNNEL'!H6:H505),0)",'currency'],
    ['Buyer → appointment',"IFERROR(SUM('MARKETING FUNNEL'!J6:J505)/SUM('MARKETING FUNNEL'!I6:I505),0)",'percent'],
    ['Buyer → won deal',"IFERROR(SUM('MARKETING FUNNEL'!N6:N505)/SUM('MARKETING FUNNEL'!I6:I505),0)",'percent'],
    ['Cost / attended call',"IFERROR(SUM('MARKETING FUNNEL'!D6:D505)/SUM('MARKETING FUNNEL'!L6:L505),0)",'currency'],
    ['Calls on calendar',"SUM('MARKETING FUNNEL'!K6:K505)"],
    ['Gross cash collected',"SUM('MARKETING FUNNEL'!P6:P505)",'currency'],
    ['Refunds',"SUM('MARKETING FUNNEL'!Q6:Q505)",'currency']
  ]);
  // Helper data within this sheet powers a real chart without a fragile pivot-table dependency.
  sh.getCell('J34').value='FUNNEL STAGE';sh.getCell('K34').value='VOLUME';
  const funnels=[['Leads',"SUM('MARKETING FUNNEL'!G6:G505)"],['Booked',"SUM('MARKETING FUNNEL'!J6:J505)"],['Calls taken',"SUM('MARKETING FUNNEL'!L6:L505)"],['Deals won',"SUM('MARKETING FUNNEL'!N6:N505)"]];
  funnels.forEach(([label,formula],i)=>{sh.getCell('J'+(35+i)).value=label;sh.getCell('K'+(35+i)).value={formula};});
  for(let r=35;r<=38;r++){sh.getCell('J'+r).fill=fill(PALE);sh.getCell('K'+r).fill=fill(PALE);sh.getCell('K'+r).font={bold:true,color:{argb:'FF'+GREEN}};}
  section(sh,54,'FUNNEL REFERENCE RANGES (PLANNING STARTING POINTS, NOT INDUSTRY GUARANTEES)');
  sh.mergeCells('A56:R56');sh.getCell('A56').value='VSL: Lead → booked 10–20%; show 50–75%; close 15–35%. LTO: buyer → appointment 20–40%; show 60–90%; close 25–50%.';
  sh.mergeCells('A57:R57');sh.getCell('A57').value='These are illustrative ranges from the supplied image, NOT verified benchmarks. Your actual targets depend on channel, offer, audience, definition and attribution.';
  sh.mergeCells('A59:R59');sh.getCell('A59').value='⚠ Dashboard does not combine MARKETING FUNNEL and DAILY SALES KPI totals. Keep both datasets consistent; marketing values must be entered, not guessed.';
  for(const r of [56,57,59]){const c=sh.getCell('A'+r);c.alignment={wrapText:true,vertical:'middle'};c.font={color:{argb:'FF'+GRAY},italic:true,size:10};sh.getRow(r).height=32;}
  sh.getCell('M34').value='OWNER REVENUE GOAL';sh.getCell('O34').value=p.revenueGoal;sh.getCell('O34').numFmt=curr;
  sh.getCell('M35').value='CURRENT ANNUAL REVENUE';sh.getCell('O35').value=p.annualRevenue;sh.getCell('O35').numFmt=curr;
  sh.getCell('M36').value='REVENUE GAP';sh.getCell('O36').value={formula:'MAX(0,O34-O35)'};sh.getCell('O36').numFmt=curr;
  sh.pageSetup={orientation:'landscape',fitToPage:true,fitToWidth:1,paperSize:9};
}
