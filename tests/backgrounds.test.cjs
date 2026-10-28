'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function app(){
 const values=new Map(),styles=new Map(),body={dataset:{},style:{setProperty:(key,value)=>styles.set(key,value)}};
 const context=vm.createContext({localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)},document:{body,getElementById:()=>({}),addEventListener(){}},window:{addEventListener(){}},setInterval(){},Date,Intl,alert(){}});
 const source=fs.readFileSync(path.join(root,'app.js'),'utf8').replace(/render\(\);\s*$/,'');
 vm.runInContext(fs.readFileSync(path.join(root,"js/activity.js"),"utf8"),context);
 vm.runInContext(fs.readFileSync(path.join(root,"js/achievements.js"),"utf8"),context);
 vm.runInContext(fs.readFileSync(path.join(root,'js/journey.js'),'utf8'),context);
 vm.runInContext(fs.readFileSync(path.join(root,"js/badges.js"),"utf8"),context);
 vm.runInContext(source,context);
 vm.runInContext('render=()=>{};var unlockedBackground=null;showSaveDialog=(levels,rank)=>{unlockedBackground=rank;};',context);
 return {run:code=>vm.runInContext(code,context),body,styles};
}
test('all rank thresholds choose existing named scenery, including just before each unlock',()=>{
 const a=app();
 const thresholds=[5,10,25,50,75,100,150,200,250];
 for(let i=0;i<thresholds.length;i++){
  const rank=a.run('TOTAL_RANKS['+i+'][0]');
  const reward=JSON.parse(a.run('JSON.stringify(backgroundForTotal('+thresholds[i]+'))'));
  assert.equal(a.run('totalRank('+thresholds[i]+')'),rank);

  assert(reward.name.length>0);
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/backgrounds/portrait-manifest.json'),'utf8'));
  assert(manifest[reward.key].width>=800&&manifest[reward.key].height>=1600);
  const bytes=fs.readFileSync(path.join(root,'assets/backgrounds',manifest[reward.key].file));
  assert.equal(bytes.readUInt32LE(4)+8,bytes.length,'WebP file must be complete');
  assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
  if(i>0)assert.equal(a.run('totalRank('+(thresholds[i]-1)+')'),a.run('TOTAL_RANKS['+(i-1)+'][0]'));
 }
 assert.match(a.run('rankProgression()'),/Quiet Desk/);
 assert.match(a.run('rankProgression()'),/Grand Author’s Hall/);
});
test('background derives from saved XP, and a check-in announces the newly earned rank',()=>{
 const a=app();
 a.run('applyRankBackground()');assert.equal(a.body.dataset.rankBackground,'beginner');
 const before=a.run('JSON.stringify(state)');
 a.run('applyRankBackground()');assert.equal(a.run('JSON.stringify(state)'),before);
 a.run('draftDay=localDay();draftRatings=Object.fromEntries(SKILLS.map(s=>[s.id,5]));saveCheckin();applyRankBackground();');
 assert.equal(a.run('unlockedBackground'),'Bronze');assert.equal(a.body.dataset.rankBackground,'bronze');
 assert.match(a.styles.get('--rank-art'),/bronze-portrait-v3.webp/);

 a.run('state=blank();applyRankBackground()');assert.equal(a.body.dataset.rankBackground,'beginner');
});

test('every intermediate level queues in skill order and failed saves show no celebrations',()=>{
 const a=app();
 a.run('var captured=[];showSaveDialog=(levels)=>{captured=levels;};state=blank();state.checkins={"2020-01-01":Object.fromEntries(SKILLS.map(s=>[s.id,5])),"2020-01-02":Object.fromEntries(SKILLS.map(s=>[s.id,5]))};draftDay=localDay();draftRatings=Object.fromEntries(SKILLS.map(s=>[s.id,5]));saveCheckin();');
 const levels=JSON.parse(a.run('JSON.stringify(captured)'));
 assert.deepEqual(levels.slice(0,2),[{name:'Drafting',level:2},{name:'Drafting',level:3}]);
 assert.equal(levels.length,10);
 a.run('captured=[];save=()=>{throw Error("Storage unavailable")};draftRatings=Object.fromEntries(SKILLS.map(s=>[s.id,5]));saveCheckin();');
 assert.equal(a.run('captured.length'),0);
});

test('new achievement notifications persist until viewed, survive validation and do not replay on correction',()=>{
 const a=app();
 a.run('var newItems=[];showSaveDialog=(levels,rank,items)=>{newItems=items;};draftDay=localDay();draftRatings=Object.fromEntries(SKILLS.map(s=>[s.id,5]));saveCheckin();');
 assert(a.run('newItems.some(a=>a.id==="first")'));
 assert(a.run('unseenAchievements().some(a=>a.id==="first")'));
 assert.match(a.run('header()'),/header-new-dot/);
 a.run('var groups=[{open:false},{open:true},{open:true},{open:false}];app.querySelectorAll=()=>groups;render=()=>{groups=[{open:true},{open:false},{open:false},{open:false}]};var replayed=false;var fireworks=0;showNextCelebration=()=>{replayed=true};celebrateAchievement=()=>{fireworks++};viewAchievement("first");');
 assert.equal(a.run("replayed"),false);
 assert.equal(a.run("groups.map(g=>g.open).join()"),"false,true,true,false");
 assert.equal(a.run("fireworks"),1);
 a.run('viewAchievement("first");');
 assert.equal(a.run("fireworks"),1);
 assert.equal(a.run('unseenAchievements().some(a=>a.id==="first")'),false);
 assert.equal(a.run('validateSave(state).achievementsSeen.includes("first")'),true);
 a.run('newItems=[];draftRatings=Object.fromEntries(SKILLS.map(s=>[s.id,5]));saveCheckin();');
 assert.equal(a.run('newItems.length'),0);
});

test('header navigation keeps Journey and Achievements accessible and Go Back returns Home',()=>{
 const a=app();
 assert.match(a.run('header()'),/data-page="journey"/);
 assert.match(a.run('header()'),/class="settings-button achievements-button" data-page="projects"/);
 assert.doesNotMatch(a.run('header()'),/Go Back to Home/);
 for(const page of ['home','settings','journey','checkin','ranks','projects']){
  a.run('page='+JSON.stringify(page)+';');
  const markup=a.run(page==='home'?'home()':page==='settings'?'settings()':page==='journey'?'journey()':page==='checkin'?'checkin()':page==='ranks'?'rankProgression()':'achievements()');
  assert.doesNotMatch(markup,/<nav/);
  if(page!=="home")assert.match(markup,/<(?:section|div) class="(?:card[^"\n]*|checkin-heading)">(?:<div class="page-title-row">)?<button class="back content-back"/);
  assert.match(markup,/data-page="journey"/);
 }
 a.run('window.scrollTo=()=>{};page="settings";previous="journey";back();');
 assert.equal(a.run('page'),'home');
});
