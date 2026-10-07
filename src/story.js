const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=value=>1-Math.pow(1-value,3);

// One scroll clock drives the whole journey, including the CSS depth fallback.
export function initStory({selectFeature}){
  const root=document.documentElement,story=document.querySelector('.story'),stage=document.querySelector('.story-sticky');
  const host=document.querySelector('#scene-host'),bench=document.querySelector('.workbench');
  const panels=[...document.querySelectorAll('[data-chapter]')],jumps=[...document.querySelectorAll('[data-jump]')];
  const motion=document.querySelector('#scene-motion'),style=document.querySelector('#scene-style'),status=document.querySelector('#scene-status');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen=matchMedia('(max-height:480px)');
  root.classList.add('enhanced','journey');host.dataset.renderer='css-depth';
  const world=document.createElement('div');world.className='world-stage';world.setAttribute('aria-hidden','true');
  world.append(bench,host);document.body.prepend(world);
  host.removeAttribute('tabindex');host.removeAttribute('role');host.removeAttribute('aria-label');
  const input=document.createElement('div');input.className='lens-input';input.tabIndex=0;input.setAttribute('role','img');input.setAttribute('aria-label','創作鏡頭。拖曳或使用方向鍵旋轉。');stage.prepend(input);
  const dock=document.createElement('aside');dock.className='motion-dock';dock.setAttribute('aria-label','全頁動畫控制');
  dock.innerHTML='<span class="journey-label">01 / EXPLORE</span><i class="journey-meter" aria-hidden="true"></i>';
  dock.append(motion);document.body.append(dock);
  document.querySelector('#aperture-blades').innerHTML=Array.from({length:9},(_,i)=>`<path d="M 250 95 C 351 105 401 167 393 245 L 293 198 Q 238 201 250 95" fill="${i%2?'#38453f':'#293a34'}" stroke="#97a38f" stroke-opacity=".25" transform="rotate(${i*40} 250 250)"/>`).join('');
  document.querySelector('#lens-ticks').innerHTML=Array.from({length:80},(_,i)=>`<line x1="250" y1="${i%5?51:43}" x2="250" y2="${i%5?58:61}" stroke="#f4ebd8" stroke-width="${i%5?1:2}" opacity=".75" transform="rotate(${i*4.5} 250 250)"/>`).join('');

  const workGrid=document.querySelector('#creative-grid'),cases=[...workGrid.children];
  const workScroll=document.createElement('div');workScroll.className='work-scroll';workGrid.before(workScroll);workScroll.append(workGrid);
  const workNav=document.createElement('nav');workNav.className='work-reel-nav';workNav.setAttribute('aria-label','精選作品');
  workNav.innerHTML='<span class="reel-caption">SCROLL THE FILM ↓</span>'+cases.map((_,i)=>`<button data-case="${i}" aria-label="查看第 ${i+1} 件作品">0${i+1}</button>`).join('')+'<span class="reel-track" aria-hidden="true"><i></i></span>';
  workGrid.prepend(workNav);
  const workButtons=[...workNav.querySelectorAll('button')];
  cases.forEach((card,i)=>{card.dataset.caseIndex=String(i);card.style.setProperty('--case-direction',i%2?1:-1);});
  const lab=document.querySelector('.lab-showcase'),labScroll=document.createElement('div');labScroll.className='lab-scroll';lab.before(labScroll);labScroll.append(lab);
  const labButtons=[...document.querySelectorAll('[data-feature]')];
  const labGauge=document.createElement('div');labGauge.className='lab-gauge';labGauge.setAttribute('aria-hidden','true');labGauge.innerHTML='<span>SCROLL / PLAY / DISCOVER</span><i></i>';lab.append(labGauge);
  const impact=document.querySelector('.impact-section');impact.id='impact';
  const orbit=document.createElement('div');orbit.className='impact-orbit';orbit.setAttribute('aria-hidden','true');orbit.innerHTML='<i></i><i></i><i></i><span>MAKE AN IMPACT · MAKE AN IMPACT ·</span>';impact.prepend(orbit);
  const contactTitle=document.querySelector('#contact h2');contactTitle.innerHTML='<span class="contact-line">LET’S</span><span class="contact-line">CREATE<i aria-hidden="true">↗</i></span>';
  const ribbon=document.createElement('div');ribbon.className='closing-ribbon';ribbon.setAttribute('aria-hidden','true');ribbon.innerHTML='<div>'+Array.from({length:4},()=>'<span>IDEAS INTO EXPERIENCES <b>✳</b> LET’S CREATE <b>↗</b></span>').join('')+'</div>';document.querySelector('.site-footer').before(ribbon);
  const titleLines=[];
  document.querySelectorAll('.display-title').forEach(title=>{
    const lines=title.innerHTML.split(/<br\s*\/?\s*>/i);title.innerHTML=lines.map((line,i)=>`<span class="kinetic-line" style="--line-direction:${i%2?1:-1}">${line}</span>`).join('');titleLines.push(...title.children);
  });
  const reveal=[...document.querySelectorAll('.section-heading,.section-intro,.project-intro,.about-copy > *, .craft-grid > *, .contact-bottom,.contact-links,.source-note')];
  reveal.forEach(el=>el.classList.add('journey-reveal'));
  const timeline=document.querySelector('#timeline'),entries=[...timeline.children];
  const metrics=[
    {node:document.querySelector('.impact-main > strong'),value:2.7,suffix:'<span>M</span>',prefix:'',label:'270 萬總觀看次數'},
    {node:document.querySelector('.impact-bottom > div:first-child strong'),value:86.2,suffix:'K',prefix:'',label:'8.62 萬總觀看時數'},
    {node:document.querySelector('.impact-bottom > div:nth-child(2) strong'),value:40.4,suffix:'K',prefix:'+',label:'增加 4.04 萬訂閱人數'}
  ];
  metrics.forEach(item=>{item.node.setAttribute('aria-label',item.label);item.node.innerHTML=`<span class="metric-value" aria-hidden="true">${item.prefix}${item.value.toFixed(1)}${item.suffix}</span>`;item.visual=item.node.firstElementChild;});

  const regionNodes=[story,document.querySelector('#work'),impact,document.querySelector('#projects'),document.querySelector('#about'),document.querySelector('#experience'),document.querySelector('#contact'),ribbon,document.querySelector('#sources')];
  const names=['01 / EXPLORE','02 / SELECTED WORK','03 / IMPACT','04 / EXPERIMENT LAB','05 / THE HUMAN','06 / THE JOURNEY','07 / LET’S CREATE','08 / KEEP CREATING','08 / KEEP CREATING'];
  const navigation=[...document.querySelectorAll('.desktop-nav a')];
  const portraitNode=document.querySelector('.about-photo'),dockLabel=dock.querySelector('.journey-label');
  const positions=new Map();let dirty=true,stageHeight=innerHeight,workHeight=0,labHeight=0,pageTravel=1,lastRegion=-1;
  let paused=reduced.matches,disassembled=false,dragging=false,lastX=0,lastY=0,turn=0,tilt=0,pointerX=0,pointerY=0;
  let time=0,lastFrame=0,frame=0,graphics=null,disposed=false,active=-1,workActive=-1,labActive=-1,manualLab=-1,metricStart=null,metricDone=false,loadingGraphics=false;
  const poses=[{rx:.20,ry:-.28,scale:1,explode:0},{rx:.12,ry:-.64,scale:.92,explode:.4},{rx:-.2,ry:.86,scale:.84,explode:1.2},{rx:-.25,ry:-.28,scale:.97,explode:.16}];
  const colors=['#29291f','#191f1b','#b6492b','#263e33'];
  function measure(){
    const y=scrollY;[...regionNodes,workScroll,labScroll,timeline,portraitNode,...titleLines,...reveal,...entries].forEach(el=>{const r=el.getBoundingClientRect();positions.set(el,{top:r.top+y,height:r.height});});
    stageHeight=stage.offsetHeight;workHeight=workGrid.offsetHeight;labHeight=lab.offsetHeight;pageTravel=Math.max(1,root.scrollHeight-innerHeight);dirty=false;
  }
  const travel=node=>Math.max(1,node.offsetHeight-(node===story?stage.offsetHeight:node===workScroll?workGrid.offsetHeight:lab.offsetHeight));
  function jumpTo(node,index,count){const top=node.getBoundingClientRect().top+scrollY;scrollTo({top:top+travel(node)*index/(count-1),behavior:reduced.matches?'instant':'smooth'});}
  function controls(){
    root.classList.toggle('motion-paused',paused);root.classList.toggle('motion-reduced',reduced.matches);
    motion.disabled=reduced.matches;motion.setAttribute('aria-pressed',String(paused));motion.textContent=reduced.matches?'減少動態 ✓':paused?'播放動態 ▷':'暫停動態 Ⅱ';motion.setAttribute('aria-label',reduced.matches?'已依系統設定減少動態':paused?'播放全頁自動動態':'暫停全頁自動動態');
    style.setAttribute('aria-pressed',String(disassembled));style.textContent=disassembled?'組合鏡頭 −':'拆解鏡頭 ＋';
    status.textContent=reduced.matches?'減少動態 · 作品全部展開':'拖曳鏡頭，換個角度。';
    dirty=true;lastFrame=0;if(paused&&metricStart!==null)metricDone=true;metrics.forEach(item=>{item.visual.innerHTML=`${item.prefix}${item.value.toFixed(1)}${item.suffix}`;item.last=undefined;});schedule();
  }
  function setCase(index){
    if(workActive===index)return;workActive=index;
    cases.forEach((card,i)=>{const selected=i===index,reading=reduced.matches||shortScreen.matches;card.classList.toggle('reel-active',selected);card.inert=!selected&&!reading;card.setAttribute('aria-hidden',String(!selected&&!reading));});
    workButtons.forEach((button,i)=>{button.setAttribute('aria-current',i===index?'true':'false');});workGrid.dataset.active=String(index);
  }
  function render(now){
    frame=0;if(disposed||document.hidden)return;if(dirty)measure();
    const y=scrollY,h=innerHeight,w=innerWidth,mobile=w<=780,reduce=reduced.matches;
    const dt=lastFrame?Math.min((now-lastFrame)/1000,.04):0;lastFrame=now;if(!paused&&!dragging)time+=dt;
    const storyBounds=positions.get(story),p=clamp((y-storyBounds.top)/Math.max(1,storyBounds.height-stageHeight))*3;
    const chapter=Math.round(p);
    if(chapter!==active){active=chapter;panels.forEach((panel,i)=>{const selected=i===chapter;panel.classList.toggle('active',selected);panel.inert=!selected&&!reduce;panel.setAttribute('aria-hidden',String(!selected&&!reduce));});jumps.forEach((button,i)=>{if(i===chapter)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});}
    // Reduced motion exposes all content and removes the long pinned galleries.
    if(reduce){panels.forEach(panel=>{panel.inert=false;panel.setAttribute('aria-hidden','false');});cases.forEach(card=>{card.inert=false;card.setAttribute('aria-hidden','false');});}
    if(shortScreen.matches)cases.forEach(card=>{card.inert=false;card.setAttribute('aria-hidden','false');});
    let region=0;regionNodes.forEach((node,i)=>{if(positions.get(node).top<=y+h*.3)region=i;});
    const regionBox=positions.get(regionNodes[region]),regionProgress=clamp((y+h*.7-regionBox.top)/(regionBox.height+h*.4));
    root.dataset.journey=String(region);host.dataset.chapter=region===0?String(chapter):regionNodes[region].id||'closing';
    if(region!==lastRegion){dockLabel.textContent=names[region];lastRegion=region;}
    root.style.setProperty('--page-progress',String(y/pageTravel));
    root.style.setProperty('--story-p',String(p/3));story.style.setProperty('--story-color',colors[chapter]);
    world.style.setProperty('--bench-opacity',String(region===0?1-clamp(p*1.65):0));
    const segment=Math.min(2,Math.floor(p)),t=p-segment,a=poses[segment],b=poses[segment+1];
    const baseDiameter=mobile?Math.min(w*(h<=700?.66:.77),500):Math.min(w*.42,570);
    const targets=[
      {x:mobile?.51:.49,y:mobile?.48:.55,d:baseDiameter,opacity:1,rx:mix(a.rx,b.rx,t),ry:mix(a.ry,b.ry,t),scale:mix(a.scale,b.scale,t),explode:mix(a.explode,b.explode,t)},
      {x:.86,y:.28,d:mobile?150:260,opacity:.28,rx:.4,ry:-.4,scale:1,explode:.3},
      {x:.79,y:.3,d:mobile?170:360,opacity:.42,rx:-.4,ry:.5,scale:1,explode:.7},
      {x:.89,y:.22,d:mobile?130:240,opacity:.35,rx:.2,ry:1.1,scale:1,explode:.85},
      {x:.87,y:.28,d:mobile?150:250,opacity:.28,rx:.3,ry:-.5,scale:1,explode:.2},
      {x:.88,y:.32,d:mobile?120:210,opacity:.25,rx:-.2,ry:.7,scale:1,explode:.8},
      {x:mobile?.82:.78,y:.3,d:mobile?175:390,opacity:.95,rx:.3,ry:-.7,scale:1,explode:0},
      {x:.85,y:.5,d:mobile?110:180,opacity:.4,rx:.3,ry:.2,scale:1,explode:.3},
      {x:.85,y:.5,d:mobile?110:180,opacity:.25,rx:.3,ry:.2,scale:1,explode:.3}
    ];
    const target=targets[region],prev=targets[Math.max(0,region-1)];
    const blend=region===0?1:clamp((y+h*.3-regionBox.top)/(h*.55));
    const moving=!reduce&&!paused;
    const state={rx:mix(prev.rx,target.rx,blend)+tilt+(moving?pointerY*.07:0),ry:mix(prev.ry,target.ry,blend)+turn+Math.sin(time*.45)*.09+(moving?pointerX*.1:0),rz:-.22+Math.sin(time*.3)*.05,scale:mix(prev.scale,target.scale,blend),explode:disassembled?1.4:mix(prev.explode,target.explode,blend),centerX:mix(prev.x,target.x,blend),centerY:mix(prev.y,target.y,blend),diameter:mix(prev.d,target.d,blend),time,mobile,p};
    if(region>0&&!reduce){state.ry+=regionProgress*.6;state.rx+=Math.sin(regionProgress*Math.PI)*.18;}
    const opacity=mix(prev.opacity,target.opacity,blend);
    host.style.opacity=String(opacity);
    world.style.setProperty('--lens-x',`${state.centerX*100}%`);world.style.setProperty('--lens-y',`${state.centerY*100}%`);world.style.setProperty('--lens-size',`${state.diameter}px`);
    world.style.setProperty('--scene-tilt',`${state.rx*180/Math.PI}deg`);world.style.setProperty('--scene-turn',`${state.ry*180/Math.PI}deg`);world.style.setProperty('--scene-scale',String(state.scale));world.style.setProperty('--explode',String(state.explode));world.style.setProperty('--scene-y',`${Math.sin(time*.4)*3}px`);
    if(!reduce)graphics?.render(state);

    const wb=positions.get(workScroll),wp=clamp((y-wb.top)/Math.max(1,wb.height-workHeight));
    const wi=Math.min(3,Math.floor(wp*4));setCase(wi);
    workGrid.style.setProperty('--reel-progress',String(wp));
    cases.forEach((card,i)=>{const distance=clamp((wp*4-i)-.5,-1,1);card.style.setProperty('--card-drift',String(reduce?0:distance));card.style.setProperty('--ambient',String(moving?Math.sin(time*.5)*1.4:0));});
    const lb=positions.get(labScroll),lp=clamp((y-lb.top)/Math.max(1,lb.height-labHeight));
    const li=Math.min(2,Math.floor(lp*3));
    if(li!==labActive){labActive=li;manualLab=-1;if(!reduce)selectFeature(labButtons[li].dataset.feature);}
    lab.style.setProperty('--lab-progress',String(lp));lab.style.setProperty('--screen-turn',`${moving?Math.sin(time*.45)*1.3+pointerX*1.4:0}deg`);lab.style.setProperty('--screen-lift',`${moving?Math.sin(time*.65)*4:0}px`);
    for(const el of titleLines){const r=positions.get(el);const amount=reduce||paused?0:clamp((r.top-y-h*.4)/h,-1,1);el.style.setProperty('--title-shift',`${amount*(mobile?28:90)}px`);}
    for(const el of reveal){const r=positions.get(el);const visible=reduce||paused||y+h*.92>r.top;el.classList.toggle('is-revealed',visible);el.classList.toggle('is-inview',r.top<y+h&&r.top+r.height>y);}
    const pb=positions.get(portraitNode),portrait=clamp((y+h*.85-pb.top)/(h*.65));
    portraitNode.style.setProperty('--portrait-open',String(reduce||paused?1:portrait));
    portraitNode.style.setProperty('--portrait-turn',`${reduce||paused?-3:mix(-9,3,portrait)}deg`);
    portraitNode.classList.toggle('is-inview',pb.top<y+h&&pb.top+pb.height>y);
    lab.classList.toggle('is-inview',lb.top<y+h&&lb.top+lb.height>y);
    const tb=positions.get(timeline),tp=clamp((y+h*.6-tb.top)/tb.height);timeline.style.setProperty('--timeline-progress',String(reduce?1:tp));
    entries.forEach(entry=>{const r=positions.get(entry);entry.classList.toggle('timeline-past',reduce||y+h*.6>r.top);entry.classList.toggle('timeline-current',r.top<y+h*.6&&r.top+r.height>y+h*.6);});
    const cb=positions.get(regionNodes[6]),cp=clamp((y+h*.85-cb.top)/(h*.7));contactTitle.style.setProperty('--contact-open',String(reduce||paused?1:cp));
    impact.classList.toggle('is-inview',positions.get(impact).top<y+h&&positions.get(impact).top+positions.get(impact).height>y);
    ribbon.classList.toggle('is-inview',positions.get(ribbon).top<y+h);
    if(metricStart===null&&positions.get(impact).top<y+h*.8)metricStart=time;
    if(metricStart!==null){const progress=reduce||paused||metricDone?1:ease(clamp((time-metricStart)/1.4));if(progress===1)metricDone=true;metrics.forEach(item=>{const value=`${item.prefix}${(item.value*progress).toFixed(1)}${item.suffix}`;if(item.last!==value){item.visual.innerHTML=value;item.last=value;}});}
    const current=region===0?'home':region<=2?'work':region===3?'projects':region<=5?'about':'contact';
    document.body.classList.toggle('light-header',[1,4,5].includes(region));navigation.forEach(link=>link.classList.toggle('current',link.hash===`#${current}`));
    if(!paused)frame=requestAnimationFrame(render);
  }
  function schedule(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(render);}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',()=>{dirty=true;schedule();},{passive:true});
  const layoutObserver=new ResizeObserver(()=>{dirty=true;schedule();});layoutObserver.observe(document.querySelector('main'));layoutObserver.observe(document.querySelector('#sources'));
  document.addEventListener('visibilitychange',()=>{lastFrame=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  motion.addEventListener('click',()=>{paused=!paused;controls();});style.addEventListener('click',()=>{disassembled=!disassembled;controls();});
  reduced.addEventListener('change',()=>{paused=reduced.matches;active=-1;workActive=-1;controls();loadGraphics();});
  shortScreen.addEventListener('change',()=>{workActive=-1;dirty=true;schedule();});
  jumps.forEach(button=>button.addEventListener('click',()=>jumpTo(story,Number(button.dataset.jump),4)));
  workButtons.forEach(button=>button.addEventListener('click',()=>{if(reduced.matches){cases[Number(button.dataset.case)].scrollIntoView();return;}jumpTo(workScroll,Number(button.dataset.case)+.12,5);}));
  labButtons.forEach((button,i)=>button.addEventListener('click',()=>{manualLab=i;labActive=Math.min(2,Math.floor(clamp((scrollY-(positions.get(labScroll)?.top??0))/travel(labScroll))*3));lab.dataset.manual=String(manualLab);schedule();}));
  if(location.hash==='#intro')jumpTo(story,1,4);
  const release=()=>{dragging=false;schedule();};
  input.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;dragging=true;lastX=event.clientX;lastY=event.clientY;if(event.pointerType==='mouse')input.setPointerCapture(event.pointerId);});
  input.addEventListener('pointermove',event=>{if(!dragging)return;turn+=(event.clientX-lastX)*.005;tilt=clamp(tilt+(event.clientY-lastY)*.003,-.65,.65);lastX=event.clientX;lastY=event.clientY;schedule();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>input.addEventListener(name,release));window.addEventListener('blur',release);
  input.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();if(event.key==='ArrowLeft')turn-=.18;if(event.key==='ArrowRight')turn+=.18;if(event.key==='ArrowUp')tilt=clamp(tilt-.12,-.65,.65);if(event.key==='ArrowDown')tilt=clamp(tilt+.12,-.65,.65);schedule();});
  window.addEventListener('pointermove',event=>{pointerX=event.clientX/innerWidth-.5;pointerY=event.clientY/innerHeight-.5;},{passive:true});
  function loadGraphics(){if(graphics||loadingGraphics||reduced.matches||disposed)return;loadingGraphics=true;import('./scene.js').then(({initScene})=>{if(!disposed){graphics=initScene(host,schedule);schedule();}}).catch(()=>{host.dataset.renderer='css-depth';}).finally(()=>{loadingGraphics=false;});}
  loadGraphics();
  window.addEventListener('pagehide',event=>{if(event.persisted)return;disposed=true;cancelAnimationFrame(frame);layoutObserver.disconnect();graphics?.dispose();},{once:true});
  controls();
}
