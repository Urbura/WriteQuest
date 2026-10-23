'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..'),key='writequest-starter-v1';
function boot(search=''){
 const profile={xp:{drafting:12,editing:4,creativity:0,learning:0,research:0},checkins:{'2026-10-22':{drafting:5}}};
 const raw=JSON.stringify(profile),map=new Map([[key,raw],[key+'-backup',raw]]);
 let writes=0;const alerts=[];
 const context=vm.createContext({
  location:{search,href:'https://example.com/WriteQuest/'+search},URL,URLSearchParams,Date,Intl,
  localStorage:{getItem:k=>map.get(k)??null,setItem(k,v){writes++;map.set(k,v);}},
  document:{getElementById:()=>({}),addEventListener(){}},window:{addEventListener(){},scrollTo(){}},
  setInterval(){},alert:m=>alerts.push(m)
 });
 vm.runInContext(fs.readFileSync(path.join(root,'js/developer.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8').replace(/render\(\);\s*$/,''),context);
 vm.runInContext('render=()=>{};openDeveloperPanel=()=>{};showSaveDialog=()=>{};',context);
 return {run:s=>vm.runInContext(s,context),map,raw,alerts,writes:()=>writes};
}
test('normal links stay normal; explicit dev and test links start isolated previews',()=>{
 assert.equal(boot().run('developer.active'),false);
 assert.equal(boot('?test=0').run('developer.active'),false);
 for(const query of ['?dev','?test=1']){
  const b=boot(query);assert.equal(b.run('developer.active'),true);
  assert.equal(b.run('state.xp.drafting'),12);
  assert.equal(b.run('Object.keys(state.checkins).length'),0);
  assert.equal(b.map.get(key),b.raw);assert.equal(b.writes(),0);
 }
});
test('all nine rank presets reach exact totals without changing either normal save',()=>{
 const b=boot('?dev');
 for(const total of [5,10,25,50,75,100,150,200,250]){
  assert.equal(b.run('developer.setTotal('+total+')'),true);
  assert.equal(b.run('SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0)'),total);
 }
 assert.equal(b.map.get(key),b.raw);assert.equal(b.map.get(key+'-backup'),b.raw);assert.equal(b.writes(),0);
 for(const invalid of [4,251,10.5,'10'])assert.equal(b.run('developer.setTotal('+JSON.stringify(invalid)+')'),false);
});
test('preview check-ins retain preset XP and never persist; original preview can be restored',()=>{
 const b=boot('?dev');b.run('developer.setTotal(100)');
 const xp=b.run('state.xp.drafting');
 b.run('draftDay=localDay();draftRatings={drafting:3};saveCheckin()');
 assert.equal(b.run('state.xp.drafting'),xp+5); // Level 20 adds the existing +2 bonus.
 assert.equal(b.run('stats(state.xp.editing).level'),20);
 assert.equal(b.writes(),0);
 b.run('developer.enter();developer.restore()');
 assert.equal(b.run('state.xp.drafting'),12);
 assert.equal(b.map.get(key),b.raw);
});
test('exit loads the latest normal save, including updates from another tab',()=>{
 const b=boot('?dev');b.run('developer.setTotal(250)');
 const updated=JSON.parse(b.raw);updated.xp.drafting=30;
 b.map.set(key,JSON.stringify(updated));b.run('exitDeveloperMode()');
 assert.equal(b.run('developer.active'),false);assert.equal(b.run('state.xp.drafting'),30);
 assert.equal(b.run('Object.keys(state.checkins).length'),1);assert.equal(b.writes(),0);
});
test('backup import, export, restoration and reset are guarded during previews',async()=>{
 const b=boot('?dev');
 b.run('exportBackup();restorePrevious();confirmResetProgress()');
 await b.run('importBackup({target:{value:""}})');
 assert.equal(b.alerts.length,4);assert.equal(b.writes(),0);assert.equal(b.map.get(key),b.raw);
});
