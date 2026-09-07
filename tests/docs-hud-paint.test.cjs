const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/docs-hud.js'),'utf8');
const decode=s=>s.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');

// Minimal paint-only DOM. Browser QA owns layout/pixels; this harness owns
// layer retention and cancellation ordering, without a browser dependency.
// classList is real enough for the painter's DOM reads: the same-body check
// asks whether the painted body carries lens-body-list, so a stub that cannot
// answer would force a full repaint on every list frame and hide that path.
function classList(){const set=new Set();return {set,add(c){set.add(c);},remove(c){set.delete(c);},contains(c){return set.has(c);},toggle(c,force){if(force===undefined)force=!set.has(c);if(force)set.add(c);else set.delete(c);return force;}};}
class Box {
  constructor(){this.nodes={};this.style={};this.clientHeight=50;this.scrollHeight=150;this.classList=classList();}
  set innerHTML(value){
    this.markup=value;
    this.textContent=decode(value);
    if(!value.includes('lens-nav'))return;
    this.nodes={};
    for(const name of ['lens-nav','lens-body','lens-text','lens-footer']){
      const node=new Box();
      const match=value.match(new RegExp('<div class="('+name+'[^\"]*)">([\\s\\S]*?)</div>'));
      for(const cls of (match?.[1]||'').split(' '))if(cls)node.classList.add(cls);
      node.textContent=decode(match?.[2]||'');this.nodes['.'+name]=node;
      if(name==='lens-text' && match?.[2].includes('class="lens-bright"'))node.nodes['.lens-bright']=new Box();
    }
    if(value.includes('lens-host-menu'))this.appendChild(Object.assign(new Box(),{panel:true}));
    if(value.includes('lens-thumb'))this.nodes['.lens-thumb']=new Box();
  }
  querySelector(selector){return this.nodes[selector]||null;}
  appendChild(node){node.parent=this;this.nodes['.lens-host-menu']=node;}
  remove(){if(this.parent)delete this.parent.nodes['.lens-host-menu'];}
}
function harness({reduced=false,anime=true}={}){
  const animations=[];
  const context={document:{querySelectorAll:()=>[],createElement:()=>new Box()},matchMedia:()=>({matches:reduced})};
  if(anime)context.anime={animate(target,props){const a={target,props,paused:false,pause(){this.paused=true;}};animations.push(a);return a;}};
  vm.runInNewContext(source,context);
  return {hud:context.CosDocsHud,screen:new Box(),animations};
}

test('model lesson separates overlay, cursor, and saved choice with a consistent completion footer',()=>{
  const context={};
  vm.runInNewContext(source,context);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/ring-lessons.js'),'utf8'),context);
  const {lessons,picker}=context.CosRingLessons,steps=lessons.models,hud=context.CosDocsHud;
  assert.equal(steps.length,11);
  assert.equal(steps[1].gesture,'hold');
  assert.deepEqual(Array.from(steps.slice(1,4),s=>s.frame.menuIndex),[1,2,3]);
  assert.equal(steps[4].frame.menu,undefined,'Model is a full HUD page, not another shortcut overlay');
  assert.match(steps[6].frame.body,/ \*Opus\n  Fable\n> Sonnet/);
  assert.match(steps[7].frame.nav,/\[S\] Effort/);
  assert.equal(steps[9].frame.body,' *High\n  X-High\n> Max\n  Ultra');
  assert.match(steps[10].frame.nav,/\[S\]/);
  assert.equal(steps[10].frame.footer,'Sonnet  3/3  #412  demo1234:3  2m  82%','Completed lesson reflects selected Sonnet');
  assert.equal(steps[0].frame.footer,hud.frames.home.footer,'Completion must not mutate the starting fixture');
  assert.match(hud.frames.home.footer,/^Opus\b/);
  assert.doesNotMatch(steps[10].description,/footer may still say Opus/);
  for(const [kind,count] of [['model',7],['effort',4]])for(let i=0;i<count;i++){
    const frame=picker(kind,i),markup=hud.html(frame);
    const body=markup.match(/<div class="lens-text">([\s\S]*?)<\/div>/)[1];
    assert.equal(decode(body),frame.body);
    assert.equal((body.match(/class="lens-bright"/g)||[]).length,1,'Only the cursor row is bright');
    assert.match(body,/<span class="lens-bright">&gt;/,'Current * alone is not the cursor');
    assert.ok(frame.body.split('\n').length<=5);
  }
});

