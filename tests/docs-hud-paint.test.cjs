const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/docs-hud.js'),'utf8');
const decode=s=>s.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');

// Minimal paint-only DOM. Browser QA owns layout/pixels; this harness owns
// layer retention and cancellation ordering, without a browser dependency.
class Box {
  constructor(){this.nodes={};this.style={};this.clientHeight=50;this.scrollHeight=150;this.classList={toggle(){}};}
  set innerHTML(value){
    this.markup=value;
    this.textContent=decode(value);
    if(!value.includes('lens-nav'))return;
    this.nodes={};
    for(const name of ['lens-nav','lens-body','lens-text','lens-footer']){
      const node=new Box();
      const match=value.match(new RegExp('<div class="'+name+'[^\"]*">([\\s\\S]*?)</div>'));
      node.textContent=decode(match?.[1]||'');this.nodes['.'+name]=node;
      if(name==='lens-text' && match?.[1].includes('class="lens-bright"'))node.nodes['.lens-bright']=new Box();
    }
    if(value.includes('lens-host-menu'))this.appendChild(Object.assign(new Box(),{panel:true}));
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

test('model lesson separates overlay, cursor, saved choice, and original message attribution',()=>{
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
  assert.equal(steps[10].frame.footer,hud.frames.home.footer,'Do not relabel old Opus answer');
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

test('Ask shows message, left overlay, recording, then a visibly protected transcript',()=>{
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
  const before=h.screen.querySelector('.lens-text').textContent;h.flush();
  assert.ok(before.includes(h.askTranscript));
  assert.equal(h.screen.querySelector('.lens-text').textContent,before,'A double-tap does not discard speech');
  assert.match(h.statuses.at(-1),/recording continues · nothing sent/);
});

test('Sessions replays 4 of 4 before scrolling to 1 of 4 with body retained',()=>{
  const h=lessonHarness(),steps=h.lessons.sessions;
  h.playScene(steps[6],steps[5].frame,h.options);
  assert.match(h.screen.querySelector('.lens-footer').textContent,/Ask COS · 4\/4/);
  const body=h.screen.querySelector('.lens-text');h.flush();
  assert.match(h.screen.querySelector('.lens-footer').textContent,/Back to list · 1\/4/);
  assert.equal(h.screen.querySelector('.lens-text'),body);
  assert.match(h.statuses.at(-1),/wrapped without running an action/);
});

test('new selection cancels an older scene, including timeout and hold status',()=>{
  const h=lessonHarness(),steps=h.lessons.ask;
  for(const i of [1,2,6]){
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
    assert.equal(animations.length,reduced?0:1);
    const cursor=screen.querySelector('.lens-text').querySelector('.lens-bright');
    cursor.style.opacity='.6';
    hud.paint(screen,target,{replay:true});
    assert.equal(cursor.style.opacity,'1');
    if(!reduced)assert.equal(animations[0].paused,true);
  }
});

test('shortcut window slides in and out from the left over retained HUD nodes',()=>{
  const {hud,screen,animations}=harness();
  hud.paint(screen,'reader',{animate:false});const body=screen.querySelector('.lens-text');
  hud.paint(screen,{...hud.frames.reader,menu:true},{hold:true});
  assert.equal(screen.querySelector('.lens-text'),body,'opening menu must preserve the actual underlying body');
  assert.ok(screen.querySelector('.lens-host-menu'));
  assert.equal(animations.at(-1).props.delay,1100);
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
  hud.paint(screen,'messages');const stale=animations.at(-1);
  hud.paint(screen,'reader');const newest=animations.at(-1);
  assert.equal(stale.paused,true);
  stale.props.onComplete();
  newest.props.onComplete();
  assert.equal(screen.querySelector('.lens-text').textContent,hud.frames.reader.body);
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
