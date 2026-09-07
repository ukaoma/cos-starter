const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Ring-to-HUD sync contract. Loads the three shipped assets into one context
// and drives the real renderer at 60fps, so the HUD's commit instant is
// checked against what the ring has actually drawn by then. Every number
// comes from the assets' exported constants, never restated here.
const read = name => fs.readFileSync(path.join(__dirname, '../assets', name), 'utf8');
const noop = () => {};
const FRAME = 1000 / 60;

function harness({ reduced = false } = {}) {
  let state = { globalAlpha: 1 };
  const stack = [];
  let clock = 1000;
  const counts = { stroke: 0, fill: 0, arc: 0, alpha: 0 };
  const methods = {
    save() { stack.push({ ...state }); },
    restore() { state = stack.pop(); },
    createRadialGradient() { return { addColorStop: noop }; },
    stroke() { counts.stroke++; counts.alpha = Math.max(counts.alpha, state.globalAlpha); }, fill() { counts.fill++; }, arc() { counts.arc++; }
  };
  for (const name of ['setTransform', 'clearRect', 'fillRect', 'beginPath', 'moveTo', 'lineTo', 'closePath', 'rect', 'clip', 'transform']) methods[name] = noop;
  const ctx = new Proxy(methods, { get(t, k) { return k in t ? t[k] : state[k]; }, set(t, k, v) { state[k] = v; return true; } });
  const frames = new Map(); let nextFrame = 0;
  const window = {
    document: { hidden: false, addEventListener: noop, removeEventListener: noop },
    addEventListener: noop, removeEventListener: noop, devicePixelRatio: 1,
    matchMedia: () => ({ matches: reduced, addEventListener: noop, removeEventListener: noop })
  };
  const context = { window, performance: { now: () => clock }, requestAnimationFrame(cb) { const id = ++nextFrame; frames.set(id, cb); return id; }, cancelAnimationFrame(id) { frames.delete(id); } };
  vm.runInNewContext(read('ring-3d.js'), context);
  vm.runInNewContext(read('docs-hud.js'), context);
  vm.runInNewContext(read('ring-lessons.js'), context);
  const canvas = { width: 300, height: 236, getContext: () => ctx, getBoundingClientRect: () => ({ width: 300, height: 236 }), addEventListener: noop, removeEventListener: noop, setAttribute: noop, removeAttribute: noop, classList: { add: noop, remove: noop } };
  const r = window.CosRing3D.create(canvas, {});
  return {
    r, ctx, counts, frames, TIMING: window.CosRing3D.TIMING, POSES: window.CosRing3D.POSES, hud: window.CosDocsHud, L: window.CosRingLessons,
    now: () => clock, tick(ms) { clock += ms; return clock; },
    run(ms) { const end = clock + ms; while (clock < end) { clock = Math.min(end, clock + FRAME); frames.clear(); r.frame(clock); } return clock; },
    gestureStrokes(now) { counts.stroke = 0; counts.alpha = 0; r.drawGesture(ctx, now, 1, r.outerRadius + .009, r.touchRailStart, r.touchRailEnd); return counts.stroke; },
    gestureAlpha(now) { counts.stroke = 0; counts.alpha = 0; r.drawGesture(ctx, now, 1, r.outerRadius + .009, r.touchRailStart, r.touchRailEnd); return counts.alpha; },
    collarArcs(now) { counts.arc = 0; r.drawCollar(ctx, now); return counts.arc; }
  };
}

function rotate(p, pose) {
  const cx = Math.cos(pose.x), sx = Math.sin(pose.x), cy = Math.cos(pose.y), sy = Math.sin(pose.y), cz = Math.cos(pose.z), sz = Math.sin(pose.z);
  const x = p.x, y = p.y * cx - p.z * sx, z = p.y * sx + p.z * cx;
  const x2 = x * cy + z * sy, z2 = -x * sy + z * cy;
  return { x: x2 * cz - y * sz, y: x2 * sz + y * cz, z: z2 };
}
// The renderer's own rail visibility term (drawCrown), evaluated at a pose.
function railVisibility(r, pose) {
  const a = (r.touchRailStart + r.touchRailEnd) / 2;
  const n = rotate({ x: Math.cos(a), y: Math.sin(a), z: 0 }, pose);
  const c = rotate(r.surfacePoint(a, 0, r.outerRadius), pose);
  const to = { x: -c.x, y: -c.y, z: 5.4 - c.z }; const len = Math.hypot(to.x, to.y, to.z);
  return Math.max(0, Math.min(1, (n.x * to.x + n.y * to.y + n.z * to.z) / len / .35));
}

const GESTURES = ['tap', 'double-tap', 'swipe-down', 'swipe-up'];
const FROM = ['idle', 'swipe-down', 'tap', 'double-tap', 'hold'];

