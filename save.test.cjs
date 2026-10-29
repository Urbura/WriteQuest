const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/app.js','utf8').replace(/render\(\);\s*$/,'');
const key='writequest-starter-v1';
const sample={xp:{drafting:5,editing:0,creativity:0,learning:0,research:0},checkins:{'2026-10-22':{drafting:5}}};
function boot(entries={}){
 const map=new Map(Object.entries(entries));let fail=false;const alerts=[];
 const storage={getItem:k=>map.get(k)??null,setItem(k,v){if(fail)throw Error('Storage full');map.set(k,v);}};
 const context=vm.createContext({localStorage:storage,document:{getElementById:()=>({}),addEventListener(){}},window:{addEventListener(){},confirm:()=>true},setInterval(){},setTimeout(){},Intl,Date,alert:m=>alerts.push(m)});
 vm.runInContext(source,context);vm.runInContext('render=()=>{};showSaveDialog=()=>{};',context);
 return {context,map,alerts,run:s=>vm.runInContext(s,context),fail:()=>fail=true};
}
test('local 3:30 reset in Winnipeg, Ontario, Vancouver, year boundaries and DST',()=>{
 const original=process.env.TZ;
 try{for(const zone of ['America/Winnipeg','America/Toronto','America/Vancouver']){
  process.env.TZ=zone;const b=boot();
  for(const [instant,expected] of [['2026-10-23T03:29:59','2026-10-22'],['2026-10-23T03:30:00','2026-10-23'],['2026-01-01T03:29:00','2025-12-31'],['2026-03-08T01:59:00','2026-03-07'],['2026-03-08T03:29:00','2026-03-07'],['2026-03-08T03:30:00','2026-03-08'],['2026-11-01T03:29:00','2026-10-31'],['2026-11-01T03:30:00','2026-11-01']])assert.equal(b.run(`localDay(new Date('${instant}'))`),expected,zone+' '+instant);
 }}finally{if(original===undefined)delete process.env.TZ;else process.env.TZ=original;}
});
test('existing save survives loading and previous copy is kept',()=>{const raw=JSON.stringify(sample);const b=boot({[key]:raw});assert.equal(b.run('state.xp.drafting'),5);b.run('save({...state,xp:{...state.xp,drafting:6}})');assert.equal(b.map.get(key+'-backup'),raw);assert.equal(JSON.parse(b.map.get(key)).xp.drafting,6);});
test('failed write leaves state and stored progress untouched',()=>{const raw=JSON.stringify(sample);const b=boot({[key]:raw});b.fail();assert.throws(()=>b.run('save({...state,xp:{...state.xp,drafting:8}})'));assert.equal(b.run('state.xp.drafting'),5);assert.equal(b.map.get(key),raw);});
test('corrupt primary recovers previous copy but prevents overwrite',()=>{const b=boot({[key]:'broken',[key+'-backup']:JSON.stringify(sample)});assert.equal(b.run('state.xp.drafting'),5);assert.throws(()=>b.run('save(state)'));assert.equal(b.map.get(key),'broken');b.run('restorePrevious()');assert.equal(b.run('storageBlocked'),false);assert.equal(JSON.parse(b.map.get(key)).xp.drafting,5);});
test('invalid backups rejected',()=>{const b=boot();for(const data of [{}, {...sample,xp:{...sample.xp,drafting:-1}},{...sample,checkins:{'2026-02-30':{}}},{...sample,checkins:{'2026-10-22':{drafting:6}}}])assert.throws(()=>b.run(`validateSave(${JSON.stringify(data)})`));});
test('stale tab cannot overwrite a newer save',()=>{const b=boot({[key]:JSON.stringify(sample)});b.map.set(key,JSON.stringify({...sample,xp:{...sample.xp,drafting:9}}));assert.throws(()=>b.run('save(state)'),/Another tab/);assert.equal(JSON.parse(b.map.get(key)).xp.drafting,9);});
test('check-in corrections do not duplicate XP; failed check-in retains draft',()=>{const b=boot();b.run('draftDay=localDay();draftRatings={drafting:5};saveCheckin();');assert.equal(b.run('state.xp.drafting'),5);b.run('draftRatings={drafting:5};saveCheckin();');assert.equal(b.run('state.xp.drafting'),5);b.run('draftRatings={drafting:3};saveCheckin();');assert.equal(b.run('state.xp.drafting'),3);b.fail();b.run('draftRatings={drafting:4};saveCheckin();');assert.equal(b.run('state.xp.drafting'),3);assert.equal(b.run('draftRatings.drafting'),4);assert.match(b.alerts.at(-1),/not saved/);});
test('unsaved ratings across reset require review',()=>{const b=boot();b.run('draftDay="2000-01-01";draftRatings={drafting:5};saveCheckin();');assert.equal(b.map.has(key),false);assert.match(b.alerts[0],/new writing day/);});
test('reset can be recovered from previous copy',()=>{const b=boot({[key]:JSON.stringify(sample)});b.run('save(blank());restorePrevious();');assert.equal(b.run('state.xp.drafting'),5);});
test('import validates before replacing and supports exported format',async()=>{const b=boot({[key]:JSON.stringify(sample)});await b.run(`importBackup({target:{files:[{size:10,text:async()=>JSON.stringify({app:'Other',version:1,data:state})}],value:'a'}})`);assert.equal(b.run('state.xp.drafting'),5);await b.run(`importBackup({target:{files:[{size:10,text:async()=>JSON.stringify({app:'WriteQuest',version:1,data:{...state,xp:{...state.xp,drafting:7}}})}],value:'a'}})`);assert.equal(b.run('state.xp.drafting'),7);});


