const limit=(s,n=150)=>typeof s==='string'?s.trim().slice(0,n):'';

export function validate(body){
  const company=limit(body.company,100), industry=limit(body.industry,100);
  const names=[...new Set((Array.isArray(body.reps)?body.reps:[]).map(n=>limit(n,40)).filter(Boolean))].slice(0,15);
  const rev=Number(body.annualRevenue),goal=Number(body.revenueGoal),deal=Number(body.averageDeal);
  if(!company||!industry||names.length<1||!Number.isFinite(rev)||rev<0||rev>1e11||!Number.isFinite(goal)||goal<0||goal>1e11||!Number.isFinite(deal)||deal<0||deal>1e9) throw new Error('Enter valid business details, revenue figures and at least one salesperson.');
  return {company,industry,names,annualRevenue:rev,revenueGoal:goal,averageDeal:deal,model:limit(body.model,80)||'Appointments / consultations', notes:limit(body.notes,500)};
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
  book.creator='Cash Out Challenge';
  book.title=w.title;
  book.calcProperties.fullCalcOnLoad=true;
  book.calcProperties.forceFullCalc=true;
  const dark='1C2A3D',light='EAF0F7',gold='C5A36A';
  for(let i=0;i<w.sheets.length;i++){
    const {title}=w.sheets[i].properties;
    const sh=book.addWorksheet(title,{views:[{state:'frozen',ySplit:title==='DAILY SALES KPI'?4:0}]});
    sh.properties.defaultRowHeight=19;
    sh.getColumn(1).width=34;
    for(let c=2;c<=14;c++)sh.getColumn(c).width=18;
    if(title==='DAILY SALES KPI'){ sh.getColumn(1).width=15;sh.getColumn(2).width=24;sh.getColumn(13).width=42;}
    if(title==='EXECUTIVE DASHBOARD'){ sh.getColumn(1).width=29;sh.getColumn(2).width=23; }
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
