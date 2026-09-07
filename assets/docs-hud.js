/* Public, fictional fixtures for the COS lens. No device/server connection.
 * Labels audited against cos-glasses-app (6.9.455 + reader-menu-wrap branch).
 * See scripts/verify-docs-hud.mjs for source-content parity checks.
 * The Hub-themed frame and typography intentionally follow the supplied mockup.
 */
(function (root) {
  'use strict';
  // HUD motion, in ms. ILLUSTRATIVE, like the ring's contact clock. Shared with
  // ring-lessons.js so the status line and the ring never restate these.
  var timing = Object.freeze({ holdMenuDelay: 800, menuSlide: 440, menuExit: 260, scroll: 580, footerFade: 280, cursorFade: 180, crossFade: 220 });
  var home = {
    nav: 'COS [O] 9:16 AM 9/4/26 3msg 2m',
    body: 'Chief of Staff v6.9.453\n\n72° Clear • Austin\n→ in 44m: Design review\n\nTap=Latest  ↓ Menu  ↑ Messages\n"reference message 104" • "review meetings"',
    footer: 'Opus  3/3  #412  demo1234:3  2m  82%',
    layout: 'list'
  };
  var listBody = '✉ Record Message\n▶ #412  9:14a  Friday pilot\n  #411  8:42a  Design review\n  #410  9/3    Team brief';
  var replyBody = '? What changed for the design review?\n─────\n→ The design review moved to 10:00. Bring the revised control states and the mobile navigation pass.\n\nThe open decision is whether the setup path stays inside Docs or moves into the guided wizard.\n\nDana owns the navigation review. Sam will confirm the final setup copy before the meeting.';
  var sessionBody = 'Friday pilot rollout\n[ANT] 14m • 31msg • mac\n\nDISCUSSION\nImport owner is Dana. Rollout email drafts Thursday.\n\nSTATS\nMessages: 15u / 16a\nBranch: main';
  var frames = {
    home: home,
    messages: { nav: 'COS [O] 9:16 AM 9/4/26 3msg 2m', body: listBody, footer: 'Opus  1/3 Pg 1  demo1234  82%', layout: 'list' },
    selected: { nav: 'COS [O] 9:16 AM 9/4/26 3msg 2m', body: listBody.replace('▶ #412', '  #412').replace('  #411', '▶ #411'), footer: 'Opus  2/3 Pg 1  demo1234  82%', layout: 'list' },
    reader: { nav: 'COS [O] #411 Pg 1/1 9:16 AM 9/4/26', body: replyBody, footer: 'Opus  #411 Pg 1/1  demo1234:2  34m  82%', thumb: true },
    continued: { nav: 'COS [O] #411 Pg 1/1 9:16 AM 9/4/26', body: replyBody, footer: 'Opus  #411 Pg 1/1  demo1234:2  34m  82%', scroll: true, thumb: true },
    // A prompt started from the open reader by Reply or by double-tap. The app
    // arms a "Referencing #N" line only from the spoken "reference message N"
    // command, never from these gestures, so the recording view is plain.
    reply: { nav: '■□□□ LISTEN · COS [O●] Msg Tap to finish', body: 'Listening...\n\nSpeak your message.', footer: 'Opus  Tap to finish  demo1234  82%' },
    review: { nav: 'COS [O] Msg Msg 1/1  Tap=Send  ↓ No 9:16 AM 9/4/26', body: 'Summarize the pilot thread.', footer: 'Opus  Msg 1/1  Tap=Send  ↓ No  demo1234  82%' },
    replyReview: { nav: 'COS [O] Msg Msg 1/1  Tap=Send  ↓ No 9:16 AM 9/4/26', body: 'Summarize the design review changes.', footer: 'Opus  Msg 1/1  Tap=Send  ↓ No  demo1234  82%' },
    // The send receipt: the prompt is echoed while the run starts. One tap
    // opens the live job log; double-tap is still the two-step cancel.
    receipt: { nav: 'COS [O] Thinking 1s 9/4/26 82%', body: '▶ "Summarize the pilot thread."\n\nSending...', footer: 'Tap to watch · double-tap to cancel' },
    sessionMic: { nav: '■□□□ LISTEN · COS [O●] Msg Tap to finish', body: 'Listening...\n\nSpeak your message.', footer: 'Continue: say your next message' },
    session: { nav: 'COS [O] Sess 1/3 9:16 AM 9/4/26', body: sessionBody, footer: 'Opus  1/3 · Tap: actions  demo1234  82%', thumb: true },
    sessionMenu: { nav: 'COS [O] Sess 1/3 9:16 AM 9/4/26', body: sessionBody, footer: '▶ Back to list · 1/4 · Scroll=move Tap=select' },
    sessionRefusal: { nav: 'COS [O] Sess 1/3 9:16 AM 9/4/26', body: sessionBody, footer: '▶ Continue (unavailable) · 2/4 · Scroll=move · Unavailable' },
    job: { nav: 'COS [O] Thinking 66s 9/4/26 82%', body: '00:00 ASK  Summarize the pilot thread.\n00:09 TOOL Searching web...\n00:21 OUT  5 results · vendor pricing\n00:34 TOOL Reading page...\n01:05 LIVE The pilot is on track. Two\n01:06 LIVE items need a decision…', footer: 'Opus  Running · double-tap to cancel  66.0s  demo1234  82%', layout: 'list' },
    meeting: { nav: '■■□□ REC 12:08  ★1  82%', body: '[maya] we can ship the pilot friday\n[sam] blocking item is the data import, one day of work\n[maya] then friday holds', footer: '◆ 2 nudges  ↓ history  ↑↑ home' }
  };
  var menuIdle = ['Display off', 'Ask COS', 'Start Meeting', 'Model: Opus', 'Messages', 'Sessions', 'Tasks', 'Home', 'Brightness', 'Close'];
  var menuRecording = ['Display off', 'Resume Meeting', 'Stop Meeting', 'Ask COS', 'Model: Opus', 'Messages', 'Sessions', 'Home', 'Brightness', 'Close'];
  function escape(text) { return String(text).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function bodyHtml(body, layout) {
    return body.split('\n').map(function(line,i){
      // Pickers brighten the > cursor row; menus brighten the ▶ row. Neither
      // treats line 0 as a title, so a menu never shows two highlighted rows.
      if (layout === 'picker') return line.charAt(0) === '>' ? '<span class="lens-bright">'+escape(line)+'</span>' : escape(line);
      if (layout === 'menu') return line.indexOf('▶') === 0 ? '<span class="lens-bright">'+escape(line)+'</span>' : escape(line);
      var homeTitle = line.match(/^(Chief of Staff)( v[\d.]+)$/);
      if (homeTitle) return '<span class="lens-bright">'+escape(homeTitle[1])+'</span><span class="lens-dim">'+escape(homeTitle[2])+'</span>';
      return i === 0 || line.indexOf('▶') === 0 ? '<span class="lens-bright">'+escape(line)+'</span>' : escape(line);
    }).join('\n');
  }
  function footerHtml(footer) {
    var battery = footer.match(/^(.*?)(  \d+%)$/);
    return battery ? '<span>'+escape(battery[1])+'</span><span class="lens-battery">'+escape(battery[2])+'</span>' : escape(footer);
  }
  function html(frame) {
    var f = typeof frame === 'string' ? frames[frame] : frame;
    if (!f) throw new Error('Unknown Docs HUD frame');
    var out = '<div class="lens-nav">' + escape(f.nav) + '</div><div class="lens-body' + (f.layout === 'list' ? ' lens-body-list' : '') + (f.scroll ? ' lens-scrolled' : '') + '"><div class="lens-text">' + bodyHtml(f.body, f.layout) + '</div>' + (f.thumb ? '<i class="lens-thumb" aria-hidden="true"></i>' : '') + '</div><div class="lens-footer' + (f.layout === 'list' ? ' lens-footer-list' : '') + '">' + footerHtml(f.footer) + '</div>';
    if (f.menu) {
      var items = f.recording ? menuRecording : menuIdle;
      var selected = f.menuIndex == null ? 1 : f.menuIndex;
      var start = Math.max(0, Math.min(items.length - 5, selected - 2));
      out += '<div class="lens-host-menu" role="group" aria-label="Simulated Even shortcut overlay"><div class="lens-menu-window">' + items.slice(start, start + 5).map(function (name, i) { return '<div class="lens-menu-row' + (start + i === selected ? ' selected' : '') + '">' + escape((start + i === selected ? '▶ ' : '  ') + name) + '</div>'; }).join('') + '</div><div class="lens-menu-position">' + (selected + 1) + '/' + items.length + '</div></div>';
    }
    return out;
  }
  var ringFrames = ['home', Object.assign({}, home, {menu:true,menuIndex:1}), Object.assign({}, home, {menu:true,menuIndex:4}), 'messages', 'selected', 'reader', 'continued', 'reply', 'replyReview'];
  // One painter for every lesson. When nav and body are unchanged only the
  // changed layer moves: native body scroll, footer selection, or the
  // firmware-owned window above the page. A nav or body change replaces the
  // frame and cross-fades it, since the lens repaints those wholesale.
  var paints = new WeakMap();
  function paint(el, frame, options) {
    options = options || {};
    var f = typeof frame === 'string' ? frames[frame] : frame;
    var previous = paints.get(el);
    if (previous) previous.cancel();
    var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var motion = !reduced && options.animate !== false && root.anime && root.anime.animate;
    var animations = [], cancelled = false;
    var old = previous && previous.frame;
    // Compare the painted DOM, not the requested state: a user may step again
    // while the outgoing window is still moving and cancel its commit. Layout
    // and the scroll indicator are read from the DOM for the same reason.
    var paintedText = el.querySelector('.lens-text'), paintedNav = el.querySelector('.lens-nav'), paintedBody = el.querySelector('.lens-body');
    var paintedList = !!(paintedBody && paintedBody.classList && paintedBody.classList.contains && paintedBody.classList.contains('lens-body-list'));
    var sameBody = !!old && !!paintedText && paintedText.textContent === f.body && paintedNav.textContent === f.nav && old.layout === f.layout
      && paintedList === (f.layout === 'list') && !!el.querySelector('.lens-thumb') === !!f.thumb;
    function animate(target, props) {
      if (!target || !motion) return;
      animations.push(root.anime.animate(target, props));
    }
    function commit() {
      if (cancelled) return;
      var base = Object.assign({}, f, {menu:false});
      var oldPanel = el.querySelector('.lens-host-menu');
      if (!sameBody) {
        el.innerHTML = html(base);
        animate(el.querySelector('.lens-nav'), {opacity:[.35,1],duration:timing.crossFade,ease:'outQuad'});
        animate(el.querySelector('.lens-text'), {opacity:[.35,1],duration:timing.crossFade,ease:'outQuad'});
        animate(el.querySelector('.lens-footer'), {opacity:[.35,1],duration:timing.crossFade,ease:'outQuad'});
      } else {
        el.querySelector('.lens-footer').innerHTML = footerHtml(f.footer);
        el.querySelector('.lens-body').classList.toggle('lens-scrolled', !!f.scroll);
        if (oldPanel) oldPanel.remove();
      }
      var body = el.querySelector('.lens-body'), text = el.querySelector('.lens-text');
      el.querySelector('.lens-footer').style.opacity = '1';
      var end = f.scroll ? -Math.max(0, text.scrollHeight - body.clientHeight) : 0;
      text.style.transform = 'translateY(' + end + 'px)';
      if (sameBody && !!old.scroll !== !!f.scroll) animate(text, {translateY:[old.scroll ? -Math.max(0,text.scrollHeight-body.clientHeight) : 0,end],duration:timing.scroll,ease:'inOutCubic'});
      if (sameBody && old.footer !== f.footer) animate(el.querySelector('.lens-footer'), {opacity:[.5,1],duration:timing.footerFade,ease:'outQuad'});
      if (f.layout === 'picker') {
        var cursor = text.querySelector('.lens-bright');
        if (cursor) cursor.style.opacity = '1';
        if (!sameBody || options.replay) animate(cursor, {opacity:[.55,1],duration:timing.cursorFade,ease:'outQuad'});
      }
      if (f.menu) {
        var box = document.createElement('div'); box.innerHTML = html(f);
        var panel = box.querySelector('.lens-host-menu'); el.appendChild(panel);
        if (!old || !old.menu || options.replay) animate(panel, {translateX:['-110%','0%'],opacity:[.2,1],delay:(options.hold ? timing.holdMenuDelay : 0) + (options.delay || 0),duration:timing.menuSlide,ease:'outCubic'});
      }
      if (options.onCommit) options.onCommit();
    }
    paints.set(el, {frame:f,cancel:function(){ cancelled=true; animations.forEach(function(a){a.pause();}); }});
    var panel = el.querySelector('.lens-host-menu');
    if (panel && old && old.menu && !f.menu && motion) animate(panel, {translateX:['0%','-110%'],opacity:[1,.2],duration:timing.menuExit,ease:'inCubic',onComplete:commit});
    else commit();
  }
  function current(el) { var p = paints.get(el); return p ? p.frame : null; }
  root.CosDocsHud = { frames: frames, html: html, paint: paint, current: current, footerHtml: footerHtml, ringFrames: ringFrames, menuIdle: menuIdle, menuRecording: menuRecording, timing: timing };
  if (typeof document !== 'undefined') document.querySelectorAll('[data-hud]').forEach(function (el) { el.innerHTML = html(el.getAttribute('data-hud')); });
})(typeof window !== 'undefined' ? window : globalThis);
