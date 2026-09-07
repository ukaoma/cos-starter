/* COS Control exhibit for Docs: the sticky panel shows what each chapter says.
 * Fictional fixtures; labels mirror the shipping Control app. Scenes change
 * the painted DOM only. Every version claim stays in docs/index.html so the
 * drift checker can read it, and the resting panel is restored from the DOM.
 */
(function (root) {
  'use strict';
  function esc(text) { return String(text).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  var scenes = {
    status: {caption:'See what is actually running, not what you hope is running.', lit:['server','ownership','recovery','clis']},
    update: {caption:'Staged, proven with a real query, then switched.', lit:['server','recovery'],
      notice:{title:'New in COS Control', body:'Tasks carry a finish line. Run now waits for it.'},
      foot:{left:'Checked today', button:'Check for updates'},
      server:['Staging the next generation','Proving Claude · Codex · Cursor']},
    brief: {caption:'A numbered reply, delivered on schedule.', lit:['jobs'],
      card:{title:'Morning brief', rows:[['Schedule','Weekdays · 07:00'],['Last brief','Today · delivered'],['Calendar','3 events'],['Meetings','4 stored'],['Tasks','2 due this week'],['Waiting on you','1 reply']], button:'Run now'}},
    origin: {caption:'The label is a stamp, never a guess.',
      card:{title:'Activity · Messages', list:[{no:'#413',chip:'ROUTINE',text:'Morning brief',meta:'Opus · 07:00'},{no:'#412',chip:'TASK',text:'Friday pilot checklist',meta:'Sonnet · 9:14'},{no:'#411',text:'Design review',meta:'Opus · 8:42'}]}},
    tasks: {caption:'Nothing runs until the task says what finished looks like.', lit:['jobs'],
      card:{title:'Activity · Tasks', lanes:[['Inbox',3],['Today',1],['Scheduled',2],['Running',1],['Done',4]], task:{title:'Prepare the Friday pilot checklist', done:'Done when: checklist includes the owner, rollout date, and a tested rollback.'}, button:'Run now'}},
    meetings: {caption:'Fast text first. The canonical record wins.', lit:['preview','replay','tier','dictate','commit','polish'],
      tier:{tier:'Balanced', dictate:'Small.en', commit:'Large-v3-Turbo', polish:'Large-v3'}},
    sessions: {caption:'The threads on this Mac, readable and writable.', lit:['clis'],
      row:{label:'Memory & Threads', value:'4,875 · 64 threads'},
      card:{title:'Activity · Sessions', list:[{chip:'Codex',text:'Release checks',meta:'running · 16s'},{chip:'Claude',text:'Docs launch',meta:'done'},{chip:'Cursor',text:'Agent routing',meta:'waiting on you'}]}},
    pet: {caption:'Running, waiting, done. Readable without opening a window.', ledger:[['running',2],['waiting',1],['done',4]]}
  };
  function cardHtml(name) {
    var s = scenes[name], c = s && s.card;
    if (!c) return '';
    var out = '<h4>' + esc(c.title) + '</h4>';
    if (c.lanes) out += '<div class="cc-lanes">' + c.lanes.map(function (l) { return '<span class="cc-lane"><b>' + esc(l[1]) + '</b> ' + esc(l[0]) + '</span>'; }).join('') + '</div>';
    if (c.rows) out += '<div class="cc-list">' + c.rows.map(function (r) { return '<div class="cc-item"><small>' + esc(r[0]) + '</small><span>' + esc(r[1]) + '</span></div>'; }).join('') + '</div>';
    if (c.list) out += '<div class="cc-list">' + c.list.map(function (m) {
      return '<div class="cc-item">' + (m.no ? '<small class="cc-no">' + esc(m.no) + '</small>' : '') + (m.chip ? '<span class="cc-chip' + (m.chip === 'TASK' ? ' task' : '') + '">' + esc(m.chip) + '</span>' : '') + '<span class="cc-text">' + esc(m.text) + '</span><small>' + esc(m.meta) + '</small></div>';
    }).join('') + '</div>';
    if (c.task) out += '<div class="cc-task"><b>' + esc(c.task.title) + '</b><span>' + esc(c.task.done) + '</span></div>';
    if (c.button) out += '<span class="cc-btn">' + esc(c.button) + '</span>';
    return out;
  }
  function noticeHtml(name) { var n = scenes[name] && scenes[name].notice; return n ? '<div><b>' + esc(n.title) + '</b>' + esc(n.body) + '</div><i aria-hidden="true">×</i>' : ''; }
  function footHtml(name) { var f = scenes[name] && scenes[name].foot; return f ? '<span>' + esc(f.left) + '</span><span class="cc-btn">' + esc(f.button) + '</span>' : ''; }
  function ledgerHtml(name) {
    var l = scenes[name] && scenes[name].ledger;
    if (!l) return '';
    return '<i aria-hidden="true">' + l.map(function (p) { return '<b class="' + esc(p[0]) + '" style="flex:' + Number(p[1]) + '"></b>'; }).join('') + '</i><span>' + l.map(function (p) { return p[1] + ' ' + p[0]; }).join(' · ') + '</span>';
  }
  function mount(host) {
    var panel = host.querySelector('[data-cc-panel]'), caption = host.querySelector('[data-cc-caption]');
    if (!panel) return null;
    var notice = panel.querySelector('[data-cc-notice]'), foot = panel.querySelector('[data-cc-foot]'), card = panel.querySelector('[data-cc-card]'), ledger = host.querySelector('[data-cc-ledger]');
    var rows = {};
    panel.querySelectorAll('[data-cc-row]').forEach(function (r) { rows[r.getAttribute('data-cc-row')] = {el:r, value:r.querySelector('b').textContent}; });
    var chapters = Array.prototype.slice.call(host.querySelectorAll('[data-cc-scene]'));
    var AN = root.anime;
    var reduced = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var motion = !reduced && !!(AN && AN.animate);
    var timers = [], anims = [], extra = null;
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function animate(target, props) { if (!motion || !target || (target.length !== undefined && !target.length)) return null; var a = AN.animate(target, props); anims.push(a); return a; }
    function value(key) { return rows[key] && rows[key].el.querySelector('b'); }
    function rest() {
      timers.forEach(clearTimeout); timers = [];
      anims.forEach(function (a) { if (a && a.pause) a.pause(); }); anims = [];
      Object.keys(rows).forEach(function (k) { rows[k].el.classList.remove('lit'); value(k).textContent = rows[k].value; value(k).style.opacity = ''; });
      if (extra) { extra.remove(); extra = null; }
      [notice, foot, card, ledger].forEach(function (el) { if (el) { el.hidden = true; el.innerHTML = ''; el.style.opacity = ''; el.style.transform = ''; } });
    }
    function apply(name) {
      var s = scenes[name];
      if (!s) return;
      rest();
      host.setAttribute('data-cc-active', name);
      chapters.forEach(function (c) {
        var on = c.getAttribute('data-cc-scene') === name;
        if (on) c.setAttribute('data-active', ''); else c.removeAttribute('data-active');
      });
      (s.lit || []).forEach(function (k, i) {
        if (!rows[k]) return;
        if (motion) later(function () { rows[k].el.classList.add('lit'); }, 90 * i); else rows[k].el.classList.add('lit');
      });
      if (caption) { caption.textContent = s.caption; animate(caption, {opacity:[.3,1], duration:360, ease:'outQuad'}); }
      if (s.notice && notice) { notice.innerHTML = noticeHtml(name); notice.hidden = false; animate(notice, {opacity:[0,1], translateY:[-8,0], duration:420, ease:'outQuad'}); }
      if (s.foot && foot) { foot.innerHTML = footHtml(name); foot.hidden = false; animate(foot, {opacity:[0,1], duration:360, delay:240, ease:'outQuad'}); }
      if (s.server && rows.server && motion) {
        var steps = s.server.concat([rows.server.value]);
        steps.forEach(function (text, i) { later(function () { var b = value('server'); b.textContent = text; animate(b, {opacity:[.35,1], duration:260, ease:'outQuad'}); }, 700 + i * 1100); });
      }
      if (s.tier && motion) {
        var keys = Object.keys(s.tier);
        later(function () { keys.forEach(function (k) { var v = value(k); if (v) { v.textContent = s.tier[k]; animate(v, {opacity:[.35,1], duration:260, ease:'outQuad'}); } }); }, 900);
        later(function () { keys.forEach(function (k) { var v = value(k); if (v) { v.textContent = rows[k].value; animate(v, {opacity:[.35,1], duration:260, ease:'outQuad'}); } }); }, 3400);
      }
      if (s.row) {
        extra = document.createElement('div'); extra.className = 'ccp-row lit'; extra.style.opacity = '1';
        extra.innerHTML = '<span>' + esc(s.row.label) + '</span><b>' + esc(s.row.value) + '</b>';
        var anchor = rows.jobs ? rows.jobs.el : null;
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(extra, anchor.nextSibling); else panel.querySelector('.ccp-in').appendChild(extra);
        animate(extra, {opacity:[0,1], translateY:[-6,0], duration:360, ease:'outQuad'});
      }
      if (s.card && card) {
        card.innerHTML = cardHtml(name); card.hidden = false;
        animate(card, {opacity:[0,1], translateY:[18,0], duration:460, ease:'outCubic'});
        animate(card.querySelectorAll('.cc-chip'), {scale:[.6,1], opacity:[0,1], duration:380, delay:function (el, i) { return 420 + i * 110; }, ease:'outBack(1.6)'});
        animate(card.querySelectorAll('.cc-item, .cc-task, .cc-lane'), {opacity:[0,1], translateY:[6,0], duration:320, delay:function (el, i) { return 160 + i * 70; }, ease:'outQuad'});
      }
      if (s.ledger && ledger) {
        ledger.innerHTML = ledgerHtml(name); ledger.hidden = false;
        animate(ledger, {opacity:[0,1], translateY:[8,0], duration:420, ease:'outQuad'});
        animate(ledger.querySelectorAll('i b'), {scaleX:[0,1], duration:600, delay:function (el, i) { return 200 + i * 140; }, ease:'outCubic'});
      }
    }
    var manual = false;
    chapters.forEach(function (c) {
      var h = c.querySelector('h3');
      if (!h) return;
      h.tabIndex = 0; h.setAttribute('role', 'button');
      function pick() { manual = true; apply(c.getAttribute('data-cc-scene')); }
      h.addEventListener('click', pick);
      h.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
    });
    if ('IntersectionObserver' in root && chapters.length) {
      root.addEventListener('wheel', function () { manual = false; }, {passive:true});
      root.addEventListener('touchmove', function () { manual = false; }, {passive:true});
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting && !manual) apply(e.target.getAttribute('data-cc-scene')); });
      }, {rootMargin:'-32% 0px -46% 0px', threshold:.1});
      chapters.forEach(function (c) { io.observe(c); });
    }
    apply('status');
    return apply;
  }
  root.CosDocsControl = {scenes:scenes, cardHtml:cardHtml, noticeHtml:noticeHtml, footHtml:footHtml, ledgerHtml:ledgerHtml, mount:mount};
  if (typeof document !== 'undefined') Array.prototype.slice.call(document.querySelectorAll('[data-control-exhibit]')).forEach(mount);
})(typeof window !== 'undefined' ? window : globalThis);
