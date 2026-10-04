/* Public, fictional fixtures for the COS lens. No device/server connection.
 * Labels audited against the 6.10.578 companion pack.
 * See scripts/verify-docs-hud.mjs for source-content parity checks.
 * The Hub-themed frame and typography intentionally follow the supplied mockup.
 */
(function (root) {
  'use strict';
  // HUD motion, in ms. ILLUSTRATIVE, like the ring's contact clock. Shared with
  // ring-lessons.js so the status line and the ring never restate these.
  var timing = Object.freeze({ holdMenuDelay: 800, menuSlide: 440, menuExit: 260, scroll: 580, footerFade: 280, cursorFade: 180, crossFade: 220 });
  var home = {
    nav: "COS [O] 9:16a 9/4/26 3msg 2m 82%",
    body: 'Chief of Staff v6.10.578\n\n72° Clear • Austin\n→ in 44m: Design review\n\nTap=Latest  ↓ Menu  ↑ Messages\n"reference message 104" • "review meetings"',
    footer: 'Opus  3/3  #412  2m  82%',
    layout: 'list'
  };
  var listBody = '● Record Message\n▶ #412  9:14a  Friday pilot\n  #411  8:42a  Design review\n  #410  9/3    Team brief';
  var replyBody = '? What changed for the design review?\n─────\n→ The design review moved to 10:00. Bring the revised control states and the mobile navigation pass.\n\nThe open decision is whether the setup path stays inside Docs or moves into the guided wizard.\n\nDana owns the navigation review. Sam will confirm the final setup copy before the meeting.';
  var sessionBody = 'Friday pilot rollout\n[ANT] 14m • 31msg • mac\n\nDISCUSSION\nImport owner is Dana. Rollout email drafts Thursday.\n\nSTATS\nMessages: 15u / 16a\nBranch: main';
  var frames = {
    home: home,
    messages: { nav: "◈ Msg [O] 9:16a 9/4/26 3msg 2m 82%", body: listBody, footer: 'Opus  1/3 Pg 1  82%', layout: 'list' },
    selected: { nav: "◈ Msg [O] 9:16a 9/4/26 3msg 2m 82%", body: listBody.replace('▶ #412', '  #412').replace('  #411', '▶ #411'), footer: 'Opus  2/3 Pg 1  82%', layout: 'list' },
    reader: { nav: "◈ Msg [O] #411 Pg 1/1 9:16a 9/4/26 82%", body: replyBody, footer: 'Opus  #411 Pg 1/1  Tap: actions  34m', thumb: true },
    continued: { nav: "◈ Msg [O] #411 Pg 1/1 9:16a 9/4/26 82%", body: replyBody, footer: 'Opus  #411 Pg 1/1  Tap: actions  34m', scroll: true, thumb: true },
    // A prompt started from the open reader by Reply or by double-tap. The app
    // arms a "Referencing #N" line only from the spoken "reference message N"
    // command, never from these gestures, so the recording view is plain.
    reply: { nav: "◈ Msg ■□□□ LISTEN · [O●] Tap to 82%", body: 'Listening...\n\nSpeak your message.', footer: 'Opus  Tap to finish  82%' },
    // The same recorder with Glasses dictation set to hold (6.9.483+): the footer
    // reads the control that ends it, and letting go opens the review.
    replyHold: { nav: "◈ Msg ■□□□ LISTEN · [O●] 82%", body: 'Listening...\n\nSpeak your message.', footer: 'Opus  Release to confirm 4/15s  82%' },
    review: { nav: "◈ Msg [O] 9:16a 9/4/26 82%", body: 'Summarize the pilot thread.', footer: 'Opus  Msg 1/1  Tap=Send  ↓ No  82%' },
    replyReview: { nav: "◈ Msg [O] 9:16a 9/4/26 82%", body: 'Summarize the design review changes.', footer: 'Opus  Msg 1/1  Tap=Send  ↓ No  82%' },
    // Send opens the job page immediately, before the Mac acknowledges it.
    // SENDING is not a claim that the provider has started.
    receipt: {"nav": "◈ Msg [O] Thinking 1s 9/4/26 82%", "body": "◌ SENDING\n--- ask ---\n  \"Summarize the pilot thread.\"", "footer": "1s · double-tap to cancel · Scroll up: history + Ask"},
    sessionMic: { nav: "↔ Sess ■□□□ LISTEN · [O●] Tap to 82%", body: 'Listening...\n\nSpeak your message.', footer: 'Continue: say your next message' },
    session: { nav: "↔ Sess [O] 1/3 9:16a 9/4/26 82%", body: sessionBody, footer: 'Opus  1/3 · Tap: actions', thumb: true },
    sessionMenu: { nav: "↔ Sess [O] 1/3 9:16a 9/4/26 82%", body: sessionBody, footer: '▶ Back to list · 1/6 · Scroll=move Tap=select' },
    sessionRefusal: { nav: "↔ Sess [O] 1/3 9:16a 9/4/26 82%", body: sessionBody, footer: '▶ Continue (unavailable) · 3/6 · Scroll=move · Unavailable' },
    job: { nav: "◈ Msg [O] Thinking 66s 9/4/26 82%", body: '00:00 ASK  Summarize the pilot thread.\n00:09 TOOL Searching web...\n00:21 OUT  5 results · vendor pricing\n00:34 TOOL Reading page...\n01:05 LIVE The pilot is on track. Two\n01:06 LIVE items need a decision…', footer: '1m 06s · double-tap to cancel · Scroll up: history + Ask', layout: 'list' },
    meeting: { nav: "■■□□ REC 12:08  ★1  82%", body: '[Maya] We can ship the pilot Friday.\n[Sam] The data import needs one day.\n[Maya] Then Friday holds.\n~ I will check the final rollout notes', footer: '◆ 2 nudges  ↑ history  Tap: actions' }
  };
  Object.assign(frames, {
  "sending": {
    "nav": "◈ Msg [O] Thinking 1s 9/4/26 82%",
    "body": "◌ SENDING\n--- ask ---\n  \"Summarize the pilot thread.\"",
    "footer": "1s · double-tap to cancel · Scroll up: history + Ask"
  },
  "live": {
    "nav": "◈ Msg [O] Thinking 66s 9/4/26 82%",
    "body": "● RUNNING  1 step · 1s ago\nThe pilot is on track. Dana owns the import. Sam is checking\nthe rollout notes.",
    "footer": "1m 06s · double-tap to cancel · Scroll up: history + Ask"
  },
  "history": {
    "nav": "◈ Msg [hist] [O] Thinking 66s 9/4/26 82%",
    "body": "--- ask ---\nSummarize the pilot thread.",
    "footer": "1/2 · 1m 06s · 1 down to live"
  },
  "sessionLive": {
    "nav": "↔ Sess [O] FRIDAY PILOT 9:16a 9/4/26 82%",
    "body": "● RUNNING  1 step · 1s ago\nThe pilot is on track. Dana owns the import. Sam is checking\nthe rollout notes.",
    "footer": "Hold: continue · 1m 06s · Scroll up: history + Ask"
  },
  "sessionHistory": {
    "nav": "↔ Sess [hist] [O] HISTORY FRIDAY 82%",
    "body": "--- ask ---\nSummarize the pilot thread.",
    "footer": "1/2 · 1m 06s · 1 down to live"
  }
});
  frames.meetingHistory = {nav:'[hist] ■■□□ REC 12:08  ★1  82%',body:'[Maya] Before we set the date, what is left?\n[Sam] The data import needs one day.',footer:'1/1  ↑ older  1 down to live'};
  frames.meetingActions = Object.assign({},frames.meeting,{footer:'▶ Meetings · 1/3 · Scroll=move Tap=select'});
  frames.meetingHome = Object.assign({},frames.meeting,{footer:'▶ Home · recording continues · 3/3 · Tap=select'});
  var menuIdle = ['Display off', 'Home', 'Ask COS', 'Start Meeting', 'Model: Opus', 'Messages', 'Sessions', 'Tasks', 'Brightness', 'Close'];
  var menuRecording = ['Display off', 'Home', 'Resume Meeting', 'Stop Meeting', 'Ask COS', 'Model: Opus', 'Messages', 'Sessions', 'Brightness', 'Close'];
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
  var ringFrames = ['home', Object.assign({}, home, {menu:true,menuIndex:1}), Object.assign({}, home, {menu:true,menuIndex:5}), 'messages', 'selected', 'reader', 'continued', 'reply', 'replyReview'];
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
// Direct state comparison; does not connect to devices or invoke a provider.
(function () {
  if (typeof document === 'undefined') return;
  var captions = {
    sending: 'Send opens the job page immediately. SENDING means the Mac has not acknowledged the prompt yet.',
    live: 'The newest words sit on the last page. The clock, cancel control and history hint share the footer; battery stays out of that row.',
    history: 'Scroll up to see the original ask. The footer says 1 down to live, so one downward scroll returns to the newest page.',
    sessionLive: 'Sessions uses the same history + Ask language. Hold continues this session; tap opens its actions. The clock belongs to the active turn.',
    sessionHistory: 'Older context is above the latest reply. The page counter and distance to live stay visible while you read.',
    meetingHistory: 'One upward scroll enters older transcript. The live recording continues; one downward scroll returns to live.',
    meetingHome: 'Tap for actions, scroll up once to wrap to Home, then tap to confirm. Recording continues when you leave this page.',
    meeting: 'Committed speaker lines stay visible above one provisional preview marked ~. Scroll up for earlier transcript and down toward live, the same direction as Messages and Sessions. Tap opens Meetings, Nudges and Home. Home keeps recording active.'
  };
  document.querySelectorAll('[data-hud-explorer]').forEach(function (root) {
    var screen = root.querySelector('[data-hud]'), caption = root.querySelector('.hud-state-caption');
    root.querySelectorAll('[data-hud-state]').forEach(function (button) {
      button.addEventListener('click', function () {
        root.querySelectorAll('[data-hud-state]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === button)); });
        var name = button.getAttribute('data-hud-state');
        window.CosDocsHud.paint(screen, name, {onCommit:function () {caption.textContent=captions[name];}});
      });
    });
  });
})();
