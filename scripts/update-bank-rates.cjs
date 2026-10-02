const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
function textFromHtml(html){
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const v=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return v<=0x10ffff?String.fromCodePoint(v):' ';})
    .replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
}
function parseRate(id,html){
  const t=textFromHtml(html);let m;
  if(id==='moneta')m=t.match(/Platné podmínky pro (\d+,\d{2}) % pro každého Sazba \1 % ročně platí pro všechny žadatele o hypotéku s tříletou fixací úrokové sazby, s LTV do 80 % a s výší úvěru nad 1 milion korun\./);
  if(id==='csas')m=t.match(/Hypotéka, která se vám přizpůsobí\. S úrokem od (\d+,\d{2}) % ročně/);
  if(id==='kb')m=t.match(/Jak získat úrokovou sazbu (\d+,\d{2}) % p\. a\. Výhodná úroková sazba při splnění těchto podmínek\s*:\s*Směřování vašich příjmů na u nás vedený účet Uzavření smlouvy o rizikovém životním pojištění u Komerční pojišťovny, a\. s\. Uzavření smlouvy o pojištění zastavené nemovitosti u Komerční pojišťovny, a\.s\. Předložení PENB v energetické třídě A nebo B k zastavené nemovitosti/);
  if(!m)throw Error('Sazba nebo očekávané podmínky nebyly jednoznačně nalezeny');
  const rate=Number(m[1].replace(',','.'));if(rate<0.1||rate>20)throw Error('Sazba mimo povolený rozsah');return rate;
}
const pragueDate=now=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Prague'}).format(now);
function scheduleMatches(cron,now){
  const offset=new Intl.DateTimeFormat('en',{timeZone:'Europe/Prague',timeZoneName:'shortOffset'}).formatToParts(now).find(p=>p.type==='timeZoneName').value;
  return cron===(offset==='GMT+2'?'0 23 * * *':'0 0 * * *');
}
async function update(data,fetcher=fetch,now=new Date()){
  const checkedOn=pragueDate(now),expiry=new Date(checkedOn+'T00:00:00Z');expiry.setUTCDate(expiry.getUTCDate()+3);
  const results=await Promise.allSettled(data.banks.map(async bank=>{
    const response=await fetcher(bank.source,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'FinanceOndrejKrapka-rate-check/1.0'}});
    if(!response.ok)throw Error('HTTP '+response.status);
    const rate=parseRate(bank.id,await response.text());
    return {...bank,rate,checkedOn,checkedAt:now.toISOString(),expiresOn:expiry.toISOString().slice(0,10),status:'verified',lastAttemptAt:now.toISOString()};
  }));
  let failed=0;
  const banks=results.map((r,i)=>{if(r.status==='fulfilled')return r.value;failed++;console.error(data.banks[i].id+': '+r.reason.message);return {...data.banks[i],status:'unavailable',lastAttemptAt:now.toISOString()};});
  return {data:{...data,automatic:true,banks},failed};
}
async function main(){
  if(process.argv.includes('--schedule-check')){
    const run=process.env.GITHUB_EVENT_NAME!=='schedule'||scheduleMatches(process.env.RATE_SCHEDULE,new Date());
    fs.appendFileSync(process.env.GITHUB_OUTPUT,'run='+run+'\n');return;
  }
  const file=path.join(root,'bank-rates-data.js');
  const data=JSON.parse(fs.readFileSync(file,'utf8').split('window.mortgageBankData = ')[1].trim().replace(/;$/,''));
  const result=await update(data);
  const temp=file+'.tmp';fs.writeFileSync(temp,'// Automatically checked public starting rates. See scripts/update-bank-rates.cjs.\nwindow.mortgageBankData = '+JSON.stringify(result.data,null,2)+';\n');fs.renameSync(temp,file);
  console.log('Verified '+(data.banks.length-result.failed)+'/'+data.banks.length+' banks.');
  if(process.env.GITHUB_OUTPUT)fs.appendFileSync(process.env.GITHUB_OUTPUT,'failed='+result.failed+'\n');
  if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,'Verified '+(data.banks.length-result.failed)+'/'+data.banks.length+' bank sources. Failed banks are hidden until verification succeeds.\n');
}
module.exports={parseRate,textFromHtml,scheduleMatches,update};
if(require.main===module)main().catch(e=>{console.error(e.message);process.exitCode=1;});
