const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const pages=['index.html','kalkulacky.html','spoluprace.html','kariera.html'];
const contents=Object.fromEntries(pages.map(file=>[file,fs.readFileSync(path.join(root,file),'utf8')]));
const routes=['mortgage','investment','insurance','pension','rentbuy','freedom'];
let checks=0;
for(const [file,html] of Object.entries(contents)){
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,file+' contains duplicate IDs');checks++;
  assert.equal((html.match(/<h1\b/g)||[]).length,1,file+' needs one main heading');checks++;
  assert.equal((html.match(/<section\b/g)||[]).length,(html.match(/<\/section>/g)||[]).length,file+' unbalanced sections');checks++;
  for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    const ref=match[1];if(/^(https?:|mailto:|tel:|data:)/.test(ref))continue;
    const [resource,anchor]=ref.split('#');
    const target=resource.split('?')[0]||file;
    assert.ok(fs.existsSync(path.join(root,target)),file+' -> missing '+ref);checks++;
    if(anchor&&target.endsWith('.html')){
      const document=contents[target];
      const calculatorRoute=target==='kalkulacky.html'&&(routes.includes(anchor)||routes.some(name=>anchor==='result-'+name));
      assert.ok(calculatorRoute||document?.includes('id="'+anchor+'"'),file+' -> missing anchor '+ref);checks++;
    }
  }
  for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new Function(script[1]);checks++;
}
assert.ok(!contents['index.html'].includes('class="calculator-view'),'Calculator panels must not be on home');checks++;
assert.ok(!contents['index.html'].includes('function calcMortgage'),'Home must not execute calculator code');checks++;
assert.ok(!contents['kalkulacky.html'].includes('id="contactForm"'),'Calculator page must link to the main contact');checks++;
assert.equal((contents['index.html'].match(/Spolupráce začíná rozhovorem\./g)||[]).length,1);checks++;
assert.equal((contents['kalkulacky.html'].match(/role="tabpanel"/g)||[]).length,6);checks++;
new Function(fs.readFileSync(path.join(root,'script.js'),'utf8'));checks++;
console.log(`PASS ${checks} page, link, asset and script checks`);