test('exported backup round-trips XP, history, background and viewed achievements', async () => {
 const b=boot({[key]:JSON.stringify({...sample,background:'beginner',achievementsSeen:['first']})});
 let exported,clicked=false,removed=false;
 b.context.Blob=class { constructor(parts) { exported=parts.join(''); } };
 b.context.URL={createObjectURL:()=> 'blob:backup',revokeObjectURL(){}};
 b.context.document.body={appendChild(){}};
 b.context.document.createElement=()=>({click(){clicked=true;},remove(){removed=true;}});
 b.run('exportBackup()');
 assert(clicked && removed);
 const payload=JSON.parse(exported);
 assert.equal(payload.app,'WriteQuest');assert.equal(payload.version,1);
 assert.equal(payload.data.xp.drafting,5);
 assert.equal(payload.data.checkins['2026-10-22'].drafting,5);
 assert.equal(payload.data.background,'beginner');
 assert.deepEqual(payload.data.achievementsSeen,['first']);
 const other=boot();other.context.backupText=exported;
 await other.run("importBackup({target:{files:[{size:backupText.length,text:async()=>backupText}],value:'backup.json'}})");
 assert.deepEqual(JSON.parse(other.map.get(key)),payload.data);
});

test('cancelled, oversized and malformed imports preserve both saved copies',async()=>{
 const raw=JSON.stringify(sample),b=boot({[key]:raw,[key+'-backup']:raw});
 const before=new Map(b.map);
 b.context.window.confirm=()=>false;
 await b.run("importBackup({target:{files:[{size:10,text:async()=>JSON.stringify({app:'WriteQuest',version:1,data:blank()})}],value:'backup.json'}})");
 b.context.window.confirm=()=>true;
 for(const file of ["{size:6000000,text:async()=>''}","{size:10,text:async()=>'{broken'}"]){
  await b.run(`importBackup({target:{files:[${file}],value:'backup.json'}})`);
 }
 assert.deepEqual(b.map,before);
});

test('save validation rejects non-object progress containers',()=>{
 const b=boot();
 for(const checkins of [1,true,'history',[]])assert.throws(()=>b.run(`validateSave({...blank(),checkins:${JSON.stringify(checkins)}})`));
 for(const xp of [1,true,'xp',[]])assert.throws(()=>b.run(`validateSave({...blank(),xp:${JSON.stringify(xp)}})`));
});

