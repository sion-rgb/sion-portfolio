import * as T from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { museumStops } from './museum-stops.js';

export const gap = 6.4;
export const sideOf = (i) => (i % 2 ? -1 : 1);
const assets = import.meta.env.BASE_URL + 'assets/';
function lettering(line, sub, ink) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = ink;
  ctx.font = 'italic 96px Georgia';
  ctx.fillText(line, 16, 115, 980);
  ctx.fillRect(18, 151, 75, 3);
  ctx.font = '32px "Microsoft JhengHei", sans-serif';
  ctx.fillText(sub, 18, 220, 975);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
}

export function buildHall(scene, renderer, refresh) {
  const pmrem = new T.PMREMGenerator(renderer),
    studio = new RoomEnvironment();
  const lightmap = pmrem.fromScene(studio, 0.04);
  scene.environment = lightmap.texture;
  scene.environmentIntensity = 0.36;
  studio.dispose();
  pmrem.dispose();
  scene.background = new T.Color('#cad9d3');
  scene.fog = new T.FogExp2('#c5c6b9', 0.018);
  scene.add(new T.HemisphereLight(0xfff6e6, 0x958b76, 1.05));
  const sun = new T.DirectionalLight(0xffe4a9, 2.75);
  sun.position.set(-16, 16, -6);
  sun.target.position.set(0, 0, -16);
  sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 27, bottom: -27, near: 1, far: 75 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.normalBias = 0.024;
  sun.shadow.bias = -0.0003;
  scene.add(sun, sun.target);
  const fill = new T.DirectionalLight(0xf6f4ff, 0.47);
  fill.position.set(3, 4, 4);
  scene.add(fill);

  const loader = new T.TextureLoader();
  function finish(name, u = 1, v = 1) {
    const tex = loader.load(assets + 'museum/' + name + '.webp', refresh);
    tex.colorSpace = T.SRGBColorSpace;
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.repeat.set(u, v);
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }
  const blockMap = finish('stone', 2, 2),
    plaster = finish('plaster');
  const stone = (c) => new T.MeshStandardMaterial({ color: c, roughness: 0.85 });
  const cream = stone('#e4d7be'),
    trim = stone('#c5b699'),
    cove = stone('#f3e9d5');
  cream.map = blockMap;
  trim.map = blockMap;
  cove.map = plaster;
  const wood = new T.MeshStandardMaterial({ map: finish('walnut'), roughness: 0.47 });
  const brass = new T.MeshStandardMaterial({ color: '#b39a62', metalness: 0.77, roughness: 0.32 });
  const dark = stone('#393b35'),
    linen = stone('#f6eedc');
  const glow = new T.MeshBasicMaterial({ color: '#fff2c8' });
  const floors = finish('terrazzo', 6, 36);
  floors.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const floor = new T.Mesh(
    new T.PlaneGeometry(9.2, 60),
    new T.MeshStandardMaterial({ map: floors, roughness: 0.46, metalness: 0.07 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -20;
  floor.receiveShadow = true;
  scene.add(floor);
  const shell = new T.Group(),
    cube = new T.BoxGeometry(),
    sphere = new T.IcosahedronGeometry(1, 1);
  const ring = new T.TorusGeometry(1, 0.13, 12, 48),
    cylinder = new T.CylinderGeometry(1, 1, 1, 22);
  const unitPlane = new T.PlaneGeometry();
  function solid(parent, geometry, material, x, y, z, w, h, d, rz = 0) {
    const m = new T.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.scale.set(w, h, d);
    m.rotation.z = rz;
    parent.add(m);
    return m;
  }
  const box = (parent, mat, x, y, z, w, h, d) => solid(parent, cube, mat, x, y, z, w, h, d);
  function label(parent, line, sub, ink, x, y, z, w) {
    const m = new T.Mesh(unitPlane, lettering(line, sub, ink));
    m.position.set(x, y, z);
    m.scale.set(w, w / 4, 1);
    parent.add(m);
  }
  const longWall = (x) => {
    box(shell, brass, x, 0.008, -20, 0.016, 0.012, 59);
  };
  longWall(-3.12);
  longWall(3.12);
  box(shell, cove, 0, 6.11, -20, 9.4, 0.2, 60);
  for (let z = 8; z >= -49; z -= 2.13) {
    box(shell, wood, 0, 5.88, z, 9.04, 0.24, 0.16);
    box(shell, glow, 0, 5.977, z - 0.75, 3.4, 0.025, 0.64);
  }
  // Extruded transverse arches form actual thresholds between the galleries.
  const arch = new T.Shape();
  arch.moveTo(-4.5, -2.28);
  arch.lineTo(-4.5, 3.72);
  arch.lineTo(4.5, 3.72);
  arch.lineTo(4.5, -2.28);
  arch.lineTo(3.72, -2.28);
  arch.lineTo(3.72, 0);
  arch.absellipse(0, 0, 3.72, 3.22, 0, Math.PI, false);
  arch.lineTo(-3.72, -2.28);
  arch.closePath();
  const archGeo = new T.ExtrudeGeometry(arch, { depth: 0.43, bevelEnabled: false, curveSegments: 40 });
  const uv = archGeo.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.4, uv.getY(i) * 0.4);
  const band = new T.Shape();
  band.absellipse(0, 0, 3.75, 3.25, 0, Math.PI, false);
  band.absellipse(0, 0, 3.6, 3.1, Math.PI, 0, true);
  band.closePath();
  const bandGeo = new T.ExtrudeGeometry(band, { depth: 0.06, bevelEnabled: false, curveSegments: 38 });
  for (const z of [4.8, -3.2, -16, -28.8, -41.6, -48]) {
    solid(shell, archGeo, cream, 0, 2.28, z, 1, 1, 1);
    for (const face of [-0.05, 0.44]) solid(shell, bandGeo, trim, 0, 2.28, z + face, 1, 1, 1);
    for (const s of [-1, 1]) {
      box(shell, trim, s * 3.91, 0.13, z + 0.21, 0.67, 0.26, 0.73);
      box(shell, trim, s * 3.91, 2.26, z + 0.21, 0.67, 0.18, 0.73);
      for (let k = 0; k < 5; k++)
        box(shell, cove, s * (3.68 + k * 0.08), 1.19, z + 0.458, 0.03, 1.9, 0.045);
    }
  }
  for (const z of [9.6, -49.8]) box(shell, cream, 0, 3, z, 9, 6, 0.35);
  const walls = [
    '#53645d',
    '#847057',
    '#54646c',
    '#805e4d',
    '#64725b',
    '#535e6e',
    '#796759',
    '#49665e'
  ].map(stone);
  const leaves = ['#455d42', '#75804f', '#506c49', '#917d52', '#637043'].map(stone),
    trunk = stone('#65503a');
  let gardenSeed = 1337;
  const random = () => (gardenSeed = (gardenSeed * 1664525 + 1013904223) >>> 0) / 4294967296;
  box(shell, stone('#83976d'), 0, -0.42, -20, 80, 0.6, 83);
  walls.forEach((m) => {
    m.map = plaster;
  });
  const works = [];
  for (let i = 0; i < museumStops.length; i++) {
    const stop = museumStops[i],
      sign = sideOf(i),
      z = -i * gap;
    const bay = new T.Group();
    bay.position.set(sign * 4.5, 0, z);
    bay.rotation.y = (-sign * Math.PI) / 2;
    shell.add(bay);
    box(bay, cream, 0, 3, -0.13, gap + 0.02, 6, 0.26);
    box(bay, walls[i], 0, 2.18, 0.035, 4.98, 3.95, 0.09);
    box(bay, wood, 0, 0.17, 0.095, gap, 0.34, 0.18);
    box(bay, brass, 0, 0.35, 0.18, gap, 0.027, 0.035);
    box(bay, brass, 0, 4.14, 0.1, 5, 0.027, 0.035);
    label(
      bay,
      stop.english,
      String(i + 1).padStart(2, '0') + '   /   ' + stop.title,
      '#f4e7c6',
      0,
      3.25,
      0.105,
      2.84
    );
    const mount = box(bay, wood, 0, 1.91, 0.166, 2.08, 1.51, 0.13);
    const mat = box(bay, linen, 0, 1.91, 0.24, 2, 1.44, 0.03);
    const picture = new T.Mesh(unitPlane, new T.MeshBasicMaterial({ color: '#e8dfcf', toneMapped: false }));
    picture.position.set(0, 1.91, 0.262);
    bay.add(picture);
    works.push({ picture, mat, mount });
    box(bay, brass, 0, 2.88, 0.26, 1.06, 0.06, 0.35);
    box(bay, glow, 0, 2.846, 0.34, 0.99, 0.016, 0.14);
    box(bay, linen, 1.69, 1.37, 0.12, 0.49, 0.24, 0.065);
    label(
      bay,
      'Plate ' + String(i + 1).padStart(2, '0'),
      'SION NG   /   HONG KONG',
      '#433d30',
      1.69,
      1.37,
      0.157,
      0.44
    );
    // An object study on a plinth beside each framed original.
    const px = -1.88;
    box(bay, trim, px, 0.44, 0.54, 0.62, 0.88, 0.64);
    box(bay, brass, px, 0.905, 0.54, 0.65, 0.05, 0.67);
    if (i % 3 === 0) {
      const r = solid(bay, ring, brass, px, 1.24, 0.54, 0.32, 0.32, 0.32);
      r.rotation.y = 0.44;
      solid(bay, sphere, walls[i], px, 1.23, 0.54, 0.15, 0.15, 0.15);
    } else if (i % 3 === 1) {
      for (let k = 0; k < 4; k++) {
        const m = box(bay, k % 2 ? wood : brass, px + 0.018 * k, 0.97 + k * 0.105, 0.54, 0.47, 0.088, 0.33);
        m.rotation.y = k * 0.27;
      }
    } else {
      solid(bay, sphere, walls[i], px, 1.12, 0.53, 0.25, 0.2, 0.21);
      solid(bay, sphere, brass, px + 0.08, 1.41, 0.53, 0.16, 0.15, 0.14);
    }
    const garden = new T.Group();
    garden.position.set(-sign * 4.5, 0, z);
    garden.rotation.y = (sign * Math.PI) / 2;
    shell.add(garden);
    box(garden, cream, 0, 0.54, -0.12, gap, 1.08, 0.3);
    box(garden, trim, 0, 1.1, 0, gap, 0.12, 0.36);
    box(garden, cream, 0, 5.32, -0.12, gap, 1.42, 0.3);
    for (const u of [-3.13, -1.55, 0, 1.55, 3.13]) box(garden, wood, u, 2.92, -0.12, 0.075, 3.58, 0.14);
    for (const h of [3.72, 4.4]) box(garden, wood, 0, h, -0.12, gap, 0.065, 0.12);
    box(garden, wood, 0, 0.49, 0.7, 2.0, 0.11, 0.49);
    for (const u of [-0.75, 0.75]) box(garden, brass, u, 0.23, 0.7, 0.09, 0.46, 0.38);
    for (let k = 0; k < 4; k++) {
      const x = -2.3 + k * 1.65,
        depth = -4.4 - ((i + k) % 3);
      solid(garden, cylinder, trunk, x, 1.35, depth, 0.087, 2.7, 0.087);
      for (let t = 0; t < 7; t++) {
        const angle = random() * Math.PI * 2,
          spread = 0.32 + random() * 0.65;
        const bx = x + Math.cos(angle) * spread,
          bz = depth + Math.sin(angle) * spread,
          by = 2.3 + random() * 1.1;
        const base = new T.Vector3(x, 1.63, depth),
          top = new T.Vector3(bx, by, bz),
          dir = top.clone().sub(base);
        const branch = solid(
          garden,
          cylinder,
          trunk,
          (x + bx) / 2,
          (1.63 + by) / 2,
          (depth + bz) / 2,
          0.043,
          dir.length(),
          0.043
        );
        branch.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize());
        for (let l = 0; l < 7; l++) {
          const rad = 0.14 + random() * 0.26;
          solid(
            garden,
            sphere,
            leaves[Math.floor(random() * leaves.length)],
            bx + (random() - 0.5) * 0.74,
            by + random() * 0.47,
            bz + (random() - 0.5) * 0.74,
            rad * 1.27,
            rad * 0.81,
            rad
          );
        }
      }
    }
    box(garden, cream, 0, 0.85, -9, gap + 0.04, 1.7, 0.35);
    box(garden, trim, 0, 1.76, -9, gap + 0.04, 0.12, 0.45);
    for (const u of [-2.1, 1.1]) {
      box(garden, cream, u, 2.48, -9, 0.2, 1.42, 0.24);
    }
    box(garden, trim, 0, 3.2, -9, gap + 0.04, 0.12, 0.34);
  }
  for (const z of [6.4, -48]) for (const s of [-1, 1]) box(shell, cream, s * 4.5, 3, z, 0.26, 6, 6.42);
  label(shell, 'Sion Ng', 'P E R M A N E N T   C O L L E C T I O N', '#5b6253', 0, 2.48, -49.59, 5.4);

  // Instance repeated architectural parts; unique art and lettering stay individually addressable.
  shell.updateMatrixWorld(true);
  const groups = new Map();
  shell.traverse((m) => {
    if (!m.isMesh || m.geometry === unitPlane || works.some((w) => w.mat === m || w.mount === m)) return;
    const key = m.geometry.uuid + m.material.uuid;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(m);
  });
  for (const batch of groups.values()) {
    const first = batch[0],
      inst = new T.InstancedMesh(first.geometry, first.material, batch.length);
    batch.forEach((m, k) => {
      inst.setMatrixAt(k, m.matrixWorld);
      m.removeFromParent();
    });
    inst.castShadow = first.material !== glow;
    inst.receiveShadow = true;
    scene.add(inst);
  }
  scene.add(shell);
  works.forEach(({ picture, mat, mount }, i) => {
    loader.load(assets + museumStops[i].image, (tex) => {
      tex.colorSpace = T.SRGBColorSpace;
      const r = tex.image.width / tex.image.height,
        w = Math.min(2.65, 1.59 * r),
        h = w / r;
      picture.scale.set(w, h, 1);
      picture.material.color.set('white');
      picture.material.map = tex;
      picture.material.needsUpdate = true;
      mat.scale.set(w + 0.13, h + 0.13, 0.03);
      mount.scale.set(w + 0.22, h + 0.22, 0.13);
      refresh();
    });
  });
}
