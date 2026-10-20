/* Miles Windu Version 15 on the web: the COS Control pack's own strips, re-cut into
   cropped WebP rows by scripts/build-windu-cast-atlases.py.

   Running states rotate shuffled opponent casts the way the app does
   (PetEncounterSequence and PetEncounterRotation.layers in Models.swift): a shuffled
   bag with no immediate repeat; before the handoff frame the current cast's full
   scene; from the handoff on, the incoming cast's entry layer under the current
   cast's body layer; at the loop end the incoming cast takes over.

   Retina screens get the 2x art, other screens the 1x art. Every pose is drawn at the
   same height per cell, so the hero keeps one size across cards. Only the rows about
   to play are fetched and decoded (a whole 2x cast is 40 to 90 MB decoded, a row at
   most 10 MB), a canvas that leaves the viewport gives its decoded rows back, a row
   that is not ready yet holds the current frame instead of skipping, and Reduced
   Motion holds frame zero of the first cast. */
(function(){
  'use strict';

  var ROOT = '/control/assets/session-command/windu-v15/';
  var VERSION = '15.1';
  var LOOKAHEAD = 14;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = reduced;
  var players = [];
  var manifestPromise = null;
  var blobs = {};

  function manifest(){
    if (!manifestPromise) manifestPromise = fetch(ROOT + 'manifest.json?v=' + VERSION).then(function(r){
      if (!r.ok) throw new Error('manifest ' + r.status);
      return r.json();
    });
    return manifestPromise;
  }

  function blob(rel){
    if (!blobs[rel]) blobs[rel] = fetch(ROOT + rel + '?v=' + VERSION).then(function(r){
      if (!r.ok) throw new Error(rel + ' ' + r.status);
      return r.blob();
    }).catch(function(err){ delete blobs[rel]; throw err; });
    return blobs[rel];
  }

  function decode(rel){
    return blob(rel).then(function(b){
      if (window.createImageBitmap) return createImageBitmap(b);
      return new Promise(function(resolve,reject){
        var url = URL.createObjectURL(b), im = new Image();
        im.onload = function(){ URL.revokeObjectURL(url); resolve(im); };
        im.onerror = function(){ URL.revokeObjectURL(url); reject(new Error('decode ' + rel)); };
        im.src = url;
      });
    });
  }

  function release(row){ if (row && row.bmp && row.bmp.close) row.bmp.close(); }

  function Sequence(count,frames,handoff){
    this.count = count; this.frames = frames; this.handoff = handoff;
    this.bag = []; this.previous = -1; this.frame = 0;
    this.current = this.pick(); this.incoming = this.pick();
  }
  Sequence.prototype.pick = function(){
    if (!this.bag.length){
      var bag = [], i, j, t;
      for (i = 0; i < this.count; i++) bag.push(i);
      for (i = this.count - 1; i >= 1; i--){ j = Math.floor(Math.random() * (i + 1)); t = bag[i]; bag[i] = bag[j]; bag[j] = t; }
      if (bag[0] === this.previous){ j = 1 + Math.floor(Math.random() * (this.count - 1)); t = bag[0]; bag[0] = bag[j]; bag[j] = t; }
      this.bag = bag;
    }
    this.previous = this.bag.shift();
    return this.previous;
  };
  Sequence.prototype.advance = function(){
    this.frame += 1;
    if (this.frame === this.frames){ this.frame = 0; this.current = this.incoming; this.incoming = this.pick(); }
  };

  function Player(canvas,opts){
    this.canvas = canvas;
    this.inset = opts && opts.inset != null ? opts.inset : .04;
    this.zoom = 1;
    this.visible = false;
    this.eager = !!(opts && opts.eager);
    this.wanted = null;
    this.st = null;
    this.rows = {};
    this.generation = 0;
    this.last = 0;
    this.onCast = opts && opts.onCast;
    players.push(this);
  }

  Player.prototype.setPose = function(pose,zoom){
    this.zoom = zoom || 1;
    if (this.wanted === pose) return;
    this.wanted = pose;
    this.drop();
    this.st = null;
    this.drawn = false;
    if (this.visible || this.eager) this.start();
  };

  Player.prototype.drop = function(){
    for (var k in this.rows) release(this.rows[k]);
    this.rows = {};
  };

  Player.prototype.start = function(){
    var self = this, pose = this.wanted, request = ++this.generation;
    if (!pose) return;
    manifest().then(function(m){
      if (request !== self.generation) return;
      var entry = m.poses[pose];
      if (!entry) throw new Error('unknown pose ' + pose);
      var scale = (window.devicePixelRatio || 1) >= 1.5 && entry.scales['2'] ? '2' : '1';
      var sc = entry.scales[scale];
      self.st = {pose:pose, entry:entry, sc:sc, scale:scale, frame:0,
                 seq: sc.variants ? new Sequence(sc.variants.length,entry.frames,entry.handoff) : null};
      self.last = 0;
      self.prefetch();
    }).catch(function(err){ if (window.console) console.warn('pet-cast:',err.message); });
  };

  /* The rows one frame needs, in draw order: [rel, layer box, column]. */
  Player.prototype.need = function(frame,current,incoming){
    var st = this.st, sc = st.sc, out = [];
    function at(spec,box,i){
      var r = Math.floor(i / spec.cols);
      out.push([spec.rows[r],box,i - r * spec.cols]);
    }
    if (!st.seq){ at(sc,sc.box,frame); return out; }
    var L = sc.layers;
    if (frame + 1 >= st.entry.handoff){
      if (L.entry.box && incoming != null) at(sc.variants[incoming].entry,L.entry.box,frame - L.entry.start);
      at(sc.variants[current].body,L.body.box,frame - L.body.start);
    } else {
      at(sc.variants[current].full,L.full.box,frame);
    }
    return out;
  };

  Player.prototype.plan = function(steps){
    var st = this.st, seq = st.seq, list = [];
    var f = seq ? seq.frame : st.frame, cur = seq ? seq.current : 0, inc = seq ? seq.incoming : null;
    var frames = st.entry.frames;
    for (var k = 0; k <= steps; k++){
      list.push(this.need(f,cur,inc));
      f += 1;
      if (f === frames){ f = 0; if (seq){ cur = inc; inc = null; } }
    }
    return list;
  };

  Player.prototype.prefetch = function(){
    if (!this.st) return;
    var self = this, keep = {}, plan = this.plan(reduced ? 0 : LOOKAHEAD), gen = this.generation;
    plan.forEach(function(parts){ parts.forEach(function(p){ keep[p[0]] = true; }); });
    for (var rel in this.rows) if (!keep[rel]){ release(this.rows[rel]); delete this.rows[rel]; }
    Object.keys(keep).forEach(function(rel){
      if (self.rows[rel]) return;
      var row = self.rows[rel] = {bmp:null};
      decode(rel).then(function(bmp){
        if (gen !== self.generation || self.rows[rel] !== row){ if (bmp.close) bmp.close(); return; }
        row.bmp = bmp;
        if (!self.drawn) self.draw();
      }).catch(function(err){
        if (self.rows[rel] === row) delete self.rows[rel];
        if (window.console) console.warn('pet-cast:',err.message);
      });
    });
  };

  Player.prototype.ready = function(parts){
    for (var i = 0; i < parts.length; i++){ var r = this.rows[parts[i][0]]; if (!r || !r.bmp) return false; }
    return true;
  };

  Player.prototype.draw = function(){
    var st = this.st;
    if (!st) return false;
    var seq = st.seq, parts = this.need(seq ? seq.frame : st.frame, seq ? seq.current : 0, seq ? seq.incoming : null);
    if (!this.ready(parts)) return false;
    var c = this.canvas, dpr = Math.min(window.devicePixelRatio || 1,2), r = c.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
    if (c.width !== w || c.height !== h){ c.width = w; c.height = h; }
    var ctx = c.getContext('2d'), cell = st.sc.cell, pad = Math.min(w,h) * this.inset;
    /* Height decides the scale so Miles stands the same size in every pose; width only caps it. */
    var s = Math.min((h - pad * 2) / cell[1],(w - pad * 2) / cell[0]) * st.entry.renderScale * this.zoom;
    var ox = (w - cell[0] * s) / 2, oy = (h - cell[1] * s) / 2;
    ctx.clearRect(0,0,w,h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    for (var i = 0; i < parts.length; i++){
      var p = parts[i], bmp = this.rows[p[0]].bmp, b = p[1];
      ctx.drawImage(bmp,p[2] * b[2],0,b[2],b[3],ox + b[0] * s,oy + b[1] * s,b[2] * s,b[3] * s);
    }
    this.drawn = true;
    c.dataset.frame = String(seq ? seq.frame : st.frame);
    c.dataset.petScale = st.scale + 'x';
    if (seq){
      var id = st.sc.variants[seq.current].id;
      if (c.dataset.cast !== id){ c.dataset.cast = id; if (this.onCast) this.onCast(seq.current,st.sc.variants.length); }
    } else if (c.dataset.cast){
      delete c.dataset.cast;
    }
    return true;
  };

  Player.prototype.tick = function(now){
    var st = this.st;
    if (!st || paused || !this.visible || document.hidden){ this.last = 0; return; }
    var step = st.entry.interval * 1000;
    if (!this.last){ this.last = now; if (!this.drawn) this.draw(); return; }
    var elapsed = now - this.last;
    /* A card that was hidden or scrolled away resumes its held pose instead of fast-forwarding. */
    if (elapsed > step * 2.5){ this.last = now; return; }
    if (elapsed < step) return;
    var seq = st.seq, nf = (seq ? seq.frame : st.frame) + 1, frames = st.entry.frames;
    var wrap = nf === frames;
    var next = this.need(wrap ? 0 : nf, seq ? (wrap ? seq.incoming : seq.current) : 0, seq && !wrap ? seq.incoming : null);
    /* The next row is still decoding: hold this frame rather than flash an empty one. */
    if (!this.ready(next)){ this.prefetch(); return; }
    this.last += step;
    if (seq) seq.advance(); else st.frame = wrap ? 0 : nf;
    this.draw();
    this.prefetch();
  };

  Player.prototype.show = function(on){
    this.visible = on;
    if (on){
      if (!this.st && this.wanted) this.start(); else this.prefetch();
    } else if (!this.eager){
      /* Off screen: give decoded rows back. Encoded bytes stay cached for the return. */
      this.drop();
      this.drawn = false;
    }
  };

  var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if (e.target.__petCast) e.target.__petCast.show(e.isIntersecting); });
  },{rootMargin:'360px 0px'}) : null;

  function attach(canvas,opts){
    if (canvas.__petCast) return canvas.__petCast;
    var p = new Player(canvas,opts);
    canvas.__petCast = p;
    if (observer) observer.observe(canvas); else p.visible = true;
    return p;
  }

  function loop(now){
    for (var i = 0; i < players.length; i++) players[i].tick(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  var rz;
  window.addEventListener('resize',function(){
    clearTimeout(rz);
    rz = setTimeout(function(){ players.forEach(function(p){ if (p.visible) p.draw(); }); },120);
  },{passive:true});

  window.COSPetCast = {
    attach: attach,
    reduced: reduced,
    isPaused: function(){ return paused; },
    setPaused: function(v){ paused = !!v || reduced; players.forEach(function(p){ p.last = 0; }); },
    /* For tests/pet-cast.test.cjs only. */
    _internals: {Sequence: Sequence, Player: Player}
  };
})();
