import test from 'node:test';import assert from 'node:assert/strict';
import {validate,buildWorkbook} from '../netlify/functions/_builder.mjs';
const b={company:'Acme',industry:'Manufacturing',email:'a@example.com',annualRevenue:2000000,revenueGoal:3000000,averageDeal:5000,reps:['Alex','Robin'],model:'B2B',notes:'Improve win rate'};
test('validates profile',()=>{const p=validate(b);assert.equal(p.names.length,2);assert.equal(p.annualRevenue,2000000)});
test('generates four useful tabs and KPI formulas',()=>{const p=validate(b),w=buildWorkbook(p);assert.equal(w.sheets.length,4);assert.equal(w.values.length,4);assert.equal(w.values[2].values.length,504);assert.match(w.values[2].values[4][9],/E5\/D5/);assert.equal(w.values[1].values[19][0],'Alex');assert.match(w.values[3].values[9][1],/ROUNDUP/)});
test('deduplicates reps, enforces 15 max, rejects bad emails',()=>{const p=validate({...b,reps:['A','A',...Array.from({length:25},(_,i)=>`Rep${i}`)]});assert.equal(p.names.length,15);assert.throws(()=>validate({...b,email:'bad'}));});
test('protects text against spreadsheet formula injection',()=>{const p=validate({...b,company:'=IMPORTXML("http://evil.example")',reps:['=HYPERLINK("http://evil")']});const w=buildWorkbook(p);assert.match(w.values[0].values[1][1],/^'/);assert.match(w.values[1].values[19][0],/^'/);});