function lessonHarness(){
  const context={};vm.runInNewContext(source,context);
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/ring-lessons.js'),'utf8'),context);
  const {hud,screen,animations}=harness(),queued=[],statuses=[];
  const options={paint:(frame,opts)=>hud.paint(screen,frame,opts),status:text=>statuses.push(text),
    schedule(fn,ms){const timer={fn,ms};queued.push(timer);return timer;},unschedule(timer){timer.cancelled=true;}};
  function flush(){while(queued.length){const t=queued.shift();if(!t.cancelled)t.fn();}
    const pending=animations.splice(0);pending.forEach(a=>{if(!a.paused && a.props.onComplete)a.props.onComplete();});}
  return {...context.CosRingLessons,hud,screen,queued,statuses,options,flush};
}

test('model confirmation paints Sonnet and restarting restores Opus without leaking state',()=>{
  const h=lessonHarness(),steps=h.lessons.models;
  h.playScene(steps[10],steps[9].frame,h.options);h.flush();
  assert.match(h.screen.querySelector('.lens-nav').textContent,/\[S\]/);
  assert.match(h.screen.querySelector('.lens-footer').textContent,/^Sonnet\b/);
  h.playScene(steps[0],steps[10].frame,h.options);h.flush();
  assert.match(h.screen.querySelector('.lens-nav').textContent,/\[O\]/);
  assert.match(h.screen.querySelector('.lens-footer').textContent,/^Opus\b/);
  h.playScene(steps[10],steps[0].frame,h.options);h.flush();
  assert.match(h.screen.querySelector('.lens-footer').textContent,/^Sonnet\b/,'Direct navigation to completion also reflects Sonnet');
});

test('every chapter, including out-of-order Ask clicks, reaches its actual HUD result',()=>{
  const h=lessonHarness();
  for(const [name,steps] of Object.entries(h.lessons))for(const i of Array.from(steps.keys()).reverse()){
    const s=steps[i];h.playScene(s,steps[Math.max(0,i-1)].frame,h.options);h.flush();
    assert.equal(h.screen.querySelector('.lens-nav').textContent,s.frame.nav,name+' nav '+i);
    assert.equal(h.screen.querySelector('.lens-text').textContent,s.frame.body,name+' body '+i);
    assert.equal(h.screen.querySelector('.lens-footer').textContent,s.frame.footer,name+' footer '+i);
    assert.equal(!!h.screen.querySelector('.lens-host-menu'),!!s.frame.menu,name+' overlay '+i);
  }
});

test('Ask shows capture, unsent review, protected review, choices, then the exact submitted prompt',()=>{
  const h=lessonHarness(),steps=h.lessons.ask;
  h.playScene(steps[1],steps[0].frame,h.options);
  assert.equal(h.screen.querySelector('.lens-text').textContent,h.hud.frames.reader.body);
  assert.ok(h.screen.querySelector('.lens-host-menu'));
  h.flush();
  h.playScene(steps[2],steps[1].frame,h.options);
  assert.ok(h.screen.querySelector('.lens-host-menu'),'tap begins over the open menu');
  h.flush();
  assert.equal(h.screen.querySelector('.lens-host-menu'),null);
  assert.equal(h.screen.querySelector('.lens-text').textContent,h.hud.frames.sessionMic.body);
  h.playScene(steps[3],steps[2].frame,h.options);
  assert.match(h.screen.querySelector('.lens-text').textContent,/Listening.*\n\nSummarize the pilot thread\./s);
  assert.equal(steps[3].gesture,'tap');h.flush();
  assert.equal(h.screen.querySelector('.lens-text').textContent,'Summarize the pilot thread.');
  assert.doesNotMatch(h.screen.querySelector('.lens-nav').textContent,/LISTEN|●/);
  assert.match(h.screen.querySelector('.lens-footer').textContent,/Msg 1\/1  Tap=Send/);
  assert.match(h.statuses.at(-1),/nothing sent/);
  h.playScene(steps[4],steps[3].frame,h.options);h.flush();
  assert.equal(steps[4].gesture,'double-tap');
  assert.equal(h.screen.querySelector('.lens-text').textContent,'Summarize the pilot thread.','Double-tap preserves reviewed words');
  assert.match(h.statuses.at(-1),/Review protected.*nothing sent/);
  for(const [index,choice] of [[5,'Send original (Opus)'],[6,'Edit'],[7,'Send original (Opus)']]){
    h.playScene(steps[index],steps[index-1].frame,h.options);h.flush();
    assert.equal(h.screen.querySelector('.lens-text').textContent.split('\n').find(line=>line.startsWith('▶')),'▶ '+choice);
    assert.match(h.screen.querySelector('.lens-footer').textContent,/Tap=Select/);
  }
  h.playScene(steps[8],steps[7].frame,h.options);
  assert.match(h.screen.querySelector('.lens-text').textContent,/▶ Send original/,'Prompt is not running before tap settles');
  assert.equal(steps[8].gesture,'tap');h.flush();
  assert.equal(h.screen.querySelector('.lens-text').textContent.split('\n')[0],'▶ "Summarize the pilot thread."','Confirming Send shows the receipt first');
  assert.match(h.screen.querySelector('.lens-footer').textContent,/Tap to watch/);
  h.playScene(steps[9],steps[8].frame,h.options);
  assert.equal(steps[9].gesture,'tap');h.flush();
  assert.equal(h.screen.querySelector('.lens-text').textContent.split('\n')[0],'00:00 ASK  Summarize the pilot thread.');
  assert.match(h.screen.querySelector('.lens-footer').textContent,/Running/);
});

