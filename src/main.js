import './style.css';
import { creativeWorks, projects, experience } from './data.js';

export const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//,'')}`;
// Vite handles build-time paths in HTML; generated asset URLs use the same base.
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
document.querySelectorAll('a[href^="/documents/"]').forEach(link => { link.href = asset(link.getAttribute('href')); });
document.querySelectorAll('img[src^="/assets/"]').forEach(img => { img.src = asset(img.getAttribute('src')); });

const creativeGrid = document.querySelector('#creative-grid');
creativeGrid.innerHTML = creativeWorks.map((work, i) => `
  <article class="creative-card">
    <button class="creative-image-button" data-work="${work.id}" aria-label="查看${escape(work.client)}作品詳情">
      <img src="${asset(`assets/${work.image}`)}" alt="${escape(work.alt)}" loading="lazy" width="800" height="516">
      <span class="image-view-label" aria-hidden="true">↗</span>
    </button>
    <div class="creative-card-meta"><span>${escape(work.category)}</span><span>0${i+1}</span></div>
    <h3>${escape(work.title)}</h3><p>${escape(work.client)}</p>
  </article>`).join('');

const categories = {games:'遊戲與互動',tools:'影音與工具',content:'內容與生活'};
const projectGrid = document.querySelector('#project-grid');
projectGrid.innerHTML = projects.map((project,i) => {
  const repository = `https://github.com/sion-rgb/${project.id}`;
  const image = project.image
    ? `<img src="${asset(`assets/${project.image}`)}" alt="${escape(project.title)} — ${escape(project.imageSource)}" loading="lazy" width="800" height="485"><span class="image-source">${escape(project.imageSource)}</span>`
    : `<span class="project-initials">${escape(project.initials)}</span><span class="project-placeholder-label">PROJECT OVERVIEW / 專案概覽</span>`;
  return `<article class="project-card" data-id="${project.id}" data-category="${project.category}">
    <a class="project-image ${project.image ? '' : `project-placeholder ${project.color}`}" href="${repository}" target="_blank" rel="noopener" aria-label="在 GitHub 查看 ${escape(project.title)}">${image}</a>
    <div class="project-card-topline"><span>${categories[project.category]}</span><span>${String(i+1).padStart(2,'0')}</span></div>
    <h3>${escape(project.title)}</h3><p class="project-subtitle">${escape(project.subtitle)}</p><p class="project-description">${escape(project.description)}</p>
    <div class="project-tags">${project.tags.map(tag=>`<span>${escape(tag)}</span>`).join('')}</div>
    <div class="project-card-links"><a href="${repository}" target="_blank" rel="noopener">GitHub <span aria-hidden="true">↗</span></a>${project.demo?`<a href="${project.demo}" target="_blank" rel="noopener">開啟體驗 <span aria-hidden="true">↗</span></a>`:''}</div>
  </article>`;
}).join('');

const filters = document.querySelectorAll('[data-filter]');
const projectCount = document.querySelector('#project-count');
function filterProjects(category) {
  filters.forEach(button => {
    const selected = button.dataset.filter === category;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  let count = 0;
  projectGrid.querySelectorAll('.project-card').forEach(card => {
    card.hidden = category !== 'all' && card.dataset.category !== category;
    if (!card.hidden) count++;
  });
  projectCount.textContent = `${String(count).padStart(2,'0')} 個專案`;
}
filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.filter)));
filterProjects('all');

document.querySelector('#timeline').innerHTML = experience.map(item=>`<article class="timeline-entry"><p class="timeline-date">${escape(item.date)}</p><div><h3>${escape(item.company)}</h3><p class="timeline-title">${escape(item.title)}<br>${escape(item.cn)}</p><p class="timeline-description">${escape(item.description)}</p></div></article>`).join('');

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '關閉導覽選單' : '開啟導覽選單');
  mobileNav.hidden = !open;
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown', event=>{ if(event.key==='Escape') setMenu(false); });
window.matchMedia('(min-width:781px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});

const dialog = document.querySelector('#work-dialog');
const dialogContent = document.querySelector('#dialog-content');
creativeGrid.addEventListener('click', event => {
  const button = event.target.closest('[data-work]');
  if (!button) return;
  const work = creativeWorks.find(item=>item.id === button.dataset.work);
  dialogContent.innerHTML = `<img class="dialog-image" src="${asset(`assets/${work.image}`)}" alt="${escape(work.alt)}"><div class="dialog-text"><p class="eyebrow">${escape(work.category)}</p><h2 id="dialog-title">${escape(work.title)}</h2><h3>${escape(work.client)}</h3><p>${escape(work.description)}</p><p class="dialog-role">${escape(work.role)}</p><a class="text-link" href="${work.link}" target="_blank" rel="noopener">${escape(work.linkLabel)} <span aria-hidden="true">↗</span></a><p class="dialog-source">圖片與工作資料來源：${escape(work.source)}</p></div>`;
  dialog.showModal();
  document.body.classList.add('dialog-open');
});
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{ if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();} });
dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));

const navigation = document.querySelectorAll('.desktop-nav a');
const sectionObserver = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{ if(entry.isIntersecting) navigation.forEach(link=>link.classList.toggle('current',link.hash===`#${entry.target.id}`)); });
},{rootMargin:'-10% 0px -55% 0px'});
['work','projects','about'].forEach(id=>sectionObserver.observe(document.getElementById(id)));

import('./scene.js').then(({initScene})=>initScene()).catch(()=>{
  document.querySelector('#scene-status').textContent='靜態雕塑 · 內容照常可瀏覽';
  document.querySelectorAll('.scene-controls button').forEach(button=>{button.disabled=true;});
});
