(function(global){
  'use strict';

  var TAU = Math.PI * 2;
  var BASE_POSE = {x:-0.46,y:0.24,z:-0.08};
  // Gesture timeline in ms on the contact clock. ILLUSTRATIVE pacing for
  // teaching, not a firmware recognition threshold. ring-lessons.js reads this
  // object so the HUD reacts after the drawn contact instead of on a guess, and
  // the tests import it instead of restating the numbers.
  var TIMING = Object.freeze({
    lead: 260,                       // camera turn before the contact clock starts; the pose settles ~95% in 17 frames
    tapCycle: 2200, swipeCycle: 2400, // one cycle per step; Replay restarts it
    tapPulse: 560, tapVisible: 760, doubleTapGap: 340,
    swipeStroke: 820, swipeFadeStart: 1050, swipeFadeEnd: 1750,
    holdTap: 150, holdRelease: 300, holdPress: 450,
    collarRipple: 900
  });
  // Camera poses. The tap/hold pose keeps the touch rail facing the viewer
  // (rail visibility .92, searched numerically); the shipped pose turned it
  // 58% away, so every tap drew at less than half the brightness of a swipe.
  var POSES = {
    'idle':BASE_POSE,
    'swipe-up':{x:-0.8,y:-0.28,z:-0.14},
    'swipe-down':{x:-0.8,y:-0.28,z:0.06},
    'tap':{x:-1.15,y:0.15,z:-0.10},
    'hold':{x:-1.15,y:0.15,z:-0.10},
    'double-tap':{x:-0.76,y:-0.18,z:0.13}
  };

  function clamp(value, min, max){ return Math.max(min, Math.min(max, value)); }
  function lerp(a, b, amount){ return a + (b - a) * amount; }
  function easeOut(value){ return 1 - Math.pow(1 - clamp(value, 0, 1), 3); }
  function normalizeAngle(value){
    while (value > Math.PI) value -= TAU;
    while (value < -Math.PI) value += TAU;
    return value;
  }
  function dot(a, b){ return a.x*b.x + a.y*b.y + a.z*b.z; }
  function cross(a, b){
    return {x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x};
  }
  function subtract(a, b){ return {x:a.x-b.x,y:a.y-b.y,z:a.z-b.z}; }
  function normalize(v){
    var length = Math.sqrt(dot(v,v)) || 1;
    return {x:v.x/length,y:v.y/length,z:v.z/length};
  }
  function rotate(point, pose){
    var cx=Math.cos(pose.x), sx=Math.sin(pose.x);
    var cy=Math.cos(pose.y), sy=Math.sin(pose.y);
    var cz=Math.cos(pose.z), sz=Math.sin(pose.z);
    var x=point.x, y=point.y*cx-point.z*sx, z=point.y*sx+point.z*cx;
    var x2=x*cy+z*sy, z2=-x*sy+z*cy;
    return {x:x2*cz-y*sz,y:x2*sz+y*cz,z:z2};
  }
  function RingRenderer(canvas, options){
    this.canvas=canvas;
    this.shell=options.shell;
    this.resetButton=options.resetButton || null;
    this.ctx=canvas.getContext('2d', {alpha:true});
    if(!this.ctx) return;

    this.pose={x:BASE_POSE.x-0.18,y:BASE_POSE.y+0.2,z:BASE_POSE.z+0.1};
    this.target={x:BASE_POSE.x,y:BASE_POSE.y,z:BASE_POSE.z};
    this.velocity={x:0,y:0,z:0};
    this.pointers=new Map();
    this.dragging=false;
    this.rollMode=false;
    this.multi=null;
    this.gesture='idle';
    this.gestureStarted=performance.now();
    this.lastFrame=0;
    this.frameId=0;
    this.inView=true;
    this.pageVisible=!global.document.hidden;
    this.destroyed=false;
    this.motionQuery=global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.reduced=!!(this.motionQuery && this.motionQuery.matches);
    this.light=normalize({x:-0.42,y:-0.66,z:0.9});
    this.innerRadius=1.03;
    this.outerRadius=1.37;
    this.crownHeight=1.39;
    this.crownHalfAngle=.30;
    this.shoulderEnd=.67;
    this.uSegments=96;
    // Axial width and radial wall are independent dimensions. The broad ceramic
    // band surrounds a round bore; only the outside has the flat crown/shoulders.
    this.profile=[
      {r:1.11,z:-0.33,mat:'steel'},
      {r:1.26,z:-0.33,mat:'body'},
      {r:1.33,z:-0.30,mat:'body'},
      {r:1.365,z:-0.26,mat:'body'},
      {r:1.37,z:-0.21,mat:'body'},
      {r:1.37,z:0.21,mat:'body'},
      {r:1.365,z:0.26,mat:'body'},
      {r:1.33,z:0.30,mat:'body'},
      {r:1.26,z:0.33,mat:'body'},
      {r:1.11,z:0.33,mat:'steel'},
      {r:1.055,z:0.29,mat:'steel'},
      {r:1.03,z:0.21,mat:'steel'},
      {r:1.03,z:0.07,mat:'steel'},
      {r:1.03,z:-0.07,mat:'steel'},
      {r:1.03,z:-0.21,mat:'steel'},
      {r:1.055,z:-0.29,mat:'steel'}
    ];
    this.vSegments=this.profile.length;
    this.vertices=[];
    this.faces=[];
    this.crownAngle=-Math.PI/2;
    this.sensorAngle=Math.PI/2;
    this.touchRailStart=this.crownAngle+.54;
    this.touchRailEnd=this.crownAngle+1.01;
    this.evenMarkPaths=global.Path2D ? [
      new global.Path2D('M18.5873 11.1777H29.9651V14.0222H18.5873V11.1777Z'),
      new global.Path2D('M15.7429 11.1777H12.8984V25.4H15.7429V22.5555H18.5873V25.4H29.9651V22.5555H18.5873V19.7111H29.9651V16.8666H18.5873V14.0222L15.7429 14.0222V11.1777ZM15.7429 19.7111H18.5873V16.8666H15.7429V19.7111Z')
    ] : null;

    this.buildMesh();
    this.bind();
    this.resize();
    this.canvas.tabIndex=0;
    this.canvas.removeAttribute('aria-hidden');
    if(this.shell){
      this.shell.classList.add('is-ready');
      var fallback=this.shell.querySelector('.rp-ring-fallback');
      if(fallback) fallback.setAttribute('aria-hidden','true');
    }
    if(this.resetButton){
      this.resetButton.hidden=false;
      this.resetButton.addEventListener('click', this.onResetClick);
    }
    this.start();
  }

  RingRenderer.prototype.buildMesh=function(){
    for(var u=0;u<this.uSegments;u++){
      var ua=TAU*u/this.uSegments;
      for(var v=0;v<this.vSegments;v++){
        var section=this.profile[v];
        this.vertices.push(this.surfacePoint(ua,section.z,section.r));
      }
    }
    for(var ui=0;ui<this.uSegments;ui++){
      for(var vi=0;vi<this.vSegments;vi++){
        var nextU=(ui+1)%this.uSegments;
        var nextV=(vi+1)%this.vSegments;
        var a=ui*this.vSegments+vi;
        var b=nextU*this.vSegments+vi;
        var c=nextU*this.vSegments+nextV;
        var d=ui*this.vSegments+nextV;
        this.faces.push({indices:[a,b,c,d],mat:this.profile[vi].mat,profile:vi});
      }
    }
  };

  RingRenderer.prototype.outerContour=function(angle){
    var delta=Math.abs(normalizeAngle(angle-this.crownAngle));
    if(delta>=this.shoulderEnd) return this.outerRadius;
    // A plane, not a constant-radius bulge: every point on the crown has y=-h.
    if(delta<=this.crownHalfAngle) return this.crownHeight/Math.cos(delta);
    var x0=this.crownHeight*Math.tan(this.crownHalfAngle);
    var x1=this.outerRadius*Math.sin(this.shoulderEnd);
    var y1=-this.outerRadius*Math.cos(this.shoulderEnd);
    var slope=(y1+this.crownHeight)/(x1-x0);
    return (this.crownHeight+slope*x0)/(Math.cos(delta)+slope*Math.sin(delta));
  };

  RingRenderer.prototype.bind=function(){
    var self=this;
    this.onPointerDown=function(event){ self.pointerDown(event); };
    this.onPointerMove=function(event){ self.pointerMove(event); };
    this.onPointerUp=function(event){ self.pointerUp(event); };
    this.onLostPointerCapture=function(event){ self.pointerUp(event); };
    this.onKeyDown=function(event){ self.keyDown(event); };
    this.onMotionChange=function(event){ self.reduced=event.matches; self.velocity={x:0,y:0,z:0}; self.gestureStarted=performance.now(); self.start(); };
    this.onVisibilityChange=function(){ self.pageVisible=!global.document.hidden; if(self.pageVisible){ self.resumeGesture(); self.start(); } else self.stop(); };
    this.onContextMenu=function(event){ event.preventDefault(); };
    this.onDoubleClick=function(){ self.reset(); };
    this.onResetClick=function(){ self.reset(); self.canvas.focus({preventScroll:true}); };
    canvasAdd(this.canvas,'pointerdown',this.onPointerDown);
    canvasAdd(this.canvas,'pointermove',this.onPointerMove);
    canvasAdd(this.canvas,'pointerup',this.onPointerUp);
    canvasAdd(this.canvas,'pointercancel',this.onPointerUp);
    canvasAdd(this.canvas,'lostpointercapture',this.onLostPointerCapture);
    canvasAdd(this.canvas,'keydown',this.onKeyDown);
    canvasAdd(this.canvas,'contextmenu',this.onContextMenu);
    canvasAdd(this.canvas,'dblclick',this.onDoubleClick);
    global.document.addEventListener('visibilitychange',this.onVisibilityChange);
    if(this.motionQuery){
      if(this.motionQuery.addEventListener) this.motionQuery.addEventListener('change',this.onMotionChange);
      else if(this.motionQuery.addListener) this.motionQuery.addListener(this.onMotionChange);
    }

    if(global.ResizeObserver){
      this.resizeObserver=new ResizeObserver(function(){ self.resize(); });
      this.resizeObserver.observe(this.canvas);
    }else{
      this.onWindowResize=function(){ self.resize(); };
      global.addEventListener('resize',this.onWindowResize);
    }
    if(global.IntersectionObserver){
      this.viewObserver=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          self.inView=entry.isIntersecting;
          if(self.inView){ self.resumeGesture(); self.start(); } else self.stop();
        });
      },{threshold:0.02});
      this.viewObserver.observe(this.canvas);
    }
  };

  function canvasAdd(canvas, name, handler){ canvas.addEventListener(name,handler); }

  RingRenderer.prototype.resize=function(){
    var rect=this.canvas.getBoundingClientRect();
    if(!rect.width || !rect.height) return;
    var dpr=Math.min(global.devicePixelRatio || 1, 2);
    var width=Math.max(1,Math.round(rect.width*dpr));
    var height=Math.max(1,Math.round(rect.height*dpr));
    if(this.canvas.width!==width || this.canvas.height!==height){
      this.canvas.width=width;
      this.canvas.height=height;
    }
    this.width=rect.width;
    this.height=rect.height;
    this.dpr=dpr;
    this.draw(performance.now());
  };

  RingRenderer.prototype.pointerDown=function(event){
    this.canvas.focus({preventScroll:true});
    this.canvas.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    this.dragging=true;
    this.rollMode=!!(event.shiftKey || event.button===2);
    this.velocity={x:0,y:0,z:0};
    if(this.pointers.size===2) this.setMultiStart();
    this.canvas.classList.add('is-dragging');
    this.start();
  };

  RingRenderer.prototype.setMultiStart=function(){
    var pts=Array.from(this.pointers.values());
    this.multi={
      angle:Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x),
      x:(pts[0].x+pts[1].x)/2,
      y:(pts[0].y+pts[1].y)/2
    };
  };

  RingRenderer.prototype.pointerMove=function(event){
    var prior=this.pointers.get(event.pointerId);
    if(!prior) return;
    this.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(this.pointers.size>=2){
      var pts=Array.from(this.pointers.values()).slice(0,2);
      var angle=Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x);
      var cx=(pts[0].x+pts[1].x)/2;
      var cy=(pts[0].y+pts[1].y)/2;
      if(this.multi){
        var angleDelta=normalizeAngle(angle-this.multi.angle);
        this.target.z+=angleDelta;
        this.target.y+=(cx-this.multi.x)*0.005;
        this.target.x+=(cy-this.multi.y)*0.005;
        this.velocity.z=angleDelta*0.2;
      }
      this.multi={angle:angle,x:cx,y:cy};
      return;
    }
    var dx=event.clientX-prior.x;
    var dy=event.clientY-prior.y;
    if(this.rollMode || event.shiftKey){
      this.target.z+=dx*0.012+dy*0.003;
      this.velocity.z=(dx*0.012+dy*0.003)*0.18;
    }else{
      this.target.y+=dx*0.009;
      this.target.x+=dy*0.009;
      this.velocity.y=dx*0.0018;
      this.velocity.x=dy*0.0018;
    }
  };

  RingRenderer.prototype.pointerUp=function(event){
    this.pointers.delete(event.pointerId);
    if(this.pointers.size>=2){
      this.setMultiStart();
    }else if(this.pointers.size===1){
      this.multi=null;
    }else if(!this.pointers.size){
      this.dragging=false;
      this.multi=null;
      this.canvas.classList.remove('is-dragging');
    }
  };

  RingRenderer.prototype.keyDown=function(event){
    var handled=true;
    if(event.key==='ArrowLeft') this.target.y-=0.16;
    else if(event.key==='ArrowRight') this.target.y+=0.16;
    else if(event.key==='ArrowUp') this.target.x-=0.16;
    else if(event.key==='ArrowDown') this.target.x+=0.16;
    else if(event.key==='q' || event.key==='Q') this.target.z-=0.16;
    else if(event.key==='e' || event.key==='E') this.target.z+=0.16;
    else if(event.key===' ' || event.key==='Home') this.reset();
    else handled=false;
    if(handled){
      event.preventDefault();
      event.stopPropagation();
      this.start();
    }
  };

  RingRenderer.prototype.reset=function(){
    this.target={x:BASE_POSE.x,y:BASE_POSE.y,z:BASE_POSE.z};
    this.velocity={x:0,y:0,z:0};
    this.start();
  };

  // Returns the lead-in in ms: the contact clock starts only after the camera
  // has turned to the new pose, so the first contact is never drawn mid-turn or
  // at the old rail position. A same-pose change starts at once.
  RingRenderer.prototype.setGesture=function(gesture, label){
    this.gesture=gesture || 'idle';
    var pose=POSES[this.gesture] || BASE_POSE;
    var turn=Math.abs(this.pose.x-pose.x)+Math.abs(this.pose.y-pose.y)+Math.abs(this.pose.z-pose.z);
    var lead=this.reduced || this.gesture==='idle' || turn<0.05 ? 0 : TIMING.lead;
    this.gestureLead=lead;
    this.gestureStarted=performance.now()+lead;
    this.target={x:pose.x,y:pose.y,z:pose.z};
    this.velocity={x:0,y:0,z:0};
    this.canvas.setAttribute('aria-label','Interactive 3D COS ring. Current demonstration: '+(label || this.gesture)+'. Drag to rotate. Shift-drag or use two fingers to roll. Arrow keys rotate; Q and E roll; Space resets.');
    this.start();
    return lead;
  };

  RingRenderer.prototype.gestureCycle=function(){
    return this.gesture.indexOf('swipe')===0 ? TIMING.swipeCycle : TIMING.tapCycle;
  };

  // True while the one-shot gesture still has frames to draw. Hold keeps a
  // slow glow forever; tap, double-tap and swipe stop after one cycle and rest.
  RingRenderer.prototype.gestureLive=function(now){
    if(this.gesture==='idle' || this.reduced) return false;
    if(this.gesture==='hold') return true;
    return now-this.gestureStarted < this.gestureCycle()+60;
  };

  // A ring that was paused mid-gesture (tab hidden, scrolled away) replays the
  // contact from the top when it comes back, instead of resuming at an
  // arbitrary point of a cycle it never showed.
  RingRenderer.prototype.resumeGesture=function(){
    var now=performance.now();
    if(this.gesture!=='idle' && now-this.gestureStarted < this.gestureCycle()) this.gestureStarted=now;
  };

  RingRenderer.prototype.start=function(){
    if(this.frameId || this.destroyed || !this.inView || !this.pageVisible) return;
    var self=this;
    this.frameId=requestAnimationFrame(function(now){ self.frame(now); });
  };

  RingRenderer.prototype.stop=function(){
    if(this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId=0;
  };

  RingRenderer.prototype.frame=function(now){
    this.frameId=0;
    if(this.destroyed || !this.inView || !this.pageVisible) return;
    {
      var frameScale=this.lastFrame ? clamp((now-this.lastFrame)/16.67,0.1,2) : 1;
      this.lastFrame=now;
      if(!this.dragging && !this.reduced){
        this.target.x+=this.velocity.x*frameScale;
        this.target.y+=this.velocity.y*frameScale;
        this.target.z+=this.velocity.z*frameScale;
        this.velocity.x*=Math.pow(0.9,frameScale);
        this.velocity.y*=Math.pow(0.9,frameScale);
        this.velocity.z*=Math.pow(0.9,frameScale);
      }else if(!this.dragging && this.reduced){
        this.velocity={x:0,y:0,z:0};
      }
      var response=this.reduced ? 1 : 1-Math.pow(0.84,frameScale);
      this.pose.x=lerp(this.pose.x,this.target.x,response);
      this.pose.y=lerp(this.pose.y,this.target.y,response);
      this.pose.z=lerp(this.pose.z,this.target.z,response);
      this.draw(now);
    }
    var poseMoving=Math.abs(this.pose.x-this.target.x)>0.0005 || Math.abs(this.pose.y-this.target.y)>0.0005 || Math.abs(this.pose.z-this.target.z)>0.0005;
    var hasVelocity=Math.abs(this.velocity.x)>0.0004 || Math.abs(this.velocity.y)>0.0004 || Math.abs(this.velocity.z)>0.0004;
    if(this.dragging || poseMoving || hasVelocity || this.gestureLive(now)) this.start();
  };

  RingRenderer.prototype.project=function(point){
    var camera=5.4;
    var perspective=camera/(camera-point.z);
    var scale=Math.min(this.width,this.height)*0.285;
    return {x:this.width/2+point.x*scale*perspective,y:this.height*.47+point.y*scale*perspective,z:point.z,scale:perspective};
  };

  RingRenderer.prototype.surfacePoint=function(angle,z,radius){
    var shape=clamp((radius-1.11)/(this.outerRadius-1.11),0,1);
    var r=radius+shape*(this.outerContour(angle)-this.outerRadius);
    return {x:Math.cos(angle)*r,y:Math.sin(angle)*r,z:z};
  };

  // The software depth buffer gives surface details the same occlusion as the
  // shell. A rear sensor or logo must never be composited over the near wall.
  RingRenderer.prototype.rasterTriangle=function(a,b,c,visit){
    var den=(b.y-c.y)*(a.x-c.x)+(c.x-b.x)*(a.y-c.y);
    if(Math.abs(den)<.00001) return;
    var left=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x)));
    var right=Math.min(this.depthWidth-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    var top=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y)));
    var bottom=Math.min(this.depthHeight-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    for(var y=top;y<=bottom;y++) for(var x=left;x<=right;x++){
      var u=((b.y-c.y)*(x+.5-c.x)+(c.x-b.x)*(y+.5-c.y))/den;
      var v=((c.y-a.y)*(x+.5-c.x)+(a.x-c.x)*(y+.5-c.y))/den;
      if(u>=-.0001 && v>=-.0001 && u+v<=1.0001){
        visit(y*this.depthWidth+x,u*a.scale+v*b.scale+(1-u-v)*c.scale);
      }
    }
  };

  RingRenderer.prototype.visiblePoint=function(point){
    var x=Math.floor(point.x),y=Math.floor(point.y);
    return x>=0 && x<this.depthWidth && y>=0 && y<this.depthHeight &&
      point.scale+.002>=this.depth[y*this.depthWidth+x];
  };

  RingRenderer.prototype.strokeSurface=function(ctx,path,closed){
    ctx.beginPath();
    for(var i=0;i<path.length-(closed?0:1);i++){
      var a=path[i],b=path[(i+1)%path.length];
      if(this.visiblePoint(a) && this.visiblePoint(b)){
        ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      }
    }
    ctx.stroke();
  };

  RingRenderer.prototype.clipSurface=function(ctx,polygon){
    var self=this,mask=this.detailMask;
    mask.fill(0);
    for(var i=1;i<polygon.length-1;i++){
      this.rasterTriangle(polygon[0],polygon[i],polygon[i+1],function(index,depth){
        if(depth+.002>=self.depth[index]) mask[index]=1;
      });
    }
    var xs=polygon.map(function(p){return p.x;}),ys=polygon.map(function(p){return p.y;});
    var left=Math.max(0,Math.floor(Math.min.apply(null,xs))-1);
    var right=Math.min(this.depthWidth-1,Math.ceil(Math.max.apply(null,xs))+1);
    var top=Math.max(0,Math.floor(Math.min.apply(null,ys))-1);
    var bottom=Math.min(this.depthHeight-1,Math.ceil(Math.max.apply(null,ys))+1);
    ctx.beginPath();
    for(var y=top;y<=bottom;y++){
      var start=-1;
      for(var x=left;x<=right+1;x++){
        var visible=x<=right && mask[y*this.depthWidth+x];
        if(visible && start<0) start=x;
        if(!visible && start>=0){ctx.rect(start,y,x-start,1);start=-1;}
      }
    }
    ctx.clip();
  };

  RingRenderer.prototype.draw=function(now){
    if(!this.width || !this.height) return;
    var ctx=this.ctx;
    var dpr=this.dpr || 1;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,this.width,this.height);

    var glow=ctx.createRadialGradient(this.width*.5,this.height*.47,0,this.width*.5,this.height*.47,Math.min(this.width,this.height)*.52);
    glow.addColorStop(0,'rgba(77,213,138,.035)');
    glow.addColorStop(.42,'rgba(31,111,71,.045)');
    glow.addColorStop(1,'rgba(7,16,10,0)');
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,this.width,this.height);
    this.drawCollar(ctx,now);

    var points=new Array(this.vertices.length);
    for(var i=0;i<this.vertices.length;i++){
      points[i]=rotate(this.vertices[i],this.pose);
    }

    var faces=[];
    this.depthWidth=Math.ceil(this.width);this.depthHeight=Math.ceil(this.height);
    var depthSize=this.depthWidth*this.depthHeight;
    if(!this.depth || this.depth.length!==depthSize){
      this.depth=new Float32Array(depthSize);this.detailMask=new Uint8Array(depthSize);
    }else this.depth.fill(0);
    var self=this;
    for(var f=0;f<this.faces.length;f++){
      var face=this.faces[f];
      var p0=points[face.indices[0]],p1=points[face.indices[1]],p2=points[face.indices[2]],p3=points[face.indices[3]];
      var normal=normalize(cross(subtract(p1,p0),subtract(p3,p0)));
      var center={x:(p0.x+p1.x+p2.x+p3.x)/4,y:(p0.y+p1.y+p2.y+p3.y)/4,z:(p0.z+p1.z+p2.z+p3.z)/4};
      if(dot(normal,subtract({x:0,y:0,z:5.4},center))<=0) continue;
      var projected=[p0,p1,p2,p3].map(function(p){return self.project(p);});
      var writeDepth=function(index,value){if(value>self.depth[index]) self.depth[index]=value;};
      this.rasterTriangle(projected[0],projected[1],projected[2],writeDepth);
      this.rasterTriangle(projected[0],projected[2],projected[3],writeDepth);
      faces.push({p:projected,n:normal,z:center.z,index:f,mat:face.mat});
    }
    faces.sort(function(a,b){ return a.z-b.z; });

    ctx.lineJoin='round';
    for(var fi=0;fi<faces.length;fi++){
      var item=faces[fi];
      var a=item.p[0],b=item.p[1],c=item.p[2],d=item.p[3];
      var area=(b.x-a.x)*(d.y-a.y)-(b.y-a.y)*(d.x-a.x);
      if(Math.abs(area)<0.015) continue;
      var diffuse=Math.max(0,dot(item.n,this.light));
      var facing=Math.abs(item.n.z);
      var spec=Math.pow(Math.max(0,diffuse*.76+facing*.24),11);
      var steel=item.mat==='steel';
      var grain=((item.index*19)%13-6)*.12;
      var red=steel ? 34+diffuse*52+spec*72+grain : 7+diffuse*9+spec*25+grain;
      var green=steel ? 98+diffuse*84+spec*53+grain : 33+diffuse*30+spec*75+grain;
      var blue=steel ? 65+diffuse*65+spec*60 : 22+diffuse*20+spec*48;
      ctx.fillStyle='rgb('+Math.round(clamp(red,0,238))+','+Math.round(clamp(green,0,255))+','+Math.round(clamp(blue,0,242))+')';
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fill();
      ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.35;ctx.stroke();
    }
    this.drawSeams(ctx,points);
    this.drawCrown(ctx,now);
    this.drawSensorStack(ctx,now);
  };

  RingRenderer.prototype.drawSeams=function(ctx,points){
    var self=this;
    var indices=[1,3,6,8,10,15];
    ctx.save();
    ctx.lineCap='round';
    indices.forEach(function(vIndex,band){
      for(var u=0;u<self.uSegments;u++){
        var next=(u+1)%self.uSegments;
        var a3=points[u*self.vSegments+vIndex];
        var b3=points[next*self.vSegments+vIndex];
        var a=self.project(a3),b=self.project(b3);
        ctx.strokeStyle='rgba(108,236,163,'+(band<4?.58:.72)+')';
        ctx.lineWidth=.65;
        ctx.shadowColor='rgba(77,213,138,.4)';ctx.shadowBlur=2;
        self.strokeSurface(ctx,[a,b]);
      }
    });
    ctx.restore();
  };

  RingRenderer.prototype.tracePatch=function(ctx,points){
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    for(var i=1;i<points.length;i++) ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath();
  };

  RingRenderer.prototype.drawCrown=function(ctx,now){
    var self=this;
    var normal=rotate({x:0,y:-1,z:0},this.pose);
    var center=rotate({x:0,y:-this.crownHeight,z:0},this.pose);
    if(dot(normal,subtract({x:0,y:0,z:5.4},center))>0){
      // Original 1.20:1 Even vector, flush on the actual flat crown plane.
      var mark=[{x:-.18,z:-.15},{x:.18,z:-.15},{x:.18,z:.15},{x:-.18,z:.15}].map(function(p){
        return self.project(rotate({x:p.x,y:-self.crownHeight-.006,z:p.z},self.pose));
      });
      ctx.save();this.clipSurface(ctx,mark);this.drawEvenMark(ctx,mark,1);ctx.restore();
    }

    var railAngle=(this.touchRailStart+this.touchRailEnd)/2;
    var railNormal=rotate({x:Math.cos(railAngle),y:Math.sin(railAngle),z:0},this.pose);
    var railCenter=rotate(this.surfacePoint(railAngle,0,this.outerRadius),this.pose);
    var railVisibility=clamp(dot(railNormal,normalize(subtract({x:0,y:0,z:5.4},railCenter)))/.35,0,1);
    var railRadius=this.outerRadius+.009;
    ctx.save();ctx.globalAlpha=railVisibility;ctx.fillStyle='rgba(178,255,211,.72)';ctx.shadowColor='rgba(77,213,138,.85)';ctx.shadowBlur=4;
    for(var i=0;i<5;i++){
      var theta=lerp(this.touchRailStart,this.touchRailEnd,i/4);
      var p=this.project(rotate(this.surfacePoint(theta,0,railRadius),this.pose));
      if(this.visiblePoint(p)) ctx.fillRect(p.x-.85,p.y-.85,1.7,1.7);
    }
    ctx.restore();
    this.drawGesture(ctx,now,railVisibility,railRadius,this.touchRailStart,this.touchRailEnd);
  };

  RingRenderer.prototype.drawEvenMark=function(ctx,patch,visibility){
    var x0=12.8984,y0=11.1777,width=17.0667,height=14.2223;
    var p0=patch[0],p1=patch[1],p3=patch[3];
    var a=(p1.x-p0.x)/width,b=(p1.y-p0.y)/width;
    var c=(p3.x-p0.x)/height,d=(p3.y-p0.y)/height;
    var e=p0.x-a*x0-c*y0,f=p0.y-b*x0-d*y0;
    ctx.save();
    ctx.globalAlpha=visibility;
    ctx.transform(a,b,c,d,e,f);
    ctx.fillStyle='rgba(222,255,235,.96)';
    ctx.shadowColor='rgba(152,255,200,.65)';ctx.shadowBlur=1/Math.max(Math.abs(a),Math.abs(d),.01);
    if(this.evenMarkPaths){
      ctx.fill(this.evenMarkPaths[0]);
      ctx.fill(this.evenMarkPaths[1],'evenodd');
    }else{
      ctx.fillRect(12.8984,11.1777,2.8445,14.2223);
      ctx.fillRect(18.5873,11.1777,11.3778,2.8445);
      ctx.fillRect(18.5873,16.8666,11.3778,2.8445);
      ctx.fillRect(18.5873,22.5555,11.3778,2.8445);
    }
    ctx.restore();
  };

  RingRenderer.prototype.drawSensorStack=function(ctx,now){
    var radius=this.innerRadius-.007;
    var offsets=[-.58,-.30,0,.30,.58];
    for(var i=0;i<offsets.length;i++){
      var angle=this.sensorAngle+offsets[i];
      var normal=rotate({x:-Math.cos(angle),y:-Math.sin(angle),z:0},this.pose);
      var center=rotate(this.surfacePoint(angle,0,radius),this.pose);
      if(dot(normal,subtract({x:0,y:0,z:5.4},center))<=0) continue;
      var wide=i===2?.13:(i===0||i===4?.062:.10);
      var segment=[];
      // Rounded, individual flush windows; there is no floating controller plate.
      for(var j=0;j<32;j++){
        var phase=TAU*j/32,cs=Math.cos(phase),sn=Math.sin(phase);
        var da=Math.sign(cs)*Math.pow(Math.abs(cs),.45)*wide;
        var z=Math.sign(sn)*Math.pow(Math.abs(sn),.45)*.125;
        segment.push(this.project(rotate(this.surfacePoint(angle+da,z,radius),this.pose)));
      }
      ctx.save();this.clipSurface(ctx,segment);
      this.tracePatch(ctx,segment);
      ctx.fillStyle=i===2?'rgba(15,61,39,.92)':'rgba(40,110,72,.88)';ctx.fill();
      ctx.restore();
      ctx.save();ctx.strokeStyle='rgba(204,255,224,.82)';ctx.lineWidth=.8;
      ctx.shadowColor='rgba(159,250,187,.5)';ctx.shadowBlur=3;
      this.strokeSurface(ctx,segment,true);ctx.restore();
    }
  };

  RingRenderer.prototype.surfaceLoop=function(angle,radius,angleHalf,zHalf){
    var path=[];
    for(var i=0;i<=28;i++){
      var phase=TAU*i/28;
      var point=this.surfacePoint(angle+Math.cos(phase)*angleHalf,Math.sin(phase)*zHalf,radius);
      path.push(this.project(rotate(point,this.pose)));
    }
    return path;
  };

  RingRenderer.prototype.drawGesture=function(ctx,now,visibility,radius,railStart,railEnd){
    if(this.gesture==='idle') return;
    var elapsed=now-this.gestureStarted;
    // Nothing is drawn during the lead-in: the camera is still turning.
    if(elapsed<0 && !this.reduced) return;
    var cycle=this.gestureCycle();
    // One cycle per step, then rest. Replay restarts the clock. The rail
    // contact and the collar ripple share this clock.
    var local=Math.min(Math.max(elapsed,0),cycle);
    var visibilityAlpha=clamp((visibility+.08)/.5,0,1);
    if(this.reduced && this.gesture.indexOf('swipe')===0) local=cycle*.22;

    if(this.gesture==='swipe-up' || this.gesture==='swipe-down'){
      var progress=easeOut(local/TIMING.swipeStroke);
      var from=this.gesture==='swipe-up' ? railEnd : railStart;
      var to=this.gesture==='swipe-up' ? railStart : railEnd;
      var current=lerp(from,to,progress);
      var tailStart=lerp(from,to,Math.max(0,progress-.34));
      var path=[];
      for(var i=0;i<=12;i++){
        var along=lerp(tailStart,current,i/12);
        path.push(this.project(rotate(this.surfacePoint(along,0,radius+.018),this.pose)));
      }
      var guideStart=this.project(rotate(this.surfacePoint(from,0,radius+.014),this.pose));
      var guideEnd=this.project(rotate(this.surfacePoint(to,0,radius+.014),this.pose));
      var guideDx=guideEnd.x-guideStart.x,guideDy=guideEnd.y-guideStart.y;
      var guideLength=Math.sqrt(guideDx*guideDx+guideDy*guideDy) || 1;
      var ux=guideDx/guideLength,uy=guideDy/guideLength;
      var arrowSize=this.width<230 ? 6.5 : 5.5;
      var fade=local<TIMING.swipeFadeStart ? 1 : clamp(1-(local-TIMING.swipeFadeStart)/(TIMING.swipeFadeEnd-TIMING.swipeFadeStart),.22,1);
      ctx.save();ctx.globalAlpha=visibility*visibilityAlpha*fade;
      ctx.strokeStyle='rgba(159,250,187,.24)';ctx.lineWidth=this.width<230 ? 2.2 : 1.7;ctx.lineCap='round';ctx.lineJoin='round';
      var guide=[];
      for(var g=0;g<=18;g++) guide.push(this.project(rotate(this.surfacePoint(lerp(from,to,g/18),0,radius+.014),this.pose)));
      this.strokeSurface(ctx,guide);
      if(this.visiblePoint(guideEnd)){
        ctx.fillStyle='rgba(159,250,187,.52)';ctx.beginPath();ctx.moveTo(guideEnd.x,guideEnd.y);ctx.lineTo(guideEnd.x-ux*arrowSize-uy*arrowSize*.58,guideEnd.y-uy*arrowSize+ux*arrowSize*.58);ctx.lineTo(guideEnd.x-ux*arrowSize+uy*arrowSize*.58,guideEnd.y-uy*arrowSize-ux*arrowSize*.58);ctx.closePath();ctx.fill();
      }
      ctx.strokeStyle='rgba(159,250,187,.94)';ctx.lineWidth=this.width<230 ? 3.3 : 2.5;
      ctx.shadowColor='rgba(70,232,120,.95)';ctx.shadowBlur=9;
      this.strokeSurface(ctx,path);
      var head=path[path.length-1];
      if(this.visiblePoint(head)){
        ctx.fillStyle='rgba(159,250,187,1)';ctx.beginPath();ctx.arc(head.x,head.y,(this.width<230 ? 4.6 : 3.6)*head.scale,0,TAU);ctx.fill();
      }
      ctx.restore();
      return;
    }

    var centerAngle=(railStart+railEnd)/2;
    var center=this.project(rotate(this.surfacePoint(centerAngle,0,radius+.022),this.pose));
    if(!this.visiblePoint(center)) return;
    // R1 sequence demonstrated by Miles: tap, release, then press and HOLD.
    // Illustrative pacing, not a claim about the firmware recognition threshold.
    // Run once; retaining contact is the lesson, not an endless double-tap loop.
    if(this.gesture==='hold'){
      var firstTap=elapsed<TIMING.holdTap, release=elapsed>=TIMING.holdTap && elapsed<TIMING.holdRelease;
      if(!this.reduced && release) return;
      var press=this.reduced ? 1 : clamp((elapsed-TIMING.holdRelease)/(TIMING.holdPress-TIMING.holdRelease),0,1);
      var strength=this.reduced ? 1 : firstTap ? 1 : .85+.15*Math.sin(elapsed/500);
      var spread=this.reduced ? .085 : firstTap ? lerp(.045,.12,elapsed/TIMING.holdTap) : lerp(.13,.07,press);
      ctx.save();ctx.globalAlpha=visibility*visibilityAlpha*strength;
      ctx.strokeStyle='rgba(159,250,187,.95)';ctx.lineWidth=2;
      ctx.shadowColor='rgba(70,232,120,.9)';ctx.shadowBlur=12;
      this.strokeSurface(ctx,this.surfaceLoop(centerAngle,radius+.026,spread,spread*.7));
      ctx.fillStyle='rgba(159,250,187,1)';ctx.beginPath();ctx.arc(center.x,center.y,3.5*center.scale,0,TAU);ctx.fill();ctx.restore();
      return;
    }
    if(this.reduced){
      var staticRings=this.gesture==='double-tap' ? [.055,.12] : [.09];
      ctx.save();ctx.globalAlpha=visibility*visibilityAlpha;
      ctx.strokeStyle='rgba(159,250,187,.9)';ctx.lineWidth=1.7;ctx.shadowColor='rgba(70,232,120,.82)';ctx.shadowBlur=8;
      staticRings.forEach(function(spread){
        var loop=this.surfaceLoop(centerAngle,radius+.024,spread,spread*.7);
        this.strokeSurface(ctx,loop);
      },this);
      ctx.fillStyle='rgba(159,250,187,.95)';ctx.beginPath();ctx.arc(center.x,center.y,2.5*center.scale,0,TAU);ctx.fill();ctx.restore();
      return;
    }
    ctx.save();ctx.globalAlpha=visibility*visibilityAlpha*.32;
    ctx.strokeStyle='rgba(159,250,187,.92)';ctx.lineWidth=1.4;ctx.shadowColor='rgba(70,232,120,.7)';ctx.shadowBlur=6;
    var resting=this.surfaceLoop(centerAngle,radius+.024,this.gesture==='double-tap'?.075:.06,this.gesture==='double-tap'?.052:.042);
    this.strokeSurface(ctx,resting);
    ctx.fillStyle='rgba(159,250,187,.9)';ctx.beginPath();ctx.arc(center.x,center.y,2.2*center.scale,0,TAU);ctx.fill();ctx.restore();
    var pulses=this.gesture==='double-tap' ? [0,TIMING.doubleTapGap] : [0];
    pulses.forEach(function(offset){
      var p=clamp((local-offset)/TIMING.tapPulse,0,1);
      if(local<offset || local>offset+TIMING.tapVisible) return;
      var alpha=(1-p)*visibility*visibilityAlpha;
      ctx.save();ctx.globalAlpha=alpha;
      ctx.strokeStyle='rgba(159,250,187,.95)';ctx.lineWidth=1.6;ctx.shadowColor='rgba(70,232,120,.9)';ctx.shadowBlur=10;
      var spread=.03+p*.14;
      var pulse=this.surfaceLoop(centerAngle,radius+.026,spread,spread*.7);
      this.strokeSurface(ctx,pulse);
      ctx.fillStyle='rgba(159,250,187,.95)';ctx.beginPath();ctx.arc(center.x,center.y,(2.8-p)*center.scale,0,TAU);ctx.fill();ctx.restore();
    },this);
  };

  RingRenderer.prototype.drawCollar=function(ctx,now){
    var cx=this.width*.5,cy=this.height*.47,r=Math.min(this.width,this.height)*.42;
    var active=this.gesture!=='idle';
    var elapsed=now-this.gestureStarted;
    ctx.save();ctx.lineCap='round';
    ctx.strokeStyle='rgba(77,213,138,'+(active?.035:.015)+')';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
    if(active && elapsed>=0 && !this.reduced){
      ctx.shadowColor='rgba(77,213,138,.78)';ctx.shadowBlur=7;
      ctx.strokeStyle='rgba(77,213,138,.12)';ctx.lineWidth=1;
      // Swipe and hold belong on the hardware rail, not a second screen-space
      // track. Each collar ripple rides the SAME contact clock as its rail
      // pulse (0, and 0 + doubleTapGap), so the ring never ripples without a
      // contact or contacts without a ripple.
      if(this.gesture==='tap' || this.gesture==='double-tap'){
        var offsets=this.gesture==='double-tap' ? [0,TIMING.doubleTapGap] : [0];
        for(var ri=0;ri<offsets.length;ri++){
          var pulse=(elapsed-offsets[ri])/TIMING.collarRipple;
          if(pulse<0 || pulse>1) continue;
          ctx.globalAlpha=(1-pulse)*(ri===0 ? .8 : .55);
          ctx.beginPath();ctx.arc(cx,cy,r*(.76+pulse*.24),0,TAU);ctx.stroke();
        }
      }
    }
    ctx.restore();
  };

  RingRenderer.prototype.destroy=function(){
    this.destroyed=true;this.stop();
    this.canvas.removeEventListener('pointerdown',this.onPointerDown);
    this.canvas.removeEventListener('pointermove',this.onPointerMove);
    this.canvas.removeEventListener('pointerup',this.onPointerUp);
    this.canvas.removeEventListener('pointercancel',this.onPointerUp);
    this.canvas.removeEventListener('lostpointercapture',this.onLostPointerCapture);
    this.canvas.removeEventListener('keydown',this.onKeyDown);
    this.canvas.removeEventListener('contextmenu',this.onContextMenu);
    this.canvas.removeEventListener('dblclick',this.onDoubleClick);
    global.document.removeEventListener('visibilitychange',this.onVisibilityChange);
    if(this.resetButton) this.resetButton.removeEventListener('click',this.onResetClick);
    if(this.resizeObserver) this.resizeObserver.disconnect();
    if(this.viewObserver) this.viewObserver.disconnect();
    if(this.onWindowResize) global.removeEventListener('resize',this.onWindowResize);
    if(this.motionQuery){
      if(this.motionQuery.removeEventListener) this.motionQuery.removeEventListener('change',this.onMotionChange);
      else if(this.motionQuery.removeListener) this.motionQuery.removeListener(this.onMotionChange);
    }
  };

  global.CosRing3D={
    TIMING:TIMING,
    POSES:POSES,
    create:function(canvas,options){
      if(!canvas || !canvas.getContext) return null;
      var renderer=new RingRenderer(canvas,options || {});
      return renderer.ctx ? renderer : null;
    }
  };
})(window);
