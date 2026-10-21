import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
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

function createWabiGarden(onTextureReady=()=>{}){
  const root=new THREE.Group();root.name='WabiSabiGarden';
  const makeMaterial=(color,roughness=.94)=>new THREE.MeshStandardMaterial({color,roughness,metalness:0});
  const moss=makeMaterial(0x596753),mossLight=makeMaterial(0x77806a),stoneTexture=new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/wabi-stone-moss.png`,onTextureReady);
  stoneTexture.colorSpace=THREE.SRGBColorSpace;stoneTexture.wrapS=stoneTexture.wrapT=THREE.RepeatWrapping;stoneTexture.repeat.set(1.35,1.35);
  const stone=new THREE.MeshPhysicalMaterial({color:0xaaa391,map:stoneTexture,bumpMap:stoneTexture,bumpScale:.025,roughness:.84,metalness:.01,clearcoat:.08,clearcoatRoughness:.8,envMapIntensity:.45}),stoneLight=new THREE.MeshPhysicalMaterial({color:0xb8ad98,map:stoneTexture,bumpMap:stoneTexture,bumpScale:.018,roughness:.76,metalness:.01,clearcoat:.12,clearcoatRoughness:.7,envMapIntensity:.52}),dark=new THREE.MeshPhysicalMaterial({color:0x62695c,map:stoneTexture,bumpMap:stoneTexture,bumpScale:.03,roughness:.9,clearcoat:.06,clearcoatRoughness:.85,envMapIntensity:.4});
  const moon=new THREE.Mesh(new THREE.CircleGeometry(1.08,64),new THREE.MeshBasicMaterial({color:0xe8dfca}));moon.position.set(3.4,2.18,-4.2);root.add(moon);
  function ridge(points,z,color){const shape=new THREE.Shape();shape.moveTo(points[0][0],points[0][1]);for(const point of points.slice(1))shape.lineTo(point[0],point[1]);shape.lineTo(points.at(-1)[0],-7);shape.lineTo(points[0][0],-7);shape.closePath();const mesh=new THREE.Mesh(new THREE.ShapeGeometry(shape,24),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));mesh.position.z=z;root.add(mesh);return mesh;}
  ridge([[-9,-.15],[-7,1.1],[-5,.48],[-3,1.5],[-.4,.35],[1.8,1.2],[4,.3],[6,1.5],[9,.15]],-4.5,0xc9c4b2);
  ridge([[-9,-.65],[-6,.05],[-4,-.45],[-1,.35],[1,-.35],[3,.24],[5,-.2],[7,.7],[9,-.4]],-3.8,0xbab9a7);
  const waterShader={...Reflector.ReflectorShader,uniforms:{...Reflector.ReflectorShader.uniforms,uTime:{value:0}},fragmentShader:Reflector.ReflectorShader.fragmentShader.replace('uniform sampler2D tDiffuse;','uniform sampler2D tDiffuse;\nuniform float uTime;').replace('vec4 base = texture2DProj( tDiffuse, vUv );','vec2 ripple = vec2( sin(vUv.y * 90.0 + uTime * 0.45), cos(vUv.x * 75.0 - uTime * 0.32) ) * 0.0012;\n\t\t\tvec4 base = texture2DProj( tDiffuse, vUv + vec4( ripple * vUv.w, 0.0, 0.0 ) );')};
  const water=new Reflector(new THREE.PlaneGeometry(22,4.5,64,24),{clipBias:.003,textureWidth:innerWidth<=780?256:512,textureHeight:innerWidth<=780?256:512,multisample:innerWidth<=780?0:2,color:0x778271,shader:waterShader});
  water.position.set(0,-2.55,-1.8);water.material.uniforms.uTime.value=0;let reflectionFrame=0;const reflect=water.onBeforeRender;water.onBeforeRender=function(...args){if(reflectionFrame++%2===0)reflect.apply(this,args);};root.add(water);
  const bank=new THREE.Mesh(new THREE.CircleGeometry(2.65,80),makeMaterial(0xaaa58f));bank.scale.set(1.9,.46,1);bank.position.set(2.45,-2.12,-.8);root.add(bank);
  const sand=new THREE.Mesh(new THREE.CircleGeometry(2.3,80),makeMaterial(0xc9c0ab));sand.scale.set(1.9,.4,1);sand.position.set(2.42,-2.06,-.7);root.add(sand);
  const pebbleGeo=new THREE.SphereGeometry(1,28,20);
  function rock(x,y,sx,sy,sz,material,seed){const geometry=pebbleGeo.clone();const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const wave=Math.sin(p.getX(i)*5.1+seed)*Math.cos(p.getY(i)*6.3-seed*.7)*.055;p.setXYZ(i,p.getX(i)*(1+wave),p.getY(i)*(1+wave*.7),p.getZ(i)*(1+wave));}geometry.computeVertexNormals();const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,sz);mesh.scale.set(sx,sy,sx*.66);root.add(mesh);return mesh;}
  rock(1.25,-1.05,1.02,.78,.18,stone,1);rock(2.58,-.83,.78,.98,.05,stoneLight,2.2);rock(3.72,-1.18,.92,.62,.24,dark,3.1);rock(4.65,-1.43,.48,.36,.12,stone,4.8);
  // A small sculpted pine balances the stones and holds the scene's center of gravity.
  const branchMaterial=makeMaterial(0x4d5044);const branches=[[[3.48,-.75,.28],[3.18,-.1,.24],[3.24,.55,.18],[2.76,1.02,.1]],[[3.24,.47,.18],[3.83,.92,.1],[4.2,1.32,.04]],[[3.19,-.03,.24],[2.68,.23,.18],[2.35,.72,.08]],[[3.36,.1,.19],[3.78,.38,.12],[4.5,.56,.02]],[[2.98,.79,.14],[2.58,1.25,.08],[2.15,1.48,.02]]];
  for(const points of branches){const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point)));root.add(new THREE.Mesh(new THREE.TubeGeometry(curve,24,.035,7,false),branchMaterial));}
  for(const [x,y,s] of [[2.66,1.13,.39],[2.26,1.49,.34],[3.22,.77,.43],[3.93,1.05,.37],[4.4,.62,.35],[2.48,.61,.29],[3.83,.26,.3]]){const canopy=new THREE.Mesh(pebbleGeo,moss);canopy.position.set(x,y,.04);canopy.scale.set(s*1.35,s*.48,s*.46);root.add(canopy);const tuft=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),mossLight);tuft.position.set(x-s*.18,y+s*.28,.12);root.add(tuft);}
  for(let i=0;i<7;i++){const x=-1.2+i*.49,y=-2.5+(i%2)*.06;const ring=new THREE.Mesh(new THREE.TorusGeometry(.18+(i%3)*.1,.012,5,36),makeMaterial(0x787967));ring.scale.y=.34;ring.position.set(x,y,.15);root.add(ring);}
  return {root,update(time){water.material.uniforms.uTime.value=time;root.rotation.y=Math.sin(time*.12)*.012;}};
}

export function initScene(host,onReady){
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}
  catch(error){host.dataset.renderer='css-depth';host.dataset.rendererError='webgl-unavailable';return null;}
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(35,1,.1,50);camera.position.set(0,0,12.5);
  let environment,contextLost=false,disposed=false,lastState=null,width=0,height=0,renderCount=0,hdrLoading=false,activeWabi=false;
  function rebuildEnvironment(){
    const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
    try{const next=pmrem.fromScene(room,.04);environment?.dispose();environment=next;scene.environment=next.texture;}
    finally{room.dispose();pmrem.dispose();}
  }
  rebuildEnvironment();
  const lens=createLens();scene.add(lens.root);
  const studio=createStudioElements();scene.add(studio.root);
  const garden=createWabiGarden(onReady);scene.add(garden.root);garden.root.visible=false;
  function loadWabiEnvironment(){
    if(hdrLoading||host.dataset.hdri==='loaded'||host.dataset.hdri==='failed')return;
    hdrLoading=true;new RGBELoader().load(`${import.meta.env.BASE_URL}assets/wabi-studio-1k.hdr`,texture=>{
      hdrLoading=false;if(disposed){texture.dispose();return;}texture.mapping=THREE.EquirectangularReflectionMapping;const pmrem=new THREE.PMREMGenerator(renderer);
      try{const next=pmrem.fromEquirectangular(texture);environment?.dispose();environment=next;scene.environment=next.texture;host.dataset.hdri='loaded';}
      catch{host.dataset.hdri='failed';}
      finally{texture.dispose();pmrem.dispose();onReady();}
    },undefined,()=>{hdrLoading=false;host.dataset.hdri='failed';onReady();});
  }
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
    const wabi=state.theme==='wabi';garden.root.visible=wabi;lens.root.visible=!wabi;studio.root.visible=!wabi;
    if(wabi){if(!activeWabi){activeWabi=true;scene.background=new THREE.Color(0xd9d1c0);loadWabiEnvironment();}garden.update(state.time);camera.position.set(0,0,12.5);camera.fov=35;camera.updateProjectionMatrix();renderer.render(scene,camera);host.dataset.frames=String(++renderCount);host.dataset.calls=String(renderer.info.render.calls);return;}
    if(activeWabi){activeWabi=false;scene.background=null;}renderer.setClearColor(0x000000,0);
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
  function fallback(reason){contextLost=true;host.classList.remove('scene-ready');host.dataset.renderer='css-depth';host.dataset.rendererError=reason;onReady();}
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback('webgl-context-lost');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{
    if(disposed)return;try{rebuildEnvironment();contextLost=false;resize();host.classList.add('scene-ready');host.dataset.renderer='three-webgl';delete host.dataset.rendererError;onReady();}catch{fallback('webgl-restore-failed');}
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