test('the HUD commits after the drawn contact, while the ring is still showing it, on every transition', () => {
  for (const from of FROM) for (const gesture of GESTURES) {
    const h = harness(), { r, TIMING, L } = h;
    r.setGesture(from); r.pose = { ...r.target }; r.velocity = { x: 0, y: 0, z: 0 }; r.lastFrame = h.now(); r.frame(h.now());
    const lead = r.setGesture(gesture);
    const wait = L.waitFor(gesture, undefined, lead);
    assert.ok(wait > lead, `${from}>${gesture}: the HUD waits for the camera turn`);
    // Nothing is drawn while the camera turns: the first contact is never mid-turn.
    if (lead) { h.run(lead / 2); assert.equal(h.gestureStrokes(h.now()), 0, `${from}>${gesture}: no contact during the lead-in`); h.run(lead / 2 - FRAME); }
    else h.run(0);
    const commitAt = h.now() + (wait - (h.now() - (r.gestureStarted - lead)));
    h.run(commitAt - h.now());
    const elapsed = h.now() - r.gestureStarted;
    assert.ok(elapsed >= 0, `${from}>${gesture}: commit happens after the contact clock started`);
    assert.ok(railVisibility(r, r.pose) >= .85, `${from}>${gesture}: rail faces the viewer at commit (${railVisibility(r, r.pose).toFixed(2)})`);
    assert.ok(r.gestureLive(h.now()), `${from}>${gesture}: gesture still playing at commit`);
    if (gesture === 'tap') assert.ok(elapsed < TIMING.tapVisible, 'tap pulse still visible at commit');
    if (gesture === 'double-tap') assert.ok(elapsed >= TIMING.doubleTapGap && elapsed < TIMING.doubleTapGap + TIMING.tapVisible, 'second contact landed and is still visible at commit');
    if (gesture.startsWith('swipe')) assert.ok(elapsed <= TIMING.swipeStroke, 'swipe stroke still moving at commit');
    assert.ok(h.gestureStrokes(h.now()) > 0, `${from}>${gesture}: the contact is on screen at commit`);
    r.destroy();
  }
});

test('one gesture per step: the ring rests after its cycle and the HUD never sees a second contact', () => {
  for (const gesture of GESTURES) {
    const h = harness(), { r, TIMING } = h;
    r.setGesture('idle'); r.pose = { ...r.target }; r.lastFrame = h.now();
    r.setGesture(gesture);
    const cycle = r.gestureCycle();
    h.run(r.gestureStarted - h.now() + 80);
    const during = h.gestureAlpha(h.now());
    h.run(cycle);
    const rested = h.gestureAlpha(h.now());
    h.run(2000);
    assert.equal(h.gestureAlpha(h.now()), rested, gesture + ': the drawing after the cycle is the resting marker, unchanged');
    assert.ok(rested < during * .6, gesture + ': the resting marker is dimmer than a live contact (' + rested.toFixed(2) + ' vs ' + during.toFixed(2) + ')');
    assert.equal(r.gestureLive(h.now()), false, gesture + ': no animation after one cycle');
    h.frames.clear(); r.frame(h.now());
    assert.equal(h.frames.size, 0, gesture + ': no further frame scheduled');
    r.destroy();
  }
  const h = harness();
  h.r.setGesture('hold'); h.run(h.TIMING.lead + h.TIMING.tapCycle * 3);
  assert.equal(h.r.gestureLive(h.now()), true, 'hold keeps its contact glow');
});

test('the collar ripple rides the rail contact clock', () => {
  const h = harness(), { r, TIMING } = h;
  r.setGesture('idle'); r.pose = { ...r.target }; r.lastFrame = h.now();
  r.setGesture('double-tap');
  const start = r.gestureStarted;
  h.run(start - h.now() - FRAME);
  assert.equal(h.collarArcs(h.now()), 1, 'only the base ring before contact');
  assert.equal(h.collarArcs(start + 40), 2, 'first ripple with the first contact');
  assert.equal(h.collarArcs(start + TIMING.doubleTapGap + 40), 3, 'second ripple with the second contact');
  assert.equal(h.collarArcs(start + TIMING.doubleTapGap + TIMING.collarRipple + 40), 1, 'ripples end; no drift into a second cycle');
});

test('the hold phases, menu delay and status flip derive from the shared constants', () => {
  const h = harness(), { TIMING, hud, L } = h;
  assert.deepEqual([...L.holdPhases(TIMING.lead)], [TIMING.lead + TIMING.holdTap, TIMING.lead + TIMING.holdRelease]);
  assert.equal(L.holdStatusAt(TIMING.lead), TIMING.lead + hud.timing.holdMenuDelay + hud.timing.menuSlide);
  assert.ok(hud.timing.holdMenuDelay > TIMING.holdPress, 'the shortcut window appears after the press has landed');
  assert.ok(L.react.tap < TIMING.tapVisible && L.react.doubleTap < TIMING.tapVisible, 'the HUD answers a tap while its pulse is visible');
  assert.ok(L.react.swipe <= TIMING.swipeStroke, 'the HUD answers a swipe before the stroke ends');
  for (const gesture of ['tap', 'hold']) assert.ok(railVisibility(h.r, h.POSES[gesture]) >= .9, gesture + ' pose faces the rail to the viewer');
  assert.equal(L.waitFor('idle', 3000, TIMING.lead), 3000, 'a timeout wait is the firmware value, untouched by the lead');
});
