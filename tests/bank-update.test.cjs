const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const {parseRate,scheduleMatches,update}=require('../scripts/update-bank-rates.cjs');
const samples=Object.fromEntries(['moneta','csas','kb'].map(id=>[id,fs.readFileSync(path.join(__dirname,'fixtures',id+'.txt'),'utf8')]));
(async()=>{
for(const [id,rate] of Object.entries({moneta:4.99,csas:5.39,kb:5.49})){assert.equal(parseRate(id,samples[id]),rate);assert.throws(()=>parseRate(id,'Access denied 5,99 %'));}
assert.equal(parseRate('csas',samples.csas.replace('5,39','5,69')),5.69);
assert.throws(()=>parseRate('moneta',samples.moneta.replace('80 %','70 %')));
assert.throws(()=>parseRate('kb',samples.kb.replace('A nebo B','pouze A')));
assert.equal(parseRate('csas','<script>Hypotéka, která se vám přizpůsobí. S úrokem od 1,00 % ročně</script>'+samples.csas),5.39);
for(const [date,cron] of [['2026-07-01T23:00:00Z','0 23 * * *'],['2026-12-01T00:00:00Z','0 0 * * *'],['2026-10-24T23:00:00Z','0 23 * * *'],['2026-10-26T00:00:00Z','0 0 * * *']]){assert.ok(scheduleMatches(cron,new Date(date)));assert.ok(!scheduleMatches(cron==='0 0 * * *'?'0 23 * * *':'0 0 * * *',new Date(date)));}
const data={banks:Object.keys(samples).map(id=>({id,source:id,rate:4,checkedOn:'2026-01-01',expiresOn:'2026-01-04'}))};
const result=await update(data,async id=>({ok:true,text:async()=>id==='kb'?'changed page':samples[id]}),new Date('2026-10-02T23:00:00Z'));
assert.equal(result.failed,1);assert.equal(result.data.banks[0].checkedOn,'2026-10-03');assert.equal(result.data.banks[0].expiresOn,'2026-10-06');assert.equal(result.data.banks[2].checkedOn,'2026-01-01');assert.equal(result.data.banks[2].status,'unavailable');assert.equal(data.banks[0].rate,4);
console.log('PASS parsers, changed terms, script exclusion, DST scheduling and partial failure');
})().catch(e=>{console.error(e);process.exitCode=1});
