'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'..');
function app(){
 const values=new Map(),styles=new Map(),body={dataset:{},style:{setProperty:(key,value)=>styles.set(key,value)}};
 const context=vm.createContext({localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)},document:{body,getElementById:()=>({}),addEventListener(){}},window:{addEventListener(){}},setInterval(){},Date,Intl,alert(){}});
 const source=fs.readFileSync(path.join(root,'app.js'),'utf8').replace(/render\(\);\s*$/,'');
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
  assert(fs.existsSync(path.join(root,'assets/backgrounds',reward.key+'.svg')));
  assert(reward.name.length>0);
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
 assert.match(a.styles.get('--rank-art'),/bronze.svg/);
 a.run('state=blank();applyRankBackground()');assert.equal(a.body.dataset.rankBackground,'beginner');
});
