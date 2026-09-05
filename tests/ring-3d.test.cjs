const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/ring-3d.js'), 'utf8');
const noop = () => {};

// Exercise the shipped renderer and its software depth buffer. This Canvas
// stub checks execution/state, not pixel appearance or browser raster quality.
function harness({ reduced = false, width = 300, height = 236 } = {}) {
  let state = { globalAlpha: 1 };
  const stack = [];
  const attributes = new Map();
  const frames = new Map();
  let nextFrame = 0;
  const methods = {
    save() { stack.push({ ...state }); },
    restore() {
      assert.ok(stack.length, 'Canvas restore must have a matching save');
      state = stack.pop();
    },
    createRadialGradient() { return { addColorStop: noop }; }
  };
  for (const name of ['setTransform', 'clearRect', 'fillRect', 'beginPath',
    'moveTo', 'lineTo', 'closePath', 'fill', 'stroke', 'arc', 'rect', 'clip', 'transform']) {
    methods[name] = (...args) => {
      for (const value of args) {
        if (typeof value === 'number') assert.ok(Number.isFinite(value), `${name} received a non-finite coordinate`);
      }
    };
  }
  const ctx = new Proxy(methods, {
    get(target, key) { return key in target ? target[key] : state[key]; },
    set(target, key, value) {
      if (key === 'globalAlpha') assert.ok(value >= 0 && value <= 1, 'valid Canvas alpha');
      state[key] = value;
      return true;
    }
  });
  const window = {
    document: { hidden: false, addEventListener: noop, removeEventListener: noop },
    addEventListener: noop,
    removeEventListener: noop,
    devicePixelRatio: 1,
    matchMedia: () => ({ matches: reduced, addEventListener: noop, removeEventListener: noop })
  };
  vm.runInNewContext(source, {
    window,
    performance: { now: () => 1000 },
    requestAnimationFrame(callback) { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); }
  }, { filename: 'assets/ring-3d.js' });
  const canvas = {
    width, height,
    getContext: () => ctx,
    getBoundingClientRect: () => ({ width, height }),
    addEventListener: noop,
    removeEventListener: noop,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    classList: { add: noop, remove: noop }
  };
  const renderer = window.CosRing3D.create(canvas, {});
  return {
    renderer, frames, attributes,
    assertBalanced() {
      assert.equal(stack.length, 0, 'a rendered frame must balance Canvas save/restore');
      assert.equal(ctx.globalAlpha, 1, 'a rendered frame must restore alpha');
    },
    runFrame(now) {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(now);
    }
  };
}

