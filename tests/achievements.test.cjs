const {test}=require('node:test');
const assert=require('node:assert/strict');
const {list}=require('../js/achievements.js');
const skills=['drafting','editing','creativity','learning','research'].map(id=>({id,name:id}));
const ranks=[['Beginner',5],['Bronze',10],['Silver',25],['Gold',50],['Platinum',75],['Emerald',100],['Diamond',150],['Master',200],['Grandmaster',250]];
const context=(checkins={},n=1)=>({skills,xp:Object.fromEntries(skills.map(s=>[s.id,n])),checkins,level:n=>n,ranks});
test('empty profile has 38 locked achievements and does not mutate its save',()=>{const c=context(),before=JSON.stringify(c);const a=list(c);assert.equal(a.length,38);assert.equal(a.filter(x=>x.earned).length,0);assert.equal(JSON.stringify(c),before);});
test('consecutive dates cross month boundaries, gaps break streaks, corrections update perfect scores',()=>{const c=context({'2026-01-30':{},'2026-01-31':{},'2026-02-01':Object.fromEntries(skills.map(s=>[s.id,5])),'2026-02-03':{}});let a=list(c);assert.equal(a.find(a=>a.id==='streak-3').earned,true);assert.equal(a.find(a=>a.id==='streak-7').value,3);assert.equal(a.find(a=>a.id==='five-for-five').earned,true);c.checkins['2026-02-01'].drafting=4;a=list(c);assert.equal(a.find(a=>a.id==='five-for-five').earned,false);});
test('level thresholds and completionist require every milestone',()=>{const c=context({},50);let a=list(c);assert.equal(a.find(a=>a.id==='total-250').earned,true);assert.equal(a.find(a=>a.id==='legend').earned,false);for(let i=0;i<100;i++){const d=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10);c.checkins[d]=Object.fromEntries(skills.map(s=>[s.id,5]));}a=list(c);assert.equal(a.every(x=>x.earned),true);});
