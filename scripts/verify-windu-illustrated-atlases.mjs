#!/usr/bin/env node
/* Independent source/alpha/pixel check for the web export. Same CLI paths as the
   exporter; verifies source hashes and samples both ends and the middle of every
   output row against the app's segmented source strips. Requires sharp. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const args=Object.fromEntries(process.argv.slice(2).reduce((a,v,i,vs)=>i%2?a:[...a,[v.slice(2),vs[i+1]]],[]));
const sharp=require(args.sharp||'sharp');sharp.cache(false);sharp.concurrency(2);
const src=args.src,out=args.out;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const bytes=await fs.readFile(path.join(src,'session-pet-states.json')),states=JSON.parse(bytes).poses;
const manifest=JSON.parse(await fs.readFile(path.join(out,'manifest.json')));
assert.equal(digest(bytes),manifest.statesSha256,'source state map changed');
for(const [name,hash] of Object.entries(manifest.sourceFiles)) assert.equal(digest(await fs.readFile(path.join(src,name))),hash,name);
for(const [name,pin] of Object.entries(manifest.assets)) {
  const data=await fs.readFile(path.join(out,name));assert.equal(data.length,pin.bytes,name+' size');assert.equal(digest(data),pin.sha256,name+' hash');
}
let checked=0;
for(const [pose,e] of Object.entries(manifest.poses)) {
  const p=states[pose];assert.equal(e.frames,p.frames);assert.equal(e.interval,p.interval);
  for(const [scale,sc] of Object.entries(e.scales)) {
    const sources=scale==='1'?{file:p.file,variants:p.rotation?.variants}:p.retina;
    const variants=sc.variants||[sc];
    for(let v=0;v<variants.length;v++) for(const layer of sc.variants?['full','body','entry']:['single']) {
      const L=sc.variants?sc.layers[layer]:{box:sc.box,start:0,count:e.frames};
      if(!L.box) continue;
      const spec=layer==='single'?sc:variants[v][layer];
      const files=layer==='single'?sources.file:sources.variants[v][{full:'file',body:'bodyFile',entry:'entryFile'}[layer]];
      const segments=[];let offset=0;
      for(const name of [files].flat()) {
        const meta=await sharp(path.join(src,name),{limitInputPixels:false}).metadata();
        segments.push({name,offset,count:meta.width/sc.cell[0]});offset+=meta.width/sc.cell[0];
      }
      for(let r=0;r<spec.rows.length;r++) {
        const bmp=await sharp(path.join(out,spec.rows[r])).ensureAlpha().raw().toBuffer({resolveWithObject:true});
        const n=Math.min(spec.cols,L.count-r*spec.cols),[l,t,w,h]=L.box;
        assert.equal(bmp.info.width,n*w);assert.equal(bmp.info.height,h);
        for(const col of new Set([0,Math.floor(n/2),n-1])) {
          const frame=L.start+r*spec.cols+col;
          const seg=segments.find(s=>frame>=s.offset&&frame<s.offset+s.count);
          const original=await sharp(path.join(src,seg.name),{limitInputPixels:false})
            .extract({left:(frame-seg.offset)*sc.cell[0]+l,top:t,width:w,height:h}).ensureAlpha().raw().toBuffer();
          for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
            const a=(y*w+x)*4,b=(y*n*w+col*w+x)*4;
            assert.equal(bmp.data[b+3],original[a+3],`${pose} frame ${frame}: alpha`);
            if(original[a+3]) for(let channel=0;channel<3;channel++)
              assert.equal(bmp.data[b+channel],original[a+channel],`${pose} frame ${frame}: visible color`);
          }
          checked++;
        }
      }
    }
  }
  console.log(pose+' source pixels and alpha passed');
}
console.log(JSON.stringify({sourceHashes:Object.keys(manifest.sourceFiles).length,sampledFrames:checked,statesSha256:manifest.statesSha256}));