function near(actual, expected, tolerance = 1e-8) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`);
}

function rotate(point, pose) {
  const y = point.y * Math.cos(pose.x) - point.z * Math.sin(pose.x);
  const z = point.y * Math.sin(pose.x) + point.z * Math.cos(pose.x);
  const x = point.x * Math.cos(pose.y) + z * Math.sin(pose.y);
  return {
    x: x * Math.cos(pose.z) - y * Math.sin(pose.z),
    y: x * Math.sin(pose.z) + y * Math.cos(pose.z),
    z: -point.x * Math.sin(pose.y) + z * Math.cos(pose.y)
  };
}

test('every gesture draws through its active pulses and restores Canvas state', () => {
  for (const size of [{ width: 300, height: 236 }, { width: 222, height: 166 }]) {
    const h = harness(size);
    const r = h.renderer;
    let sensorPasses = 0;
    const drawSensors = r.drawSensorStack;
    r.drawSensorStack = function (...args) { sensorPasses++; return drawSensors.apply(this, args); };
    for (const gesture of ['idle', 'swipe-up', 'swipe-down', 'tap', 'hold', 'double-tap']) {
      r.setGesture(gesture);
      r.pose = { ...r.target };
      for (const elapsed of [0, 100, 339, 350, 560, 700, 900, 1200, 2199, 2401]) {
        const before = sensorPasses;
        assert.doesNotThrow(() => r.draw(r.gestureStarted + elapsed), `${gesture} at ${elapsed}ms`);
        assert.equal(sensorPasses, before + 1, 'gesture effects must not interrupt the sensor pass');
        h.assertBalanced();
      }
    }
    r.destroy();
  }
});

test('the outside crown is flat with continuous shoulders and a circular bore', () => {
  const { renderer: r } = harness();
  for (let i = -20; i <= 20; i++) {
    const angle = r.crownAngle + r.crownHalfAngle * i / 20;
    const crown = r.surfacePoint(angle, 0, r.outerRadius);
    near(crown.y, -r.crownHeight);
  }
  for (const join of [r.crownHalfAngle, r.shoulderEnd]) {
    for (const side of [-1, 1]) {
      const angle = r.crownAngle + side * join;
      near(r.outerContour(angle - 1e-7), r.outerContour(angle + 1e-7), 1e-6);
    }
  }
  for (let i = 0; i < 48; i++) {
    const point = r.surfacePoint(i * Math.PI / 24, 0, r.innerRadius);
    near(Math.hypot(point.x, point.y), r.innerRadius);
  }
  const axialWidth = Math.max(...r.vertices.map(p => p.z)) - Math.min(...r.vertices.map(p => p.z));
  const outsideDiameter = r.outerRadius * 2;
  assert.ok(axialWidth / outsideDiameter > .18, 'the physical band must retain width when viewed from the side');
  assert.ok(axialWidth / outsideDiameter < .35, 'band width must remain proportionate to its diameter');
  assert.ok(r.innerRadius / r.outerRadius > .6 && r.innerRadius / r.outerRadius < .9, 'retain a usable bore and a substantial wall');
});

test('raised touch paths follow the same crown shoulder and exterior as the mesh', () => {
  const { renderer: r } = harness();
  let sampledShoulder = false;
  for (let i = 0; i <= 20; i++) {
    const angle = r.touchRailStart + (r.touchRailEnd - r.touchRailStart) * i / 20;
    const body = r.surfacePoint(angle, 0, r.outerRadius);
    const effect = r.surfacePoint(angle, 0, r.outerRadius + .02);
    near(Math.hypot(body.x, body.y), r.outerContour(angle));
    near(Math.hypot(effect.x, effect.y) - Math.hypot(body.x, body.y), .02);
    near(effect.z, body.z);
    if (Math.abs(r.outerContour(angle) - r.outerRadius) > .005) sampledShoulder = true;
  }
  assert.ok(sampledShoulder, 'the touch path must exercise the shaped shoulder, not only the circular section');
});

test('the depth buffer hides inside sensors behind the near side wall', () => {
  const { renderer: r } = harness();
  const sensor = r.surfacePoint(r.sensorAngle, 0, r.innerRadius - .007);
  r.setGesture('idle');
  r.pose = { ...r.target };
  r.draw(1100);
  assert.ok(r.visiblePoint(r.project(rotate(sensor, r.pose))), 'inside sensor is visible through the bore at idle');
  r.pose = { x: -Math.PI / 2, y: 0, z: 0 };
  r.draw(1100);
  assert.equal(r.visiblePoint(r.project(rotate(sensor, r.pose))), false, 'near exterior wall must occlude the far inside sensor');
  const crown = { x: 0, y: -r.crownHeight - .006, z: 0 };
  assert.ok(r.visiblePoint(r.project(rotate(crown, r.pose))), 'the near crown remains visible');
  r.pose = { x: Math.PI / 2, y: 0, z: 0 };
  r.draw(1100);
  assert.equal(r.visiblePoint(r.project(rotate(crown, r.pose))), false, 'rear crown must not show through the opposite band');
});

test('reduced motion renders each gesture once and leaves no animation scheduled', () => {
  const h = harness({ reduced: true });
  for (const gesture of ['idle', 'swipe-up', 'swipe-down', 'tap', 'hold', 'double-tap']) {
    h.renderer.setGesture(gesture);
    h.renderer.velocity = { x: .2, y: -.1, z: .3 };
    assert.ok(h.frames.size, 'a changed gesture should request its static frame');
    h.runFrame(1100);
    assert.equal(h.frames.size, 0, 'reduced motion must not schedule a gesture loop');
    near(h.renderer.pose.x, h.renderer.target.x);
    near(h.renderer.pose.y, h.renderer.target.y);
    near(h.renderer.pose.z, h.renderer.target.z);
    near(Math.hypot(h.renderer.velocity.x, h.renderer.velocity.y, h.renderer.velocity.z), 0);
    h.assertBalanced();
  }
});