test('missing primary displays recovery copy and blocks new writes',()=>{
 const raw=JSON.stringify(sample), b=boot({[key+'-backup']:raw});
 assert.equal(b.run('state.xp.drafting'),5);
 assert.throws(()=>b.run('save(blank())'),/paused/);
 assert.equal(b.map.has(key),false);
 b.run('restorePrevious()');
 assert.equal(JSON.parse(b.map.get(key)).xp.drafting,5);
});
test('silent browser write failure never reports successful progress',()=>{
 const b=boot({[key]:JSON.stringify(sample)});
 b.context.localStorage.setItem=()=>{};
 assert.throws(()=>b.run('save({...state,xp:{...state.xp,drafting:8}})'),/verify/);
 assert.equal(b.run('state.xp.drafting'),5);
});
test('unfinished ratings recover only for the same day and saved profile',()=>{
 const b=boot(), drafts=new Map();
 b.context.sessionStorage={setItem:(k,v)=>drafts.set(k,v),getItem:k=>drafts.get(k)??null,removeItem:k=>drafts.delete(k)};
 b.run('draftDay=localDay();updateDraftRating("drafting",4);draftRatings=null;recoverRatingDraft();');
 assert.equal(b.run('draftRatings.drafting'),4);
 assert.equal(b.run('page'),'checkin');
 assert.equal(b.map.has(key),false);
 b.run('saveCheckin()');
 assert.equal(drafts.size,0);
 b.run('draftRatings={drafting:3};draftDay="2000-01-01";retainRatingDraft();draftRatings=null;recoverRatingDraft();');
 assert.equal(b.run('draftRatings'),null);
 b.run('draftRatings={drafting:3};draftDay=localDay();retainRatingDraft();draftRatings=null;save({...state,background:"beginner"});recoverRatingDraft();');
 assert.equal(b.run('draftRatings'),null);
});
test('ratings show rest wording and preserve numeric zero for XP',()=>{
 const b=boot();
 const html=b.run('checkinSkillRow(SKILLS[0],{drafting:0})');
 assert.match(html,/data-value="0"[^>]*>Not Practiced Today/);
 assert.doesNotMatch(html,/0 out of 5|>0\/5</);
 b.run('draftRatings={drafting:0};saveCheckin()');
 assert.equal(b.run('state.xp.drafting'),0);
});
test('mobile update checks bypass cache and reject missing build markers',async()=>{
 const b=boot();const requests=[];let status={};
 b.context.location={href:'https://example.com/WriteQuest/',replace:url=>requests.push(url)};
 b.context.URL=URL;
 b.context.document.getElementById=()=>status;
 b.context.fetch=async(url,options)=>{requests.push({url,options});return {ok:true,text:async()=>'<meta name="writequest-build" content="20261029-reliable-7">'}};
 await b.run('checkForUpdates(true)');
 assert.equal(status.textContent,'WriteQuest is up to date.');
 assert.equal(requests[0].options.cache,'no-store');
 b.context.fetch=async()=>({ok:true,text:async()=>'<meta name="writequest-build" content="20261030-next">'});
 await b.run('checkForUpdates(true)');
 assert.equal(b.run('availableBuild'),'20261030-next');
 b.run('draftRatings={drafting:4};applyUpdate()');
 assert.equal(requests.length,1);
 b.run('draftRatings=null;applyUpdate()');
 assert.match(requests[1],/v=20261030-next/);
 b.context.fetch=async()=>({ok:true,text:async()=>'<html>Error page</html>'});
 await b.run('checkForUpdates(true)');
 assert.match(status.textContent,/Could not check/);
});
test('every loaded script and stylesheet uses the same release marker',()=>{
 const html=fs.readFileSync(__dirname+'/index.html','utf8');
 const build=html.match(/name="writequest-build" content="([^"]+)"/)[1];
 const assets=[...html.matchAll(/(?:src|href)="((?:js\/[^"?]+\.js|app\.js|styles\.css)\?v=([^"]+))"/g)];
 assert.equal(assets.length,11);
 for(const match of assets)assert.equal(match[2],build,match[1]);
});

