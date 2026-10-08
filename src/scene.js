import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createStudioElements } from './studio-elements.js';

function annulus(outer,inner,depth){
  const shape=new THREE.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);
  const hole=new THREE.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);
  return new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.028,bevelThickness:.025,curveSegments:96});
}

function brushedTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');let seed=8031;
  for(let y=0;y<256;y++){seed=(seed*16807)%2147483647;const v=130+seed%55;ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(0,y,256,1);}
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(3,3);return texture;
}

function dialTexture(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
  const ctx=canvas.getContext('2d');ctx.translate(512,512);ctx.fillStyle='#f4ead8';
  const text='SION NG  •  CREATIVE OPTICS  •  13+ YEARS  •  FRAME / MAKE / PLAY  •  ';
  ctx.font='bold 21px Arial';ctx.textAlign='center';
  for(let i=0;i<text.length;i++){ctx.save();ctx.rotate(i/text.length*Math.PI*2-.1);ctx.fillText(text[i],0,-438);ctx.restore();}
  ctx.font='bold 15px Arial';ctx.fillText('01   /   HONG KONG   /   2026',0,345);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

function createLens(){
  const root=new THREE.Group();root.name='CreativeOptics';
  const grain=brushedTexture();
  const materials={
    shell:new THREE.MeshPhysicalMaterial({color:0xd74b22,roughness:.36,metalness:.2,clearcoat:.75,clearcoatRoughness:.22,roughnessMap:grain}),
    body:new THREE.MeshStandardMaterial({color:0x1b2923,metalness:.85,roughness:.36,roughnessMap:grain}),
    trim:new THREE.MeshStandardMaterial({color:0xb8bda3,metalness:1,roughness:.28}),
    blade:new THREE.MeshStandardMaterial({color:0x66746b,metalness:1,roughness:.42,roughnessMap:grain,side:THREE.DoubleSide}),
    glass:new THREE.MeshPhysicalMaterial({color:0x1a4949,metalness:.72,roughness:.1,clearcoat:1,iridescence:.65,iridescenceIOR:1.36,iridescenceThicknessRange:[120,390]}),
    marks:new THREE.MeshBasicMaterial({color:0xf4ead8}),
    label:new THREE.MeshBasicMaterial({map:dialTexture(),transparent:true,depthWrite:false,side:THREE.DoubleSide}),
    shadow:new THREE.MeshBasicMaterial({color:0x101711,transparent:true,opacity:.25,depthWrite:false}),
  };
  const layers=Array.from({length:4},()=>new THREE.Group());layers.forEach((group,i)=>{group.name=`OpticalLayer${i}`;root.add(group);});
  const addRing=(layer,outer,inner,depth,material,z)=>{const mesh=new THREE.Mesh(annulus(outer,inner,depth),material);mesh.position.z=z;layer.add(mesh);return mesh;};
  addRing(layers[0],1.91,1.26,.15,materials.body,-.62);
  addRing(layers[0],1.86,1.68,.04,materials.trim,-.45);
  addRing(layers[1],2.07,1.52,.42,materials.body,-.42);
  addRing(layers[1],2.10,1.95,.035,materials.trim,-.23);
  addRing(layers[2],2.22,1.70,.20,materials.shell,.04);
  addRing(layers[2],2.18,2.14,.012,materials.trim,.265);
  addRing(layers[3],1.70,1.48,.075,materials.body,.285);
  addRing(layers[3],1.53,1.48,.015,materials.trim,.38);

  const knobs=new THREE.InstancedMesh(new THREE.BoxGeometry(.042,.10,.34),materials.body,120);
  const matrix=new THREE.Object3D();
  for(let i=0;i<120;i++){const a=i/120*Math.PI*2;matrix.position.set(Math.sin(a)*2.083,Math.cos(a)*2.083,-.22);matrix.rotation.z=-a;matrix.updateMatrix();knobs.setMatrixAt(i,matrix.matrix);}
  knobs.instanceMatrix.needsUpdate=true;layers[1].add(knobs);
  const ticks=new THREE.InstancedMesh(new THREE.BoxGeometry(.013,.09,.008),materials.marks,80);
  for(let i=0;i<80;i++){const a=i/80*Math.PI*2;matrix.position.set(Math.sin(a)*1.93,Math.cos(a)*1.93,.258);matrix.rotation.z=-a;matrix.scale.set(1,i%5===0?1.75:1,1);matrix.updateMatrix();ticks.setMatrixAt(i,matrix.matrix);}
  ticks.instanceMatrix.needsUpdate=true;layers[2].add(ticks);
  const label=new THREE.Mesh(new THREE.PlaneGeometry(4.3,4.3),materials.label);label.position.z=.266;layers[2].add(label);

  const glass=new THREE.Mesh(new THREE.SphereGeometry(1.49,64,32),materials.glass);glass.scale.z=.10;glass.position.z=.42;layers[3].add(glass);
  const bladeShape=new THREE.Shape();bladeShape.moveTo(0,1.43);bladeShape.bezierCurveTo(.98,1.36,1.46,.77,1.31,0);bladeShape.lineTo(.39,.42);bladeShape.quadraticCurveTo(-.1,.40,0,1.43);
  const bladeGeometry=new THREE.ExtrudeGeometry(bladeShape,{depth:.012,bevelEnabled:true,bevelSegments:1,bevelSize:.003,bevelThickness:.003,curveSegments:16});
  const blades=[];
  for(let i=0;i<9;i++){const pivot=new THREE.Group();pivot.rotation.z=i*Math.PI*2/9;const blade=new THREE.Mesh(bladeGeometry,materials.blade);blade.position.z=.58+i*.002;pivot.add(blade);layers[3].add(pivot);blades.push(pivot);}
  const center=new THREE.Mesh(new THREE.CircleGeometry(.48,64),new THREE.MeshStandardMaterial({color:0x071514,metalness:.8,roughness:.12}));center.position.z=.605;layers[3].add(center);
  const bolts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.024,.024,.013,12),materials.trim,6);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;matrix.position.set(Math.cos(a)*1.615,Math.sin(a)*1.615,.39);matrix.rotation.set(Math.PI/2,0,0);matrix.scale.set(1,1,1);matrix.updateMatrix();bolts.setMatrixAt(i,matrix.matrix);}
  bolts.instanceMatrix.needsUpdate=true;layers[3].add(bolts);
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(2.15,64),materials.shadow);shadow.position.z=-.75;root.add(shadow);
  return {root,layers,blades};
}

