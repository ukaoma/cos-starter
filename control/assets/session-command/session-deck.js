(function(){
  'use strict';

  var decks = [].slice.call(document.querySelectorAll('[data-session-deck]'));
  if (!decks.length) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AN = window.anime;
  var animeOK = !!(AN && AN.animate && AN.utils);
  var assetRoot = '/control/assets/session-command/';

  var states = {
    running:{
      top:'4 agents · live', title:'Running 4', context:'All systems', caption:'Live workload',
      pet:{src:assetRoot + 'miles-four-plus.png',frames:26,interval:.22,scale:1},
      rows:[
        {provider:'codex',label:'Codex',task:'Release checks',detail:'mu-chief-staff · building',meta:'16s',start:16},
        {provider:'claude',label:'Claude',task:'Control motion',detail:'cos-control · refining',meta:'21s',start:21},
        {provider:'cursor',label:'Cursor',task:'Agent routing',detail:'cos-glasses · wiring',meta:'21s',start:21},
        {provider:'claude',label:'Claude',task:'Docs launch',detail:'gotcos-site · verifying',meta:'22s',start:22}
      ]
    },
    done:{
      top:'3 turns · complete', title:'Done 3', context:'Finished turns', caption:'Work complete',
      pet:{src:assetRoot + 'miles-idle.png',frames:8,interval:.24,scale:1.3},
      rows:[
        {provider:'codex',label:'Codex',task:'Codex session audit',detail:'Finished · transcript ready',meta:'Open'},
        {provider:'claude',label:'Claude',task:'Sprocket Rocket copy',detail:'Finished · transcript ready',meta:'Open'},
        {provider:'cursor',label:'Cursor',task:'Control deck QA',detail:'Finished · session ready',meta:'Open'}
      ]
    },
    waiting:{
      top:'1 thread · needs you', title:'Waiting 1', context:'Needs you', caption:'Awaiting reply',
      pet:{src:assetRoot + 'miles-one.png',frames:16,interval:.10,scale:1},
      rows:[
        {provider:'claude',label:'Claude',task:'Sprocket Rocket plan',detail:'Needs your reply',meta:'Open'}
      ]
    }
  };

  function drawPet(canvas,state){
    var ctx = canvas.getContext('2d');
    if (!ctx || !state.image || !state.image.naturalWidth) return;
    var dpr = Math.min(window.devicePixelRatio || 1,2);
    var bounds = canvas.getBoundingClientRect();
    var width = Math.max(1,Math.round(bounds.width * dpr));
    var height = Math.max(1,Math.round(bounds.height * dpr));
    if (canvas.width !== width || canvas.height !== height){
      canvas.width = width;
      canvas.height = height;
    }
    var sw = state.image.naturalWidth / state.frames;
    var sh = state.image.naturalHeight;
    var scale = Math.min(width / sw,height / sh) * .92 * state.scale;
    var dw = sw * scale;
    var dh = sh * scale;
    var dx = (width - dw) / 2;
    var dy = (height - dh) / 2;
    ctx.clearRect(0,0,width,height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(state.image,state.frame * sw,0,sw,sh,dx,dy,dw,dh);
    canvas.dataset.frame = String(state.frame);
  }

  function createPetController(canvas){
    var generation = 0;
    var state = {image:null,frames:1,interval:220,scale:1,frame:0,running:!reduced};

    function setSprite(config){
      generation += 1;
      var request = generation;
      var image = new Image();
      image.decoding = 'async';
      image.onload = function(){
        if (request !== generation) return;
        state.image = image;
        state.frames = Math.max(1,parseInt(config.frames || 1,10));
        state.interval = Math.max(.04,parseFloat(config.interval || .22)) * 1000;
        state.scale = Math.max(.1,parseFloat(config.scale || 1));
        state.frame = 0;
        state.last = 0;
        canvas.dataset.src = config.src;
        canvas.dataset.frames = String(state.frames);
        canvas.dataset.interval = String(config.interval);
        canvas.dataset.scale = String(state.scale);
        drawPet(canvas,state);
      };
      image.src = config.src;
    }

    function tick(){
      if (state.running && state.image){
        state.frame = (state.frame + 1) % state.frames;
        drawPet(canvas,state);
      }
      if (!reduced) window.setTimeout(tick,state.interval);
    }

    window.addEventListener('resize',function(){ drawPet(canvas,state); },{passive:true});
    if (!reduced) window.setTimeout(tick,300);
    return {setSprite:setSprite};
  }

  function initializeDeck(deck){
    var canvas = deck.querySelector('[data-session-pet]');
    var pet = canvas ? createPetController(canvas) : null;
    var rowsWrap = deck.querySelector('.sd-rows');
    var rows = [].slice.call(deck.querySelectorAll('.sd-row'));
    var tabs = [].slice.call(deck.querySelectorAll('[data-deck-state]'));
    var current = '';
    var timerAnchor = Date.now();
    var transitionToken = 0;

    function renderRows(config){
      rowsWrap.dataset.rowCount = String(config.rows.length);
      rows.forEach(function(row,index){
        var data = config.rows[index];
        if (!data){
          row.hidden = true;
          return;
        }
        row.hidden = false;
        row.className = 'sd-row sd-' + data.provider;
        row.querySelector('.sd-provider').textContent = data.label;
        row.querySelector('.sd-task').textContent = data.task;
        row.querySelector('.sd-row-detail span').textContent = data.detail;
        var meta = row.querySelector('.sd-time');
        meta.textContent = data.meta;
        if (typeof data.start === 'number') meta.dataset.start = String(data.start);
        else delete meta.dataset.start;
      });
    }

    function applyState(key,shouldAnimate,token){
      if (token !== transitionToken) return;
      var config = states[key];
      current = key;
      timerAnchor = Date.now();
      deck.dataset.state = key;
      deck.querySelector('[data-deck-top]').textContent = config.top;
      deck.querySelector('[data-ledger-title]').textContent = config.title;
      deck.querySelector('[data-ledger-context]').textContent = config.context;
      deck.querySelector('.sd-pet-stage').dataset.petCaption = config.caption;
      renderRows(config);
      if (pet) pet.setSprite(config.pet);
      tabs.forEach(function(tab){
        var active = tab.dataset.deckState === key;
        tab.setAttribute('aria-selected',active ? 'true' : 'false');
        tab.tabIndex = active ? 0 : -1;
      });
      deck.setAttribute('aria-label',config.title + ' preview. ' + config.context + '. The ledger and Miles Windu animation update together.');

      if (!shouldAnimate || reduced || !animeOK) return;
      var visibleRows = rows.filter(function(row){ return !row.hidden; });
      AN.utils.set(visibleRows,{opacity:0});
      AN.animate(visibleRows,{opacity:[0,1],duration:390,delay:AN.stagger ? AN.stagger(65) : 0,ease:'out(3)'});
    }

    function selectState(key,shouldAnimate){
      if (!states[key] || (key === current && deck.dataset.state)) return;
      transitionToken += 1;
      var token = transitionToken;
      var activeRows = rows.filter(function(row){ return !row.hidden; });
      if (shouldAnimate && !reduced && animeOK){
        AN.animate(activeRows,{opacity:[1,0],duration:130,ease:'inQuad'});
        window.setTimeout(function(){ applyState(key,true,token); },135);
      } else {
        applyState(key,false,token);
      }
    }

    tabs.forEach(function(tab,index){
      tab.addEventListener('click',function(){ selectState(tab.dataset.deckState,true); });
      tab.addEventListener('keydown',function(event){
        var next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        else return;
        event.preventDefault();
        tabs[next].focus();
        selectState(tabs[next].dataset.deckState,true);
      });
    });

    window.setInterval(function(){
      if (document.hidden || reduced || current !== 'running') return;
      var elapsed = Math.floor((Date.now() - timerAnchor) / 1000);
      states.running.rows.forEach(function(item,index){
        if (!rows[index].hidden) rows[index].querySelector('.sd-time').textContent = (item.start + elapsed) + 's';
      });
    },1000);

    selectState('running',false);
  }

  function animateDeck(deck){
    if (deck.dataset.animated === 'true') return;
    deck.dataset.animated = 'true';
    if (reduced || !animeOK) return;
    var rows = [].slice.call(deck.querySelectorAll('.sd-row:not([hidden])'));
    var statuses = [].slice.call(deck.querySelectorAll('.sd-status'));
    AN.utils.set(rows,{opacity:0});
    AN.utils.set(statuses,{opacity:0});
    AN.animate(rows,{opacity:[0,1],duration:460,delay:AN.stagger ? AN.stagger(75,{start:180}) : 180,ease:'out(3)'});
    AN.animate(statuses,{opacity:[0,1],duration:440,delay:AN.stagger ? AN.stagger(65,{start:360}) : 360,ease:'out(3)'});
  }

  function boot(){
    decks.forEach(function(deck){
      initializeDeck(deck);
      if (reduced || !('IntersectionObserver' in window)){
        animateDeck(deck);
        return;
      }
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if (entry.isIntersecting){ animateDeck(deck); observer.disconnect(); }
        });
      },{threshold:.2});
      observer.observe(deck);
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else boot();
})();
