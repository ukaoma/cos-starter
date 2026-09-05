/* Reusable, local-only Ring to Lens lessons. Fictional fixtures; no mic or API.
 * Gesture contracts audited against cos-glasses-app 72c0f67. Task wrap: 6.9.455.
 * Keep source-derived menu differences here, not in independent page scripts.
 */
(function (root) {
  'use strict';
  var hud = root.CosDocsHud;
  if (!hud) return;
  var f = hud.frames;
  function frame(name, changes) { return Object.assign({}, f[name], changes); }
  function step(title, gesture, view, description) { return {title:title,gesture:gesture,frame:view,description:description}; }
  function reader(index) {
    return frame('continued', {footer:['Messages','Reply','View image'].map(function(label,i){return (i===index?'▶':' ')+' '+label;}).join('  ')});
  }
  var sessionRows = ['Back to list','Continue','Fork','Ask COS'];
  var taskRows = ['Back to list','Ask COS','Done','Today','To active','To review'];
  var taskFixture = {title:'Prepare the Friday pilot checklist',column:'inbox',stage:'planning',doneWhen:'Checklist includes the owner, rollout date, and a tested rollback.'};
  var task = {nav:f.home.nav,body:taskFixture.title+'\n\nDONE WHEN\n'+taskFixture.doneWhen+'\n\nSTAGE\nPLANNING',footer:f.home.footer,thumb:true};
  function menu(base, rows, index) { return Object.assign({},base,{scroll:true,footer:'▶ '+rows[index]+' · '+(index+1)+'/'+rows.length+' · Scroll=move Tap=select'}); }
  var lessons = {
    messages: [
      step('Open a message','tap',f.reader,'A tap on a selected Messages row opens its prompt and answer. The Messages list and the open reader do not share the same double-tap action.'),
      step('Read to the bottom','swipe-down',f.continued,'Finish the body before choosing what to do next. The nav and footer stay fixed. You can open footer actions before reaching the bottom, too; this is not an unlock gesture.'),
      step('Open footer actions','tap',reader(0),'One deliberate tap opens Messages, Reply, and, when available, View image. It does not run the selected action. The body stays at your reading position.'),
      step('Choose Reply','swipe-down',reader(1),'With the menu open, a scroll changes the footer selection instead of scrolling the message. This is the pause between the two deliberate taps, not a double-tap.'),
      step('Find the photo action','swipe-down',reader(2),'View image appears only for an attached photo with lens image preview enabled and no meeting-critical capture active. This example assumes those conditions are met.'),
      step('This menu stops at the end','swipe-down',reader(2),'Another downward scroll stays on View image. Unlike the one-row Tasks and Sessions menus, the reader menu does not wrap.'),
      step('Scroll back, then confirm','swipe-up',reader(1),'Move back to Reply. Read the highlighted choice before tapping again; that second deliberate tap is the false-touch confirmation.'),
      step('Start the reply','tap',f.reply,'The confirming tap starts dictation referencing #411. Review the transcript after finishing; starting a recording is not the same as sending it.'),
      step('Or use the express gesture','double-tap',f.reply,'Alternative from the open, idle message reader: two quick taps start the same referenced reply without opening the footer menu. From the Messages list, double-tap goes to Quick Actions instead.')
    ],
    ask: [
      step('Keep your context','idle',f.reader,'Ask COS starts a new prompt. Reply continues the open message. Choose the route based on whether the answer should reference what you are reading.'),
      step('Tap, then press and hold','hold',frame('reader',{menu:true,menuIndex:1}),'Tap and release, then quickly press again and keep holding. The shortcut window slides over the current HUD. It is a separate layer, not a new message page.'),
      step('Choose Ask COS','tap',frame('sessionMic',{footer:'Opus  Tap to finish  demo1234  82%'}),'Select Ask COS for a fresh transcription. The recording view has no “Referencing #411” line because this is not a reply.'),
      step('Protect the draft','double-tap',frame('sessionMic',{footer:'Opus  Tap to finish  demo1234  82%'}),'During voice-prompt capture, a double-tap does not send or discard the draft. Tap once to finish recording, then read the transcript and confirm Send.'),
      step('After review and send','idle',f.job,'This example resumes after you have reviewed and sent the prompt. The job log shows the work in progress. No example on this page opens a real microphone or runs a model.'),
      step('Arm cancellation','double-tap',frame('job',{footer:'Double-tap again to cancel'}),'During an active run, the first double-tap arms cancellation. It does not immediately stop the job. The footer tells you to double-tap again within three seconds.'),
      step('Let the confirmation expire','idle',f.job,'If you do not confirm within three seconds, the run continues. A second double-tap inside that window would cancel and pause queued work. Read the footer before repeating a gesture.')
    ],
    sessions: [
      step('Read the session','idle',f.session,'Start in the session detail. Reading and acting are separate: the discussion stays in the body while actions live in the footer.'),
      step('Reach the footer','swipe-down',frame('session',{scroll:true,thumb:true}),'Scroll through the discussion and stats. A single tap can open actions at any reading position; scrolling first lets you finish the context.'),
      step('Open the safe first choice','tap',menu(f.session,sessionRows,0),'The first tap opens Back to list, 1 of 4. It does not continue a session or start a model turn.'),
      step('Continue the original','swipe-down',menu(f.session,sessionRows,1),'One scroll selects Continue. A separate confirming tap would start dictation into the original thread, subject to its availability and permissions.'),
      step('Fork a copy','swipe-down',menu(f.session,sessionRows,2),'Fork starts a new thread from this context. It does not write your follow-up back into the original thread.'),
      step('Reach the final choice','swipe-down',menu(f.session,sessionRows,3),'Ask COS is 4 of 4 in this supported Claude example. Providers and availability can change the choices; read the row label and counter.'),
      step('Wrap back to the beginning','swipe-down',menu(f.session,sessionRows,0),'One more downward scroll wraps from 4 of 4 to 1 of 4. Scrolling up from the first row wraps to the last. No action runs just because the cursor wraps.'),
      step('Or leave for Quick Actions','double-tap',frame('session',{scroll:true,footer:'Double-tap again for Quick Actions'}),'From session detail, double-tap closes the footer menu and asks for confirmation. Double-tap again within three seconds to leave. If you wait, the normal footer returns.'),
      step('Open shortcuts in place','hold',frame('session',{scroll:true,menu:true,menuIndex:1}),'Tap and release, then quickly press and hold. The shortcut window slides over this session without replacing it or returning Home.'),
      step('Find Close in the shortcuts','swipe-down',frame('session',{scroll:true,menu:true,menuIndex:9}),'Keep scrolling through the system menu to Close at the bottom. This example skips ahead to that final selection; one scroll normally moves one row.'),
      step('Return to the same page','tap',frame('session',{scroll:true}),'Selecting Close slides the shortcut window away. The session and reading position are still underneath.')
    ],
    tasks: [
      step('Read the task and finish line','idle',task,'The body shows the task, its Done when condition, and its stage. Available footer actions depend on the task and its run state.'),
      step('Finish reading','swipe-down',Object.assign({},task,{scroll:true}),'Scroll to the bottom of the task body. Opening actions is a separate tap; it does not require a special edge-of-screen gesture.'),
      step('Open the action menu','tap',menu(task,taskRows,0),'The menu starts at Back to list, 1 of 6 in this ready Inbox example. One touch does not mark a task Done or start Ask COS.'),
      step('Select Ask COS','swipe-down',menu(task,taskRows,1),'A scroll selects Ask COS. A separate confirming tap would start real work for this task. Without a finish line the action is unavailable; set the finish line on the phone first.'),
      step('Done is a deliberate choice','swipe-down',menu(task,taskRows,2),'Done is 3 of 6. Highlighting it does not complete the task; that needs the second deliberate tap.'),
      step('Move through Today','swipe-down',menu(task,taskRows,3),'Scroll moves the footer cursor, not the body, while the action menu is open.'),
      step('Change the stage','swipe-down',menu(task,taskRows,4),'To active moves the task out of planning. Other stages, completed tasks, and running tasks have different action sets.'),
      step('Reach the last row','swipe-down',menu(task,taskRows,5),'To review is 6 of 6. The counter tells you where you are even though only one action is visible.'),
      step('Keep scrolling to wrap','swipe-down',menu(task,taskRows,0),'On glasses 6.9.455 and later, another downward scroll wraps to Back to list, 1 of 6. Older builds may stop at the last row; scroll upward to return.'),
      step('Wait to dismiss','idle',Object.assign({},task,{scroll:true}),'After three seconds without menu input, the menu closes and the normal footer returns. Reopen with one tap; do not assume the previous action is still selected.')
    ]
  };
  // Teach actual waiting without auto-advancing the lesson. A new selection
  // cancels the pending result; reduced motion shows the final state directly.
  lessons.ask[6].before=lessons.ask[5].frame;lessons.ask[6].settleAfter=3000;
  lessons.tasks[9].before=lessons.tasks[8].frame;lessons.tasks[9].settleAfter=3000;
  lessons.messages[8].before=f.reader;lessons.messages[8].settleAfter=650;
  root.CosRingLessons = {lessons:lessons,taskFixture:taskFixture,task:task,sessionRows:sessionRows,taskRows:taskRows};
  if (typeof document === 'undefined') return;
  var main = document.querySelector('[data-ring-path]');
  if (!main) return;
  var template = main.querySelector('.rp-stage').cloneNode(true);
  var sequence = 0;
  var labels = {idle:'Ring',tap:'Tap',hold:'Tap · press · hold','double-tap':'Double-tap','swipe-down':'Scroll down','swipe-up':'Scroll up'};
  function mount(host, states, compact) {
    var stage, buttons;
    if (compact) {
      stage = template.cloneNode(true);
      stage.querySelectorAll('[id]').forEach(function(el){el.removeAttribute('id');});
      stage.querySelectorAll('[aria-describedby]').forEach(function(el){el.removeAttribute('aria-describedby');});
      stage.querySelector('[data-hud]').removeAttribute('data-hud');
      var grid = document.createElement('div'); grid.className = 'rl-grid';
      var choices = document.createElement('ol'); choices.className='rl-choices';
      states.forEach(function(s){
        var item=document.createElement('li'),button=document.createElement('button'),title=document.createElement('strong'),copy=document.createElement('p');
        button.type='button'; title.textContent=s.title; copy.textContent=s.description;
        button.appendChild(title); item.appendChild(button); item.appendChild(copy); choices.appendChild(item);
      });
      grid.appendChild(stage);grid.appendChild(choices);host.appendChild(grid);
      buttons=Array.from(choices.querySelectorAll('button'));
      host.classList.add('rl-ready');
    } else { stage=host.querySelector('.rp-stage');buttons=Array.from(host.querySelectorAll('.rp-step button')); }
    var screen=stage.querySelector('.rp-screen'),shell=stage.querySelector('.rp-ring-shell'),canvas=stage.querySelector('canvas');
    var reset=stage.querySelector('.rp-orbit-hint button'),gesture=stage.querySelector('.rp-gesture');
    var controls=stage.querySelector('.rp-stage-foot'),prev=controls.querySelector('button:first-child'),next=controls.querySelector('button:last-child');
    var progress=stage.querySelector('.rp-progress'),index=0,ring=null,manual=false,timers=[];
    screen.id='ring-lesson-screen-'+(++sequence);
    buttons.forEach(function(b){b.setAttribute('aria-controls',screen.id);});
    var replay=document.createElement('button');replay.type='button';replay.className='rl-replay';replay.textContent='Replay gesture';
    stage.querySelector('.rp-ring-zone').appendChild(replay);
    var caption=document.createElement('p');caption.className='rl-caption';
    if(compact)stage.insertBefore(caption,controls);
    var status=document.createElement('span');status.className='rl-status';status.setAttribute('role','status');
    stage.insertBefore(status,controls);
    var phase=document.createElement('div');phase.className='rl-contact';phase.setAttribute('aria-hidden','true');
    phase.innerHTML='<span>Tap</span><span>Release</span><span>Press + hold</span>';stage.querySelector('.rp-ring-zone').appendChild(phase);
    try {if(root.CosRing3D) ring=root.CosRing3D.create(canvas,{shell:shell,resetButton:reset});} catch (error) { /* Static ring and written instructions remain. */ }
    if(ring) stage.querySelector('.rp-orbit-hint').hidden=false;
    function render(n,replaying,animate) {
      timers.forEach(clearTimeout);timers=[];
      index=Math.max(0,Math.min(states.length-1,n));var s=states[index];
      host.setAttribute('data-lesson-index',String(index));
      var reduced=root.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var waiting=!!s.settleAfter&&!reduced&&animate!==false;
      hud.paint(screen,waiting?s.before:s.frame,{hold:s.gesture==='hold',replay:replaying,animate:animate});
      status.textContent=waiting&&s.settleAfter===3000?'No input · waiting 3 seconds…':'';
      if(waiting)timers.push(setTimeout(function(){hud.paint(screen,s.frame,{animate:true});status.textContent=s.settleAfter===3000?'Confirmation expired · normal footer restored':'';},s.settleAfter));
      shell.setAttribute('data-gesture',s.gesture);gesture.setAttribute('data-gesture',s.gesture);gesture.textContent=labels[s.gesture];
      if(ring) ring.setGesture(s.gesture,labels[s.gesture]);
      phase.hidden=s.gesture!=='hold';
      phase.setAttribute('data-phase',reduced?'all':'tap');
      if(s.gesture==='hold'&&!reduced) {
        timers.push(setTimeout(function(){phase.setAttribute('data-phase','release');},150));
        timers.push(setTimeout(function(){phase.setAttribute('data-phase','hold');},300));
      }
      progress.textContent=(index+1)+' of '+states.length+' · '+s.title;
      caption.textContent=s.description;
      buttons.forEach(function(b,i){
        b.parentElement.toggleAttribute('data-active',i===index);
        if(i===index)b.parentElement.setAttribute('aria-current','step');else b.parentElement.removeAttribute('aria-current');
        if(compact){b.setAttribute('aria-expanded',String(i===index));b.nextElementSibling.hidden=i!==index;}
      });
      prev.disabled=index===0;next.disabled=index===states.length-1;
    }
    function alignMobile(){if(compact&&root.matchMedia('(max-width: 860px)').matches)stage.scrollIntoView({block:'start',behavior:'auto'});}
    buttons.forEach(function(b,i){b.addEventListener('click',function(){
      manual=true;render(i,true,true);
      alignMobile();
    });});
    prev.addEventListener('click',function(){manual=true;render(index-1,false,true);alignMobile();});
    next.addEventListener('click',function(){manual=true;render(index+1,false,true);alignMobile();});
    replay.addEventListener('click',function(){manual=true;render(index,true,true);alignMobile();});
    stage.addEventListener('keydown',function(ev){
      // Ring orbit keys must never also advance the lesson.
      if(ev.target===canvas)return;
      if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'){ev.preventDefault();manual=true;render(index+(ev.key==='ArrowRight'?1:-1),false,true);}
    });
    if(!compact && 'IntersectionObserver' in root){
      root.addEventListener('wheel',function(){manual=false;},{passive:true});
      root.addEventListener('touchmove',function(){manual=false;},{passive:true});
      var observer=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting&&!manual)render(buttons.indexOf(e.target.querySelector('button')),false,true);});},{rootMargin:'-30% 0px -48% 0px',threshold:.15});
      buttons.forEach(function(b){observer.observe(b.parentElement);});
    }
    render(0,false,false);
    if('ResizeObserver' in root){
      var width=screen.clientWidth;
      var resize=new ResizeObserver(function(){if(width!==screen.clientWidth){width=screen.clientWidth;hud.paint(screen,states[index].frame,{animate:false});}});
      resize.observe(screen);
    }
    // Lazy construction: off-screen ring canvases are not allocated until useful.
    return render;
  }
  var mainStates=Array.from(main.querySelectorAll('.rp-step')).map(function(el,i){return step(el.querySelector('strong').textContent,el.getAttribute('data-gesture'),hud.ringFrames[i],'');});
  mount(main,mainStates,false);
  document.querySelectorAll('[data-ring-lesson]').forEach(function(host){
    var ready=false;
    function init(){if(!ready){ready=true;mount(host,lessons[host.getAttribute('data-ring-lesson')],true);}}
    if('IntersectionObserver' in root){var observer=new IntersectionObserver(function(entries){if(entries.some(function(e){return e.isIntersecting;})){init();observer.disconnect();}},{rootMargin:'400px'});observer.observe(host);}else init();
  });
})(typeof window !== 'undefined' ? window : globalThis);
