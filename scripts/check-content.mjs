import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { projects, creativeWorks, experience } from '../src/data.js';
assert.equal(projects.length,15);
assert.equal(new Set(projects.map(p=>p.id)).size,15);
for(const p of projects){assert.ok(['games','tools','content'].includes(p.category));if(p.image)assert.ok(existsSync(`public/assets/${p.image}`),`Missing ${p.image}`);}
for(const work of creativeWorks){assert.ok(existsSync(`public/assets/${work.image}`));assert.ok(new URL(work.link).protocol==='https:');}
assert.equal(experience.length,6);
assert.ok(existsSync('public/documents/Sion_Ng_CV.pdf'));
assert.ok(existsSync('public/documents/Sion_Ng_Visual_Portfolio.pdf'));
assert.ok(existsSync('public/assets/sion-portrait.jpg'));
assert.ok(existsSync('public/assets/social-cover.jpg'));
assert.ok(existsSync('public/assets/wabi-stone-moss.png'));
assert.ok(existsSync('public/assets/wabi-studio-1k.hdr'));
const html=readFileSync('index.html','utf8');
assert.ok(html.includes('zh-Hant-HK'));assert.ok(html.includes('為維護期間後台數據'));
assert.equal(projects.find(p=>p.id==='auralis-player').repositoryUrl,'https://github.com/sion-rgb/auralis-android/releases/tag/v1.0.0-preview.1');
assert.ok(projects.find(p=>p.id==='auralis-player').description.includes('尚未公開上架'));
for(const id of ['pixel-media-toolbox','canto-suite','auto-publisher']){const p=projects.find(item=>item.id===id);assert.ok(p?.storeStatus?.includes('尚未公開上架'));assert.equal(p.repositoryUrl,undefined);assert.equal(p.demo,undefined);}
assert.ok(projects.find(p=>p.id==='sakura-sprint').description.includes('PARTIAL'));
for(const id of ['tidal-odyssey','roadster-rocket-lab']){const p=projects.find(item=>item.id===id);assert.ok(p);assert.ok(new URL(p.repositoryUrl).protocol==='https:');assert.ok(new URL(p.demo).protocol==='https:');}
assert.ok(html.includes('theme-toggle'));assert.ok(readFileSync('src/scene.js','utf8').includes('createWabiGarden'));
const sources=JSON.parse(readFileSync('public/sources.json','utf8').replace(/^\uFEFF/,''));for(const id of ['tidal-odyssey','roadster-rocket-lab'])assert.ok(sources.github_repositories.some(repo=>repo.name===id));for(const asset of ['wabi-stone-moss.png','wabi-studio-1k.hdr'])assert.ok(sources.assets.some(item=>item.asset===asset));
console.log('PASS: 15 portfolio projects, 4 creative works, 6 experience entries, all local assets and source qualifications.');
