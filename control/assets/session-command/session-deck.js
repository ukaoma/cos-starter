(function(){
  'use strict';

  var decks = [].slice.call(document.querySelectorAll('[data-session-deck]'));
  if (!decks.length) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AN = window.anime;
  var animeOK = !!(AN && AN.animate && AN.utils);

  function drawPet(canvas, state){
    var ctx = canvas.getContext('2d');
    if (!ctx || !state.image || !state.image.naturalWidth) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var bounds = canvas.getBoundingClientRect();
    var width = Math.max(1, Math.round(bounds.width * dpr));
    var height = Math.max(1, Math.round(bounds.height * dpr));
    if (canvas.width !== width || canvas.height !== height){
      canvas.width = width;
      canvas.height = height;
    }
    var sw = state.image.naturalWidth / state.frames;
    var sh = state.image.naturalHeight;
    var scale = Math.min(width / sw, height / sh) * .92;
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

  function startPet(canvas){
    var state = {
      image:new Image(),
      frames:Math.max(1,parseInt(canvas.dataset.frames || '1',10)),
      interval:Math.max(.04,parseFloat(canvas.dataset.interval || '.22')) * 1000,
      frame:0,
      last:0,
      running:!reduced
    };
    state.image.decoding = 'async';
    state.image.onload = function(){
      drawPet(canvas,state);
      if (!reduced) requestAnimationFrame(tick);
    };
    state.image.src = canvas.dataset.src;
    function tick(now){
      if (!state.running) return;
      if (!state.last) state.last = now;
      if (now - state.last >= state.interval){
        state.frame = (state.frame + 1) % state.frames;
        state.last = now;
        drawPet(canvas,state);
      }
      requestAnimationFrame(tick);
    }
    window.addEventListener('resize',function(){ drawPet(canvas,state); },{passive:true});
  }

  function startTimers(deck){
    var timers = [].slice.call(deck.querySelectorAll('[data-session-timer]'));
    if (reduced){
      timers.forEach(function(timer){ timer.textContent = (timer.dataset.start || '0') + 's'; });
      return;
    }
    var started = Date.now();
    window.setInterval(function(){
      if (document.hidden) return;
      var elapsed = Math.floor((Date.now() - started) / 1000);
      timers.forEach(function(timer){
        timer.textContent = (parseInt(timer.dataset.start || '0',10) + elapsed) + 's';
      });
    },1000);
  }

  function animateDeck(deck){
    if (deck.dataset.animated === 'true') return;
    deck.dataset.animated = 'true';
    startTimers(deck);
    if (reduced || !animeOK) return;
    var headline = deck.querySelector('.sd-topline');
    var ledger = deck.querySelector('.sd-ledger');
    var rows = [].slice.call(deck.querySelectorAll('.sd-row'));
    var marks = [].slice.call(deck.querySelectorAll('.sd-provider-mark'));
    var statuses = [].slice.call(deck.querySelectorAll('.sd-status'));
    var pet = deck.querySelector('.sd-pet-stage');
    AN.utils.set([headline,ledger,pet],{opacity:0});
    AN.utils.set(ledger,{translateY:10});
    AN.utils.set(rows,{opacity:0,translateX:-14});
    AN.utils.set(statuses,{opacity:0,translateY:8});
    AN.utils.set(pet,{scale:.92});
    AN.animate(headline,{opacity:[0,1],translateY:[-5,0],duration:420,ease:'outQuad'});
    AN.animate(ledger,{opacity:[0,1],translateY:[10,0],duration:580,delay:90,ease:'out(3)'});
    AN.animate(rows,{opacity:[0,1],translateX:[-14,0],duration:460,delay:AN.stagger ? AN.stagger(75,{start:240}) : 240,ease:'out(3)'});
    AN.animate(marks,{scale:[.65,1],rotate:[-10,0],duration:520,delay:AN.stagger ? AN.stagger(75,{start:310}) : 310,ease:'outBack'});
    AN.animate(pet,{opacity:[0,1],scale:[.92,1],duration:650,delay:360,ease:'out(3)'});
    AN.animate(statuses,{opacity:[0,1],translateY:[8,0],duration:440,delay:AN.stagger ? AN.stagger(65,{start:500}) : 500,ease:'out(3)'});
    var liveParts = [].slice.call(deck.querySelectorAll('.sd-signal,.sd-rail'));
    AN.animate(liveParts,{opacity:[1,.48,1],duration:1500,delay:AN.stagger ? AN.stagger(120) : 0,loop:true,ease:'inOutSine'});
  }

  decks.forEach(function(deck){
    var canvas = deck.querySelector('[data-session-pet]');
    if (canvas) startPet(canvas);
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
})();
