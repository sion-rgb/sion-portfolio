import {projects} from './data.js';

const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const escape=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const steps=[
  {word:'FRAME',title:'先對準，<br>值得說的故事。',copy:'從受眾、品牌與內容出發，找到清晰的方向。讓每一個畫面，都有表達的理由。',tools:'STRATEGY / STORY / PHOTOGRAPHY',symbol:'◎'},
  {word:'DESIGN',title:'給想法，<br>一個有感覺的形狀。',copy:'透過版面、色彩與介面，把資訊整理成容易理解的視覺。細節，決定作品的感覺。',tools:'VISUAL / BRAND / INTERFACE',symbol:'✳'},
  {word:'MOVE',title:'讓畫面，<br>跟著節奏呼吸。',copy:'拍攝、剪輯與動態設計，讓故事在時間裡展開。畫面與聲音，找到自己的節奏。',tools:'FILM / EDIT / MOTION',symbol:'↗'},
  {word:'PLAY',title:'再把創意，<br>變成一次體驗。',copy:'從觀看到操作，透過 Three.js 與 AI 協作探索互動世界。讓一個想法，有更多實現方式。',tools:'THREE.JS / INTERACTION / AI',symbol:'⌘'}
];

export function initEmbellishments({world,schedule}){
  const process=document.createElement('section');process.id='process';process.className='process-section';process.setAttribute('aria-labelledby','process-title');
  process.innerHTML=`<div class="process-sticky section-shell">
    <div class="process-heading"><p class="eyebrow">INSIDE THE CREATIVE PROCESS</p><h2 id="process-title">從一個想法，<br>到一個世界。</h2><p>捲動，讓創作逐步成形。<br>也可以選擇你想探索的一步。</p></div>
    <div class="process-reticle" aria-hidden="true"><i></i><i></i><i></i><span>CREATIVE OPTICS / WORK IN MOTION</span></div>
    <div class="process-caption"><span class="process-kicker"></span><h3></h3><p></p><span class="process-tools"></span></div>
    <nav class="process-controls" aria-label="探索創作流程">${steps.map((s,i)=>`<button data-process="${i}" aria-pressed="${i===0}"><span>0${i+1}</span><b>${s.word}</b><i aria-hidden="true">${s.symbol}</i></button>`).join('')}</nav>
    <div class="process-track" aria-hidden="true"><i></i></div>
  </div>`;
  document.querySelector('#impact').after(process);
  const sticky=process.firstElementChild,caption=process.querySelector('.process-caption'),buttons=[...process.querySelectorAll('[data-process]')];
  let selected=-1,scrollStep=-1,manual=false,bounds={top:0,height:1,stage:1};
  const select=index=>{if(index===selected)return;selected=index;const step=steps[index];process.dataset.step=String(index);buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));caption.querySelector('.process-kicker').textContent=`0${index+1} / ${step.word}`;caption.querySelector('h3').innerHTML=step.title;caption.querySelector('p').textContent=step.copy;caption.querySelector('.process-tools').textContent=step.tools;};
  buttons.forEach((button,i)=>button.addEventListener('click',()=>{manual=true;select(i);schedule();}));select(0);

  const signals=document.createElement('div');signals.className='signal-field';signals.setAttribute('aria-hidden','true');
  signals.innerHTML=`<svg viewBox="0 0 1200 800" preserveAspectRatio="none"><path class="signal-wire" d="M-50 650C240 380 330 710 580 340S930 140 1250 250"/><path class="signal-wire" d="M-60 130C210 430 600-100 880 220S1080 580 1260 420"/><path class="signal-wire" d="M200 880C440 500 800 740 1060-90"/><g>${Array.from({length:24},(_,i)=>`<circle cx="${(i*181+47)%1200}" cy="${(i*137+61)%800}" r="${i%4===0?3:1.5}"/>`).join('')}</g></svg><span class="signal-coordinate">SION / CREATIVE FIELD</span>`;
  world.prepend(signals);
  const props=document.createElement('div');props.className='orbit-props';props.setAttribute('aria-hidden','true');
  props.innerHTML='<div class="prop-orbit"></div><div class="prop-film"><i></i><span>FRAME / 01</span><b>◎</b><small>SION / CREATIVE OPTICS</small></div><div class="prop-swatches"><i></i><i></i><i><b>✳</b><span>IDEAS<br>MADE<br>VISIBLE.</span></i></div><div class="prop-code">〈<i>/</i>〉</div>';
  document.querySelector('.scene-fallback').append(props);

  const ticker=document.createElement('div');ticker.className='craft-ticker';ticker.setAttribute('aria-hidden','true');const words='STORY ✳ DESIGN ↗ FILM ◎ MOTION ✳ INTERACTION ⌘ ';
  ticker.innerHTML=`<div>${Array.from({length:4},()=>`<span>${words}</span>`).join('')}</div>`;document.querySelector('#work .source-note').before(ticker);
  const cases=[...document.querySelectorAll('.creative-case')];
  const covers=cases.map(card=>card.querySelector('.creative-image-button img').src);
  cases.forEach((card,i)=>{const stack=document.createElement('div');stack.className='reel-stack';stack.setAttribute('aria-hidden','true');stack.innerHTML=`<img src="${covers[(i+1)%cases.length]}" alt="" loading="lazy"><img src="${covers[(i+2)%cases.length]}" alt="" loading="lazy">`;card.prepend(stack);});

  const atlas=document.createElement('div');atlas.className='project-atlas';atlas.setAttribute('aria-labelledby','atlas-title');
  atlas.innerHTML=`<div class="atlas-heading"><h3 id="atlas-title">PROJECT CONSTELLATION</h3><span>點選節點，探索專案 ↓</span></div>
    <svg class="atlas-wires" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden="true"><path d="M150 80Q600 380 1050 80M150 200Q600-30 1050 200M150 320Q600 90 1050 320M150 80L450 200L750 80L1050 200L750 320L450 200L150 320M450 80L750 200L1050 320M150 200L450 320L750 200L1050 80"/></svg>
    <div class="atlas-nodes">${projects.map((p,i)=>`<button data-atlas="${p.id}" aria-controls="project-${p.id}" aria-label="查看專案：${escape(p.title)}"><i aria-hidden="true">${p.category==='games'?'✳':p.category==='tools'?'⌘':'◎'}</i><span><small>${String(i+1).padStart(2,'0')} / ${p.category.toUpperCase()}</small><b>${escape(p.title)}</b></span><em aria-hidden="true">↗</em></button>`).join('')}</div>
    <p class="atlas-note">遊戲、工具與內容，連成持續探索的創作星圖。</p>`;
  document.querySelector('.project-intro').after(atlas);
  atlas.querySelectorAll('[data-atlas]').forEach(button=>{
    const row=document.querySelector(`.project-row[data-id="${button.dataset.atlas}"]`);row.id=`project-${button.dataset.atlas}`;
    button.addEventListener('click',()=>{if(row.hidden)document.querySelector('[data-filter="all"]').click();row.open=true;row.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});row.querySelector('summary').focus({preventScroll:true});});
  });
  const halo=document.createElement('div');halo.className='pointer-halo';halo.setAttribute('aria-hidden','true');halo.innerHTML='<i></i><span>VIEW</span>';document.body.append(halo);
  let pointer={x:0,y:0,seen:false,target:null},box=null;
  const pointerMove=event=>{
    if(event.pointerType==='touch')return;pointer.x=event.clientX;pointer.y=event.clientY;pointer.seen=true;
    const target=event.target.closest('a,button,summary,.about-photo');
    if(target!==pointer.target){pointer.target=target;box=target?.getBoundingClientRect()??null;halo.classList.toggle('over-control',!!target);halo.querySelector('span').textContent=target?.matches('a')?'OPEN':target?.matches('[data-atlas]')?'PLAY':'VIEW';}
    if(target&&!box)box=target.getBoundingClientRect();
    if(target&&box){target.style.setProperty('--hover-x',`${(event.clientX-box.left)/box.width*100}%`);target.style.setProperty('--hover-y',`${(event.clientY-box.top)/box.height*100}%`);}
  };
  const measured=new Map(),ambient=[ticker,atlas];
  function measure(y){const r=process.getBoundingClientRect();bounds={top:r.top+y,height:r.height,stage:sticky.offsetHeight};ambient.forEach(el=>{const r=el.getBoundingClientRect();measured.set(el,{top:r.top+y,height:r.height});});box=null;}
  function update({y,h,time,paused,reduced,phase,p}){
    const progress=clamp((y-bounds.top)/Math.max(1,bounds.height-bounds.stage));
    const step=Math.min(3,Math.floor(progress*4));if(step!==scrollStep){scrollStep=step;manual=false;}if(!manual&&!reduced)select(step);
    process.style.setProperty('--process-progress',String(progress));process.classList.toggle('is-inview',bounds.top<y+h&&bounds.top+bounds.height>y);
    world.dataset.phase=phase;
    world.dataset.studio=String(selected);
    world.style.setProperty('--signal-offset',`${-time*35}px`);world.style.setProperty('--signal-wave',`${Math.sin(time*.3)*12}px`);
    world.style.setProperty('--prop-sway',`${Math.sin(time*.42)*7}px`);world.style.setProperty('--prop-turn',`${Math.sin(time*.35)*12}deg`);
    world.style.setProperty('--orbit-turn',`${time*2.6}deg`);world.style.setProperty('--scan-position',`${(time*12)%120}%`);
    const accents=phase==='home'?clamp((p-1)*.45)*.55:phase==='process'?1:phase==='contact'?.48:.62;
    world.style.setProperty('--prop-presence',String(accents));
    ambient.forEach(el=>{const r=measured.get(el);if(r)el.classList.toggle('is-inview',r.top<y+h&&r.top+r.height>y);});
    if(pointer.seen){halo.style.transform=`translate(${pointer.x}px,${pointer.y}px)`;halo.classList.add('is-visible');}
    halo.classList.toggle('is-paused',paused||reduced);
    document.querySelector('#featured-project').style.setProperty('--scan-position',`${(time*12)%120}%`);
    return {studioMode:selected,accents:reduced?0:accents,processProgress:progress};
  }
  return {process,measure,update,pointerMove,dispose:()=>halo.remove()};
}
