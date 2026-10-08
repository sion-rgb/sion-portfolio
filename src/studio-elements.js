import * as THREE from 'three';

// Original workshop props, not product screenshots or third-party models.
function printTexture(kind){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=384;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#eee7d4';ctx.fillRect(0,0,512,384);
  ctx.strokeStyle='#263b30';ctx.lineWidth=2;ctx.strokeRect(24,24,464,336);
  ctx.fillStyle='#263b30';ctx.font='bold 26px Arial';ctx.fillText(kind===0?'FRAME / 01':'IDEAS MADE VISIBLE',42,64);
  if(kind===0){
    ctx.fillStyle='#253f32';ctx.fillRect(42,90,428,220);
    ctx.strokeStyle='#bbc7a8';ctx.lineWidth=1;
    for(let i=1;i<6;i++){ctx.beginPath();ctx.moveTo(42+i*71,90);ctx.lineTo(42+i*71,310);ctx.stroke();}
    for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(42,90+i*55);ctx.lineTo(470,90+i*55);ctx.stroke();}
    ctx.fillStyle='#e76a3b';ctx.beginPath();ctx.arc(256,200,77,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#eee7d4';ctx.lineWidth=3;ctx.beginPath();ctx.arc(256,200,48,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#eee7d4';ctx.font='bold 32px Arial';ctx.fillText('SION',212,212);
  }else{
    ctx.fillStyle='#dc6037';ctx.fillRect(42,90,230,220);ctx.fillStyle='#264134';ctx.fillRect(290,90,180,220);
    ctx.strokeStyle='#eee7d4';ctx.lineWidth=6;
    for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(157-Math.cos(a)*22,200-Math.sin(a)*22);ctx.lineTo(157+Math.cos(a)*72,200+Math.sin(a)*72);ctx.stroke();}
    ctx.fillStyle='#eee7d4';ctx.font='bold 42px Arial';ctx.fillText('MAKE',310,169);ctx.fillText('IT',310,221);ctx.fillText('REAL.',310,273);
  }
  ctx.fillStyle='#263b30';ctx.font='16px Arial';ctx.fillText('CREATIVE WORKBENCH / HONG KONG',42,344);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

export function createStudioElements(){
  const root=new THREE.Group();root.name='OrbitingCreativeTools';
  const metal=new THREE.MeshStandardMaterial({color:0x253a2d,roughness:.36,metalness:.65});
  const orange=new THREE.MeshStandardMaterial({color:0xe26636,roughness:.42,metalness:.25});
  const cream=new THREE.MeshStandardMaterial({color:0xece5d1,roughness:.7,metalness:.08});
  const ink=new THREE.LineBasicMaterial({color:0xc0c7a6,transparent:true,opacity:.45});
  const box=new THREE.BoxGeometry(1,1,1),plate=new THREE.PlaneGeometry(1,1);
  const film=new THREE.Group();film.name='PerforatedFilmFrame';root.add(film);
  const solid=(parent,x,y,sx,sy,sz,material,z=0)=>{const mesh=new THREE.Mesh(box,material);mesh.scale.set(sx,sy,sz);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
  // Shared instances keep the small machined perforations to one draw call.
  solid(film,0,0,2.5,1.9,.12,metal);
  const filmFace=new THREE.Mesh(plate,new THREE.MeshBasicMaterial({map:printTexture(0)}));filmFace.scale.set(2.2,1.5,1);filmFace.position.z=.07;film.add(filmFace);
  const holes=new THREE.InstancedMesh(box,cream,16),dummy=new THREE.Object3D();
  for(let i=0;i<16;i++){dummy.position.set(-1.08+(i%8)*.31,i<8?.84:-.84,.07);dummy.scale.set(.15,.07,.016);dummy.updateMatrix();holes.setMatrixAt(i,dummy.matrix);}holes.instanceMatrix.needsUpdate=true;film.add(holes);
  const swatches=new THREE.Group();swatches.name='FanningDesignCards';root.add(swatches);
  const cards=[];
  for(let i=0;i<3;i++){const card=new THREE.Group();solid(card,0,0,1.45,1.9,.035,i===0?cream:i===1?orange:metal);card.position.z=i*.075;swatches.add(card);cards.push(card);}
  const poster=new THREE.Mesh(plate,new THREE.MeshBasicMaterial({map:printTexture(1)}));poster.scale.set(1.36,1.04,1);poster.position.set(0,.14,.022);cards[2].add(poster);
  solid(cards[2],-.2,-.62,.8,.025,.016,cream,.025);solid(cards[2],-.32,-.73,.56,.018,.016,cream,.025);
  const code=new THREE.Group();code.name='SculptedCodeBrackets';root.add(code);
  const shape=new THREE.Shape();shape.moveTo(.42,.8);shape.lineTo(-.42,0);shape.lineTo(.42,-.8);shape.lineTo(.62,-.59);shape.lineTo(-.01,0);shape.lineTo(.62,.59);shape.closePath();
  const bracket=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035});
  const left=new THREE.Mesh(bracket,orange);left.position.x=-.9;code.add(left);
  const right=new THREE.Mesh(bracket,orange);right.rotation.z=Math.PI;right.position.x=.9;code.add(right);
  const slash=solid(code,0,0,.09,1.38,.15,cream);slash.rotation.z=-.3;
  const orbitGeometry=new THREE.BufferGeometry().setFromPoints(Array.from({length:97},(_,i)=>{const angle=i/96*Math.PI*2;return new THREE.Vector3(Math.cos(angle)*3.5,Math.sin(angle)*2.6,-.6);}));
  const orbit=new THREE.Line(orbitGeometry,ink);root.add(orbit);
  const sparks=new THREE.InstancedMesh(box,orange,18);root.add(sparks);
  function update(state,lensScale,center){
    const presence=state.accents??0;root.visible=presence>.01;if(!root.visible)return;
    root.position.copy(center);root.scale.setScalar(lensScale*presence);root.rotation.set(state.rx*.35,state.ry*.25,0);
    const time=state.time,mode=state.studioMode??0;
    film.position.set(-2.9+Math.sin(time*.38)*.18,(state.compact?-.2:1.35)+Math.cos(time*.42)*.16,.25);film.rotation.set(.13,Math.sin(time*.35)*.28,-.2+Math.sin(time*.22)*.08);film.scale.setScalar(mode===0?1.13:.8);
    swatches.position.set(2.8+Math.cos(time*.3)*.18,.85+Math.sin(time*.45)*.24,.5);swatches.rotation.set(.15,-.23,Math.sin(time*.32)*.12);swatches.scale.setScalar(mode===1?1.2:.82);
    cards.forEach((card,i)=>{card.rotation.z=(i-1)*(.19+Math.sin(time*.55)*.045);card.position.x=(i-1)*.17;});
    code.position.set(.7+Math.sin(time*.36)*.24,-3.0+Math.sin(time*.45)*.1,.5);code.rotation.set(Math.sin(time*.34)*.2,-.25+Math.sin(time*.29)*.25,.12);code.scale.setScalar(mode>=2?1.03:.78);
    orbit.rotation.z=time*.045;
    for(let i=0;i<18;i++){const angle=i/18*Math.PI*2+time*.06;dummy.position.set(Math.cos(angle)*3.7,Math.sin(angle)*2.9,-.6);dummy.rotation.set(0,0,angle);dummy.scale.set(.035,i%3===0?.19:.07,.035);dummy.updateMatrix();sparks.setMatrixAt(i,dummy.matrix);}sparks.instanceMatrix.needsUpdate=true;
  }
  return {root,update};
}
