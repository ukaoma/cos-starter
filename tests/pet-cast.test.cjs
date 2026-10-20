const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'../control/assets/session-command');
const source=fs.readFileSync(path.join(root,'pet-cast.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'windu-v15/manifest.json'),'utf8'));
const page=fs.readFileSync(path.join(__dirname,'../control/index.html'),'utf8');

function load(){
  const window={matchMedia:()=>({matches:false}),devicePixelRatio:2,addEventListener(){},requestAnimationFrame(){}};
  const context={window,document:{hidden:false},requestAnimationFrame(){},setTimeout,clearTimeout,fetch:()=>new Promise(()=>{})};
  vm.runInNewContext(source,context);
  return window.COSPetCast;
}

/* Width and height from a WebP's own header (VP8X, VP8L or VP8). */
function webpSize(file){
  const b=fs.readFileSync(file);
  assert.equal(b.toString('ascii',0,4)+b.toString('ascii',8,12),'RIFFWEBP',file);
  const kind=b.toString('ascii',12,16);
  if(kind==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];
  if(kind==='VP8L'){const v=b.readUInt32LE(21);return [1+(v&0x3fff),1+((v>>14)&0x3fff)];}
  return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
}

const CASTS={working:4,duel:3,trio:3,swarm:3};

test('the manifest carries every state the page plays, from the shipped Version 15 map',()=>{
  assert.equal(manifest.pack,'Miles Windu Version 15');
  const poses=[...page.matchAll(/data-pet-pose="([a-z]+)"/g)].map(m=>m[1]);
  assert.deepEqual([...poses].sort(),['duel','idle','swarm','trio','working']);
  const deck=fs.readFileSync(path.join(root,'session-deck.js'),'utf8');
  for(const pose of [...poses,...[...deck.matchAll(/pose:'([a-z]+)'/g)].map(m=>m[1])]) assert.ok(manifest.poses[pose],pose);
  for(const [pose,n] of Object.entries(CASTS)){
    for(const sc of Object.values(manifest.poses[pose].scales)) assert.equal(sc.variants.length,n,pose+' casts');
    assert.ok(manifest.poses[pose].scales['2'],pose+' has 2x art');
  }
});

test('every row file exists and is exactly its frames by its crop box',()=>{
  let rows=0;
  const check=(spec,box,count)=>{
    assert.equal(spec.rows.length,Math.ceil(count/spec.cols));
    spec.rows.forEach((rel,r)=>{
      const n=Math.min(spec.cols,count-r*spec.cols);
      assert.deepEqual(webpSize(path.join(root,'windu-v15',rel)),[n*box[2],box[3]],rel);
      rows++;
    });
  };
  for(const entry of Object.values(manifest.poses)){
    for(const sc of Object.values(entry.scales)){
      if(!sc.variants){check(sc,sc.box,entry.frames);continue;}
      const L=sc.layers;
      assert.equal(L.full.start,0);
      assert.equal(L.full.count,entry.handoff-1,'full covers the frames before the handoff');
      assert.equal(L.body.start,entry.handoff-1,'body starts on the handoff frame');
      assert.equal(L.body.start+L.body.count,entry.frames,'body runs to the loop end');
      for(const v of sc.variants){
        check(v.full,L.full.box,L.full.count);
        check(v.body,L.body.box,L.body.count);
        if(L.entry.box) check(v.entry,L.entry.box,L.entry.count); else assert.equal(v.entry,undefined);
      }
    }
  }
  const onDisk=['1x','2x'].flatMap(d=>fs.readdirSync(path.join(root,'windu-v15',d)));
  assert.equal(rows,onDisk.length,'no stray row files');
});

test('casts shuffle with no immediate repeat and every cast plays',()=>{
  const {Sequence}=load()._internals;
  for(const [pose,n] of Object.entries(CASTS)){
    const e=manifest.poses[pose], seq=new Sequence(n,e.frames,e.handoff), seen=new Set(), order=[seq.current];
    for(let i=0;i<e.frames*600;i++){
      const before=seq.current;
      seq.advance();
      if(seq.frame===0){
        assert.notEqual(seq.current,before,pose+' repeated a cast');
        order.push(seq.current);
      }
      assert.notEqual(seq.current,seq.incoming,pose+' incoming equals current');
    }
    order.forEach(c=>seen.add(c));
    assert.equal(seen.size,n,pose+' plays every cast');
  }
});

test('the tail draws the incoming entry under the current body, as the app layers them',()=>{
  const {Player}=load()._internals;
  const p=new Player({dataset:{}},{});
  const sc=manifest.poses.duel.scales['2'], e=manifest.poses.duel;
  p.st={entry:e,sc,seq:{}};
  const rels=parts=>Array.from(parts,x=>String(x[0])); // the vm realm's arrays have a foreign prototype
  const pre=p.need(0,1,2), tail=p.need(e.handoff-1,1,2), last=p.need(e.frames-1,1,2);
  assert.deepEqual(rels(pre),[sc.variants[1].full.rows[0]]);
  assert.deepEqual(rels(tail),[sc.variants[2].entry.rows[0],sc.variants[1].body.rows[0]]);
  assert.equal(last.length,2);
  const working=manifest.poses.working.scales['2'];
  p.st={entry:manifest.poses.working,sc:working,seq:{}};
  assert.equal(p.need(manifest.poses.working.frames-1,0,1).length,1,'an empty entry layer is not drawn');
});
