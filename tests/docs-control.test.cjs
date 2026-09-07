const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/docs-control.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../docs/index.html'),'utf8');
function load(){const context={};vm.runInNewContext(source,context);return context.CosDocsControl;}
const decode=s=>s.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');

test('every chapter on the page has a scene, and every scene has a chapter',()=>{
  const control=load();
  const chapters=[...html.matchAll(/data-cc-scene="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual([...chapters].sort(),Object.keys(control.scenes).sort());
  assert.equal(chapters[0],'status','The resting panel is the first chapter');
  assert.equal(new Set(chapters).size,chapters.length,'chapter keys are unique');
});

test('every row a scene lights or rewrites exists in the panel markup',()=>{
  const control=load();
  const rows=new Set([...html.matchAll(/data-cc-row="([^"]+)"/g)].map(m=>m[1]));
  for(const [name,scene] of Object.entries(control.scenes)){
    for(const key of scene.lit||[])assert.ok(rows.has(key),name+' lights a real row: '+key);
    for(const key of Object.keys(scene.tier||{}))assert.ok(rows.has(key),name+' rewrites a real row: '+key);
    if(scene.server)assert.ok(rows.has('server'),name+' needs the server row');
    if(scene.row)assert.ok(rows.has('jobs'),name+' inserts after the jobs row');
  }
  assert.ok(rows.has('server')&&rows.has('tier')&&rows.has('dictate')&&rows.has('commit')&&rows.has('polish'));
});

test('cards, notices, footers and ledgers render their scene text and escape markup',()=>{
  const control=load();
  for(const [name,scene] of Object.entries(control.scenes)){
    const card=control.cardHtml(name);
    assert.equal(!!card,!!scene.card,name+' card presence');
    if(scene.card){
      assert.ok(card.includes('<h4>'+scene.card.title+'</h4>'));
      for(const item of scene.card.list||[])assert.ok(decode(card).includes(item.text),name+' lists '+item.text);
      for(const row of scene.card.rows||[])assert.ok(decode(card).includes(row[1]),name+' shows '+row[1]);
      for(const lane of scene.card.lanes||[])assert.ok(decode(card).includes(lane[0]),name+' shows lane '+lane[0]);
    }
    assert.equal(!!control.noticeHtml(name),!!scene.notice,name+' notice presence');
    assert.equal(!!control.footHtml(name),!!scene.foot,name+' footer presence');
    assert.equal(!!control.ledgerHtml(name),!!scene.ledger,name+' ledger presence');
  }
  control.scenes.origin.card.list[0].text='<img onerror=x>';
  assert.ok(!control.cardHtml('origin').includes('<img'),'card text is escaped');
});

test('the resting panel never duplicates the drift-checked version claim',()=>{
  const plain=html.replace(/&#183;|&middot;/g,'·');
  assert.equal((plain.match(/Managed · 6\.\d+\.\d+/g)||[]).length,1,'exactly one Managed mock in markup');
  assert.equal((source.match(/Managed ·/g)||[]).length,0,'scenes never restate the server version');
  assert.ok(html.includes('data-control-exhibit') && html.includes('data-cc-panel') && html.includes('data-cc-caption'));
});
