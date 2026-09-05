// In-memory fault injection. No working-tree files or app state are changed.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const cases={
  'missing-review':['ring-lessons.js',"step('Finish and review the prompt','tap',f.review,","step('Finish and review the prompt','tap',askDraft,"],
  'missing-list-start':['ring-lessons.js','lessons.messages[0].before=f.selected;','lessons.messages[0].before=f.reader;'],
  'stale-scroll-indicator':['docs-hud.js',' && !!old.thumb === !!f.thumb',''],
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
