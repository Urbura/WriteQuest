const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync(__dirname+'/app.js','utf8').replace(/render\(\);\s*$/,'');
const key='writequest-starter-v1';
function progressOnly(profile){const {autosavedAt,...progress}=profile;return progress;}
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
test('corrupt primary recovers previous copy but prevents overwrite',()=>{const b=boot({[key]:'broken',[key+'-backup']:JSON.stringify(sample)});assert.equal(b.run('state.xp.drafting'),5);assert.throws(()=>b.run('save(state)'));assert.equal(b.map.get(key),'broken');b.run('saveLocal();loadLocal()');assert.equal(b.run('storageBlocked'),false);assert.equal(JSON.parse(b.map.get(key)).xp.drafting,5);});
test('invalid backups rejected',()=>{const b=boot();for(const data of [{}, {...sample,xp:{...sample.xp,drafting:-1}},{...sample,checkins:{'2026-02-30':{}}},{...sample,checkins:{'2026-10-22':{drafting:6}}}])assert.throws(()=>b.run(`validateSave(${JSON.stringify(data)})`));});
test('stale tab cannot overwrite a newer save',()=>{const b=boot({[key]:JSON.stringify(sample)});b.map.set(key,JSON.stringify({...sample,xp:{...sample.xp,drafting:9}}));assert.throws(()=>b.run('save(state)'),/Another tab/);assert.equal(JSON.parse(b.map.get(key)).xp.drafting,9);});
test('check-in corrections do not duplicate XP; failed check-in retains draft',()=>{const b=boot();b.run('draftDay=localDay();draftRatings={drafting:5};saveCheckin();');assert.equal(b.run('state.xp.drafting'),5);b.run('draftRatings={drafting:5};saveCheckin();');assert.equal(b.run('state.xp.drafting'),5);b.run('draftRatings={drafting:3};saveCheckin();');assert.equal(b.run('state.xp.drafting'),3);b.fail();b.run('draftRatings={drafting:4};saveCheckin();');assert.equal(b.run('state.xp.drafting'),3);assert.equal(b.run('draftRatings.drafting'),4);assert.match(b.alerts.at(-1),/not saved/);});
test('unsaved ratings across reset require review',()=>{const b=boot();b.run('draftDay="2000-01-01";draftRatings={drafting:5};saveCheckin();');assert.equal(b.map.has(key),false);assert.match(b.alerts[0],/new writing day/);});
test('reset can be recovered from a manual save',()=>{const b=boot({[key]:JSON.stringify(sample)});b.run('saveLocal();save(blank());loadLocal();');assert.equal(b.run('state.xp.drafting'),5);});
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
 b.run('saveLocal();loadLocal()');
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
 b.context.fetch=async(url,options)=>{requests.push({url,options});return {ok:true,text:async()=>'<meta name="writequest-build" content="'+b.run('APP_BUILD')+'">'}};
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
 assert.equal(boot().run('APP_BUILD'),build,'update checker must use the published release marker');
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

test('manual checkpoint survives autosaves and reloads, restoring all progress fields',()=>{
 const profile={...sample,background:'beginner',achievementsSeen:['first'],recentAchievements:['first']};
 const b=boot({[key]:JSON.stringify(profile)});
 b.run('saveLocal()');
 const checkpoint=b.map.get(key+'-manual'),payload=JSON.parse(checkpoint);
 assert.equal(payload.app,'WriteQuest');assert.equal(payload.version,1);
 assert(Number.isFinite(Date.parse(payload.savedAt)));
 b.run('save({...state,xp:{...state.xp,drafting:19}})');
 assert.equal(b.map.get(key+'-manual'),checkpoint,'autosaves must not overwrite the manual slot');
 const current=b.map.get(key),reopened=boot(Object.fromEntries(b.map));
 reopened.run('draftRatings={drafting:1};draftDay=localDay();loadLocal()');
 assert.deepEqual(progressOnly(JSON.parse(reopened.map.get(key))),progressOnly(payload.data));
 assert.equal(reopened.map.get(key+'-backup'),current,'load retains pre-load progress for recovery');
 assert.equal(reopened.map.get(key+'-manual'),checkpoint);
 assert.equal(reopened.run('draftRatings'),null);
 assert.match(reopened.run('manualSaveStatus().text'),/Saved on this device/);
 assert.match(reopened.alerts.at(-1),/loaded successfully/);
});

