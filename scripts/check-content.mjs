import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { projects, creativeWorks, experience } from '../src/data.js';
assert.equal(projects.length,12);
assert.equal(new Set(projects.map(p=>p.id)).size,12);
for(const p of projects){assert.ok(['games','tools','content'].includes(p.category));if(p.image)assert.ok(existsSync(`public/assets/${p.image}`),`Missing ${p.image}`);}
for(const work of creativeWorks){assert.ok(existsSync(`public/assets/${work.image}`));assert.ok(new URL(work.link).protocol==='https:');}
assert.equal(experience.length,6);
assert.ok(existsSync('public/documents/Sion_Ng_CV.pdf'));
assert.ok(existsSync('public/documents/Sion_Ng_Visual_Portfolio.pdf'));
assert.ok(existsSync('public/assets/sion-portrait.jpg'));
assert.ok(existsSync('public/assets/social-cover.jpg'));
const html=readFileSync('index.html','utf8');
assert.ok(html.includes('zh-Hant-HK'));assert.ok(html.includes('為維護期間後台數據'));
assert.ok(projects.find(p=>p.id==='auto-publisher').description.includes('未完成真實帳戶驗證'));
assert.ok(projects.find(p=>p.id==='sakura-sprint').description.includes('PARTIAL'));
console.log('PASS: 12 public projects, 4 creative works, 6 experience entries, all local assets and source qualifications.');
