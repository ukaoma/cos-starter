(function(global){
  'use strict';

  var TAU = Math.PI * 2;
  var BASE_POSE = {x:0.88,y:-0.34,z:-0.16};

  function clamp(value, min, max){ return Math.max(min, Math.min(max, value)); }
  function lerp(a, b, amount){ return a + (b - a) * amount; }
  function easeOut(value){ return 1 - Math.pow(1 - clamp(value, 0, 1), 3); }
  function normalizeAngle(value){
    while (value > Math.PI) value -= TAU;
    while (value < -Math.PI) value += TAU;
    return value;
  }
  function dot(a, b){ return a.x*b.x + a.y*b.y + a.z*b.z; }
  function normalize(v){
    var length = Math.sqrt(dot(v,v)) || 1;
    return {x:v.x/length,y:v.y/length,z:v.z/length};
  }
  function addScaled(base, a, amountA, b, amountB, c, amountC){
    return {
      x:base.x + a.x*amountA + b.x*amountB + (c ? c.x*amountC : 0),
      y:base.y + a.y*amountA + b.y*amountB + (c ? c.y*amountC : 0),
      z:base.z + a.z*amountA + b.z*amountB + (c ? c.z*amountC : 0)
    };
  }
  function rotate(point, pose){
    var cx=Math.cos(pose.x), sx=Math.sin(pose.x);
    var cy=Math.cos(pose.y), sy=Math.sin(pose.y);
    var cz=Math.cos(pose.z), sz=Math.sin(pose.z);
    var x=point.x, y=point.y*cx-point.z*sx, z=point.y*sx+point.z*cx;
    var x2=x*cy+z*sy, z2=-x*sy+z*cy;
    return {x:x2*cz-y*sz,y:x2*sz+y*cz,z:z2};
  }
  function roundedRectPoints(width, height, radius, steps){
    var points=[];
    var corners=[
      {x:width/2-radius,y:height/2-radius,start:0},
      {x:-width/2+radius,y:height/2-radius,start:Math.PI/2},
      {x:-width/2+radius,y:-height/2+radius,start:Math.PI},
      {x:width/2-radius,y:-height/2+radius,start:Math.PI*1.5}
    ];
    corners.forEach(function(corner){
      for(var i=0;i<=steps;i++){
        var angle=corner.start+(Math.PI/2)*(i/steps);
        points.push({x:corner.x+Math.cos(angle)*radius,y:corner.y+Math.sin(angle)*radius});
      }
    });
    return points;
  }

  function RingRenderer(canvas, options){
    this.canvas=canvas;
    this.shell=options.shell;
    this.resetButton=options.resetButton || null;
    this.ctx=canvas.getContext('2d', {alpha:true});
    if(!this.ctx) return;

    this.pose={x:BASE_POSE.x+0.34,y:BASE_POSE.y-0.42,z:BASE_POSE.z+0.12};
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
    this.destroyed=false;
    this.motionQuery=global.matchMedia ? global.matchMedia('(prefers-reduced-motion: reduce)') : null;
    this.reduced=!!(this.motionQuery && this.motionQuery.matches);
    this.light=normalize({x:-0.48,y:-0.6,z:0.82});
    this.major=1.22;
    this.minor=0.33;
    this.uSegments=56;
    this.vSegments=24;
    this.vertices=[];
    this.normals=[];
    this.faces=[];
    this.padAngle=0.78;
    this.padOutline=roundedRectPoints(0.74,0.34,0.1,4);
    this.padCenter={x:(this.major+this.minor*0.91)*Math.cos(this.padAngle),y:(this.major+this.minor*0.91)*Math.sin(this.padAngle),z:0};
    this.padTangent={x:-Math.sin(this.padAngle),y:Math.cos(this.padAngle),z:0};
    this.padAcross={x:0,y:0,z:1};
    this.padNormal={x:Math.cos(this.padAngle),y:Math.sin(this.padAngle),z:0};

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
      var cu=Math.cos(ua), su=Math.sin(ua);
      for(var v=0;v<this.vSegments;v++){
        var va=TAU*v/this.vSegments;
        var cv=Math.cos(va), sv=Math.sin(va);
        this.vertices.push({
          x:(this.major+this.minor*cv)*cu,
          y:(this.major+this.minor*cv)*su,
          z:this.minor*sv
        });
        this.normals.push({x:cv*cu,y:cv*su,z:sv});
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
        this.faces.push([a,b,c], [a,c,d]);
      }
    }
  };

  RingRenderer.prototype.bind=function(){
    var self=this;
    this.onPointerDown=function(event){ self.pointerDown(event); };
    this.onPointerMove=function(event){ self.pointerMove(event); };
    this.onPointerUp=function(event){ self.pointerUp(event); };
    this.onLostPointerCapture=function(event){ self.pointerUp(event); };
    this.onKeyDown=function(event){ self.keyDown(event); };
    this.onMotionChange=function(event){ self.reduced=event.matches; self.velocity={x:0,y:0,z:0}; self.gestureStarted=performance.now(); self.start(); };
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
          if(self.inView) self.start(); else self.stop();
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

  RingRenderer.prototype.setGesture=function(gesture, label){
    this.gesture=gesture || 'idle';
    this.gestureStarted=performance.now();
    this.canvas.setAttribute('aria-label','Interactive 3D COS ring. Current demonstration: '+(label || this.gesture)+'. Drag to rotate. Shift-drag or use two fingers to roll. Arrow keys rotate; Q and E roll; Space resets.');
    this.start();
  };

  RingRenderer.prototype.start=function(){
    if(this.frameId || this.destroyed || !this.inView) return;
    var self=this;
    this.frameId=requestAnimationFrame(function(now){ self.frame(now); });
  };

  RingRenderer.prototype.stop=function(){
    if(this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId=0;
  };

  RingRenderer.prototype.frame=function(now){
    this.frameId=0;
    if(this.destroyed || !this.inView) return;
    if(!this.lastFrame || now-this.lastFrame>=18){
      var frameScale=this.lastFrame ? clamp((now-this.lastFrame)/16.67,0.5,2) : 1;
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
    var gestureAnimating=!this.reduced && this.gesture!=='idle';
    if(this.dragging || poseMoving || hasVelocity || gestureAnimating) this.start();
  };

  RingRenderer.prototype.project=function(point){
    var camera=5.4;
    var perspective=camera/(camera-point.z);
    var scale=Math.min(this.width,this.height)*0.285;
    return {x:this.width/2+point.x*scale*perspective,y:this.height/2+point.y*scale*perspective,z:point.z,scale:perspective};
  };

  RingRenderer.prototype.padPoint=function(along, across, lift){
    return addScaled(this.padCenter,this.padTangent,along,this.padAcross,across,this.padNormal,lift || 0.065);
  };

  RingRenderer.prototype.draw=function(now){
    if(!this.width || !this.height) return;
    var ctx=this.ctx;
    var dpr=this.dpr || 1;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,this.width,this.height);

    var glow=ctx.createRadialGradient(this.width*.52,this.height*.5,0,this.width*.52,this.height*.5,Math.min(this.width,this.height)*.53);
    glow.addColorStop(0,'rgba(70,232,120,.08)');
    glow.addColorStop(.46,'rgba(201,169,110,.035)');
    glow.addColorStop(1,'rgba(23,15,9,0)');
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,this.width,this.height);

    ctx.save();
    ctx.translate(this.width*.5,this.height*.74);
    ctx.scale(1,.3);
    var shadow=ctx.createRadialGradient(0,0,2,0,0,Math.min(this.width,this.height)*.37);
    shadow.addColorStop(0,'rgba(0,0,0,.52)');
    shadow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=shadow;
    ctx.beginPath();
    ctx.arc(0,0,Math.min(this.width,this.height)*.37,0,TAU);
    ctx.fill();
    ctx.restore();

    var points=new Array(this.vertices.length);
    var normals=new Array(this.normals.length);
    for(var i=0;i<this.vertices.length;i++){
      points[i]=rotate(this.vertices[i],this.pose);
      normals[i]=rotate(this.normals[i],this.pose);
    }

    var faces=[];
    for(var f=0;f<this.faces.length;f++){
      var face=this.faces[f];
      var p0=points[face[0]],p1=points[face[1]],p2=points[face[2]];
      var normal=normalize({
        x:normals[face[0]].x+normals[face[1]].x+normals[face[2]].x,
        y:normals[face[0]].y+normals[face[1]].y+normals[face[2]].y,
        z:normals[face[0]].z+normals[face[1]].z+normals[face[2]].z
      });
      faces.push({p:[p0,p1,p2],n:normal,z:(p0.z+p1.z+p2.z)/3,index:f});
    }
    this.addSeamSegments(faces,points,0,'rgba(239,220,181,.22)',.75);
    this.addSeamSegments(faces,points,Math.floor(this.vSegments/2),'rgba(27,18,11,.65)',1);
    var padDepth=rotate(this.padPoint(0,0,.07),this.pose).z;
    faces.push({kind:'pad',z:padDepth});
    faces.sort(function(a,b){ return a.z-b.z; });

    ctx.lineJoin='round';
    for(var fi=0;fi<faces.length;fi++){
      var item=faces[fi];
      if(item.kind==='seam'){
        var seamA=this.project(item.a),seamB=this.project(item.b);
        ctx.strokeStyle=item.color;ctx.lineWidth=item.width;
        ctx.beginPath();ctx.moveTo(seamA.x,seamA.y);ctx.lineTo(seamB.x,seamB.y);ctx.stroke();
        continue;
      }
      if(item.kind==='pad'){
        this.drawTouchpad(ctx,now);
        continue;
      }
      var a=this.project(item.p[0]),b=this.project(item.p[1]),c=this.project(item.p[2]);
      var area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
      if(Math.abs(area)<0.015) continue;
      var diffuse=Math.max(0,dot(item.n,this.light));
      var facing=Math.max(0,item.n.z);
      var rim=1-Math.abs(item.n.z);
      var spec=Math.pow(Math.max(0,diffuse*.72+facing*.28),9);
      var shade=.2+diffuse*.5+rim*.09+spec*.25;
      if(item.n.z<0) shade*=.62;
      var grain=((item.index*17)%11-5)*0.75;
      var red=clamp(42+shade*142+grain,28,213);
      var green=clamp(31+shade*113+grain*.45,22,181);
      var blue=clamp(19+shade*66,15,112);
      ctx.fillStyle='rgb('+Math.round(red)+','+Math.round(green)+','+Math.round(blue)+')';
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fill();
    }
  };

  RingRenderer.prototype.addSeamSegments=function(queue,points,vIndex,color,width){
    for(var u=0;u<this.uSegments;u++){
      var next=(u+1)%this.uSegments;
      var a=points[u*this.vSegments+vIndex];
      var b=points[next*this.vSegments+vIndex];
      queue.push({kind:'seam',a:a,b:b,z:(a.z+b.z)/2,color:color,width:width});
    }
  };

  RingRenderer.prototype.drawTouchpad=function(ctx,now){
    var normal=rotate(this.padNormal,this.pose);
    if(normal.z<-.08) return;
    var outline=[];
    for(var i=0;i<this.padOutline.length;i++){
      var point=this.padPoint(this.padOutline[i].x,this.padOutline[i].y,.07);
      outline.push(this.project(rotate(point,this.pose)));
    }
    var minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    outline.forEach(function(p){minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);});
    var padGradient=ctx.createLinearGradient(minX,minY,maxX,maxY);
    padGradient.addColorStop(0,'rgba(84,70,48,.98)');
    padGradient.addColorStop(.5,'rgba(30,25,18,.99)');
    padGradient.addColorStop(1,'rgba(12,16,12,.99)');
    ctx.save();
    ctx.shadowColor='rgba(70,232,120,.18)';ctx.shadowBlur=10;
    ctx.fillStyle=padGradient;ctx.strokeStyle='rgba(222,195,139,.72)';ctx.lineWidth=1;
    ctx.beginPath();
    outline.forEach(function(p,index){if(!index)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.shadowBlur=0;

    [-.15,.15].forEach(function(across){
      var a=this.project(rotate(this.padPoint(-.25,across,.076),this.pose));
      var b=this.project(rotate(this.padPoint(.25,across,.076),this.pose));
      ctx.strokeStyle='rgba(201,169,110,.15)';ctx.lineWidth=.75;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
    },this);
    this.drawGesture(ctx,now,normal.z);
    ctx.restore();
  };

  RingRenderer.prototype.drawGesture=function(ctx,now,visibility){
    if(this.gesture==='idle'){
      var idle=this.project(rotate(this.padPoint(0,0,.09),this.pose));
      ctx.fillStyle='rgba(159,250,187,.36)';ctx.beginPath();ctx.arc(idle.x,idle.y,2.2*idle.scale,0,TAU);ctx.fill();
      return;
    }
    var elapsed=now-this.gestureStarted;
    var cycle=this.gesture.indexOf('swipe')===0 ? 2400 : 2200;
    var local=elapsed%cycle;
    var visibilityAlpha=clamp((visibility+.08)/.5,0,1);
    if(this.reduced && this.gesture.indexOf('swipe')===0) local=cycle*.22;

    if(this.gesture==='swipe-up' || this.gesture==='swipe-down'){
      var progress=easeOut(local/820);
      var from=this.gesture==='swipe-up' ? .27 : -.27;
      var to=-from;
      var current=lerp(from,to,progress);
      var tailStart=lerp(from,to,Math.max(0,progress-.34));
      var path=[];
      for(var i=0;i<=12;i++){
        var along=lerp(tailStart,current,i/12);
        path.push(this.project(rotate(this.padPoint(along,0,.098),this.pose)));
      }
      var guideStart=this.project(rotate(this.padPoint(from,0,.096),this.pose));
      var guideEnd=this.project(rotate(this.padPoint(to,0,.096),this.pose));
      var guideDx=guideEnd.x-guideStart.x,guideDy=guideEnd.y-guideStart.y;
      var guideLength=Math.sqrt(guideDx*guideDx+guideDy*guideDy) || 1;
      var ux=guideDx/guideLength,uy=guideDy/guideLength;
      var arrowSize=this.width<230 ? 6.5 : 5.5;
      var fade=local<1050 ? 1 : clamp(1-(local-1050)/700,.22,1);
      ctx.save();ctx.globalAlpha=visibilityAlpha*fade;
      ctx.strokeStyle='rgba(159,250,187,.24)';ctx.lineWidth=this.width<230 ? 2.2 : 1.7;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(guideStart.x,guideStart.y);ctx.lineTo(guideEnd.x,guideEnd.y);ctx.stroke();
      ctx.fillStyle='rgba(159,250,187,.52)';ctx.beginPath();ctx.moveTo(guideEnd.x,guideEnd.y);ctx.lineTo(guideEnd.x-ux*arrowSize-uy*arrowSize*.58,guideEnd.y-uy*arrowSize+ux*arrowSize*.58);ctx.lineTo(guideEnd.x-ux*arrowSize+uy*arrowSize*.58,guideEnd.y-uy*arrowSize-ux*arrowSize*.58);ctx.closePath();ctx.fill();
      ctx.strokeStyle='rgba(159,250,187,.94)';ctx.lineWidth=this.width<230 ? 3.3 : 2.5;
      ctx.shadowColor='rgba(70,232,120,.95)';ctx.shadowBlur=9;
      ctx.beginPath();path.forEach(function(p,index){if(!index)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.stroke();
      var head=path[path.length-1];ctx.fillStyle='rgba(159,250,187,1)';ctx.beginPath();ctx.arc(head.x,head.y,(this.width<230 ? 4.6 : 3.6)*head.scale,0,TAU);ctx.fill();
      ctx.restore();
      return;
    }

    var center=this.project(rotate(this.padPoint(0,0,.1),this.pose));
    if(this.reduced){
      var staticRings=this.gesture==='double-tap' ? [7,15] : [11];
      ctx.save();ctx.globalAlpha=visibilityAlpha;
      ctx.strokeStyle='rgba(159,250,187,.9)';ctx.lineWidth=1.7;ctx.shadowColor='rgba(70,232,120,.82)';ctx.shadowBlur=8;
      staticRings.forEach(function(radius){ctx.beginPath();ctx.arc(center.x,center.y,radius*center.scale,0,TAU);ctx.stroke();});
      ctx.fillStyle='rgba(159,250,187,.95)';ctx.beginPath();ctx.arc(center.x,center.y,2.5*center.scale,0,TAU);ctx.fill();ctx.restore();
      return;
    }
    ctx.save();ctx.globalAlpha=visibilityAlpha*.32;
    ctx.strokeStyle='rgba(159,250,187,.92)';ctx.lineWidth=1.4;ctx.shadowColor='rgba(70,232,120,.7)';ctx.shadowBlur=6;
    ctx.beginPath();ctx.arc(center.x,center.y,(this.gesture==='double-tap' ? 9 : 7)*center.scale,0,TAU);ctx.stroke();
    ctx.fillStyle='rgba(159,250,187,.9)';ctx.beginPath();ctx.arc(center.x,center.y,2.2*center.scale,0,TAU);ctx.fill();ctx.restore();
    var pulses=this.gesture==='double-tap' ? [0,340] : [0];
    pulses.forEach(function(offset){
      var p=clamp((local-offset)/560,0,1);
      if(local<offset || local>offset+760) return;
      var alpha=(1-p)*visibilityAlpha;
      ctx.save();ctx.globalAlpha=alpha;
      ctx.strokeStyle='rgba(159,250,187,.95)';ctx.lineWidth=1.6;ctx.shadowColor='rgba(70,232,120,.9)';ctx.shadowBlur=10;
      ctx.beginPath();ctx.arc(center.x,center.y,(3+p*15)*center.scale,0,TAU);ctx.stroke();
      ctx.fillStyle='rgba(159,250,187,.95)';ctx.beginPath();ctx.arc(center.x,center.y,(2.8-p)*center.scale,0,TAU);ctx.fill();ctx.restore();
    });
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
    create:function(canvas,options){
      if(!canvas || !canvas.getContext) return null;
      var renderer=new RingRenderer(canvas,options || {});
      return renderer.ctx ? renderer : null;
    }
  };
})(window);