test('cancelling manual overwrite or loading preserves all stored copies',()=>{
 const b=boot({[key]:JSON.stringify(sample)});b.run('saveLocal();save({...state,xp:{...state.xp,drafting:12}})');
 const before=new Map(b.map);
 b.context.window.confirm=()=>false;
 b.run('saveLocal();loadLocal();loadAutosave()');
 assert.deepEqual(b.map,before);
 assert.equal(b.run('state.xp.drafting'),12);
});

test('missing and invalid manual saves never replace progress',()=>{
 const raw=JSON.stringify(sample);
 const invalid=['{broken',JSON.stringify({app:'Other',version:1,savedAt:new Date().toISOString(),data:sample}),
  JSON.stringify({app:'WriteQuest',version:1,savedAt:'not a date',data:sample}),
  JSON.stringify({app:'WriteQuest',version:1,savedAt:new Date().toISOString(),data:{...sample,xp:{...sample.xp,drafting:-1}}})];
 for(const checkpoint of [null,...invalid]){
  const entries={[key]:raw,[key+'-backup']:raw};
  if(checkpoint!==null)entries[key+'-manual']=checkpoint;
  const b=boot(entries),before=new Map(b.map);
  b.run('loadLocal()');
  assert.deepEqual(b.map,before);
  assert.equal(b.run('state.xp.drafting'),5);
  assert.equal(b.run('manualSaveStatus().available'),false);
  assert.match(b.alerts.at(-1),/not loaded/);
 }
});

test('failed and silent manual writes do not report success or change autosave',()=>{
 const raw=JSON.stringify(sample),b=boot({[key]:raw});
 b.fail();b.run('saveLocal()');
 assert.equal(b.map.get(key),raw);assert.equal(b.map.has(key+'-manual'),false);
 assert.match(b.alerts.at(-1),/not created/);
 const c=boot({[key]:raw});c.context.localStorage.setItem=()=>{};c.run('saveLocal()');
 assert.match(c.alerts.at(-1),/could not verify/);assert.equal(c.map.get(key),raw);
});

test('manual operations reject stale tabs while explicit autosave load refreshes safely',()=>{
 const b=boot({[key]:JSON.stringify(sample)});b.run('saveLocal()');
 const manual=b.map.get(key+'-manual'),newer=JSON.stringify({...sample,xp:{...sample.xp,drafting:21}});
 b.map.set(key,newer);
 b.run('saveLocal();loadLocal()');
 assert.equal(b.map.get(key),newer);assert.equal(b.map.get(key+'-manual'),manual);
 assert.equal(b.run('state.xp.drafting'),5);
 b.run('loadAutosave()');
 assert.equal(b.run('state.xp.drafting'),21);assert.equal(b.run('expectedRaw'),newer);
 assert.equal(b.map.get(key),newer);assert.equal(b.map.get(key+'-manual'),manual);
 b.run('save({...state,background:"beginner"})');
 assert.equal(JSON.parse(b.map.get(key)).background,'beginner');
});

