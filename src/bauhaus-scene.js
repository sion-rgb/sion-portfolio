import * as THREE from 'three';

// Four solid parts share the same axle; the exploded view reveals their order.
export function createBauhausAssembly(){
  const root=new THREE.Group();
  const paint=color=>new THREE.MeshStandardMaterial({color,roughness:.37,metalness:.2});
  const red=paint(0xd52a20),blue=paint(0x1943d4),yellow=paint(0xf4bd20);
  const iron=new THREE.MeshStandardMaterial({color:0x292d37,roughness:.43,metalness:.62});
  const steel=new THREE.MeshStandardMaterial({color:0xb5bcc7,roughness:.26,metalness:.8});
  const dark=paint(0x141821);
  const part=()=>{const group=new THREE.Group();root.add(group);return group;};
  function mesh(parent,geometry,material,x,y,z){
    const object=new THREE.Mesh(geometry,material);
    object.position.set(x,y,z);parent.add(object);return object;
  }
  const box=(parent,material,x,y,z,w,h,d)=>mesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);
  const disc=(parent,material,r,depth,z)=>{const object=mesh(parent,new THREE.CylinderGeometry(r,r,depth,64),material,0,0,z);object.rotation.x=Math.PI/2;return object;};
  box(root,iron,0,-1.58,0,4.64,.24,2.12);
  for(const x of [-1.75,1.75])box(root,dark,x,-1.77,0,.64,.16,1.62);
  box(root,iron,0,.14,-.55,3.55,.36,.45);
  const upright=part();
  box(upright,blue,0,-.12,0,.82,2.7,.72);
  box(upright,steel,0,-1.34,0,1.17,.18,1.05);
  box(upright,blue,.22,1.16,0,1.26,.25,.72);
  const brace=part();
  const triangle=new THREE.Shape();
  triangle.moveTo(-.56,0);triangle.lineTo(.9,0);triangle.lineTo(-.56,2.15);triangle.closePath();
  mesh(brace,new THREE.ExtrudeGeometry(triangle,{depth:.57,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1}),yellow,0,-1.45,-.29);
  const wheel=part();
  disc(wheel,red,1.23,.37,0);
  mesh(wheel,new THREE.TorusGeometry(1.04,.022,8,64),steel,0,0,.19);
  disc(wheel,iron,.41,.17,.2);
  const bolt=new THREE.CylinderGeometry(.063,.063,.045,6);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    mesh(wheel,bolt,steel,.84*Math.cos(a),.84*Math.sin(a),.206).rotation.x=Math.PI/2;
  }
  const hub=part();
  disc(hub,steel,.28,.29,0);
  disc(hub,dark,.135,.042,.158);
  disc(hub,steel,.061,.047,.174);
  return {root,update({time,assembly},aspect){
    root.scale.setScalar(Math.min(1.33,aspect*1.08));
    root.rotation.set(.28,-.42+Math.sin(time*.55)*.15,-.08);
    upright.position.set(-1.45-.7*assembly,0,-.25);
    brace.position.set(1.16+.58*assembly,0,-.13);
    wheel.position.set(-.16,.04+.88*assembly,.4+.22*assembly);
    wheel.rotation.z=time*.16;
    hub.position.set(-.16+1.04*assembly,.04+.31*assembly,.77+.83*assembly);
  }};
}
