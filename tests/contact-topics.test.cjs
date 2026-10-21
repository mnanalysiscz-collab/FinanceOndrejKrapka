const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const home=fs.readFileSync('index.html','utf8'),calculators=fs.readFileSync('kalkulacky.html','utf8');
const start=home.indexOf('    const contactTopics='),end=home.indexOf('    const requestedBank=',start);
const code=home.slice(start,end);
for(const topic of ['mortgage','investment','insurance','pension','rentbuy','freedom','kariera','unknown','__proto__','']) {
 const clicks=[],selectedFuture={textContent:''},futureInput={value:''};
 vm.runInNewContext(code,{URLSearchParams,location:{search:'?tema='+encodeURIComponent(topic)},selectedFuture,futureInput,document:{querySelector:selector=>({click:()=>clicks.push(selector)})}});
 const valid=!['unknown','__proto__',''].includes(topic);
 assert.equal(clicks.length,valid?1:0,topic);
 if(valid){assert.ok(home.includes(clicks[0].match(/data-future="([^"]+)"/)[0]),topic);assert.ok(futureInput.value);assert.equal(selectedFuture.textContent,futureInput.value)}
 if(valid&&topic!=='kariera') assert.ok(calculators.includes('href="index.html?tema='+topic+'#kontakt"'),topic);
}
assert.equal((calculators.match(/<details class="calculator-explanation">/g)||[]).length,6);
console.log('PASS six calculator routes, career compatibility, invalid topics and result guidance');
