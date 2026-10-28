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
