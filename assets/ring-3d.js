(function(global){
  'use strict';

  var TAU = Math.PI * 2;
  var BASE_POSE = {x:-0.34,y:0.28,z:-0.08};

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
    this.innerRadius=1.21;
    this.outerRadius=1.36;
    this.uSegments=72;
    this.profile=[
      {r:1.23,z:-0.21,mat:'steel'},
      {r:1.28,z:-0.21,mat:'body'},
      {r:1.33,z:-0.18,mat:'body'},
      {r:1.36,z:-0.11,mat:'body'},
      {r:1.37,z:-0.04,mat:'body'},
      {r:1.37,z:0.04,mat:'body'},
      {r:1.36,z:0.11,mat:'body'},
      {r:1.33,z:0.18,mat:'body'},
      {r:1.28,z:0.21,mat:'body'},
      {r:1.23,z:0.21,mat:'steel'},
      {r:1.20,z:0.18,mat:'steel'},
      {r:1.19,z:0.12,mat:'steel'},
      {r:1.19,z:0.04,mat:'steel'},
      {r:1.19,z:-0.04,mat:'steel'},
      {r:1.19,z:-0.12,mat:'steel'},
      {r:1.20,z:-0.18,mat:'steel'}
    ];
    this.vSegments=this.profile.length;
    this.vertices=[];
    this.faces=[];
    this.crownAngle=-Math.PI/2;
    this.sensorAngle=Math.PI/2;
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
      var cu=Math.cos(ua), su=Math.sin(ua);
      for(var v=0;v<this.vSegments;v++){
        var section=this.profile[v];
        var crownWeight=section.mat==='body' && section.r>1.27 ? this.crownField(ua)*((section.r-1.27)/.1) : 0;
        var radius=section.r+crownWeight;
        this.vertices.push({
          x:radius*cu,
          y:radius*su,
          z:section.z
        });
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

  RingRenderer.prototype.crownField=function(angle){
    var delta=Math.abs(normalizeAngle(angle-this.crownAngle));
    var plateau=.18;
    var shoulder=.26;
    if(delta<=plateau) return .06;
    if(delta>=plateau+shoulder) return 0;
    var t=(delta-plateau)/shoulder;
    return .06*(1-t*t*(3-2*t));
  };

  RingRenderer.prototype.bind=function(){
    var self=this;
    this.onPointerDown=function(event){ self.pointerDown(event); };
    this.onPointerMove=function(event){ self.pointerMove(event); };
    this.onPointerUp=function(event){ self.pointerUp(event); };
    this.onLostPointerCapture=function(event){ self.pointerUp(event); };
    this.onKeyDown=function(event){ self.keyDown(event); };
    this.onMotionChange=function(event){ self.reduced=event.matches; self.velocity={x:0,y:0,z:0}; self.gestureStarted=performance.now(); self.start(); };
    this.onVisibilityChange=function(){ self.pageVisible=!global.document.hidden; if(self.pageVisible) self.start(); else self.stop(); };
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
    var poses={
      'idle':BASE_POSE,
      'swipe-up':{x:-0.42,y:0.46,z:-0.13},
      'swipe-down':{x:-0.36,y:0.08,z:0.1},
      'tap':{x:-1.12,y:0.32,z:-0.11},
      'double-tap':{x:-0.76,y:-0.18,z:0.13}
    };
    var pose=poses[this.gesture] || BASE_POSE;
    this.target={x:pose.x,y:pose.y,z:pose.z};
    this.velocity={x:0,y:0,z:0};
    this.canvas.setAttribute('aria-label','Interactive 3D COS ring. Current demonstration: '+(label || this.gesture)+'. Drag to rotate. Shift-drag or use two fingers to roll. Arrow keys rotate; Q and E roll; Space resets.');
    this.start();
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
    return {x:this.width/2+point.x*scale*perspective,y:this.height*.47+point.y*scale*perspective,z:point.z,scale:perspective};
  };

  RingRenderer.prototype.surfacePoint=function(angle,z,radius){
    return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius,z:z};
  };

  RingRenderer.prototype.draw=function(now){
    if(!this.width || !this.height) return;
    var ctx=this.ctx;
    var dpr=this.dpr || 1;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,this.width,this.height);

    var glow=ctx.createRadialGradient(this.width*.5,this.height*.47,0,this.width*.5,this.height*.47,Math.min(this.width,this.height)*.52);
    glow.addColorStop(0,'rgba(77,213,138,.13)');
    glow.addColorStop(.42,'rgba(31,111,71,.055)');
    glow.addColorStop(1,'rgba(7,16,10,0)');
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,this.width,this.height);
    this.drawCollar(ctx,now);

    var points=new Array(this.vertices.length);
    for(var i=0;i<this.vertices.length;i++){
      points[i]=rotate(this.vertices[i],this.pose);
    }

    var faces=[];
    for(var f=0;f<this.faces.length;f++){
      var face=this.faces[f];
      var p0=points[face.indices[0]],p1=points[face.indices[1]],p2=points[face.indices[2]],p3=points[face.indices[3]];
      var normal=normalize(cross(subtract(p1,p0),subtract(p3,p0)));
      faces.push({p:[p0,p1,p2,p3],n:normal,z:(p0.z+p1.z+p2.z+p3.z)/4,index:f,mat:face.mat});
    }
    faces.sort(function(a,b){ return a.z-b.z; });

    ctx.lineJoin='round';
    for(var fi=0;fi<faces.length;fi++){
      var item=faces[fi];
      var a=this.project(item.p[0]),b=this.project(item.p[1]),c=this.project(item.p[2]),d=this.project(item.p[3]);
      var area=(b.x-a.x)*(d.y-a.y)-(b.y-a.y)*(d.x-a.x);
      if(Math.abs(area)<0.015) continue;
      var diffuse=Math.max(0,dot(item.n,this.light));
      var facing=Math.abs(item.n.z);
      var rim=1-Math.abs(item.n.z);
      var spec=Math.pow(Math.max(0,diffuse*.76+facing*.24),11);
      var back=item.n.z<0;
      var steel=item.mat==='steel';
      var grain=((item.index*19)%13-6)*.45;
      var red=steel ? 72+diffuse*66+spec*102+grain : 10+diffuse*25+spec*80+grain;
      var green=steel ? 154+diffuse*55+spec*46+grain : 51+diffuse*77+spec*95+grain;
      var blue=steel ? 108+diffuse*65+spec*80 : 32+diffuse*54+spec*70;
      var alpha=(steel ? .4 : .23)+(rim*(steel?.22:.2))+(spec*(steel?.35:.3));
      if(back) alpha*=steel?.52:.45;
      ctx.fillStyle='rgba('+Math.round(clamp(red,0,238))+','+Math.round(clamp(green,0,255))+','+Math.round(clamp(blue,0,242))+','+clamp(alpha,.06,.9).toFixed(3)+')';
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.closePath();ctx.fill();
    }
    this.drawSeams(ctx,points);
    this.drawCrown(ctx);
    this.drawSensorStack(ctx,now);
    this.drawScan(ctx);
  };

  RingRenderer.prototype.drawSeams=function(ctx,points){
    var self=this;
    var indices=[0,1,4,5,8,9,10,14,15];
    ctx.save();
    ctx.lineCap='round';
    indices.forEach(function(vIndex,band){
      for(var u=0;u<self.uSegments;u++){
        var next=(u+1)%self.uSegments;
        var a3=points[u*self.vSegments+vIndex];
        var b3=points[next*self.vSegments+vIndex];
        var a=self.project(a3),b=self.project(b3);
        var angle=TAU*(u+.5)/self.uSegments;
        var radial=rotate({x:Math.cos(angle),y:Math.sin(angle),z:0},self.pose);
        var visible=radial.z>.02;
        var alpha=visible ? (band===0||band===indices.length-1?.46:.29) : .075;
        ctx.strokeStyle='rgba(77,213,138,'+alpha+')';
        ctx.lineWidth=visible ? .9 : .55;
        if(visible){ctx.shadowColor='rgba(77,213,138,.45)';ctx.shadowBlur=2.5;}else ctx.shadowBlur=0;
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
    });
    ctx.restore();
  };

  RingRenderer.prototype.patchPoints=function(angle,angleHalf,zHalf,radius){
    return [
      this.project(rotate(this.surfacePoint(angle-angleHalf,-zHalf,radius),this.pose)),
      this.project(rotate(this.surfacePoint(angle+angleHalf,-zHalf,radius),this.pose)),
      this.project(rotate(this.surfacePoint(angle+angleHalf,zHalf,radius),this.pose)),
      this.project(rotate(this.surfacePoint(angle-angleHalf,zHalf,radius),this.pose))
    ];
  };

  RingRenderer.prototype.tracePatch=function(ctx,points){
    ctx.beginPath();
    ctx.moveTo(points[0].x,points[0].y);
    for(var i=1;i<points.length;i++) ctx.lineTo(points[i].x,points[i].y);
    ctx.closePath();
  };

  RingRenderer.prototype.drawCrown=function(ctx){
    var radius=this.outerRadius+this.crownField(this.crownAngle)+.035;
    var normal=rotate({x:Math.cos(this.crownAngle),y:Math.sin(this.crownAngle),z:0},this.pose);
    var visibility=clamp((normal.z+.25)/.75,.16,1);
    var panel=this.patchPoints(this.crownAngle,.18,.145,radius);
    var inset=this.patchPoints(this.crownAngle,.164,.13,radius+.006);
    var mark=this.patchPoints(this.crownAngle,.085,.1,radius+.012);
    ctx.save();
    ctx.globalAlpha=visibility;
    ctx.shadowColor='rgba(77,213,138,.4)';ctx.shadowBlur=6;
    this.tracePatch(ctx,panel);ctx.fillStyle='rgba(9,38,25,.5)';ctx.fill();ctx.strokeStyle='rgba(121,244,178,.58)';ctx.lineWidth=.8;ctx.stroke();
    ctx.shadowBlur=0;
    this.tracePatch(ctx,inset);ctx.strokeStyle='rgba(77,213,138,.36)';ctx.lineWidth=.55;ctx.stroke();
    ctx.restore();

    this.drawEvenMark(ctx,mark,visibility);

    ctx.save();ctx.globalAlpha=visibility;ctx.fillStyle='rgba(178,255,211,.72)';ctx.shadowColor='rgba(77,213,138,.85)';ctx.shadowBlur=4;
    for(var i=0;i<5;i++){
      var theta=this.crownAngle+.55+i*.105;
      var p=this.project(rotate(this.surfacePoint(theta,0,this.outerRadius+.025),this.pose));
      ctx.fillRect(p.x-1.1,p.y-1.1,2.2,2.2);
    }
    ctx.restore();
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
    ctx.shadowColor='rgba(152,255,200,.84)';ctx.shadowBlur=4/Math.max(Math.abs(a),Math.abs(d),.01);
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
    var radial={x:Math.cos(this.sensorAngle),y:Math.sin(this.sensorAngle),z:0};
    var normal=rotate({x:-radial.x,y:-radial.y,z:0},this.pose);
    var visibility=clamp((normal.z+.18)/.62,.18,1);
    var radius=this.innerRadius-.018;
    var panel=this.patchPoints(this.sensorAngle,.4,.145,radius);
    ctx.save();
    ctx.globalAlpha=visibility;
    ctx.shadowColor='rgba(159,250,187,.8)';ctx.shadowBlur=9;
    this.tracePatch(ctx,panel);ctx.fillStyle='rgba(4,24,15,.82)';ctx.fill();ctx.strokeStyle='rgba(207,255,226,.72)';ctx.lineWidth=1.1;ctx.stroke();
    ctx.shadowBlur=0;
    var offsets=[-.245,-.12,0,.12,.245];
    for(var i=0;i<offsets.length;i++){
      var segment=this.patchPoints(this.sensorAngle+offsets[i],.042,i===2?.088:.072,radius-.012);
      this.tracePatch(ctx,segment);
      ctx.fillStyle=i===2?'rgba(188,255,214,.42)':'rgba(91,225,151,.2)';ctx.fill();
      ctx.strokeStyle='rgba(221,255,234,.82)';ctx.lineWidth=.8;ctx.stroke();
    }
    [-.46,.46].forEach(function(offset){
      var pocket=this.patchPoints(this.sensorAngle+offset,.055,.09,radius-.006);
      this.tracePatch(ctx,pocket);ctx.fillStyle='rgba(18,85,52,.35)';ctx.fill();ctx.strokeStyle='rgba(121,244,178,.46)';ctx.stroke();
    },this);
    this.drawGesture(ctx,now,visibility,radius);
    ctx.restore();
  };

  RingRenderer.prototype.drawGesture=function(ctx,now,visibility,radius){
    if(this.gesture==='idle') return;
    var elapsed=now-this.gestureStarted;
    var cycle=this.gesture.indexOf('swipe')===0 ? 2400 : 2200;
    var local=elapsed%cycle;
    var visibilityAlpha=clamp((visibility+.08)/.5,0,1);
    if(this.reduced && this.gesture.indexOf('swipe')===0) local=cycle*.22;

    if(this.gesture==='swipe-up' || this.gesture==='swipe-down'){
      var progress=easeOut(local/820);
      var from=this.gesture==='swipe-up' ? .24 : -.24;
      var to=-from;
      var current=lerp(from,to,progress);
      var tailStart=lerp(from,to,Math.max(0,progress-.34));
      var path=[];
      for(var i=0;i<=12;i++){
        var along=lerp(tailStart,current,i/12);
        path.push(this.project(rotate(this.surfacePoint(this.sensorAngle+along,0,radius-.035),this.pose)));
      }
      var guideStart=this.project(rotate(this.surfacePoint(this.sensorAngle+from,0,radius-.03),this.pose));
      var guideEnd=this.project(rotate(this.surfacePoint(this.sensorAngle+to,0,radius-.03),this.pose));
      var guideDx=guideEnd.x-guideStart.x,guideDy=guideEnd.y-guideStart.y;
      var guideLength=Math.sqrt(guideDx*guideDx+guideDy*guideDy) || 1;
      var ux=guideDx/guideLength,uy=guideDy/guideLength;
      var arrowSize=this.width<230 ? 6.5 : 5.5;
      var fade=local<1050 ? 1 : clamp(1-(local-1050)/700,.22,1);
      ctx.save();ctx.globalAlpha=visibility*visibilityAlpha*fade;
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

    var center=this.project(rotate(this.surfacePoint(this.sensorAngle,0,radius-.04),this.pose));
    if(this.reduced){
      var staticRings=this.gesture==='double-tap' ? [7,15] : [11];
      ctx.save();ctx.globalAlpha=visibility*visibilityAlpha;
      ctx.strokeStyle='rgba(159,250,187,.9)';ctx.lineWidth=1.7;ctx.shadowColor='rgba(70,232,120,.82)';ctx.shadowBlur=8;
      staticRings.forEach(function(radius){ctx.beginPath();ctx.arc(center.x,center.y,radius*center.scale,0,TAU);ctx.stroke();});
      ctx.fillStyle='rgba(159,250,187,.95)';ctx.beginPath();ctx.arc(center.x,center.y,2.5*center.scale,0,TAU);ctx.fill();ctx.restore();
      return;
    }
    ctx.save();ctx.globalAlpha=visibility*visibilityAlpha*.32;
    ctx.strokeStyle='rgba(159,250,187,.92)';ctx.lineWidth=1.4;ctx.shadowColor='rgba(70,232,120,.7)';ctx.shadowBlur=6;
    ctx.beginPath();ctx.arc(center.x,center.y,(this.gesture==='double-tap' ? 9 : 7)*center.scale,0,TAU);ctx.stroke();
    ctx.fillStyle='rgba(159,250,187,.9)';ctx.beginPath();ctx.arc(center.x,center.y,2.2*center.scale,0,TAU);ctx.fill();ctx.restore();
    var pulses=this.gesture==='double-tap' ? [0,340] : [0];
    pulses.forEach(function(offset){
      var p=clamp((local-offset)/560,0,1);
      if(local<offset || local>offset+760) return;
      var alpha=(1-p)*visibility*visibilityAlpha;
      ctx.save();ctx.globalAlpha=alpha;
      ctx.strokeStyle='rgba(159,250,187,.95)';ctx.lineWidth=1.6;ctx.shadowColor='rgba(70,232,120,.9)';ctx.shadowBlur=10;
      ctx.beginPath();ctx.arc(center.x,center.y,(3+p*15)*center.scale,0,TAU);ctx.stroke();
      ctx.fillStyle='rgba(159,250,187,.95)';ctx.beginPath();ctx.arc(center.x,center.y,(2.8-p)*center.scale,0,TAU);ctx.fill();ctx.restore();
    });
  };

  RingRenderer.prototype.drawCollar=function(ctx,now){
    var cx=this.width*.5,cy=this.height*.47,r=Math.min(this.width,this.height)*.42;
    var active=this.gesture!=='idle';
    var elapsed=now-this.gestureStarted;
    ctx.save();ctx.lineCap='round';
    ctx.strokeStyle='rgba(77,213,138,'+(active?.15:.065)+')';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.stroke();
    if(active){
      var cycle=this.gesture.indexOf('swipe')===0?2400:2200;
      var t=(elapsed%cycle)/cycle;
      ctx.shadowColor='rgba(77,213,138,.78)';ctx.shadowBlur=7;
      ctx.strokeStyle='rgba(77,213,138,.72)';ctx.lineWidth=1.8;
      if(this.gesture.indexOf('swipe')===0){
        var start=this.gesture==='swipe-up' ? Math.PI*.72 : -Math.PI*.28;
        var sweep=Math.PI*.72*easeOut(clamp(t*2.2,0,1));
        ctx.beginPath();ctx.arc(cx,cy,r,start,start+(this.gesture==='swipe-up'?-sweep:sweep),this.gesture==='swipe-up');ctx.stroke();
      }else{
        var pulse=(elapsed%900)/900;
        var pr=r*(.76+pulse*.24);
        ctx.globalAlpha=(1-pulse)*.8;
        ctx.beginPath();ctx.arc(cx,cy,pr,0,TAU);ctx.stroke();
        if(this.gesture==='double-tap'){
          var p2=clamp((pulse-.34)/.66,0,1);
          ctx.globalAlpha=(1-p2)*.55;
          ctx.beginPath();ctx.arc(cx,cy,r*(.76+p2*.24),0,TAU);ctx.stroke();
        }
      }
    }
    ctx.restore();
  };

  RingRenderer.prototype.drawScan=function(ctx){
    ctx.save();
    ctx.globalCompositeOperation='screen';
    ctx.fillStyle='rgba(77,213,138,.025)';
    for(var y=2;y<this.height;y+=4) ctx.fillRect(this.width*.17,y,this.width*.66,.55);
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
    create:function(canvas,options){
      if(!canvas || !canvas.getContext) return null;
      var renderer=new RingRenderer(canvas,options || {});
      return renderer.ctx ? renderer : null;
    }
  };
})(window);
