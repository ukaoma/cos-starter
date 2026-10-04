const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function harness(state='working',reduced=false){
 let tick=null,hidden=false,writes=[],connected=true;
 const canvas={getAttribute:()=>state,get isConnected(){return connected},getBoundingClientRect:()=>({top:0,bottom:24}),getContext:()=>({createImageData:()=>({data:new Uint8ClampedArray(2304)}),putImageData:p=>writes.push(Array.from(p.data))})};
 const ctx={atob:s=>Buffer.from(s,'base64').toString('binary'),innerHeight:800,matchMedia:()=>({matches:reduced}),setInterval:(fn,ms)=>{assert.equal(ms,500);tick=fn;return 1},clearInterval:()=>{tick=null},document:{get hidden(){return hidden},querySelectorAll:()=>[]}};
 for(const file of ['docs-signal-data.js','docs-signals.js'])vm.runInNewContext(fs.readFileSync('assets/'+file,'utf8'),ctx);
 const el={querySelectorAll:()=>[canvas]};
 return {ctx,el,writes,step:()=>tick?.(),hide:()=>{hidden=true},remove:()=>{connected=false},hasTimer:()=>!!tick};
}
test('native frames are 24px gray8; status symbols are distinct',()=>{
 const {ctx}=harness();const frames=ctx.CosDocsSignalData.frames;
 for(const rows of Object.values(frames))for(const frame of rows)assert.equal(Buffer.from(frame,'base64').length,576);
 assert.notEqual(frames.question[0],frames.approval[0]);assert.notEqual(frames.working[0],frames.complete[2]);
});
test('working loops repeatedly and pauses explicitly',()=>{
 const h=harness();h.ctx.CosDocsSignals.mount(h.el,true);
 for(let i=0;i<17;i++)h.step();assert.equal(h.writes.length,18);assert.deepEqual(h.writes[0],h.writes[8]);assert.notDeepEqual(h.writes[0],h.writes[1]);
 h.ctx.CosDocsSignals.mount(h.el,false);assert.equal(h.hasTimer(),false);
});
test('offline and waiting pulse; completion stays filled and static',()=>{
 for(const state of ['offline','waiting']){const h=harness(state);h.ctx.CosDocsSignals.mount(h.el,true);h.step();h.step();assert.notDeepEqual(h.writes[0],h.writes[2]);}
 const h=harness('complete');h.ctx.CosDocsSignals.mount(h.el,true);assert.equal(h.hasTimer(),false);assert.equal(h.writes[0][(12*24+12)*4+3],255);
});
test('reduced motion is still, hidden pages do not draw, removed canvases release timer',()=>{
 const r=harness('working',true);r.ctx.CosDocsSignals.mount(r.el,true);assert.equal(r.hasTimer(),false);
 const h=harness();h.ctx.CosDocsSignals.mount(h.el,true);h.hide();h.step();assert.equal(h.writes.length,1);h.remove();h.step();assert.equal(h.hasTimer(),false);
});