test('the status line waits for the outgoing shortcut window to finish leaving',()=>{
  const h=lessonHarness(),steps=h.lessons.ask;
  h.playScene(steps[1],steps[0].frame,h.options);h.flush();
  h.playScene(steps[2],steps[1].frame,h.options);
  h.queued.splice(0).forEach(t=>t.fn());
  assert.ok(h.screen.querySelector('.lens-host-menu'),'window is still sliding out');
  assert.equal(h.statuses.at(-1),'Gesture in progress…','no result announced before the HUD changes');
  h.flush();
  assert.equal(h.screen.querySelector('.lens-host-menu'),null);
  assert.equal(h.statuses.at(-1),'Ask COS selected · microphone view open');
});

test('menus brighten exactly one row and every wait step names its own outcome',()=>{
  const h=lessonHarness();
  for(const i of [5,6,7])assert.equal((h.hud.html(h.lessons.ask[i].frame).match(/lens-bright/g)||[]).length,1,'ask review menu '+i);
  assert.equal(h.endStatus(h.lessons.tasks[9]),'No input for three seconds · action menu closed');
  assert.equal(h.endStatus(h.lessons.ask[11]),'Confirmation expired · normal footer restored');
  assert.equal(h.endStatus(h.lessons.messages[6]),'Messages · 1 of 3 · wrapped without running an action');
  assert.equal(h.endStatus(h.lessons.tasks[8]),'Back to list · 1 of 6 · wrapped without running an action');
  for(const [name,steps] of Object.entries(h.lessons))for(const [i,s] of steps.entries()){
    if(s.gesture==='hold'||s.settleAfter||(i>0&&JSON.stringify(s.frame)===JSON.stringify(steps[i-1].frame)))assert.ok(h.endStatus(s),name+' '+i+' explains a step whose HUD holds still');
  }
});

