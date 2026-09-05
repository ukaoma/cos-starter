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
  // Public sample: Cursor ready, Ollama not configured. The native picker shows
  // five rows at once; its counter counts every available slot, not the window.
  var modelRows = ['Opus','Fable','Sonnet','GPT Max','GPT Bal','Grok','Composer'];
  var effortRows = ['High','X-High','Max','Ultra'];
  function picker(kind, index) {
    var models=kind==='model', rows=models?modelRows:effortRows;
    var start=Math.max(0,Math.min(rows.length-5,index-2));
    return {
      nav:'COS ['+(models?'O':'S')+'] '+(models?'Model':'Effort')+' 9:16 AM 9/4/26',
      body:rows.slice(start,start+5).map(function(label,i){var row=start+i;return (row===index?'>':' ')+(row===0?'*':' ')+label;}).join('\n'),
      footer:(models?'Opus':'Sonnet')+'  '+(index+1)+'/'+rows.length+'  next msg  demo1234  82%',
      layout:'picker'
    };
  }
  // This lesson's completion shows the selected model in both nav and footer.
  // Override only this fictional frame; other message-attribution examples stay intact.
  var modelHome=frame('home',{nav:f.home.nav.replace('[O]','[S]'),footer:f.home.footer.replace(/^Opus\b/,'Sonnet')});
  var askTranscript=f.review.body;
  var askDraft=frame('sessionMic',{body:'Listening...\n\n'+askTranscript,footer:'Opus  Tap to finish  demo1234  82%'});
  var reviewRows=['Re-record','Cancel','Send original (Opus)','Edit','Preview','Change Model'];
  function reviewMenu(index) {
    return {nav:'COS [O] Msg Tap=Select 9:16 AM 9/4/26',body:reviewRows.map(function(label,i){return (i===index?'▶':' ')+' '+label;}).join('\n'),footer:'Opus  Tap=Select  demo1234  82%',layout:'list'};
  }
  var lessons = {
    models: [
      step('Start with the current model','idle',f.home,'This example starts on Home with Opus and High effort. The same shortcut can be opened over the page you are reading. Nothing here changes your real settings or runs a model.'),
      step('Tap, then press and hold','hold',frame('home',{menu:true,menuIndex:1}),'Tap and release, then quickly press again and keep holding. The shortcut window slides in from the left over Home. Ask COS is the first COS choice.'),
      step('Scroll past Start Meeting','swipe-down',frame('home',{menu:true,menuIndex:2}),'One downward scroll moves one row. Highlighting Start Meeting does not start a recording; keep scrolling to Model.'),
      step('Find Model: Opus','swipe-down',frame('home',{menu:true,menuIndex:3}),'Model shows the active choice. Highlight it, then make one deliberate tap to open the picker. This is not a double-tap.'),
      step('Open the model picker','tap',picker('model',0),'The overlay closes and the model list takes over the HUD. > marks the row a tap will choose; * marks the current model. Both start on Opus. Five rows are visible, but the footer counts all seven available models in this example.'),
      step('Move the cursor, not the setting','swipe-down',picker('model',1),'Scroll down to Fable. Opus keeps its * because scrolling only highlights a choice. No model has changed yet.'),
      step('Highlight Sonnet','swipe-down',picker('model',2),'Scroll once more to Sonnet, 3 of 7. The ring moves the list selection, not a footer action menu. Read the > row before confirming.'),
      step('Choose the model; open effort','tap',picker('effort',0),'Tap saves Sonnet immediately and opens the effort picker. The nav changes to [S]. High is still starred: choosing a model does not automatically raise its effort. The four lens labels are High, X-High, Max, and Ultra.'),
      step('Move to X-High','swipe-down',picker('effort',1),'One scroll highlights X-High, called Extra High in phone Settings. High remains the current * until you tap a new level.'),
      step('Highlight Max','swipe-down',picker('effort',2),'Scroll to Max, 3 of 4. Ultra is the lens label for Ultracode, one row below. Actual effort support depends on the chosen model; a larger setting is not a promise of a different model.'),
      step('Confirm and return to your page','tap',modelHome,'Tap applies Max and returns to the page where you opened Model, Home in this example. The simulator now shows Sonnet in the footer and [S] in the nav: Sonnet + Max is selected for your next message. A running answer is not switched mid-flight.')
    ],
    messages: [
      step('Open a message','tap',f.reader,'A tap on a selected Messages row opens its prompt and answer. The Messages list and the open reader do not share the same double-tap action.'),
      step('Read to the bottom','swipe-down',f.continued,'Finish the body before choosing what to do next. The nav and footer stay fixed. You can open footer actions before reaching the bottom, too; this is not an unlock gesture.'),
      step('Open footer actions','tap',reader(0),'One deliberate tap opens Messages, Reply, and, when available, View image. It does not run the selected action. The body stays at your reading position.'),
      step('Choose Reply','swipe-down',reader(1),'With the menu open, a scroll changes the footer selection instead of scrolling the message. This is the pause between the two deliberate taps, not a double-tap.'),
      step('Find the photo action','swipe-down',reader(2),'View image appears only for an attached photo with lens image preview enabled and no meeting-critical capture active. This example assumes those conditions are met.'),
      step('This menu stops at the end','swipe-down',reader(2),'Another downward scroll stays on View image. Unlike the one-row Tasks and Sessions menus, the reader menu does not wrap.'),
      step('Scroll back, then confirm','swipe-up',reader(1),'Move back to Reply. Read the highlighted choice before tapping again; that second deliberate tap is the false-touch confirmation.'),
      step('Start the reply','tap',f.reply,'The confirming tap starts dictation referencing #411. Review the transcript after finishing; starting a recording is not the same as sending it.'),
      step('Or use the express gesture','double-tap',f.reply,'Alternative from the open, idle message reader: two quick taps start the same referenced reply without opening the footer menu. From the Messages list, double-tap goes to Quick Actions instead.'),
      step('Finish and review the reply','tap',f.replyReview,'Tap once to stop recording. After transcription finishes, the lens shows your words for confirmation. The footer keeps the #411 reference and changes to Tap=Send. Nothing has been sent yet. Scroll down for review options instead of sending.')
    ],
    ask: [
      step('Keep your context','idle',f.reader,'Ask COS starts a new prompt. Reply continues the open message. Choose the route based on whether the answer should reference what you are reading.'),
      step('Tap, then press and hold','hold',frame('reader',{menu:true,menuIndex:1}),'Tap and release, then quickly press again and keep holding. The shortcut window slides over the current HUD. It is a separate layer, not a new message page.'),
      step('Choose Ask COS','tap',frame('sessionMic',{footer:'Opus  Tap to finish  demo1234  82%'}),'Select Ask COS for a fresh transcription. The recording view has no “Referencing #411” line because this is not a reply. A double-tap during capture does not submit or discard the draft.'),
      step('Finish and review the prompt','tap',f.review,'Tap once to stop recording. After transcription finishes, the microphone indicator disappears and your words replace Listening. The footer reads Tap=Send. Read the prompt before confirming; finishing a recording has not sent it.'),
      step('Protect the reviewed draft','double-tap',f.review,'Two quick taps do not leave this review or submit your prompt. The transcript and Tap=Send stay visible. This is draft protection, not the separate deliberate tap that sends it.'),
      step('Open review choices','swipe-down',reviewMenu(2),'From the final transcript page, scroll down instead of sending. The six review options replace the transcript. Send original is highlighted by default; opening this menu does not send.'),
      step('Highlight Edit','swipe-down',reviewMenu(3),'One downward scroll highlights Edit. The prompt is still unsent. A separate tap would start recording an edit; scrolling alone does not change the draft.'),
      step('Return to Send original','swipe-up',reviewMenu(2),'Scroll back up to Send original (Opus). Check the highlighted action before tapping. Preview lets you read the transcript again; Cancel discards it only when selected.'),
      step('Confirm Send original','tap',f.job,'One deliberate tap confirms the reviewed prompt. The HUD advances to the job log, shown here 66 seconds into the example run. No example on this page opens a real microphone or runs a model.'),
      step('Arm cancellation','double-tap',frame('job',{footer:'Double-tap again to cancel'}),'During an active run, the first double-tap arms cancellation. It does not immediately stop the job. The footer tells you to double-tap again within three seconds.'),
      step('Let the confirmation expire','idle',f.job,'If you do not confirm within three seconds, the run continues. A second double-tap inside that window would cancel and pause queued work. Read the footer before repeating a gesture.')
    ],
    sessions: [
      step('Read the session','idle',f.session,'Start in the session detail. Reading and acting are separate: the discussion stays in the body while actions live in the footer.'),
      step('Reach the footer','swipe-down',frame('session',{scroll:true,thumb:true}),'Scroll through the discussion and stats. A single tap can open actions at any reading position; scrolling first lets you finish the context.'),
      step('Open the safe first choice','tap',menu(f.session,sessionRows,0),'The first tap opens Back to list, 1 of 4. It does not continue a session or start a model turn.'),
      step('Highlight Continue','swipe-down',menu(f.session,sessionRows,1),'One scroll highlights Continue. A separate confirming tap would start dictation into the original thread, subject to its availability and permissions.'),
      step('Highlight Fork','swipe-down',menu(f.session,sessionRows,2),'This scroll only highlights Fork. A separate tap opens dictation for a new thread from this context. Your follow-up does not write back into the original thread, and nothing sends before review and confirmation.'),
      step('Reach the final choice','swipe-down',menu(f.session,sessionRows,3),'Ask COS is 4 of 4 in this supported Claude example. Providers and availability can change the choices; read the row label and counter.'),
      step('Wrap back to the beginning','swipe-down',menu(f.session,sessionRows,0),'One more downward scroll wraps from 4 of 4 to 1 of 4. Scrolling up from the first row wraps to the last. No action runs just because the cursor wraps.'),
      step('Arm return to Quick Actions','double-tap',frame('session',{scroll:true,footer:'Double-tap again for Quick Actions'}),'From session detail, double-tap closes the footer menu and asks for confirmation. You are still in the session. Double-tap again within three seconds to leave. If you wait, the normal footer returns.'),
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
      step('Highlight To active','swipe-down',menu(task,taskRows,4),'This scroll only highlights To active. A separate tap would move the task out of planning. Other stages, completed tasks, and running tasks have different action sets.'),
      step('Reach the last row','swipe-down',menu(task,taskRows,5),'To review is 6 of 6. The counter tells you where you are even though only one action is visible.'),
      step('Keep scrolling to wrap','swipe-down',menu(task,taskRows,0),'On glasses 6.9.455 and later, another downward scroll wraps to Back to list, 1 of 6. Older builds may stop at the last row; scroll upward to return.'),
      step('Wait to dismiss','idle',Object.assign({},task,{scroll:true}),'After three seconds without menu input, the menu closes and the normal footer returns. Reopen with one tap; do not assume the previous action is still selected.')
    ]
  };
  // Teach actual waiting without auto-advancing the lesson. A new selection
  // cancels the pending result; reduced motion shows the final state directly.
  lessons.ask[10].before=lessons.ask[9].frame;lessons.ask[10].settleAfter=3000;
  lessons.tasks[9].before=lessons.tasks[8].frame;lessons.tasks[9].settleAfter=3000;
  lessons.messages[8].before=f.reader;lessons.messages[8].settleAfter=650;
  lessons.messages[0].before=f.selected;
  lessons.ask[1].resultText='Shortcut window open over the message';
  lessons.ask[2].resultText='Ask COS selected · microphone view open';
  lessons.ask[3].before=askDraft;
  lessons.ask[3].transitionText='Recording finished · transcribing…';
  lessons.ask[3].resultText='Review your prompt · nothing sent · Tap=Send';
  lessons.ask[4].resultText='Review protected · prompt unchanged · nothing sent';
  lessons.messages[9].before=frame('reply',{body:'Listening...\nReferencing #411.\n\n'+f.replyReview.body});
  lessons.messages[9].resultText='Review your reply to #411 · nothing sent · Tap=Send';
  lessons.sessions[6].transitionText='Ask COS · 4 of 4 · scroll down…';
  lessons.sessions[6].resultText='Back to list · 1 of 4 · wrapped without running an action';
  // A chapter click is a replay, even when it jumps across steps. Establish its
  // actual starting HUD first, then show the ring input and commit the result.
  // Explicit timers make rapid clicks cancellable and testable without a DOM.
  function playScene(s, previous, options) {
    var cancelled=false,timers=[],schedule=options.schedule||setTimeout,unschedule=options.unschedule||clearTimeout;
    function later(fn,ms){timers.push(schedule(function(){if(!cancelled)fn();},ms));}
    function status(text){if(options.status)options.status(text);}
    function final(){options.paint(s.frame,{animate:true});status(s.resultText||(s.settleAfter===3000?'Confirmation expired · normal footer restored':''));}
    if(options.animate===false||options.reduced){options.paint(s.frame,{animate:false});status(s.resultText||'');}
    else if(s.gesture==='hold'){
      options.paint(s.before||previous||s.frame,{animate:false});
      options.paint(s.frame,{hold:true,replay:true,animate:true});
      status('Tap · release · press and hold…');
      later(function(){status(s.resultText||'Shortcut window open');},1540);
    } else {
      var wait=s.settleAfter||({tap:320,'double-tap':650,'swipe-down':520,'swipe-up':520}[s.gesture]||0);
      if(wait){
        options.paint(s.before||previous||s.frame,{animate:false});
        status(s.transitionText||(s.settleAfter===3000?'No input · waiting 3 seconds…':'Gesture in progress…'));
        later(final,wait);
      }else final();
    }
    return function(){cancelled=true;timers.forEach(unschedule);};
  }
  function mainSteps(titles,gestures){return hud.ringFrames.map(function(view,i){return step(titles[i],gestures[i],typeof view==='string'?f[view]:view,'');});}
  root.CosRingLessons = {lessons:lessons,taskFixture:taskFixture,task:task,sessionRows:sessionRows,taskRows:taskRows,modelRows:modelRows,effortRows:effortRows,picker:picker,reviewMenu:reviewMenu,playScene:playScene,mainSteps:mainSteps,askTranscript:askTranscript};
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
    var progress=stage.querySelector('.rp-progress'),index=0,ring=null,manual=false,timers=[],cancelScene=function(){};
    screen.id='ring-lesson-screen-'+(++sequence);
    buttons.forEach(function(b){b.setAttribute('aria-controls',screen.id);});
    var replay=document.createElement('button');replay.type='button';replay.className='rl-replay';replay.textContent='Replay gesture';
    stage.querySelector('.rp-ring-zone').appendChild(replay);
    var caption=document.createElement('p');caption.className='rl-caption';
    if(compact)stage.insertBefore(caption,controls);
    var status=document.createElement('span');status.className='rl-status';status.setAttribute('role','status');
    stage.querySelector('.rp-lens').after(status);
    var phase=document.createElement('div');phase.className='rl-contact';phase.setAttribute('aria-hidden','true');
    phase.innerHTML='<span>Tap</span><span>Release</span><span>Press + hold</span>';stage.querySelector('.rp-ring-zone').appendChild(phase);
    function initRing(){
      try {if(root.CosRing3D) ring=root.CosRing3D.create(canvas,{shell:shell,resetButton:reset});} catch (error) { /* Static ring and written instructions remain. */ }
      if(ring){stage.querySelector('.rp-orbit-hint').hidden=false;ring.setGesture(states[index].gesture,labels[states[index].gesture]);}
    }
    if(compact&&'IntersectionObserver' in root){
      var ringObserver=new IntersectionObserver(function(entries){if(entries.some(function(e){return e.isIntersecting;})){ringObserver.disconnect();initRing();}},{rootMargin:'400px'});
      ringObserver.observe(stage);
    }else initRing();
    function render(n,replaying,animate) {
      cancelScene();timers.forEach(clearTimeout);timers=[];
      index=Math.max(0,Math.min(states.length-1,n));var s=states[index];
      host.setAttribute('data-lesson-index',String(index));
      var reduced=root.matchMedia('(prefers-reduced-motion: reduce)').matches;
      cancelScene=playScene(s,index>0?states[index-1].frame:s.frame,{
        animate:animate,reduced:reduced,
        paint:function(view,options){hud.paint(screen,view,options);},
        status:function(text){status.textContent=text;}
      });
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
    // Lesson layout is present before fragment navigation; only the 3D ring is lazy.
    return render;
  }
  var mainItems=Array.from(main.querySelectorAll('.rp-step'));
  var mainStates=mainSteps(mainItems.map(function(el){return el.querySelector('strong').textContent;}),mainItems.map(function(el){return el.getAttribute('data-gesture');}));
  mainStates[8].before=lessons.messages[9].before;mainStates[8].resultText=lessons.messages[9].resultText;
  mount(main,mainStates,false);
  document.querySelectorAll('[data-ring-lesson]').forEach(function(host){
    mount(host,lessons[host.getAttribute('data-ring-lesson')],true);
  });
})(typeof window !== 'undefined' ? window : globalThis);
