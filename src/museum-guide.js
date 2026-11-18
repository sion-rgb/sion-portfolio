import * as T from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin } from '@pixiv/three-vrm';
import walkLines from './museum-walk-lines.json';
import mouthCues from './museum-mouth.json';

export async function loadGuide(parent, onProgress) {
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));
  const gltf = await loader.loadAsync(import.meta.env.BASE_URL + 'assets/museum/RAI.vrm', onProgress);
  const vrm = gltf.userData.vrm;
  const bones = {};
  for (const name of Object.keys(vrm.humanoid.normalizedHumanBones)) {
    bones[name] = vrm.humanoid.getNormalizedBoneNode(name);
  }
  const rotate = (name, x, y, z) => bones[name]?.rotation.set(x, y, z);
  const head = bones.head.getWorldPosition(new T.Vector3());
  vrm.scene.scale.setScalar(1.49 / head.y);
  vrm.scene.traverse((m) => {
    if (m.isMesh) {
      m.frustumCulled = false;
      m.castShadow = true;
    }
  });
  parent.add(vrm.scene);
  // Simulate hair in the moving guide's own space, including reverse walks and reduced-motion jumps.
  parent.updateWorldMatrix(true, true);
  for (const joint of vrm.springBoneManager?.joints ?? []) {
    joint.center = parent;
    if (!joint.bone.name.includes('Hair')) {
      joint.settings.dragForce = 0.72;
      joint.settings.stiffness = Math.max(joint.settings.stiffness, 1.6);
    }
  }
  vrm.springBoneManager?.reset();
  const hips = bones.hips.position.clone();
  let phase = 0,
    clock = 0,
    walk = 0,
    gesture = 0,
    opening = 0,
    wave = 0;
  return function animate({ dt, meters, walking, index, audio, welcome, turnToArt, reduced }) {
    clock += dt;
    phase += (meters * Math.PI * 2) / 1.27;
    walk = T.MathUtils.damp(walk, walking ? 1 : 0, 12, dt);
    const speaking = !audio.paused && !audio.ended;
    const point = speaking ? 0.6 + 0.4 * Math.sin(Math.min(audio.currentTime, 20) * 0.88) : 0.34;
    gesture = T.MathUtils.damp(gesture, walking || welcome ? 0 : point, 4, dt);
    wave = T.MathUtils.damp(wave, welcome ? 1 : 0, 4, dt);
    const swing = Math.sin(phase) * walk;
    for (const [side, dir] of [
      ['left', 1],
      ['right', -1]
    ]) {
      const step = swing * dir;
      const knee = Math.max(0, Math.cos(phase) * dir) * 0.68 * walk;
      rotate(side + 'UpperLeg', -0.49 * step, 0, 0);
      rotate(side + 'LowerLeg', knee, 0, 0);
      rotate(side + 'Foot', 0.24 * step - 0.5 * knee, 0, 0);
      const present = dir === Math.sign(turnToArt) ? gesture : 0;
      const greet = side === 'right' ? wave : 0;
      rotate(
        side + 'UpperArm',
        0.36 * step - 0.2 * present,
        dir * 0.06,
        -dir * (1.26 - 0.86 * present - 0.57 * greet)
      );
      rotate(
        side + 'LowerArm',
        -0.06 - 0.25 * present,
        dir * (-0.17 - 0.32 * present),
        dir * (0.07 + 0.35 * present + 1.83 * greet)
      );
      rotate(side + 'Hand', 0, dir * 0.12, dir * (present * 0.18 + greet * Math.sin(clock * 5) * 0.16));
    }
    const breathe = reduced ? 0 : Math.sin(clock * 1.85);
    bones.hips.position.set(hips.x + 0.016 * swing, hips.y + 0.028 * Math.abs(swing), hips.z);
    rotate('hips', 0.045 * walk, 0.105 * swing, 0.034 * swing);
    rotate('chest', -0.04 * walk + 0.008 * breathe, -0.12 * swing, 0.014 * breathe);
    rotate('head', 0.018 * breathe, turnToArt * 0.24 * gesture, 0.025 * breathe);
    const cues = walking ? walkLines[index].mouth : mouthCues[index];
    const mouth = speaking && cues?.[Math.floor(audio.currentTime * 16)] === '1' ? 0.54 : 0;
    opening = T.MathUtils.damp(opening, mouth, 24, dt);
    const blink = clock % 4.56;
    vrm.expressionManager.setValue('aa', opening);
    vrm.expressionManager.setValue('blink', reduced ? 0 : Math.max(0, 1 - Math.abs(blink - 0.15) / 0.11));
    vrm.expressionManager.setValue('happy', welcome ? 0.19 : 0.11);
    parent.updateWorldMatrix(true, false);
    vrm.update(Math.min(dt, 0.05));
  };
}