test('Messages opens the selected row and finishes on an unsent review',()=>{
  const h=lessonHarness(),steps=h.lessons.messages;
  assert.equal(steps[0].gesture,'idle','the lesson opens at rest, on the list');
  h.playScene(steps[1],steps[0].frame,h.options);
  assert.match(h.screen.querySelector('.lens-text').textContent,/▶ #411/);
  assert.doesNotMatch(h.screen.querySelector('.lens-nav').textContent,/#411/);
  h.flush();assert.match(h.screen.querySelector('.lens-nav').textContent,/#411 Pg/);
  h.playScene(steps[6],steps[5].frame,h.options);h.flush();
  assert.match(h.screen.querySelector('.lens-footer').textContent,/^▶ Messages/,'scrolling past View image wraps to Messages');
  h.playScene(steps[8],steps[7].frame,h.options);h.flush();
  assert.doesNotMatch(h.screen.querySelector('.lens-text').textContent,/Referencing/,'Reply never shows a reference line');
  h.playScene(steps[10],steps[9].frame,h.options);h.flush();
  assert.equal(h.screen.querySelector('.lens-text').textContent,'Summarize the design review changes.');
  assert.match(h.screen.querySelector('.lens-footer').textContent,/^Opus  Msg 1\/1  Tap=Send/);
});

test('main walkthrough builds real frames and delays the selected-row and reply results',()=>{
  const h=lessonHarness(),html=fs.readFileSync(path.join(__dirname,'../docs/index.html'),'utf8');
  const items=[...html.matchAll(/class="rp-step"[^>]*data-gesture="([^"]+)"[\s\S]*?<strong>([^<]+)<\/strong>/g)];
  const steps=h.mainSteps(items.map(m=>m[2]),items.map(m=>m[1]));
  assert.equal(steps.length,9);
  for(const [index,before,after,delay] of [[5,'▶ #411','? What changed',h.waitFor('tap')],[7,'? What changed','Listening...',h.waitFor('double-tap')]]){
    h.playScene(steps[index],steps[index-1].frame,h.options);
    assert.ok(h.screen.querySelector('.lens-text').textContent.includes(before));
    assert.equal(h.queued.at(-1).ms,delay);h.flush();
    assert.ok(h.screen.querySelector('.lens-text').textContent.includes(after));
  }
  h.playScene(steps[8],steps[7].frame,h.options);h.flush();
  assert.match(h.screen.querySelector('.lens-footer').textContent,/^Opus  Msg 1\/1  Tap=Send/);
});

test('changing scroll-indicator presence updates the rendered node and restores the body position',()=>{
  const {hud,screen}=harness();
  hud.paint(screen,'home',{animate:false});assert.equal(screen.querySelector('.lens-thumb'),null);
  hud.paint(screen,{...hud.frames.home,thumb:true,scroll:true},{animate:false});
  assert.ok(screen.querySelector('.lens-thumb'));
  assert.equal(screen.querySelector('.lens-text').style.transform,'translateY(-100px)');
  hud.paint(screen,'home',{animate:false});assert.equal(screen.querySelector('.lens-thumb'),null);
  assert.equal(screen.querySelector('.lens-text').style.transform,'translateY(0px)');
});

test('Sessions replays 4 of 4 before scrolling to 1 of 4 with body retained',()=>{
  const h=lessonHarness(),steps=h.lessons.sessions;
  h.playScene(steps[1],steps[0].frame,h.options);h.flush();
  const readingBody=h.screen.querySelector('.lens-text');
  assert.ok(h.screen.querySelector('.lens-thumb'));
  h.playScene(steps[2],steps[1].frame,h.options);h.flush();
  assert.equal(h.screen.querySelector('.lens-text'),readingBody,'Opening footer actions retains reading surface');
  assert.ok(h.screen.querySelector('.lens-thumb'),'Opening actions retains the scroll indicator');
  h.playScene(steps[6],steps[5].frame,h.options);
  assert.match(h.screen.querySelector('.lens-footer').textContent,/Ask COS · 4\/4/);
  const body=h.screen.querySelector('.lens-text');h.flush();
  assert.match(h.screen.querySelector('.lens-footer').textContent,/Back to list · 1\/4/);
  assert.equal(h.screen.querySelector('.lens-text'),body);
  assert.match(h.statuses.at(-1),/wrapped without running an action/);
});

test('new selection cancels an older scene, including timeout and hold status',()=>{
  const h=lessonHarness(),steps=h.lessons.ask;
  for(const i of [1,2,3,8,10]){
    const cancel=h.playScene(steps[i],steps[Math.max(0,i-1)].frame,h.options);
    const stale=h.queued.map(t=>t.fn);cancel();
    h.playScene(steps[0],null,h.options);stale.forEach(fn=>fn());h.flush();
    assert.equal(h.screen.querySelector('.lens-text').textContent,steps[0].frame.body);
    assert.equal(h.statuses.at(-1),'');
  }
});

test('reduced motion and initial paint show final scenes without timers',()=>{
  for(const mode of [{reduced:true},{animate:false}]){
    const h=lessonHarness();
    for(const steps of Object.values(h.lessons))for(const s of steps){
      h.playScene(s,null,{...h.options,...mode});
      assert.equal(h.queued.length,0);
      assert.equal(h.screen.querySelector('.lens-text').textContent,s.frame.body);
    }
  }
});

test('model picker replaces the HUD only after the left overlay exits',()=>{
  const {hud,screen,animations}=harness();
  const target={nav:'COS [O] Model',body:'>*Opus\n  Fable',footer:'Opus  1/7  next msg',layout:'picker'};
  hud.paint(screen,{...hud.frames.home,menu:true,menuIndex:3},{animate:false});
  hud.paint(screen,target);
  assert.equal(screen.querySelector('.lens-text').textContent,hud.frames.home.body);
  animations.at(-1).props.onComplete();
  assert.equal(screen.querySelector('.lens-host-menu'),null);
  assert.equal(screen.querySelector('.lens-text').textContent,target.body);
});

test('picker replay restores a partially faded cursor; reduced motion skips the fade',()=>{
  for(const reduced of [false,true]){
    const {hud,screen,animations}=harness({reduced});
    const target={nav:'Model',body:' *Opus\n> Fable',footer:'Opus  2/7  next msg',layout:'picker'};
    hud.paint(screen,target);
    const cursor=screen.querySelector('.lens-text').querySelector('.lens-bright');
    const cursorFades=()=>animations.filter(a=>a.target===cursor);
    assert.equal(cursorFades().length,reduced?0:1);
    cursor.style.opacity='.6';
    hud.paint(screen,target,{replay:true});
    assert.equal(cursor.style.opacity,'1');
    if(!reduced){assert.equal(cursorFades()[0].paused,true,'the interrupted fade is cancelled');assert.equal(cursorFades().length,2,'a replay fades the cursor again');}
  }
});

test('shortcut window slides in and out from the left over retained HUD nodes',()=>{
  const {hud,screen,animations}=harness();
  hud.paint(screen,'reader',{animate:false});const body=screen.querySelector('.lens-text');
  hud.paint(screen,{...hud.frames.reader,menu:true},{hold:true});
  assert.equal(screen.querySelector('.lens-text'),body,'opening menu must preserve the actual underlying body');
  assert.ok(screen.querySelector('.lens-host-menu'));
  assert.equal(animations.at(-1).props.delay,hud.timing.holdMenuDelay);
  assert.deepEqual(Array.from(animations.at(-1).props.translateX),['-110%','0%']);
  hud.paint(screen,'reader');const exit=animations.at(-1);
  assert.deepEqual(Array.from(exit.props.translateX),['0%','-110%']);
  assert.ok(screen.querySelector('.lens-host-menu'),'exit holds old layer until slide finishes');
  exit.props.onComplete();
  assert.equal(screen.querySelector('.lens-host-menu'),null);
  assert.equal(screen.querySelector('.lens-text'),body,'Close does not replace the reading surface');
});

test('shortcut window is anchored left with its shadow toward the exposed HUD',()=>{
  const css=fs.readFileSync(path.join(__dirname,'../assets/docs-hud.css'),'utf8');
  const rule=css.match(/\.lens-host-menu\{([^}]+)\}/)[1];
  assert.match(rule,/(?:^|;)left:4cqw;/);
  assert.doesNotMatch(rule,/(?:^|;)right:/);
  assert.match(rule,/(?:^|;)box-shadow:2cqw 0 /);
});

test('fast step changes cannot commit a stale outgoing overlay result',()=>{
  const {hud,screen,animations}=harness();
  hud.paint(screen,{...hud.frames.home,menu:true},{animate:false});
  hud.paint(screen,'messages');const stale=animations.find(a=>a.props.onComplete);
  assert.ok(stale,'leaving a menu frame slides the window out before committing');
  hud.paint(screen,'reader');
  assert.equal(stale.paused,true);
  stale.props.onComplete();
  assert.equal(screen.querySelector('.lens-text').textContent,hud.frames.reader.body,'the stale exit cannot commit its old result');
  assert.equal(screen.querySelector('.lens-host-menu'),null);
});

test('footer choices keep body position and restore interrupted opacity',()=>{
  const {hud,screen}=harness();
  hud.paint(screen,'continued',{animate:false});const body=screen.querySelector('.lens-text');
  screen.querySelector('.lens-footer').style.opacity='.5';
  hud.paint(screen,{...hud.frames.continued,footer:'▶ Messages    Reply'});
  assert.equal(screen.querySelector('.lens-text'),body);
  assert.equal(body.style.transform,'translateY(-100px)');
  assert.equal(screen.querySelector('.lens-footer').style.opacity,'1');
});

for(const mode of [{reduced:true},{anime:false}])test('static fallback paints immediately: '+JSON.stringify(mode),()=>{
  const {hud,screen,animations}=harness(mode);
  hud.paint(screen,{...hud.frames.reader,menu:true},{hold:true});
  assert.ok(screen.querySelector('.lens-host-menu'));
  hud.paint(screen,'messages');
  assert.equal(screen.querySelector('.lens-host-menu'),null);
  assert.equal(screen.querySelector('.lens-text').textContent,hud.frames.messages.body);
  assert.equal(animations.length,0);
});
