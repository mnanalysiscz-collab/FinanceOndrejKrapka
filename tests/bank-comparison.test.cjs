const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const context=vm.createContext({window:{},Intl});
for(const file of ['bank-rates-data.js','bank-comparison.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
const data=context.window.mortgageBankData,state=context.window.mortgageBankState,bank={...data.banks.find(b=>b.id==='moneta'),status:'verified',expiresOn:'2026-10-10'};
const input={valid:true,price:6500000,own:1300000,years:30};
assert.equal(state(bank,input,'2026-10-02'),'ready');
assert.equal(state(bank,{...input,own:1299999},'2026-10-02'),'ltv');
assert.equal(state(bank,{...input,price:1250000,own:250000},'2026-10-02'),'amount');
assert.equal(state(bank,{...input,price:1250001.25,own:250000.25},'2026-10-02'),'ready');
assert.equal(state(bank,{...input,own:6500000},'2026-10-02'),'cash');
assert.equal(state(bank,{...input,valid:false},'2026-10-02'),'invalid');
assert.equal(state(bank,input,'2026-10-09'),'ready');
assert.equal(state(bank,input,'2026-10-10'),'expired');
for(const b of data.banks){assert.ok(b.rate>0&&b.rate<20);assert.ok(b.source.startsWith('https://'));assert.ok(b.conditions.length>20)}
console.log('PASS bank eligibility boundaries, invalid/zero loan states, expiry and source data');
(async () => {
  const fresh=JSON.parse(JSON.stringify(data));
  fresh.banks[0].rate=5.12;
  let renders=0;
  context.document={getElementById:()=>null};
  context.window.renderBankComparison(input,()=>0);
  context.window.renderBankComparison=()=>{renders++};
  context.fetch=async (url,options)=>{
    assert.equal(url,'bank-rates-data.js');assert.equal(options.cache,'no-store');
    return {ok:true,text:async()=>`window.mortgageBankData = ${JSON.stringify(fresh)};`};
  };
  assert.equal(await context.window.refreshMortgageBankData(),true);
  assert.equal(context.window.mortgageBankData.banks[0].rate,5.12);
  assert.equal(renders,1,'refresh redraws current mortgage inputs');
  const accepted=context.window.mortgageBankData;
  for(const text of ['not JSON', 'window.mortgageBankData = {"banks": []};']) {
    context.fetch=async()=>({ok:true,text:async()=>text});
    assert.equal(await context.window.refreshMortgageBankData(),false);
    assert.equal(context.window.mortgageBankData,accepted);
  }
  context.fetch=async()=>{throw new Error('offline')};
  assert.equal(await context.window.refreshMortgageBankData(),false);
  assert.equal(context.window.mortgageBankData,accepted);
  assert.equal(state({...fresh.banks[0],expiresOn:'2020-01-01'},input,'2026-10-19'),'expired');
  console.log('PASS fresh rate fetch, redraw, invalid response and offline fallback with expiry');
})().catch(error=>{console.error(error);process.exitCode=1});