test('autosave load cancels cleanly and rejects missing, damaged, or changed copies',()=>{
 for(const raw of [undefined,'broken']){
  const b=boot(raw===undefined?{}:{[key]:raw}),before=new Map(b.map);
  b.run('loadAutosave()');assert.deepEqual(b.map,before);assert.match(b.alerts.at(-1),/not loaded/);
 }
 const b=boot({[key]:JSON.stringify(sample)});
 b.run('draftRatings={drafting:2};draftDay=localDay()');
 b.context.window.confirm=()=>false;b.run('loadAutosave()');
 assert.equal(b.run('draftRatings.drafting'),2);
 b.context.window.confirm=()=>{b.map.set(key,JSON.stringify({...sample,xp:{...sample.xp,drafting:30}}));return true;};
 b.run('loadAutosave()');
 assert.equal(b.run('state.xp.drafting'),5);
 assert.equal(JSON.parse(b.map.get(key)).xp.drafting,30);
 assert.match(b.alerts.at(-1),/changed in another tab/);
});

test('manual save can preserve recovered progress and repair a damaged autosave',()=>{
 const b=boot({[key]:'broken',[key+'-backup']:JSON.stringify(sample)});
 b.run('saveLocal()');assert.equal(b.map.get(key),'broken');
 assert.equal(b.run('manualSaveStatus().available'),true);
 b.run('loadLocal()');assert.equal(b.run('storageBlocked'),false);
 assert.equal(JSON.parse(b.map.get(key)).xp.drafting,5);
});

test('Load menu exposes both sources, keeps unavailable options disabled, and cancels without writes',()=>{
 const b=boot({[key]:JSON.stringify(sample)}),controls=new Map();let removed=false,contained=0,released=0;
 const overlay={className:'',innerHTML:'',addEventListener(){},remove(){removed=true;},
  querySelector(selector){if(!controls.has(selector))controls.set(selector,{addEventListener(event,fn){this[event]=fn;},focus(){}});return controls.get(selector);}};
 b.context.document.createElement=()=>overlay;b.context.document.body={appendChild(){}};
 b.context.WriteQuestDialogs={contain(){contained++;},release(){released++;}};
 const before=new Map(b.map);b.run('openLoadMenu()');
 assert.match(overlay.innerHTML,/>Last Autosave</);assert.match(overlay.innerHTML,/id="load-manual" disabled/);
 controls.get('#cancel-load').click();assert(removed);assert.equal(contained,1);assert.equal(released,1);
 assert.deepEqual(b.map,before);
 b.run('saveLocal();openLoadMenu()');
 assert.doesNotMatch(overlay.innerHTML,/id="load-manual" disabled/);
 b.run('save({...state,xp:{...state.xp,drafting:15}})');
 controls.get('#load-manual').click();assert.equal(b.run('state.xp.drafting'),5);
 const settings=b.run('settings()');
 assert.match(settings,/id="save-local">Save</);assert.match(settings,/id="load-local" type="button">Load</);
});

test('load previews show each saved copy’s own rank, total and five skill levels',()=>{
 const b=boot({[key]:JSON.stringify(sample)});
 b.run('saveLocal();var previewManual=readManualSave();save({...state,xp:{...state.xp,drafting:100}});var previewAuto=readAutosave()');
 const manual=b.run('loadSlotHTML("load-manual","Manual Save",previewManual)');
 const autosave=b.run('loadSlotHTML("load-autosave","Last Autosave",previewAuto)');
 assert.match(manual,/Total Level 6</);assert.match(manual,/>Beginner</);assert.match(manual,/>Lv 2</);
 for(const name of ['Drafting','Editing','Creativity','Learning','Research'])assert(manual.includes('>'+name+'</'));
 assert.equal((manual.match(/class="load-slot-skill"/g)||[]).length,5);
 assert.match(manual,/class="load-slot-date">Saved /);
 assert(autosave.includes('Total Level '+b.run('getTotalLevel()')+'<'));
 assert.match(autosave,/class="load-slot-date">Saved /);assert.notEqual(manual,autosave);
 assert.match(b.run('loadSlotHTML("load-manual","Manual Save",null)'),/disabled/);
});