export function initScene(host,onReady){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}
  catch{host.dataset.renderer='css-depth';return null;}
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(35,1,.1,50);camera.position.set(0,0,12.5);
  let environment,contextLost=false,disposed=false,lastState=null,width=0,height=0,renderCount=0;
  function rebuildEnvironment(){
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
    try{const next=pmrem.fromScene(room,.04);environment?.dispose();environment=next;scene.environment=next.texture;}
    finally{room.dispose();pmrem.dispose();}
  }
  rebuildEnvironment();
  const lens=createLens();scene.add(lens.root);
  const studio=createStudioElements();scene.add(studio.root);
  const key=new THREE.DirectionalLight(0xffddae,2.8);key.position.set(-3,5,5);scene.add(key);
  const fill=new THREE.DirectionalLight(0xc5e1d2,1.8);fill.position.set(3,-2,3);scene.add(fill);
  const rim=new THREE.DirectionalLight(0xff996b,2);rim.position.set(-4,-2,-2);scene.add(rim);
  function resize(){
    if(contextLost||disposed)return;
    const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;
    width=rect.width;height=rect.height;renderer.setPixelRatio(Math.min(devicePixelRatio,width<=780?1.5:1.65));renderer.setSize(width,height,false);
    camera.aspect=width/height;camera.updateProjectionMatrix();if(lastState)render(lastState);
  }
  function render(state){
    lastState=state;if(contextLost||disposed||!width)return;
    const viewHeight=2*Math.tan(THREE.MathUtils.degToRad(35)/2)*camera.position.z,viewWidth=viewHeight*camera.aspect;
    const baseDiameter=state.diameter??(state.mobile?Math.min(width*(height<=700?.66:.77),500):Math.min(width*.42,570));
    const scale=baseDiameter/height*viewHeight/4.44*state.scale;
    lens.root.scale.setScalar(scale);
    lens.root.position.set(viewWidth*((state.centerX??(state.mobile?.51:.49))-.5),viewHeight*(.5-(state.centerY??(state.mobile?.48:.55)))+Math.sin(state.time*.4)*.03,0);
    lens.root.rotation.set(state.rx,state.ry,state.rz);
    const separation=[-.85,-.32,.33,1.0];lens.layers.forEach((group,i)=>{group.position.z=state.explode*separation[i];});
    lens.blades.forEach((blade,i)=>{blade.rotation.z=i*Math.PI*2/9+Math.sin(state.time*.3)*.055;});
    studio.update(state,scale,lens.root.position);
    renderer.render(scene,camera);
    host.dataset.frames=String(++renderCount);
    host.dataset.calls=String(renderer.info.render.calls);host.dataset.triangles=String(renderer.info.render.triangles);
    host.dataset.geometries=String(renderer.info.memory.geometries);host.dataset.textures=String(renderer.info.memory.textures);
  }
  function fallback(){contextLost=true;host.classList.remove('scene-ready');host.dataset.renderer='css-depth';onReady();}
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{
    if(disposed)return;try{rebuildEnvironment();contextLost=false;resize();host.classList.add('scene-ready');host.dataset.renderer='three-webgl';onReady();}catch{fallback();}
  });
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  host.classList.add('scene-ready');host.dataset.renderer='three-webgl';host.dataset.threeRevision=THREE.REVISION;
  function dispose(){
    disposed=true;observer.disconnect();const geometries=new Set(),materials=new Set(),textures=new Set();
    scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material){for(const mat of Array.isArray(object.material)?object.material:[object.material]){materials.add(mat);for(const value of Object.values(mat))if(value?.isTexture)textures.add(value);}}});
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());textures.forEach(texture=>texture.dispose());environment?.dispose();renderer.dispose();
  }
  return {render,dispose};
}
