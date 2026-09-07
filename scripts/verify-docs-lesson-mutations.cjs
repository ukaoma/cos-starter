// In-memory fault injection. No working-tree files or app state are changed.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const cases={
  'missing-review':['ring-lessons.js',"step('Finish and review the prompt','tap',f.review,","step('Finish and review the prompt','tap',askDraft,"],
  'missing-list-start':['ring-lessons.js','lessons.messages[1].before=f.selected;','lessons.messages[1].before=f.reader;'],
  'tap-pose-turned-away':['ring-3d.js',"'tap':{x:-1.15,y:0.15,z:-0.10}","'tap':{x:-1.12,y:0.32,z:-0.11}"],
  'gesture-loops-forever':['ring-3d.js','var local=Math.min(Math.max(elapsed,0),cycle);','var local=elapsed%cycle;'],
  'no-lead-in':['ring-3d.js','if(elapsed<0 && !this.reduced) return;',''],
  'hud-before-contact':['ring-lessons.js','tap: 320','tap: 900'],
  'hold-menu-before-press':['docs-hud.js','holdMenuDelay: 800','holdMenuDelay: 200'],
  'two-highlights-in-menu':['docs-hud.js',"if (layout === 'menu') return line.indexOf('▶') === 0 ? '<span class=\"lens-bright\">'+escape(line)+'</span>' : escape(line);",''],
  'status-before-commit':['ring-lessons.js',"onCommit:function(){status(endStatus(s));}});}","});status(endStatus(s));}"],
  'stale-scroll-indicator':['docs-hud.js'," && !!el.querySelector('.lens-thumb') === !!f.thumb",''],
  'changed-submitted-prompt':['docs-hud.js','00:00 ASK  Summarize the pilot thread.','00:00 ASK  summarize the pilot thread'],
  'stale-model-footer':['ring-lessons.js',"footer:f.home.footer.replace(/^Opus\\b/,'Sonnet')",'footer:f.home.footer'],
};
const selected=process.argv[2];
if(selected){
  const [file,target,replacement]=cases[selected];
  const read=fs.readFileSync;
  const targetPath=path.resolve(__dirname,'../assets',file);
  const original=read(targetPath,'utf8');
  if(original.split(target).length!==2)throw new Error('Mutation target must occur exactly once: '+selected);
  const changed=original.replace(target,replacement);
  if(changed===original)throw new Error('Mutation did not land');
  fs.readFileSync=function(filePath,options){
    if(String(filePath)===targetPath)return options==='utf8'?changed:Buffer.from(changed);
    return read.apply(this,arguments);
  };
  console.log('MUTATION_LANDED '+selected);
  require('../tests/docs-hud-paint.test.cjs');
  require('../tests/ring-sync.test.cjs');
}else{
  for(const name of Object.keys(cases)){
    const result=spawnSync(process.execPath,[__filename,name],{encoding:'utf8'});
    const output=result.stdout+result.stderr;
    if(result.status===0||!output.includes('MUTATION_LANDED '+name)||!/fail [1-9]/.test(output)){
      process.stderr.write(output);throw new Error('Mutation was not caught: '+name);
    }
    console.log('CAUGHT '+name);
  }
}