function questUI(b) {
 const controls=new Map();let overlay=null;
 const checkbox={checked:true};
 b.context.document.getElementById=id=>id==='daily-quest-check'?checkbox:id==='daily-quest-confirm'?overlay:null;
 b.context.document.removeEventListener=()=>{};
 b.context.document.body={appendChild:item=>{overlay=item;}};
 b.context.document.createElement=()=>({
   innerHTML:'',addEventListener(){},remove(){overlay=null;},
   querySelector(id){
     if(!controls.has(id))controls.set(id,{addEventListener:(event,fn)=>controls.get(id)[event]=fn,focus(){}});
     return controls.get(id);
   }
 });
 b.run('showDailyQuestReward=id=>{globalThis.rewarded=id};const questProfile=blank();questProfile.challenges[localDay()]={id:"drafting-1",swaps:0,completed:false};save(questProfile);');
 return {controls,checkbox,overlay:()=>overlay};
}
test('quest confirmation cancels without saving and Yes awards exactly two XP to its skill',()=>{
 const b=boot(),ui=questUI(b),before=b.map.get(key);
 b.run('requestDailyQuestSubmission(true)');
 assert.equal(ui.checkbox.checked,false);
 assert.match(ui.overlay().innerHTML,/Are you sure you want to submit this task for your Daily Quest\?/);
 assert.equal(b.map.get(key),before);
 ui.controls.get('#daily-quest-no').click();
 assert.equal(ui.overlay(),null);assert.equal(b.map.get(key),before);
 b.run('requestDailyQuestSubmission(true)');
 ui.controls.get('#daily-quest-yes').click();
 assert.equal(b.run('state.xp.drafting'),2);
 assert.equal(b.run('state.xp.editing'),0);
 assert.equal(b.run('globalThis.rewarded'),'drafting');
 const after=b.map.get(key);
 b.run('requestDailyQuestSubmission(true)');
 assert.equal(ui.overlay(),null);assert.equal(b.map.get(key),after);
});
test('failed quest save awards no XP and shows no reward',()=>{
 const b=boot(),ui=questUI(b);
 b.run('requestDailyQuestSubmission(true)');b.fail();
 ui.controls.get('#daily-quest-yes').click();
 assert.equal(b.run('state.xp.drafting'),0);
 assert.equal(b.run('state.challenges[localDay()].completed'),false);
 assert.equal(b.run('globalThis.rewarded'),undefined);
 assert.match(b.alerts.at(-1),/Quest was not saved/);
});
test('a swapped quest cannot be submitted through an outdated confirmation',()=>{
 const b=boot(),ui=questUI(b);
 b.run('requestDailyQuestSubmission(true);changeDailyChallenge(true)');
 ui.controls.get('#daily-quest-yes').click();
 assert.equal(b.run('state.xp.drafting'),0);
 assert.equal(b.run('state.challenges[localDay()].completed'),false);
 assert.match(b.alerts.at(-1),/changed/);
});


test('No preserves remaining quest swaps, even after repeated accidental taps',()=>{
 for(const swaps of [0,1,2]) {
  const b=boot(),ui=questUI(b);
  b.run(`const withSwaps=validateSave(state);withSwaps.challenges[localDay()].swaps=${swaps};save(withSwaps);`);
  const before=b.map.get(key);
  for(let tap=0;tap<3;tap++){
   b.run('requestDailyQuestSubmission(true)');
   ui.controls.get('#daily-quest-no').click();
   assert.equal(b.map.get(key),before);
   assert.equal(b.run('state.challenges[localDay()].swaps'),swaps);
   assert.equal(b.run('state.challenges[localDay()].everCompleted'),false);
   assert.equal(b.run('state.xp.drafting'),0);
  }
  b.run('changeDailyChallenge(true)');
  assert.equal(b.run('state.challenges[localDay()].swaps'),Math.min(2,swaps+1));
  assert.equal(b.run('state.challenges[localDay()].id === "drafting-1"'),swaps===2);
 }
});