test('loading a preview refuses a slot changed after the menu was opened',()=>{
 const b=boot({[key]:JSON.stringify(sample)});
 b.run('saveLocal();var shownManual=readManualSave();var shownAuto=readAutosave()');
 const changed=JSON.parse(b.map.get(key+'-manual'));changed.data.xp.drafting=50;
 b.map.set(key+'-manual',JSON.stringify(changed));
 const newer=JSON.stringify({...sample,xp:{...sample.xp,drafting:40}});b.map.set(key,newer);
 const before=new Map(b.map);
 b.run('loadLocal(shownManual)');
 assert.match(b.alerts.at(-1),/manual save changed/);
 b.run('loadAutosave(shownAuto)');
 assert.match(b.alerts.at(-1),/autosave changed/);
 assert.deepEqual(b.map,before);
 assert.equal(b.run('state.xp.drafting'),5);
});

function setSaveClock(b,iso){
 b.context.Date=class extends Date {
  constructor(...args){super(...(args.length?args:[iso]));}
  static now(){return Date.parse(iso);}
 };
}
test('autosave timestamps track successful writes and stay separate from manual saves',()=>{
 const b=boot({[key]:JSON.stringify(sample)});
 assert.equal(b.run('readAutosave().savedAt'),null,'legacy saves must not receive an invented time');
 assert.match(b.run('loadSlotHTML("auto","Last Autosave",readAutosave())'),/Last check-in/);
 setSaveClock(b,'2026-11-09T17:00:00.000Z');
 b.run('save(state)');
 assert.equal(JSON.parse(b.map.get(key)).autosavedAt,'2026-11-09T17:00:00.000Z');
 setSaveClock(b,'2026-11-09T17:05:00.000Z');b.run('saveLocal()');
 const manual=b.map.get(key+'-manual');
 assert.equal(b.run('readAutosave().savedAt'),'2026-11-09T17:00:00.000Z');
 assert.equal(JSON.parse(manual).savedAt,'2026-11-09T17:05:00.000Z');
 setSaveClock(b,'2026-11-09T17:10:00.000Z');b.run('save({...state,xp:{...state.xp,drafting:10}})');
 assert.equal(b.run('readAutosave().savedAt'),'2026-11-09T17:10:00.000Z');
 assert.equal(b.map.get(key+'-manual'),manual);
 const reopened=boot(Object.fromEntries(b.map));
 assert.equal(reopened.run('readAutosave().savedAt'),'2026-11-09T17:10:00.000Z');
 const before=new Map(reopened.map);reopened.run('loadAutosave()');assert.deepEqual(reopened.map,before);
 assert.match(reopened.run('loadSlotHTML("auto","Last Autosave",readAutosave())'),/class="load-slot-date">Saved /);
 assert.doesNotMatch(reopened.run('loadSlotHTML("auto","Last Autosave",readAutosave())'),/Last check-in/);
});
test('failed writes never advance the recorded autosave time',()=>{
 for(const silent of [false,true]){
  const old='2026-11-09T17:00:00.000Z',raw=JSON.stringify({...sample,autosavedAt:old});
  const b=boot({[key]:raw});setSaveClock(b,'2026-11-09T18:00:00.000Z');
  if(silent)b.context.localStorage.setItem=()=>{};else b.fail();
  assert.throws(()=>b.run('save({...state,xp:{...state.xp,drafting:9}})'));
  assert.equal(b.map.get(key),raw);assert.equal(b.run('state.autosavedAt'),old);
  assert.equal(b.run('readAutosave().savedAt'),old);
 }
});
test('timestamp validation preserves compatible saves and ignores invalid optional metadata',()=>{
 const b=boot();
 for(const stamp of [null,123,'not a date','<script>bad</script>']){
  b.context.timestampInput=stamp;
  assert.equal(b.run('validateSave({...state,autosavedAt:timestampInput}).autosavedAt'),undefined);
 }
 b.context.timestampInput='2026-11-09T12:00:00-06:00';
 assert.equal(b.run('validateSave({...state,autosavedAt:timestampInput}).autosavedAt'),'2026-11-09T18:00:00.000Z');
});
