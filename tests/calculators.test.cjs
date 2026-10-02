// Runs the calculator functions embedded in the shipped page. No duplicated formulas.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const page=fs.readFileSync(path.join(__dirname,'../kalkulacky.html'),'utf8');
const definitions={};
for(const tag of page.matchAll(/<[^>]+\bid="[^"]+"[^>]*>/g)){
  const attrs=Object.fromEntries([...tag[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));
  definitions[attrs.id]=attrs;
}
function setup(){
  const elements={};
  for(const [id,a] of Object.entries(definitions))elements[id]={...a,value:a.value||'',defaultValue:a.value||'',min:a.min||'',max:a.max||'',textContent:'',innerHTML:'',dataset:{integer:String(!a.step||Number(a.step)>=1)},offsetParent:null,style:{setProperty(){}},closest(){return null},setAttribute(k,v){this[k]=v},setCustomValidity(v){this.validationMessage=v}};
  const context=vm.createContext({Intl,Math,Number,document:{getElementById:id=>elements[id],querySelectorAll:()=>[]},window:{},requestAnimationFrame(){}});
  const start=page.indexOf('    const currency='),end=page.indexOf('    const calculators=',start);
  vm.runInContext(page.slice(start,end),context);
  context.charts={};vm.runInContext('drawLineChart=(id,series,target)=>{charts[id]={series,target}}',context);
  const validateStart=page.indexOf('    function validateCalculator'),validateEnd=page.indexOf('    function calculateView',validateStart);
  vm.runInContext(page.slice(validateStart,validateEnd),context);
  return {
    elements,charts:context.charts,
    fill(values){for(const [id,value] of Object.entries(values))elements[id].value=String(value);return this},
    run(name){vm.runInContext('calc'+name+'()',context);return this},
    value(id){return Number(elements[id].textContent.replace(/[^\d,\-]/g,'').replace(',','.'))},
    text(id){return elements[id].textContent},
    validate(ids){const notice={},result={};const view={querySelectorAll:()=>ids.map(id=>elements[id]),querySelector:q=>q==='.calc-validation'?notice:q==='.calculator-result'?result:{textContent:'Pole'}};return context.validateCalculator(view)}
  };
}
const cases=[];const test=(name,fn)=>cases.push([name,fn]);
const close=(actual,expected,tolerance=1)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
test('Default mortgage matches independent payment benchmark',()=>{const c=setup().run('Mortgage');close(c.value('mPayment'),26316.747);close(c.value('mInterest'),4274029);assert.equal(c.text('mActualYears'),'30 let')});
test('Zero-rate mortgage repays exact principal',()=>{const c=setup().fill({mPrice:1200000,mOwn:0,mRate:0,mYears:10}).run('Mortgage');close(c.value('mPayment'),10000);assert.equal(c.value('mInterest'),0);assert.equal(c.charts.mortgageChart.series[0].data.at(-1).v,0)});
test('Cash purchase does not invent payments or interest',()=>{const c=setup().fill({mOwn:6500000,mExtra:500000}).run('Mortgage');assert.equal(c.value('mPayment'),0);assert.equal(c.value('mInterest'),0)});
test('Overpayment caps first and final payment at remaining debt',()=>{const c=setup().fill({mPrice:500000,mOwn:490000,mExtra:500000,mRate:12}).run('Mortgage');assert.equal(c.value('mPayment'),10100);assert.equal(c.text('mActualYears'),'1 měsíc');assert.equal(c.value('mInterest'),100);assert.equal(c.charts.mortgageChart.series[0].data.at(-1).t,1/12)});
test('Overpayment reduces interest',()=>{const a=setup().run('Mortgage'),b=setup().fill({mExtra:5000}).run('Mortgage');assert.ok(b.value('mInterest')<a.value('mInterest'));assert.ok(b.value('mSavedInterest')>0)});
test('Investment with zero return equals contributions',()=>{const c=setup().fill({iInitial:100000,iMonthly:1000,iYears:2,iReturn:0,iFee:0,iInflation:0,iGrowth:0}).run('Investment');assert.equal(c.value('iFinal'),124000);assert.equal(c.value('iInvested'),124000)});
test('Annual contribution growth starts after the first year',()=>{const c=setup().fill({iInitial:0,iMonthly:1000,iYears:2,iReturn:0,iFee:0,iGrowth:10}).run('Investment');assert.equal(c.value('iFinal'),25200)});
test('Investment supports losses and inflation',()=>{const c=setup().fill({iInitial:100000,iMonthly:0,iYears:1,iReturn:-10,iFee:0,iInflation:10}).run('Investment');close(c.value('iFinal'),90000);close(c.value('iReal'),90000/1.1);assert.equal(c.value('iProfit'),-10000)});
test('Annual fee follows the disclosed percentage-point approximation',()=>{const c=setup().fill({iInitial:100000,iMonthly:0,iYears:1,iReturn:7,iFee:1}).run('Investment');close(c.value('iFinal'),106000)});
test('Insurance savings offset debt as well as family expenses',()=>{const c=setup().fill({lExpenses:0,lDebt:1000000,lChildren:0,lReserve:1500000}).run('Insurance');assert.equal(c.value('lDeath'),0);assert.equal(c.value('lInvalidity'),0);assert.equal(c.value('lGap'),0)});
test('Insurance reserve is subtracted exactly once',()=>{const c=setup().fill({lExpenses:10000,lSurvivorIncome:0,lSupportYears:1,lDebt:100000,lChildren:0,lReserve:50000,lExisting:20000}).run('Insurance');assert.equal(c.value('lDeath'),170000);assert.equal(c.value('lGap'),150000)});
test('Sickness gap retains debt instalments',()=>{const c=setup().fill({lExpenses:20000,lDebtPayment:10000,lIncome:40000,lSickReplacement:50}).run('Insurance');assert.equal(c.value('lSick'),10000)});
test('Pension zero-real-return boundary has no division by zero',()=>{const c=setup().fill({pAge:40,pRetire:60,pDesired:10000,pState:0,pCurrent:0,pDrawYears:20,pReturn:0,pPostReturn:0,pInflation:0}).run('Pension');assert.equal(c.value('pCapital'),2400000);assert.equal(c.value('pMonthly'),10000);close(c.charts.pensionChart.series[0].data.at(-1).v,2400000,.01)});
test('Pension handles negative real returns',()=>{const c=setup().fill({pReturn:1,pPostReturn:1,pInflation:10}).run('Pension');assert.ok(c.value('pMonthly')>0);const graph=c.charts.pensionChart;close(graph.series[0].data.at(-1).v,graph.target,.1)});
test('Covered pension income needs no additional contribution',()=>{const c=setup().fill({pState:40000}).run('Pension');assert.equal(c.value('pMonthly'),0)});
test('Rent-buy recognises an actual tie',()=>{const c=setup().fill({rPrice:500000,rOwn:500000,rRent:0,rYears:1,rGrowth:0,rRentGrowth:0,rInvest:0,rMaintenance:0,rBuyCosts:0}).run('RentBuy');assert.equal(c.text('rWinner'),'Srovnatelný výsledek');assert.equal(c.value('rDifference'),0)});
test('Rent-buy conserves equal budgets at zero rates',()=>{const c=setup().fill({rPrice:600000,rOwn:0,rRent:10000,rRate:0,rMortgageYears:5,rYears:10,rGrowth:0,rRentGrowth:0,rInvest:0,rMaintenance:0,rBuyCosts:0}).run('RentBuy');assert.equal(c.value('rRemainingLoan'),0);assert.equal(c.value('rBuyWealth'),1200000);assert.equal(c.value('rOwnerPortfolio'),600000)});
test('Rent-buy purchase costs use the same starting capital',()=>{const c=setup().fill({rPrice:500000,rOwn:500000,rRent:0,rYears:1,rGrowth:0,rRentGrowth:0,rInvest:0,rMaintenance:0,rBuyCosts:2}).run('RentBuy');assert.equal(c.value('rRentWealth'),510000);assert.equal(c.value('rBuyWealth'),500000)});
test('Freedom reached inside a year has an exact graph endpoint',()=>{const c=setup().fill({fIncome:1000,fWithdrawal:4,fCurrent:299000,fMonthly:1000,fReturn:0,fInflation:0}).run('Freedom');assert.equal(c.text('fYears'),'1 měsíc');assert.equal(c.charts.freedomChart.series[0].data.at(-1).v,300000);assert.equal(c.charts.freedomChart.series[0].data.at(-1).t,1/12)});
test('Freedom can already be reached',()=>{const c=setup().fill({fIncome:1000,fWithdrawal:4,fCurrent:400000}).run('Freedom');assert.equal(c.text('fYears'),'Cíl již dosažen')});
test('Unreachable freedom does not promise eventual attainment',()=>{const c=setup().fill({fCurrent:0,fMonthly:0,fReturn:0,fInflation:0}).run('Freedom');assert.equal(c.text('fYears'),'Nedosaženo do 100 let')});
test('Empty, fractional years and impossible relations are rejected without mutation',()=>{const c=setup();for(const [id,value] of [['mPrice',''],['mYears','2.5'],['mOwn','99999999'],['pRetire','30'],['iReturn','-30']]){c.fill({[id]:value});assert.equal(c.validate([id]),false,id);assert.equal(c.elements[id].value,value)}});
test('Every calculator remains finite at minimum and maximum field boundaries',()=>{
 const groups={Mortgage:'m',Investment:'i',Insurance:'l',Pension:'p',RentBuy:'r',Freedom:'f'};
 for(const [name,prefix] of Object.entries(groups))for(const edge of ['min','max']){
  const c=setup();for(const [id,e] of Object.entries(c.elements))if(id.startsWith(prefix)&&e.type==='number')e.value=e[edge];
  if(name==='Pension')c.fill({pAge:40,pRetire:65});
  c.run(name);
  for(const [id,e] of Object.entries(c.elements))if(id.startsWith(prefix))assert.ok(!/NaN|Infinity|∞/.test(e.textContent),name+' '+id);
  for(const chart of Object.values(c.charts))for(const series of chart.series)for(const point of series.data)assert.ok(Number.isFinite(point.v),name+' chart');
 }
});
let failed=0;for(const [name,fn] of cases){try{fn();console.log('PASS '+name)}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack)}}
console.log(`${cases.length-failed}/${cases.length} passed`);process.exitCode=failed?1:0;
