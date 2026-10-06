import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A sculptural ribbon: three disciplines following one continuous path.
class CreativeCurve extends THREE.Curve {
  getPoint(t, target = new THREE.Vector3()) {
    const a = t * Math.PI * 2;
    const r = 1.08 + 0.29 * Math.cos(3*a);
    return target.set(r*Math.cos(2*a), r*Math.sin(2*a), .50*Math.sin(3*a));
  }
}

function ribbonGeometry() {
  const steps=480, sides=12, curve=new CreativeCurve();
  const frames=curve.computeFrenetFrames(steps,true);
  const vertices=[],normals=[],indices=[];
  const center=new THREE.Vector3(),offset=new THREE.Vector3();
  for(let i=0;i<=steps;i++){
    const t=i/steps,twist=t*Math.PI*4,width=.19+.028*Math.sin(t*Math.PI*6);
    curve.getPoint(t,center);
    const n=frames.normals[i].clone().multiplyScalar(Math.cos(twist)).addScaledVector(frames.binormals[i],Math.sin(twist));
    const b=frames.binormals[i].clone().multiplyScalar(Math.cos(twist)).addScaledVector(frames.normals[i],-Math.sin(twist));
    for(let j=0;j<sides;j++){
      const a=j/sides*Math.PI*2;
      offset.copy(n).multiplyScalar(Math.cos(a)*width).addScaledVector(b,Math.sin(a)*.043);
      const p=center.clone().add(offset);
      vertices.push(p.x,p.y,p.z);
      offset.normalize();normals.push(offset.x,offset.y,offset.z);
      if(i<steps){const first=i*sides+j,next=i*sides+(j+1)%sides;indices.push(first,next,first+sides,next,next+sides,first+sides);}
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  return geo;
}

export function initScene(){
  const host=document.querySelector('#scene-host');
  const status=document.querySelector('#scene-status');
  const motionButton=document.querySelector('#scene-motion');
  const styleButton=document.querySelector('#scene-style');
  let renderer;
  try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'}); }
  catch {status.textContent='靜態雕塑 · 內容照常可瀏覽';motionButton.disabled=true;styleButton.disabled=true;return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.65));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.15;
  renderer.domElement.setAttribute('aria-hidden','true');
  host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1,.1,50);
  camera.position.set(0,0,5.75);
  let env;
  function rebuildEnvironment(){
    const pmrem=new THREE.PMREMGenerator(renderer);
    const room=new RoomEnvironment();
    try{
      const next=pmrem.fromScene(room,.04);
      env?.dispose();env=next;scene.environment=env.texture;
    }finally{room.dispose();pmrem.dispose();}
  }
  rebuildEnvironment();
  const group=new THREE.Group();scene.add(group);
  const material=new THREE.MeshPhysicalMaterial({color:0xc1a779,metalness:1,roughness:.23,clearcoat:.55,clearcoatRoughness:.25,envMapIntensity:1.4,side:THREE.DoubleSide});
  const sculpture=new THREE.Mesh(ribbonGeometry(),material);
  sculpture.rotation.set(-.24,.35,.12);group.add(sculpture);
  const inner=new THREE.Mesh(new THREE.TorusGeometry(.66,.011,8,180),new THREE.MeshStandardMaterial({color:0xe4d7b4,metalness:.8,roughness:.35}));
  inner.rotation.set(.9,-.5,.35);group.add(inner);
  const orbit=new THREE.Mesh(new THREE.TorusGeometry(1.73,.004,6,180),new THREE.MeshBasicMaterial({color:0x746b51,transparent:true,opacity:.42}));
  orbit.rotation.set(1.07,.22,-.25);group.add(orbit);
  const accentMaterial=new THREE.MeshStandardMaterial({color:0xd4c29a,metalness:1,roughness:.18});
  const accents=[];
  for(let i=0;i<3;i++){
    const mesh=new THREE.Mesh(new THREE.SphereGeometry(.042,16,12),accentMaterial);
    accents.push(mesh);group.add(mesh);
  }
  const key=new THREE.DirectionalLight(0xffedc9,5);key.position.set(-3,4,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe2e9d9,3);fill.position.set(3,-1,2);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xffdfac,4);rim.position.set(-2,-2,-3);scene.add(rim);
  const points=[];
  for(let i=0;i<80;i++) { const a=i*2.39996323,r=1.8+(i%7)*.13;points.push(Math.cos(a)*r,Math.sin(a)*r,(i%5-2)*.35); }
  const dustGeo=new THREE.BufferGeometry();dustGeo.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0x979780,size:.012,transparent:true,opacity:.4}));scene.add(dust);

  let reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let paused=reduce,visible=true,angle=.16,tilt=-.05,pointerDown=false,lastX=0,lastY=0,elapsed=0,lastTime=0;
  let disposed=false,contextLost=false;
  function render(){
    if(disposed||contextLost)return;
    group.rotation.y=angle;group.rotation.x=tilt;
    group.position.y=.04+Math.sin(elapsed*.38)*.035;
    dust.rotation.z=elapsed*.015;
    accents.forEach((mesh,i)=>{const a=elapsed*.15+i*Math.PI*2/3;mesh.position.set(Math.cos(a)*1.74,Math.sin(a)*.72,Math.sin(a)*1.4);});
    renderer.render(scene,camera);
  }
  function animate(time){
    const dt=lastTime?Math.min((time-lastTime)/1000,.04):0;lastTime=time;
    if(!paused&&!pointerDown){elapsed+=dt;angle+=dt*.09;}
    render();
  }
  function syncLoop(){lastTime=0;renderer.setAnimationLoop(!disposed&&!contextLost&&!paused&&visible&&!document.hidden?animate:null);if(visible)render();}
  function updateMotion(){motionButton.textContent=paused?'播放 ▷':'暫停 Ⅱ';motionButton.setAttribute('aria-pressed',String(paused));motionButton.setAttribute('aria-label',paused?'播放雕塑動畫':'暫停雕塑動畫');status.textContent=reduce?'減少動態 · 可拖曳旋轉':'拖曳探索 · 方向鍵旋轉';syncLoop();}
  function resizeScene(){
    if(disposed||contextLost)return;
    const {width,height}=host.getBoundingClientRect();
    if(width===0||height===0)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();
  }
  const resizeObserver=new ResizeObserver(resizeScene);resizeObserver.observe(host);
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncLoop();},{threshold:.05});intersection.observe(host);
  document.addEventListener('visibilitychange',syncLoop);
  motionButton.addEventListener('click',()=>{paused=!paused;updateMotion();});
  styleButton.addEventListener('click',()=>{material.wireframe=!material.wireframe;styleButton.setAttribute('aria-pressed',String(material.wireframe));styleButton.textContent=material.wireframe?'金屬':'線稿';render();});
  host.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'||event.isPrimary){pointerDown=true;lastX=event.clientX;lastY=event.clientY;host.setPointerCapture(event.pointerId);}});
  host.addEventListener('pointermove',event=>{if(!pointerDown)return;angle+=(event.clientX-lastX)*.007;tilt=THREE.MathUtils.clamp(tilt+(event.clientY-lastY)*.003,-.7,.7);lastX=event.clientX;lastY=event.clientY;render();});
  const release=()=>{pointerDown=false;};host.addEventListener('pointerup',release);host.addEventListener('pointercancel',release);
  host.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(event.key==='ArrowLeft')angle-=.15;if(event.key==='ArrowRight')angle+=.15;if(event.key==='ArrowUp')tilt=THREE.MathUtils.clamp(tilt-.1,-.7,.7);if(event.key==='ArrowDown')tilt=THREE.MathUtils.clamp(tilt+.1,-.7,.7);render();}});
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{reduce=event.matches;paused=reduce;updateMotion();});
  function showFallback(){
    contextLost=true;pointerDown=false;renderer.setAnimationLoop(null);
    host.classList.remove('scene-ready');host.dataset.renderer='static-fallback';
    status.textContent='靜態雕塑 · 內容照常可瀏覽';
    motionButton.disabled=true;styleButton.disabled=true;
  }
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();showFallback();});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{
    if(disposed)return;
    try{
      // GPU-generated environment maps must be recreated after context recovery.
      rebuildEnvironment();contextLost=false;resizeScene();
      host.classList.add('scene-ready');host.dataset.renderer='three-webgl';
      motionButton.disabled=false;styleButton.disabled=false;updateMotion();
    }catch{showFallback();}
  });
  host.classList.add('scene-ready');updateMotion();render();
  // Read-only diagnostics used to verify that a real WebGL scene rendered.
  host.dataset.renderer='three-webgl';host.dataset.threeRevision=THREE.REVISION;
  host.dataset.triangles=String(renderer.info.render.triangles);
  window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;renderer.setAnimationLoop(null);resizeObserver.disconnect();intersection.disconnect();scene.traverse(object=>{object.geometry?.dispose();if(object.material){const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(mat=>mat.dispose());}});env.dispose();renderer.dispose();},{once:true});
}
