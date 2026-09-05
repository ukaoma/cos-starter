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
    if(!value.includes('lens-nav'))return;
    this.nodes={};
    for(const name of ['lens-nav','lens-body','lens-text','lens-footer']){
      const node=new Box();
      const match=value.match(new RegExp('<div class="'+name+'[^\"]*">([\\s\\S]*?)</div>'));
      node.textContent=decode(match?.[1]||'');this.nodes['.'+name]=node;
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
