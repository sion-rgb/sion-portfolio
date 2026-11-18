import * as T from 'three';
import mouthCues from './museum-mouth.json';
import { museumStops } from './museum-stops.js';

const assets = import.meta.env.BASE_URL + 'assets/';
const spacing = 5.8;
function inscription(text) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#463e30';
  ctx.font = 'italic 95px Georgia';
  ctx.fillText(text, 18, 120, 979);
  ctx.fillRect(22, 153, 95, 3);
  ctx.font = '27px Arial';
  ctx.fillText('S I O N   N G     /     C O L L E C T I O N', 22, 212);
  const map = new T.CanvasTexture(c);
  map.colorSpace = T.SRGBColorSpace;
  return new T.MeshBasicMaterial({ map, transparent: true, depthWrite: false });
}

export function createMuseumScene(host, narration) {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
  renderer.setClearColor(0xcac1ab);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(37, 1, 0.04, 60);
  scene.fog = new T.FogExp2(0xd2c9b6, 0.023);
  const loader = new T.TextureLoader(),
    unit = new T.BoxGeometry(),
    plane = new T.PlaneGeometry();
  const material = (color) => new T.MeshStandardMaterial({ color, roughness: 0.83 });
  const wood = material('#584531'),
    brass = material('#8c704b'),
    mat = material('#f2ebdb');
  const box = (parent, x, y, z, w, h, d, m) => {
    const mesh = new T.Mesh(unit, m);
    mesh.position.set(x, y, z);
    mesh.scale.set(w, h, d);
    parent.add(mesh);
    return mesh;
  };
  scene.add(new T.HemisphereLight(0xfff8e6, 0xdfcebb, 1.65));
  const sun = new T.DirectionalLight(0xffebc1, 2.1);
  sun.position.set(-3, 5.9, 2.3);
  scene.add(sun);
  const background = loader.load(assets + 'museum/gallery.webp', invalidate);
  background.colorSpace = T.SRGBColorSpace;
  scene.background = background;
  const architecture = new T.MeshBasicMaterial({ map: background });
  const bays = museumStops.map((stop, i) => {
    const g = new T.Group();
    g.position.x = i * spacing;
    scene.add(g);
    const room = new T.Mesh(plane, architecture);
    room.position.set(0, 1.54, -2.18);
    room.scale.set(spacing + 0.005, 3.86, 1);
    g.add(room);
    const label = new T.Mesh(plane, inscription(stop.english));
    label.position.set(0.73, 2.74, -2.15);
    label.scale.set(1.73, 0.43, 1);
    g.add(label);
    // Every exhibit retains the original image's aspect ratio inside its mount.
    const photo = new T.Mesh(plane, new T.MeshBasicMaterial({ color: '#dfd5c0' }));
    photo.position.set(0.64, 1.64, -1.904);
    g.add(photo);
    const mount = box(g, 0.64, 1.64, -1.945, 2, 1.44, 0.072, mat);
    const frame = box(g, 0.64, 1.64, -2.006, 2.07, 1.51, 0.12, wood);
    box(g, 1.92, 1.27, -2.106, 0.32, 0.14, 0.035, mat);
    for (let n = 0; n < 3; n++)
      box(g, 1.89, 1.3 - n * 0.026, -2.084, 0.18 - n * 0.027, 0.005, 0.007, brass);
    return { g, room, photo, frame, mount, loaded: false };
  });

  const textures = new Map();
  function guideMap(pose, state) {
    const key = pose + '-' + state;
    if (!textures.has(key)) {
      const tex = loader.load(assets + 'museum/' + key + '.webp', invalidate);
      tex.colorSpace = T.SRGBColorSpace;
      textures.set(key, tex);
    }
    return textures.get(key);
  }
  const portrait = new T.Sprite(new T.SpriteMaterial({ transparent: true, depthWrite: false }));
  portrait.scale.set(1.36, 2.09, 1);
  scene.add(portrait);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 128;
  const ctx = shadowCanvas.getContext('2d'),
    grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(42,31,22,.42)');
  grad.addColorStop(0.46, 'rgba(42,31,22,.22)');
  grad.addColorStop(1, 'rgba(42,31,22,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const shadow = new T.Mesh(
    plane,
    new T.MeshBasicMaterial({
      map: new T.CanvasTexture(shadowCanvas),
      transparent: true,
      depthWrite: false
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(0.97, 0.53, 1);
  scene.add(shadow);

  let index = 0,
    position = 0,
    yaw = 0,
    pitch = 0,
    active = false,
    frameId = 0,
    stamp = 0,
    visible = true;
  let drag = null,
    clock = 0,
    dirty = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function invalidate() {
    dirty = true;
    if (active && visible && !document.hidden && !frameId) frameId = requestAnimationFrame(draw);
  }
  function draw(now) {
    frameId = 0;
    if (!active || !visible || document.hidden) return;
    if (!dirty && !reduced.matches && now - stamp < 1000 / 30) {
      frameId = requestAnimationFrame(draw);
      return;
    }
    const dt = Math.min(0.075, (now - (stamp || now)) / 1000);
    stamp = now;
    clock += dt;
    const target = index * spacing;
    position = reduced.matches ? target : T.MathUtils.damp(position, target, 6.5, dt);
    if (Math.abs(position - target) < 0.002) position = target;
    const aspect = host.clientWidth / Math.max(1, host.clientHeight);
    const near = aspect < 1.38;
    const center = position + (near ? -0.05 : 0);
    camera.position.set(center, 1.53, near ? 3.8 : 3.32);
    camera.lookAt(center + yaw, 1.48 + pitch, -1);
    camera.fov = near ? 42 : 36;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();

    bays.forEach(({ g, room }, i) => {
      g.visible = Math.abs(position / spacing - i) < 1.6;
      room.scale.y = near ? 5.8 : 4.55;
    });
    const anim = !reduced.matches;
    const pose = museumStops[index].pose;
    const face =
      anim && !narration.paused && mouthCues[index][Math.floor(narration.currentTime * 16)] === '1'
        ? 'talk'
        : anim && clock % 4.23 < 0.13
          ? 'blink'
          : 'idle';
    const tex = guideMap(pose, face);
    if (portrait.material.map !== tex && tex.image) {
      portrait.material.map = tex;
      portrait.material.needsUpdate = true;
      dirty = true;
    }
    portrait.visible = Boolean(portrait.material.map);
    portrait.position.set(
      position - (near ? 0.63 : 0.89),
      1.045 + (anim ? 0.007 * Math.sin(clock * 1.7) : 0),
      0.11
    );
    shadow.position.set(portrait.position.x, 0.009, 0.11);
    if (dirty || anim) {
      renderer.render(scene, camera);
      dirty = false;
    }
    if (anim) frameId = requestAnimationFrame(draw);
  }
  function select(i) {
    if (Math.abs(i - index) > 1 || !active) position = i * spacing;
    index = i;
    yaw = pitch = 0;
    const { pose } = museumStops[i];
    ['idle', 'talk', 'blink'].forEach((s) => guideMap(pose, s));
    bays.forEach((bay, j) => {
      if (Math.abs(j - i) > 1 || bay.loaded) return;
      bay.loaded = true;
      const texture = loader.load(assets + museumStops[j].image, () => {
        const ratio = texture.image.width / texture.image.height;
        const w = Math.min(2.06, 1.4 * ratio),
          h = w / ratio;
        bay.photo.scale.set(w, h, 1);
        bay.photo.material.map = texture;
        bay.photo.material.color.set(0xffffff);
        bay.photo.material.needsUpdate = true;
        bay.mount.scale.set(w + 0.17, h + 0.17, 0.072);
        bay.frame.scale.set(w + 0.23, h + 0.23, 0.12);
        invalidate();
      });
      texture.colorSpace = T.SRGBColorSpace;
    });
    invalidate();
  }
  new ResizeObserver(() => {
    if (host.clientWidth) {
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      invalidate();
    }
  }).observe(host);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    stamp = 0;
    invalidate();
  }).observe(host);
  document.addEventListener('visibilitychange', () => {
    stamp = 0;
    invalidate();
  });
  reduced.addEventListener('change', invalidate);
  host.addEventListener('pointerdown', (e) => {
    if (e.button === 0) {
      drag = { x: e.clientX, y: e.clientY, yaw, pitch };
      host.setPointerCapture(e.pointerId);
    }
  });
  host.addEventListener('pointermove', (e) => {
    if (drag) {
      yaw = T.MathUtils.clamp(drag.yaw - (e.clientX - drag.x) * 0.006, -1.15, 1.15);
      pitch = T.MathUtils.clamp(drag.pitch + (e.clientY - drag.y) * 0.004, -0.44, 0.44);
      invalidate();
    }
  });
  host.addEventListener('lostpointercapture', () => {
    drag = null;
  });
  host.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'Home') yaw = pitch = 0;
    else {
      yaw = T.MathUtils.clamp(yaw + ({ ArrowLeft: -0.16, ArrowRight: 0.16 }[e.key] || 0), -1.15, 1.15);
      pitch = T.MathUtils.clamp(pitch + ({ ArrowUp: 0.1, ArrowDown: -0.1 }[e.key] || 0), -0.44, 0.44);
    }
    invalidate();
  });
  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    host.classList.remove('museum-ready');
    active = false;
    cancelAnimationFrame(frameId);
    frameId = 0;
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    host.classList.add('museum-ready');
    active = document.documentElement.classList.contains('museum-theme');
    invalidate();
  });
  select(0);
  host.classList.add('museum-ready');
  return {
    select,
    setActive(value) {
      active = value;
      stamp = 0;
      invalidate();
    }
  };
}
