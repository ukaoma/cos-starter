#!/usr/bin/env node
/* Convert the approved app pack to bounded, lossless WebP rows. No poses, timing,
   geometry or alpha are changed. Requires sharp (npm install --no-save sharp).
   node scripts/build-windu-illustrated-atlases.mjs --src APP_PACK --out WEB_PACK
   --control-version VERSION [--sharp /path/to/sharp]
*/
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const args = Object.fromEntries(process.argv.slice(2).reduce((a,v,i,vs) => i % 2 ? a : [...a,[v.slice(2),vs[i+1]]],[]));
const sharp = require(args.sharp || 'sharp');
sharp.cache(false);
sharp.concurrency(2);
const src = args.src, out = args.out;
if (!src || !out || !args['control-version']) throw Error('src, out and control-version are required');
const mapBytes = await fs.readFile(path.join(src,'session-pet-states.json'));
const states = JSON.parse(mapBytes).poses;
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const manifest = {pack:'Miles Windu Illustrated',control:args['control-version'],
  statesSha256:sha(mapBytes),encoding:'lossless WebP, exact alpha',sourceFiles:{},assets:{},poses:{}};
const MAX_W = 8192, MAX_PIXELS = 2_500_000;
const castPoses = ['working','duel','trio','swarm'];

async function load(files,total) {
  const chunks = []; let start = 0, cw, ch;
  for (const name of [files].flat()) {
    const data = await fs.readFile(path.join(src,name));
    manifest.sourceFiles[name] = sha(data);
    const {data:raw,info} = await sharp(data,{limitInputPixels:false}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    ch ??= info.height;
    // Every app strip has one row; segmented retina strips keep the same cell width.
    const cellWidth = Number.isInteger(info.width / total) && [files].flat().length === 1
      ? info.width / total : states[currentPose].retina.scale * baseCellWidth;
    cw ??= cellWidth;
    if (info.width % cw || info.height !== ch || info.channels !== 4) throw Error('Invalid strip '+name);
    const count = info.width / cw;
    chunks.push({raw,width:info.width,start,count}); start += count;
  }
  if (start !== total) throw Error('Frame count differs from map');
  return {chunks,cw,ch};
}
function frame(strip,k) {
  const chunk = strip.chunks.find(c => k >= c.start && k < c.start+c.count);
  if (!chunk) throw Error('Missing frame '+k);
  return {chunk,x:(k-chunk.start)*strip.cw};
}
function bounds(strip,start,count) {
  let l=strip.cw,t=strip.ch,r=-1,b=-1;
  for (let k=start;k<start+count;k++) {
    const {chunk,x} = frame(strip,k);
    for (let y=0;y<strip.ch;y++) for (let i=0;i<strip.cw;i++) {
      if (!chunk.raw[((y*chunk.width+x+i)*4)+3]) continue;
      l=Math.min(l,i);t=Math.min(t,y);r=Math.max(r,i);b=Math.max(b,y);
    }
  }
  return r<0 ? null : [Math.max(0,l-2),Math.max(0,t-2),Math.min(strip.cw,r+3),Math.min(strip.ch,b+3)];
}
function union(a,b) {return !a ? b : !b ? a : [Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[2],b[2]),Math.max(a[3],b[3])];}
async function pack(strip,start,count,box,folder,name) {
  const [l,t,r,b]=box, w=r-l,h=b-t;
  const perRow=Math.max(1,Math.min(count,Math.floor(MAX_W/w),Math.floor(MAX_PIXELS/(w*h))));
  const cols=Math.ceil(count/Math.ceil(count/perRow)),rows=[];
  for (let row=0;row<Math.ceil(count/cols);row++) {
    const n=Math.min(cols,count-row*cols),raw=Buffer.alloc(n*w*h*4);
    for (let c=0;c<n;c++) {
      const {chunk,x}=frame(strip,start+row*cols+c);
      for (let y=0;y<h;y++) {
        const offset=((t+y)*chunk.width+x+l)*4;
        chunk.raw.copy(raw,(y*n*w+c*w)*4,offset,offset+w*4);
      }
    }
    const rel=`${folder}/${name}-r${row}.webp`;
    const encoded=await sharp(raw,{raw:{width:n*w,height:h,channels:4}}).webp({lossless:true,effort:4}).toBuffer();
    await fs.writeFile(path.join(out,rel),encoded);
    manifest.assets[rel]={sha256:sha(encoded),bytes:encoded.length};
    rows.push(rel);
  }
  return {cols,rows};
}
let currentPose,baseCellWidth,baseCellHeight;
for (const pose of [...castPoses,'idle','waiting','patrol','done']) {
  currentPose=pose;
  const p=states[pose],n=p.frames,rotation=p.rotation;
  const entry={frames:n,interval:p.interval,renderScale:p.renderScale ?? 1,scales:{}};
  if (rotation) entry.handoff=rotation.handoffFrame;
  const baseMeta=await sharp(path.join(src,p.file),{limitInputPixels:false}).metadata();
  baseCellWidth=baseMeta.width/n;baseCellHeight=baseMeta.height;
  for (const scale of [1,2]) {
    const folder=`${scale}x`;await fs.mkdir(path.join(out,folder),{recursive:true});
    const source=scale===1 ? {file:p.file,variants:rotation?.variants} : p.retina;
    const cw=baseCellWidth*scale,ch=baseCellHeight*scale,sc={cell:[cw,ch]};
    if (rotation) {
      const specs={full:{key:'file',start:0,count:entry.handoff-1},
        body:{key:'bodyFile',start:entry.handoff-1,count:n-entry.handoff+1},
        entry:{key:'entryFile',start:entry.handoff-1,count:n-entry.handoff+1}};
      sc.layers={};sc.variants=source.variants.map(v=>({id:v.id}));
      for (const [layer,spec] of Object.entries(specs)) {
        let box=null;
        for (const v of source.variants) box=union(box,bounds(await load(v[spec.key],n),spec.start,spec.count));
        sc.layers[layer]={box:box ? [box[0],box[1],box[2]-box[0],box[3]-box[1]] : null,start:spec.start,count:spec.count};
        if (!box) continue;
        for (let i=0;i<source.variants.length;i++) {
          const v=source.variants[i];
          sc.variants[i][layer]=await pack(await load(v[spec.key],n),spec.start,spec.count,box,folder,`${v.id}-${layer}`);
        }
      }
    } else {
      const strip=await load(source.file,n),box=bounds(strip,0,n) || [0,0,cw,ch];
      sc.box=[box[0],box[1],box[2]-box[0],box[3]-box[1]];
      Object.assign(sc,await pack(strip,0,n,box,folder,pose));
    }
    entry.scales[scale]=sc;
    console.log(`${pose} ${scale}x complete`);
  }
  manifest.poses[pose]=entry;
}
await fs.writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Wrote',out);
