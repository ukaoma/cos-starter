// Keep no-JavaScript examples byte-identical to the interactive fixture renderer.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),file=path.join(root,'docs/index.html'),ctx={};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/docs-hud.js'),'utf8'),ctx);
for(const file of [path.join(root,'docs/index.html'),path.join(root,'index.html'),path.join(root,'wizard/index.html')]){
let html=fs.readFileSync(file,'utf8');
for(const match of [...html.matchAll(/<div\b[^>]*data-hud="([^"]+)"[^>]*>/g)].reverse()){
  const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=match.index;let depth=0,end;
  for(let tag;tag=tags.exec(html);){depth+=tag[0].startsWith('</')?-1:1;if(!depth){end=tag.index;break;}}
  if(end===undefined)throw new Error('Unclosed HUD '+match[1]);
  html=html.slice(0,match.index+match[0].length)+ctx.CosDocsHud.html(match[1])+html.slice(end);
}
fs.writeFileSync(file,html);

}
