/* Pixel-exact app frames; website timing and lens surround are illustrative. */
(function(root){
  'use strict';
  var data=root.CosDocsSignalData, active=new Map(), timer=null;
  var moving=['working','offline','waiting','sending','saving'];
  function draw(canvas,state,phase){
    if(!data||!data.frames[state]||!canvas.getContext)return;
    var ctx=canvas.getContext('2d');if(!ctx)return;
    var bytes=root.atob(data.frames[state][phase%8]), pixels=ctx.createImageData(24,24);
    for(var i=0;i<576;i++){pixels.data[i*4]=70;pixels.data[i*4+1]=232;pixels.data[i*4+2]=120;pixels.data[i*4+3]=bytes.charCodeAt(i);}
    ctx.putImageData(pixels,0,0);
  }
  function reduced(){return root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches;}
  function tick(){
    active.forEach(function(item,canvas){
      if(!canvas.isConnected){active.delete(canvas);return;}
      if(document.hidden||reduced())return;
      var box=canvas.getBoundingClientRect();if(box.bottom<0||box.top>root.innerHeight)return;
      item.phase=(item.phase+1)%8;draw(canvas,item.state,item.phase);
    });
    if(!active.size&&timer){root.clearInterval(timer);timer=null;}
  }
  function mount(el,animate){
    if(!data)return;
    el.querySelectorAll('canvas[data-cos-signal]').forEach(function(canvas){
      var state=canvas.getAttribute('data-cos-signal');
      active.delete(canvas);draw(canvas,state,state==='complete'?2:0);
      if(animate!==false&&!reduced()&&moving.indexOf(state)>=0)active.set(canvas,{state:state,phase:0});
    });
    if(active.size&&!timer)timer=root.setInterval(tick,500);
    if(!active.size&&timer){root.clearInterval(timer);timer=null;}
  }
  root.CosDocsSignals={mount:mount,draw:draw};
  if(typeof document!=='undefined')document.querySelectorAll('[data-cos-motion]').forEach(function(button){
    var paused=false;button.addEventListener('click',function(){paused=!paused;button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Play HUD animation':'Pause HUD animation';mount(document,!paused);});
  });
})(typeof window==='undefined'?globalThis:window);
