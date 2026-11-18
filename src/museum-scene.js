import * as T from 'three';
import { buildHall, gap, sideOf } from './museum-hall.js';
import { loadGuide } from './museum-guide.js';

const eye = 1.55;
const vector = (x, y, z) => new T.Vector3(x, y, z);
const ease = (t) => t * t * (3 - 2 * t);
function bearing(from, to) {
  return Math.atan2(to.x - from.x, to.z - from.z);
}
function turn(current, target, amount) {
  return current + Math.atan2(Math.sin(target - current), Math.cos(target - current)) * amount;
}
function stopPose(i) {
  const side = sideOf(i),
    z = -i * gap;
  return {
    guide: vector(side * 2.48, 0, z + 1.77),
    visitor: vector(-side * 0.72, eye, z + 2.19),
    art: vector(side * 4.21, 1.86, z),
    attention: vector(side * 3.22, 1.39, z + 0.84)
  };
}

export async function createMuseumScene(host, audio, onArrive, onStatus, onUnavailable, onRestore) {
  const renderer = new T.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.55));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.03;
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(53, 1, 0.05, 96);
  camera.rotation.order = 'YXZ';
  const guide = new T.Group();
  scene.add(guide);
  const contact = document.createElement('canvas');
  contact.width = contact.height = 96;
  const ink = contact.getContext('2d'),
    gradient = ink.createRadialGradient(48, 48, 0, 48, 48, 47);
  gradient.addColorStop(0, 'rgba(38,29,22,.52)');
  gradient.addColorStop(0.47, 'rgba(48,35,24,.25)');
  gradient.addColorStop(1, 'rgba(48,35,24,0)');
  ink.fillStyle = gradient;
  ink.fillRect(0, 0, 96, 96);
  const shadow = new T.Mesh(
    new T.PlaneGeometry(0.9, 0.52),
    new T.MeshBasicMaterial({ map: new T.CanvasTexture(contact), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.009;
  guide.add(shadow);
  guide.position.set(-0.42, 0, 3.76);
  camera.position.set(0, eye, 6.25);
  let attention = vector(-0.22, 1.26, 3.3);
  camera.lookAt(attention);
  let viewYaw = camera.rotation.y,
    viewPitch = camera.rotation.x;
  let entered = false,
    index = 0,
    route = null,
    active = false,
    visible = true,
    paused = false,
    lost = false;
  let frame = 0,
    last = 0,
    yawOffset = 0,
    pitchOffset = 0,
    drag,
    ready = false;
  const keys = new Set(),
    reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function schedule() {
    if (ready && active && visible && !document.hidden && !lost && !frame)
      frame = requestAnimationFrame(draw);
  }
  buildHall(scene, renderer, schedule);
  const observer = new ResizeObserver(() => {
    if (host.clientWidth && host.clientHeight) {
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.fov = camera.aspect < 1.1 ? 69 : 53;
      camera.updateProjectionMatrix();
      schedule();
    }
  });
  observer.observe(host);
  let animate;
  try {
    animate = await loadGuide(guide, (event) =>
      onStatus(
        event.total
          ? '載入 RAI　' + Math.min(99, Math.round((event.loaded / event.total) * 100)) + '%'
          : '載入 RAI 模型…'
      )
    );
  } catch (error) {
    observer.disconnect();
    renderer.dispose();
    canvas.remove();
    throw error;
  }
  function lookAt(to, dt, immediate) {
    const delta = to.clone().sub(camera.position);
    const yaw = Math.atan2(-delta.x, -delta.z),
      pitch = Math.atan2(delta.y, Math.hypot(delta.x, delta.z));
    const amount = immediate ? 1 : 1 - Math.exp(-5 * dt);
    viewYaw = turn(viewYaw, yaw, amount);
    viewPitch = T.MathUtils.lerp(viewPitch, pitch, amount);
    camera.rotation.set(viewPitch + pitchOffset, viewYaw + yawOffset, 0, 'YXZ');
  }
  function finish(i) {
    index = i;
    entered = true;
    route = null;
    const end = stopPose(i);
    guide.position.copy(end.guide);
    camera.position.copy(end.visitor);
    attention.copy(end.attention);
    if (reduced.matches) {
      guide.rotation.y = bearing(guide.position, camera.position);
      lookAt(attention, 0, true);
    }
    host.dataset.tourState = 'exhibit';
    host.dataset.station = String(i);
    onArrive(i);
  }
  function travel(i, cueDuration) {
    if (entered && index === i && !route) {
      recenter();
      onArrive(i);
      return;
    }
    const dest = stopPose(i),
      from = guide.position.clone();
    const distance = Math.abs(dest.guide.z - from.z);
    const controls = [from];
    if (distance > 2.5) {
      controls.push(
        vector(from.x * 0.48, 0, T.MathUtils.lerp(from.z, dest.guide.z, 0.27)),
        vector(dest.guide.x * 0.26, 0, T.MathUtils.lerp(from.z, dest.guide.z, 0.71))
      );
    }
    controls.push(dest.guide);
    const path = new T.CatmullRomCurve3(controls),
      length = path.getLength();
    index = i;
    paused = false;
    yawOffset = pitchOffset = 0;
    keys.clear();
    // The visitor follows the same footprints, then takes a viewing position beside the guide.
    route = {
      path,
      length,
      duration: Math.max(length / 1.52, cueDuration + 0.12),
      progress: 0,
      origin: camera.position.clone(),
      dest
    };
    host.dataset.tourState = 'walking';
    if (reduced.matches || length < 0.035) finish(i);
    schedule();
  }
  function recenter() {
    yawOffset = pitchOffset = 0;
    if (!route) {
      if (entered) {
        const dest = stopPose(index);
        camera.position.copy(dest.visitor);
        attention.copy(dest.attention);
      } else {
        camera.position.set(0, eye, 6.25);
        attention.set(-0.22, 1.26, 3.3);
      }
      lookAt(attention, 0, true);
    }
    schedule();
  }
  function stepRoute(dt) {
    const r = route,
      old = guide.position.clone();
    r.progress = Math.min(1, r.progress + dt / r.duration);
    const p = r.progress,
      loc = r.path.getPointAt(p),
      direction = r.path.getTangentAt(p);
    guide.position.copy(loc);
    guide.rotation.y = turn(
      guide.rotation.y,
      Math.atan2(direction.x, direction.z),
      1 - Math.exp(-7.5 * dt)
    );
    const distance = p * r.length,
      trail = r.path.getPointAt(Math.max(0, p - 2.25 / r.length));
    trail.y = eye;
    camera.position.copy(r.origin).lerp(trail, ease(Math.min(1, distance / 2.25)));
    const arrival = ease(T.MathUtils.clamp((distance - r.length + 2.6) / Math.min(r.length, 2.6), 0, 1));
    camera.position.lerp(r.dest.visitor, arrival);
    attention.copy(loc).addScaledVector(direction, 0.29);
    attention.y = 1.39;
    attention.lerp(r.dest.attention, arrival);
    const meters = old.distanceTo(loc);
    if (p >= 1) finish(index);
    return meters;
  }
  function manualStep(dt) {
    const fw = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
    const strafe = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
    if (!fw && !strafe) return;
    const angle = viewYaw + yawOffset,
      amount = (1.8 * dt) / Math.max(1, Math.hypot(fw, strafe));
    camera.position.x = T.MathUtils.clamp(
      camera.position.x + (-fw * Math.sin(angle) + strafe * Math.cos(angle)) * amount,
      -3.05,
      3.05
    );
    camera.position.z = T.MathUtils.clamp(
      camera.position.z + (-fw * Math.cos(angle) - strafe * Math.sin(angle)) * amount,
      -47.5,
      8.55
    );
    const dx = camera.position.x - guide.position.x,
      dz = camera.position.z - guide.position.z;
    const sep = Math.hypot(dx, dz);
    if (sep < 0.54 && sep > 0.0001) {
      camera.position.x = guide.position.x + (dx * 0.54) / sep;
      camera.position.z = guide.position.z + (dz * 0.54) / sep;
    }
    // Preserve the user's heading while walking around an exhibit.
    attention.set(
      camera.position.x - Math.sin(viewYaw) * 4,
      eye + Math.tan(viewPitch) * 4,
      camera.position.z - Math.cos(viewYaw) * 4
    );
  }
  function draw(now) {
    frame = 0;
    if (!active || !visible || document.hidden || lost) return;
    const dt = Math.min(0.15, last ? (now - last) / 1000 : 1 / 60);
    if (last && now - last < 1000 / 32) {
      schedule();
      return;
    }
    last = now;
    let meters = 0;
    if (!paused) {
      if (route) {
        if (reduced.matches) finish(index);
        else meters = stepRoute(dt);
      } else manualStep(dt);
    }
    const end = stopPose(index);
    const toArt = bearing(guide.position, end.art),
      toVisitor = bearing(guide.position, camera.position);
    const side = Math.sin(toArt - guide.rotation.y) >= 0 ? 1 : -1;
    if (!route && !paused) {
      const target = entered
        ? turn(toVisitor, toArt, audio.paused ? 0.09 : 0.17 + 0.12 * Math.sin(audio.currentTime * 0.89))
        : toVisitor;
      guide.rotation.y = turn(guide.rotation.y, target, reduced.matches ? 1 : 1 - Math.exp(-4.9 * dt));
    }
    lookAt(attention, dt, false);
    animate({
      dt: paused ? 0 : dt,
      meters,
      walking: Boolean(route),
      index,
      audio,
      welcome: !entered && !route,
      turnToArt: side,
      reduced: reduced.matches
    });
    renderer.render(scene, camera);
    // These coordinates also make physical travel inspectable without a debug overlay.
    host.dataset.guidePosition = guide.position
      .toArray()
      .map((x) => x.toFixed(2))
      .join(',');
    host.dataset.visitorPosition = camera.position
      .toArray()
      .map((x) => x.toFixed(2))
      .join(',');
    if (!paused && (!reduced.matches || route || keys.size || !audio.paused)) schedule();
  }
  host.addEventListener('pointerdown', (e) => {
    if (e.button === 0 && e.target === canvas) {
      drag = [e.clientX, e.clientY, yawOffset, pitchOffset];
      host.setPointerCapture(e.pointerId);
      host.focus({ preventScroll: true });
    }
  });
  host.addEventListener('pointermove', (e) => {
    if (!drag) return;
    yawOffset = drag[2] - (e.clientX - drag[0]) * 0.005;
    pitchOffset = T.MathUtils.clamp(drag[3] - (e.clientY - drag[1]) * 0.004, -0.72, 0.72);
    schedule();
  });
  host.addEventListener('lostpointercapture', () => {
    drag = null;
  });
  host.addEventListener('keydown', (e) => {
    if (e.target !== host) return;
    if (['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
      e.preventDefault();
      keys.add(e.code);
    } else if (e.key === 'Home') {
      e.preventDefault();
      recenter();
    } else if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      yawOffset += { ArrowLeft: 0.16, ArrowRight: -0.16 }[e.key] || 0;
      pitchOffset = T.MathUtils.clamp(
        pitchOffset + ({ ArrowUp: 0.1, ArrowDown: -0.1 }[e.key] || 0),
        -0.72,
        0.72
      );
    }
    schedule();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  host.addEventListener('blur', () => keys.clear());
  audio.addEventListener('playing', schedule);
  reduced.addEventListener('change', schedule);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    last = 0;
    if (!visible) keys.clear();
    schedule();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    last = 0;
    keys.clear();
    schedule();
  });
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    host.classList.remove('museum-ready');
    onUnavailable();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    host.classList.add('museum-ready');
    last = 0;
    onRestore();
    schedule();
  });
  guide.rotation.y = bearing(guide.position, camera.position);
  host.classList.add('museum-ready');
  host.dataset.tourState = 'entrance';
  ready = true;
  return {
    travel,
    recenter,
    stride(code, down) {
      if (down) keys.add(code);
      else keys.delete(code);
      schedule();
    },
    nudge(code) {
      if (!route) {
        keys.add(code);
        manualStep(0.18);
        keys.delete(code);
        schedule();
      }
    },
    setPaused(on) {
      paused = on;
      last = 0;
      schedule();
    },
    setActive(on) {
      active = on;
      last = 0;
      keys.clear();
      schedule();
    }
  };
}
