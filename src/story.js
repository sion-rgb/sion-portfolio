const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
const mix=(a,b,t)=>a+(b-a)*t;

// DOM, CSS depth layers and WebGL share one interaction state. No GPU is
// required for scrolling, keyboard exploration, pause or lens disassembly.
export function initStory(){
  const story=document.querySelector('.story');
  const stage=document.querySelector('.story-sticky');
  const host=document.querySelector('#scene-host');
  const panels=[...document.querySelectorAll('[data-chapter]')];
  const jumps=[...document.querySelectorAll('[data-jump]')];
  const motion=document.querySelector('#scene-motion');
  const style=document.querySelector('#scene-style');
  const status=document.querySelector('#scene-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const navigation=[...document.querySelectorAll('.desktop-nav a')];
  const sections=['home','work','projects','about','contact'].map(id=>document.getElementById(id));
  let paused=reduced.matches,disassembled=false,dragging=false,lastX=0,lastY=0;
  let turn=0,tilt=0,time=0,lastFrame=0,frame=0,graphics=null,disposed=false,active=-1;
  document.documentElement.classList.add('enhanced');
  host.dataset.renderer='css-depth';
  document.querySelector('#aperture-blades').innerHTML=Array.from({length:9},(_,i)=>`<path d="M 250 95 C 351 105 401 167 393 245 L 293 198 Q 238 201 250 95" fill="${i%2?'#38453f':'#293a34'}" stroke="#97a38f" stroke-opacity=".25" transform="rotate(${i*40} 250 250)"/>`).join('');
  document.querySelector('#lens-ticks').innerHTML=Array.from({length:80},(_,i)=>`<line x1="250" y1="${i%5?51:43}" x2="250" y2="${i%5?58:61}" stroke="#f4ebd8" stroke-width="${i%5?1:2}" opacity=".75" transform="rotate(${i*4.5} 250 250)"/>`).join('');

  const poses=[{rx:.20,ry:-.28,scale:1,explode:0},{rx:.12,ry:-.64,scale:.92,explode:.4},{rx:-.2,ry:.86,scale:.84,explode:1.2},{rx:-.25,ry:-.28,scale:.97,explode:.16}];
  const colors=['#29291f','#191f1b','#b6492b','#263e33'];
  function controls(){
    motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?'播放 ▷':'暫停 Ⅱ';motion.setAttribute('aria-label',paused?'播放自動動畫':'暫停自動動畫');
    style.setAttribute('aria-pressed',String(disassembled));style.textContent=disassembled?'組合鏡頭 −':'拆解鏡頭 ＋';
    status.textContent=reduced.matches?'減少動態 · 仍可拖曳與捲動':'拖曳鏡頭，換個角度。';
    schedule();
  }
  function render(now){
    frame=0;if(disposed||document.hidden)return;
    const rect=story.getBoundingClientRect(),height=stage.offsetHeight;
    const inView=rect.top<innerHeight&&rect.bottom>0;
    const p=clamp(-rect.top/Math.max(1,rect.height-height))*3;
    const chapter=Math.round(p);
    if(chapter!==active){
      active=chapter;panels.forEach((panel,i)=>{const selected=i===chapter;panel.classList.toggle('active',selected);panel.inert=!selected;panel.setAttribute('aria-hidden',String(!selected));});
      jumps.forEach((button,i)=>{if(i===chapter)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
      stage.style.setProperty('--story-color',colors[chapter]);
      host.dataset.chapter=String(chapter);
    }
    const dt=lastFrame?Math.min((now-lastFrame)/1000,.04):0;lastFrame=now;
    if(inView&&!paused&&!dragging)time+=dt;
    const segment=Math.min(2,Math.floor(p)),t=p-segment;
    const a=poses[segment],b=poses[segment+1];
    const isMobile=innerWidth<=780;
    const state={rx:mix(a.rx,b.rx,t)+tilt,ry:mix(a.ry,b.ry,t)+turn+Math.sin(time*.3)*.06,rz:-.22+Math.sin(time*.22)*.025,scale:mix(a.scale,b.scale,t),explode:disassembled?1.4:mix(a.explode,b.explode,t),p,time,mobile:isMobile};
    stage.style.setProperty('--story-p',String(p/3));
    stage.style.setProperty('--bench-opacity',String(1-clamp(p*1.65)));
    stage.style.setProperty('--scene-tilt',`${state.rx*180/Math.PI}deg`);
    stage.style.setProperty('--scene-turn',`${state.ry*180/Math.PI}deg`);
    stage.style.setProperty('--scene-scale',String(state.scale));
    stage.style.setProperty('--explode',String(state.explode));
    const y=isMobile?Math.sin(time*.4)*3:Math.sin(time*.4)*7;
    stage.style.setProperty('--scene-y',`${y}px`);
    if(inView)graphics?.render(state);
    // Header follows the surface actually underneath it, including anchor jumps.
    let current=sections[0];for(const section of sections){if(section.getBoundingClientRect().top<=120)current=section;}
    document.body.classList.toggle('light-header',['work','about'].includes(current.id)||document.querySelector('#experience').getBoundingClientRect().top<=120&&document.querySelector('#contact').getBoundingClientRect().top>120);
    navigation.forEach(link=>link.classList.toggle('current',link.hash===`#${current.id}`));
    if(inView&&!paused)frame=requestAnimationFrame(render);
  }
  function schedule(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(render);}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{lastFrame=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  motion.addEventListener('click',()=>{paused=!paused;controls();});
  style.addEventListener('click',()=>{disassembled=!disassembled;controls();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;controls();});
  function jump(chapter){const top=story.getBoundingClientRect().top+scrollY;const travel=story.offsetHeight-stage.offsetHeight;window.scrollTo({top:top+travel*chapter/3,behavior:reduced.matches?'instant':'smooth'});}
  jumps.forEach(button=>button.addEventListener('click',()=>jump(Number(button.dataset.jump))));
  if(location.hash==='#intro')jump(1);
  const release=()=>{dragging=false;schedule();};
  host.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;dragging=true;lastX=event.clientX;lastY=event.clientY;if(event.pointerType==='mouse')host.setPointerCapture(event.pointerId);});
  host.addEventListener('pointermove',event=>{if(!dragging)return;turn+=(event.clientX-lastX)*.005;tilt=clamp(tilt+(event.clientY-lastY)*.003,-.65,.65);lastX=event.clientX;lastY=event.clientY;schedule();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>host.addEventListener(name,release));window.addEventListener('blur',release);
  host.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')turn-=.18;if(event.key==='ArrowRight')turn+=.18;if(event.key==='ArrowUp')tilt=clamp(tilt-.12,-.65,.65);if(event.key==='ArrowDown')tilt=clamp(tilt+.12,-.65,.65);schedule();});
  import('./scene.js').then(({initScene})=>{if(!disposed){graphics=initScene(host,schedule);schedule();}}).catch(()=>{host.dataset.renderer='css-depth';});
  window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;cancelAnimationFrame(frame);graphics?.dispose();},{once:true});
  controls();
}
