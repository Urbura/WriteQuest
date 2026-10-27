"use strict";
/* WRITEQUEST DATA: Edit skill descriptions and examples here. */
const SKILLS=[
 {id:"drafting",name:"Drafting",icon:"🪶",color:"#38bdf8",description:"Creating new written content for your stories, books, poems, or other writing projects.",examples:["Write a new chapter or scene","Develop dialogue between characters","Write a first draft","Add new material to a manuscript"]},
 {id:"editing",name:"Editing",icon:"📜",color:"#c084fc",description:"Improving writing you have already created through revision, proofreading, and restructuring.",examples:["Rewrite a paragraph","Fix grammar and spelling","Improve dialogue or descriptions","Reorganize scenes or chapters"]},
 {id:"creativity",name:"Creativity",icon:"💡",color:"#f4c430",description:"Exploring ideas and creative possibilities for your writing.",examples:["Brainstorm story ideas","Create characters and settings","Plan plot twists","Experiment with story concepts"]},
 {id:"learning",name:"Learning",icon:"📖",color:"#34d399",description:"Developing your knowledge of writing techniques and storytelling craft.",examples:["Study narrative structure","Read about writing techniques","Practise a new literary technique","Learn how to write stronger dialogue"]},
 {id:"research",name:"Research",icon:"🔎",color:"#f472b6",description:"Gathering information to make your writing more informed and convincing.",examples:["Research historical settings","Investigate a topic for a manuscript","Check factual accuracy","Explore real-world locations for a story"]}
];

/* Approved transparent skill assets; labels remain accessible text. */
function skillIcon(skill){return '<img class="skill-asset" src="./assets/skills/'+skill.id+'.png?v=20261023-approved" alt="" aria-hidden="true" width="64" height="64" decoding="async">';}

/* PROGRESSION: The curve and milestone bonuses can be tuned later. */
const XP_TO_NEXT=level=>Math.ceil(5*Math.pow(1.06,level-1));
const BONUS=level=>level>=40?4:level>=30?3:level>=20?2:level>=10?1:0;
const RANKS=[["Grandmaster",50],["Master",45],["Diamond",40],["Emerald",35],["Platinum",30],["Gold",20],["Silver",10],["Bronze",1]];
const rank=level=>RANKS.find(r=>level>=r[1])[0];
const KEY="writequest-starter-v1";
const blank=()=>({xp:Object.fromEntries(SKILLS.map(s=>[s.id,0])),checkins:{}});
const BACKUP_KEY=KEY+"-backup";
let saveNotice="",storageBlocked=false,expectedRaw=null;
function validateSave(input){
 if(!input||typeof input!=="object"||Array.isArray(input)||!input.xp||!input.checkins||Array.isArray(input.checkins))throw Error("Invalid WriteQuest save.");
 const clean=blank();
 if(Array.isArray(input.achievementsSeen))clean.achievementsSeen=[...new Set(input.achievementsSeen.filter(id=>typeof id==="string"&&id.length<80))];
 for(const skill of SKILLS){const n=input.xp[skill.id];if(!Number.isSafeInteger(n)||n<0)throw Error("Invalid skill XP.");clean.xp[skill.id]=n;}
 for(const [day,ratings] of Object.entries(input.checkins)){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day||!ratings||typeof ratings!=="object"||Array.isArray(ratings))throw Error("Invalid check-in date.");
  clean.checkins[day]={};
  for(const skill of SKILLS){const n=ratings[skill.id]??0;if(!Number.isInteger(n)||n<0||n>5)throw Error("Ratings must be whole numbers from 0 to 5.");clean.checkins[day][skill.id]=n;}
 }
 return clean;
}
function loadProgress(){
 try{
  expectedRaw=localStorage.getItem(KEY);
  if(expectedRaw!==null){try{return validateSave(JSON.parse(expectedRaw));}catch(error){
   storageBlocked=true;
   saveNotice="The main save is damaged and has been preserved. Export a backup before restoring or importing progress.";
   const backup=localStorage.getItem(BACKUP_KEY);
   if(backup!==null){try{const recovered=validateSave(JSON.parse(backup));saveNotice="Showing your previous valid save. Export it, then use Restore Previous Save to resume saving.";return recovered;}catch(error){/* Preserve both copies for recovery. */}}
   return blank();
  }}
  return blank();
 }catch(error){storageBlocked=true;saveNotice="Browser storage is unavailable. Saving is paused; export any progress before closing this page.";return blank();}
}
let state=loadProgress();
const developer=globalThis.WriteQuestDeveloper?.create({
 skills:SKILLS,blank,validate:validateSave,getState:()=>state,setState:next=>{state=next;},
 loadNormal:loadProgress,xpToNext:XP_TO_NEXT
});
let developerBackgroundOnly=false;
let page="home",previous="home",selected="drafting",draftRatings=null,draftDay=null;
const app=document.getElementById("app");
function save(next,{recover=false}={}){
 const clean=validateSave(next);
 if(developer?.active){state=clean;return;}
 if(storageBlocked&&!recover)throw Error("Saving is paused to protect existing data. Open Settings to export and restore a backup.");
 const current=localStorage.getItem(KEY);
 if(current!==expectedRaw)throw Error("Another tab changed your progress. Export this tab’s progress, then reload before saving.");
 if(current!==null){let valid=false;try{validateSave(JSON.parse(current));valid=true;}catch(error){}if(valid)localStorage.setItem(BACKUP_KEY,current);}
 const raw=JSON.stringify(clean);
 localStorage.setItem(KEY,raw);
 expectedRaw=raw;state=clean;storageBlocked=false;saveNotice="";
}
function stats(xp){let level=1,remaining=xp;while(level<50&&remaining>=XP_TO_NEXT(level)){remaining-=XP_TO_NEXT(level);level++}return {level,remaining,need:level===50?0:XP_TO_NEXT(level)}}
/* Use local calendar arithmetic so daylight saving days retain a 3:30 a.m. reset. */
function localDay(now=new Date()){
 const date=new Date(now);
 if(date.getHours()*60+date.getMinutes()<210)date.setDate(date.getDate()-1);
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
}
function exportBackup(){
 if(developer?.active){alert("Exit Test Mode to export your normal progress.");return;}
 const payload={app:"WriteQuest",version:1,exportedAt:new Date().toISOString(),data:state};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
 const link=document.createElement("a");link.href=url;link.download="writequest-backup-"+localDay()+".json";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importBackup(event){
 if(developer?.active){event.target.value="";alert("Exit Test Mode before importing a backup.");return;}
 const file=event.target.files?.[0];if(!file)return;
 try{
  if(file.size>5*1024*1024)throw Error("Choose a WriteQuest backup smaller than 5 MB.");
  const payload=JSON.parse(await file.text());
  if(payload.app!=="WriteQuest"||payload.version!==1)throw Error("This is not a supported WriteQuest backup.");
  const next=validateSave(payload.data);
  if(!window.confirm("Replace current progress with this backup? Export your current progress first if you want to keep it."))return;
  save(next,{recover:true});draftRatings=null;draftDay=null;render();alert("Backup restored successfully.");
 }catch(error){alert("Backup was not restored. "+error.message);}finally{event.target.value="";}
}
function restorePrevious(){
 if(developer?.active){alert("Exit Test Mode before restoring a backup.");return;}
 try{
  const raw=localStorage.getItem(BACKUP_KEY);if(!raw)throw Error("No previous save is available yet.");
  const next=validateSave(JSON.parse(raw));
  if(!window.confirm("Restore the previous saved version? Export your current progress first if you want to keep it."))return;
  save(next,{recover:true});draftRatings=null;draftDay=null;render();
 }catch(error){alert("Could not restore progress. "+error.message);}
}
function navigate(next){if(next==="checkin"){draftRatings=null;draftDay=localDay();}if(next==="detail"){previous=page}else{previous=page}page=next;render();window.scrollTo(0,0)}
function openSkill(id){selected=id;navigate("detail")}
function back(){navigate("home")}
/* Shared gear asset keeps the header and Settings heading consistent. */
const GEAR_ICON='<img class="settings-icon" src="./assets/ui/settings.svg" alt="" aria-hidden="true" width="26" height="26">';
function header(){
 const total=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0),current=totalRank(total),rankClass=current.toLowerCase();
 const brand='<button type="button" class="brand brand-logo" data-page="journey" aria-label="WriteQuest — open Journey" title="Journey"><img src="./assets/branding/writequest-logo-white-gold.png?v=20261026-logo-02" alt="WriteQuest" width="2172" height="724" decoding="async"></button>';
 const badge=current==="Beginner"?'<span class="header-rank-icon header-rank-beginner" aria-hidden="true">◇</span>':'<img class="header-rank-icon" src="./assets/achievements/ranks/'+rankClass+'.svg?v=20261026-progression" alt="" aria-hidden="true" width="28" height="32" decoding="async">';
 return '<header class="quest-header">'+brand+'<button class="header-level total-level-button rank-border-'+rankClass+'" id="open-ranks" aria-label="'+current+' rank. Total level '+total+'. View rank progression" title="'+current+' — view rank progression">'+badge+'<span class="header-level-label">Total Level <strong>'+total+'</strong></span></button>'+'<div class="header-actions"><button class="settings-button achievements-button" data-page="projects" aria-label="Achievements'+(unseenAchievements().length?', '+unseenAchievements().length+' new':'')+'" title="Achievements"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 3h10v5c0 4-2 6-5 6S7 12 7 8ZM7 5H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4M12 14v6m-5 1h10"/></svg>'+(unseenAchievements().length?'<span class="header-new-dot"></span>':'')+'</button><button class="settings-button" id="open-settings" aria-label="Open settings" title="Settings">'+GEAR_ICON+'</button></div></header>';
}
function contentBack(){return '<button class="back content-back" id="back" aria-label="Go Back to Home">← Go Back</button>';}
function contentTitle(title){return '<div class="page-title-row">'+contentBack()+'<h1>'+title+'</h1></div>';}
function progress(xp,color){const p=stats(xp);return '<div class="row small"><span>Level '+p.level+' / 50 · '+rank(p.level)+'</span><span>'+(p.level===50?'MAX':p.remaining+' / '+p.need+' XP')+'</span></div><div class="meter"><div class="fill" data-quest-xp="'+selected+'" data-xp-level="'+p.level+'" data-xp-fraction="'+(p.level===50?1:p.remaining/p.need)+'" style="width:'+(p.level===50?100:Math.floor(100*p.remaining/p.need))+'%;background:'+color+'"></div></div>'}
/* Compact dashboard XP bars use the same level calculation as skill details. */
function homeProgress(skill){
 const p=stats(state.xp[skill.id]),maxed=p.level===50;
 const value=maxed?1:p.remaining,need=maxed?1:p.need;
 const label=maxed?skill.name+': maximum level reached':skill.name+': '+p.remaining+' / '+p.need+' XP to Level '+(p.level+1);
 return '<span class="home-progress" role="progressbar" aria-label="'+label+'" aria-valuemin="0" aria-valuemax="'+need+'" aria-valuenow="'+value+'" title="'+label+'"><span class="home-progress-fill" data-quest-xp="'+skill.id+'" data-xp-level="'+p.level+'" data-xp-fraction="'+(value/need)+'" style="width:'+(100*value/need)+'%;background:'+skill.color+'"></span></span>';
}
function writingDay(ratings=todayRatings()){const positive=SKILLS.filter(s=>Number(ratings[s.id]||0)>0);return {positive,complete:positive.length>0,count:positive.length};}
function home(){const total=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0);const day=writingDay(),checkedIn=day.complete;return header()+'<div class="skill-star"><div class="skill-grid">'+SKILLS.map(s=>'<button class="skill skill-rank-'+rank(stats(state.xp[s.id]).level).toLowerCase().replace(/[^a-z]/g,"")+(stats(state.xp[s.id]).level===50?' skill-mastery':'')+'" style="--mastery-color:'+s.color+';--mastery-delay:'+(-SKILLS.indexOf(s)*1.7)+'s" data-skill="'+s.id+'"><span class="symbol" aria-hidden="true">'+skillIcon(s)+'</span><strong>'+s.name+'</strong><span class="small">Level '+stats(state.xp[s.id]).level+' · '+rank(stats(state.xp[s.id]).level)+'</span>'+homeProgress(s)+'</button>').join("")+'</div><button class="star-checkin '+(checkedIn?'star-checkin-done':'star-checkin-pending')+'" data-page="checkin" aria-label="'+(checkedIn?'Writing day complete. You made time for your writing. '+day.count+' of 5 skills checked in. Tap to edit.':'Tap to record today’s writing. One skill is enough.')+'"><span class="star-checkin-title">'+(checkedIn?'Writing day':'Skills')+'</span><span class="star-checkin-icon" aria-hidden="true">'+(checkedIn?'✓':'✎')+'</span><span class="star-checkin-label">'+(checkedIn?'Complete':'Check In')+'</span>'+(checkedIn?'<span class="star-checkin-count">'+day.count+' of 5 skills</span>':'')+'</button></div>'}
function detail(){const s=SKILLS.find(x=>x.id===selected),p=stats(state.xp[s.id]),next=[10,20,30,40].find(n=>n>p.level);return header()+'<section class="card skill-detail">'+contentBack()+'<div class="detail-top"><div class="detail-identity"><span class="detail-icon" aria-hidden="true">'+skillIcon(s)+'</span><h1>'+s.name+'</h1></div><div class="detail-standing"><span class="rank">'+rank(p.level)+'</span><strong>Level '+p.level+'</strong></div></div><div class="detail-progress">'+progress(state.xp[s.id],s.color)+'</div><h2>What is '+s.name+'?</h2><p>'+s.description+'</p><h2>Activities that count</h2><ul class="examples">'+s.examples.map(x=>'<li>'+x+'</li>').join("")+'</ul><div class="notice"><strong>XP:</strong> Rate your daily effort 0–5. You can leave a skill at zero.</div><p class="small muted">'+(next?'Next bonus: Level '+next+' (+ '+(next/10)+' XP on positive check-ins).':'All milestone XP bonuses unlocked!')+'</p></section><button class="primary" data-page="checkin">Go to Daily Check-In</button>'}
function todayRatings(){return state.checkins[localDay()]||{}}
function editingRatings(){return draftRatings||todayRatings()}
function checkin(){const today=editingRatings();return header()+'<div class="checkin-heading">'+contentBack()+'<h1>Daily Check-In</h1><p class="muted checkin-intro">Rate progress toward your own goal: 0–5. One skill is enough; leave the others at zero.</p></div><section class="card checkin-card">'+SKILLS.map(s=>'<div class="check-row"><div class="row"><strong>'+skillIcon(s)+' '+s.name+'</strong><span class="small muted" id="value-'+s.id+'">'+(today[s.id]??0)+'/5</span></div><div class="rating">'+[0,1,2,3,4,5].map(n=>'<button data-rate="'+s.id+'" data-value="'+n+'" aria-pressed="'+((today[s.id]??0)===n)+'">'+n+'</button>').join("")+'</div></div>').join("")+'</section><button class="primary" id="save-checkin">Save Today’s Check-In</button><p class="small muted checkin-footer">Resets at 3:30 a.m. local time · Backups in Settings</p>'}
/* Total Level ranks use the sum of all five skill levels (5–250). */
const TOTAL_RANKS=[["Beginner",5],["Bronze",10],["Silver",25],["Gold",50],["Platinum",75],["Emerald",100],["Diamond",150],["Master",200],["Grandmaster",250]];
/* Background rewards follow existing Total Level ranks; no new save fields. */
const BACKGROUND_REWARDS={
 Beginner:{key:"beginner",name:"Quiet Desk"},
 Bronze:{key:"bronze",name:"Candlelit Study"},
 Silver:{key:"silver",name:"Moonlit Reading Room"},
 Gold:{key:"gold",name:"Golden Library"},
 Platinum:{key:"platinum",name:"Skyward Archive"},
 Emerald:{key:"emerald",name:"Garden Library"},
 Diamond:{key:"diamond",name:"Starlit Athenaeum"},
 Master:{key:"master",name:"Author’s Observatory"},
 Grandmaster:{key:"grandmaster",name:"Grand Author’s Hall"}
};
function backgroundForTotal(total){return BACKGROUND_REWARDS[totalRank(total)];}
function applyRankBackground(){
 const total=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0),reward=backgroundForTotal(total);
 document.body.dataset.rankBackground=reward.key;
 const file=reward.key+"-portrait-v"+(["beginner","emerald"].includes(reward.key)?4:3)+".webp";
 document.body.style.setProperty("--rank-art",'url("./assets/backgrounds/'+file+'?v=20261027-beginner-attic")');
}

function totalRank(total){return [...TOTAL_RANKS].reverse().find(([name,min])=>total>=min)[0]}
function rankProgression(){
 const total=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0),current=totalRank(total);
 return header()+'<section class="card">'+contentTitle('Total Level Ranks')+'<p class="muted">Your Total Level is the sum of your five writing skills. Each rank unlocks a new writing background.</p><div class="rank-summary rank-summary-'+current.toLowerCase()+'"><strong>'+current+'</strong><span>Total Level '+total+' / 250</span></div><h2>Rank Progression</h2><div class="rank-list">'+TOTAL_RANKS.map(([name,min])=>'<div class="rank-row '+(name===current?'rank-current':'')+'"><span class="rank-symbol" aria-hidden="true">'+(name==='Beginner'?'◇':'<img class="rank-list-icon '+(total>=min?'':'rank-list-icon-locked')+'" src="./assets/achievements/ranks/'+name.toLowerCase()+'.svg?v=20261026-progression" alt="" width="40" height="40" decoding="async">')+'</span><span class="rank-name">'+name+(name===current?' <span class="small muted">(Current)</span>':'')+'<small class="rank-background-name">'+BACKGROUND_REWARDS[name].name+'</small></span><span class="small">'+min+'</span></div>').join('')+'</div></section>';
}
function settings(){return header()+'<section class="card settings-card">'+contentTitle(GEAR_ICON+'<span>Settings</span>')+'<h2>Your progress</h2><p class="notice">Progress is saved on this device, with a previous-save recovery copy. Download a backup before clearing browser data or changing devices. Backups are not cloud synced.</p><h2>Daily reset</h2><p class="muted">3:30 a.m. your device’s local time, including daylight saving changes. A reset opens a new check-in day; your XP and history stay saved.</p><h2>Back up and restore</h2><button class="primary" id="export-backup">Export Backup</button><details class="backup-options"><summary class="secondary">Restore Backup</summary><div class="backup-options-actions"><button class="secondary" id="choose-backup" type="button">Import Backup File</button><input id="import-backup" type="file" accept="application/json,.json" hidden><button class="secondary" id="restore-previous">Restore Previous Save</button></div></details><h2>Sounds & help</h2><button class="secondary" id="toggle-sounds" aria-pressed="'+(globalThis.WriteQuestSounds?.isEnabled()!==false)+'">Sounds: '+(globalThis.WriteQuestSounds?.isEnabled()===false?'Off':'On')+'</button><button class="secondary" id="open-tutorial">View Tutorial</button><h2>Developer Mode</h2><p class="small muted">Preview every rank and background using a separate temporary profile.</p><button class="secondary" id="open-developer">Open Test Mode</button><h2>Reset progress</h2><p class="small muted">Erase all saved skill XP and daily check-ins on this device. This cannot be undone.</p><button class="reset-button" id="reset-progress">Reset Progress</button></section>'}
/* One attainable goal keeps Journey useful for focused writing days. */
function nextMilestone(items){
 return items.filter(a=>!a.earned&&(a.id==="first"||/^(days-|total-|any-)/.test(a.id)||SKILLS.some(s=>a.id===s.id+"-25"||a.id===s.id+"-50")))
  .sort((a,b)=>b.value/b.goal-a.value/a.goal||a.goal-a.value-(b.goal-b.value)||a.id.localeCompare(b.id))[0]||null;
}
function journeyMilestone(){
 const item=nextMilestone(achievementList());
 if(!item)return '<h2>Your next milestone</h2><p class="muted">Every focused writing day adds to your journey.</p>';
 const remaining=item.goal-item.value;
 let label,unit;
 if(item.id==="first"||item.id.startsWith("days-")){label="active days";unit=remaining===1?"active day":"active days";}
 else if(item.id.startsWith("total-")){label="total levels";unit=remaining===1?"total level":"total levels";}
 else{label="skill levels";unit=remaining===1?"skill level":"skill levels";}
 return '<h2>Your next milestone</h2><p><strong>'+item.name+'</strong></p><p class="small muted">'+item.description+'</p><progress class="collection-progress" max="'+item.goal+'" value="'+item.value+'" aria-label="'+item.name+': '+item.value+' of '+item.goal+' '+label+'"></progress><p class="small">'+item.value+' / '+item.goal+' '+label+' · '+remaining+' more '+unit+' to go</p><button class="secondary" data-page="projects">View Achievements</button>';
}
function journey(){
 const data=globalThis.WriteQuestJourney.summary(state.checkins,localDay());
 return header()+'<section class="card">'+contentTitle('Journey')+''+(developer?.active?'<p class="small muted">Test Mode preview</p>':'')+'<h2>This week</h2><p>'+data.weekly+' / 7 days checked in</p><div class="journey-week">'+data.week.map((d,i)=>'<div class="journey-day '+(d.checked?'journey-checked':'')+'" aria-label="'+d.day+': '+(d.checked?'Checked in':d.future?'Upcoming':'No check-in')+'"><span>'+['S','M','T','W','T','F','S'][i]+'</span><strong aria-hidden="true">'+(d.checked?'✓':d.future?'·':'—')+'</strong></div>').join('')+'</div><div class="journey-stats"><div><strong>'+data.activeDays+'</strong><span>Active days</span></div><div><strong>'+data.current+'</strong><span>Current streak</span></div><div><strong>'+data.longest+'</strong><span>Longest streak</span></div></div><p class="muted">'+(data.started?'Your writing journey began '+data.started+'.':'Your first positive check-in starts your journey. One skill is enough.')+'</p><p class="small muted">A rating of 1–5 in any one skill counts as an active day and toward your streak. Other skills can stay at zero. Your writing day resets at 3:30 a.m. your device’s local time.</p>'+journeyMilestone()+'<h2>About WriteQuest</h2><p class="muted">Track writing effort across Drafting, Editing, Creativity, Learning, and Research.</p></section>';
}
function openTutorial(){
 const steps=[['Welcome to WriteQuest','Build your writing habits across Drafting, Editing, Creativity, Learning, and Research.'],['Check in once a day','Tap the centre Check In button. Rate progress toward your own goal from 0–5, then save. A rating of 1–5 in one skill completes your writing day and counts toward your streak. Leave other skills at zero; you can edit today’s ratings. Your day resets at 3:30 a.m. local time.'],['Watch your progress grow','Earn XP, gain levels, and unlock cozy backgrounds. Achievements track your milestones; Journey shows your weekly activity. Back up your progress in Settings.']];
 let step=0;const overlay=document.createElement('div');overlay.className='save-overlay';
 const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey);if(!developer?.active)try{localStorage.setItem('writequest-tutorial-seen','1');}catch(_){}document.querySelector('[data-page="checkin"], [data-page="home"]')?.focus();};
 const onKey=e=>{if(e.key==='Escape')close();};
 const draw=()=>{overlay.innerHTML='<section class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorial-heading"><p class="small">'+(step+1)+' / '+steps.length+'</p><h2 id="tutorial-heading">'+steps[step][0]+'</h2><p>'+steps[step][1]+'</p><button class="primary" id="tutorial-next">'+(step===2?'Start writing':'Next')+'</button><button class="secondary" id="tutorial-skip">Skip tutorial</button></section>';overlay.querySelector('#tutorial-next').addEventListener('click',()=>{if(step===2)close();else{step++;draw();}});overlay.querySelector('#tutorial-skip').addEventListener('click',close);overlay.querySelector('#tutorial-next').focus();};
 document.body.appendChild(overlay);document.addEventListener('keydown',onKey);draw();
}
function toggleSounds(){const audio=globalThis.WriteQuestSounds;if(!audio)return;audio.setEnabled(!audio.isEnabled());audio.unlock();audio.play('checkin');render();}
function achievementList(){return globalThis.WriteQuestAchievements?.list({skills:SKILLS,xp:state.xp,checkins:state.checkins,level:xp=>stats(xp).level,ranks:TOTAL_RANKS})||[]}
function unseenAchievements(){return achievementList().filter(a=>a.earned&&!(state.achievementsSeen||[]).includes(a.id))}
function viewAchievement(id){
 const item=achievementList().find(a=>a.id===id&&a.earned);if(!item||(state.achievementsSeen||[]).includes(id))return;
 const expanded=Array.from(app.querySelectorAll?.('.achievement-group')||[],group=>group.open);
 const next=validateSave(state);next.achievementsSeen=[...new Set([...(next.achievementsSeen||[]),id])];
 try{save(next);}catch(error){alert("Could not mark achievement viewed. "+error.message);return;}
 render();
 Array.from(app.querySelectorAll?.('.achievement-group')||[]).forEach((group,i)=>{group.open=expanded[i]??group.open;});
 celebrateAchievement();
}
function celebrateAchievement(){
 if(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
 const effect=document.createElement('div');effect.className='firework-bursts achievement-fireworks';effect.setAttribute('aria-hidden','true');
 const colors=['#f4c76a','#38bdf8','#c084fc','#86efac'];
 for(let i=0;i<24;i++){const spark=document.createElement('span');spark.className='firework-spark';spark.style.setProperty('--angle',(i*15)+'deg');spark.style.setProperty('--distance',(70+(i%4)*20)+'px');spark.style.setProperty('--spark-color',colors[i%colors.length]);effect.appendChild(spark);}
 document.body.appendChild(effect);setTimeout(()=>effect.remove(),1100);
}
// All achievement icons share one image download and a fixed square viewport.
/* Shared writing crest gains richer framing at each skill milestone. */
function skillMilestoneBadge(a){
 const tier=a.goal,master=tier===50,advanced=tier>=25;
 const metal=master?"#f8d780":advanced?"#eec16b":"#b9d6e7";
 const dark=master?"#382453":advanced?"#3e3022":"#213b50";
 const ribbon=master?"#9562cf":advanced?"#af713f":"#507f9f";
 const ornament=master?'<path d="M22 42 3 24l4 24 17 12M74 42l19-18-4 24-17 12" fill="#8a65bc" stroke="'+metal+'" stroke-width="2"/><path d="m30 18 7-10 11 7L59 8l7 10" fill="'+metal+'"/>':'';
 const wreath=advanced?'<path d="M28 65C12 51 16 32 25 23M68 65c16-14 12-33 3-42" fill="none" stroke="'+metal+'" stroke-width="3"/><path d="m21 48-7-5m8-3-6-7m9-1-3-8m53 24 7-5m-8-3 6-7m-9-1 3-8" stroke="'+metal+'" stroke-width="3" stroke-linecap="round"/>':'';
 return '<span class="achievement-badge milestone-crest '+(a.earned?'':'achievement-badge-locked')+'" aria-hidden="true"><svg viewBox="0 0 96 106" focusable="false">'+ornament+'<path d="m30 62-7 36 17-8 8 11 8-11 17 8-7-36" fill="'+ribbon+'" stroke="'+metal+'" stroke-width="2"/>'+wreath+'<path d="M48 17 72 27v22c0 17-13 26-24 31-11-5-24-14-24-31V27Z" fill="'+dark+'" stroke="'+metal+'" stroke-width="'+(master?4:3)+'"/><path d="M48 24 65 31v18c0 12-9 20-17 24-8-4-17-12-17-24V31Z" fill="none" stroke="'+metal+'" opacity=".45"/><path d="M34 41q7-4 14 0 7-4 14 0v15q-7-4-14 0-7-4-14 0ZM48 41v15" fill="none" stroke="#fff0ce" stroke-width="2" stroke-linejoin="round"/><path d="m47 47 11-17 4-1-1 5-14 13" fill="'+metal+'"/>'+(master?'<path d="m48 2 2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1Z" fill="'+metal+'"/><path d="m8 67 2 4 4 2-4 2-2 4-2-4-4-2 4-2m82-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2" fill="'+metal+'"/>':'')+'<rect x="33" y="63" width="30" height="20" rx="7" fill="'+dark+'" stroke="'+metal+'" stroke-width="2"/><text x="48" y="78" text-anchor="middle" fill="#fff0ce" font-family="system-ui,sans-serif" font-size="15" font-weight="800">'+tier+'</text></svg></span>';
}
/* Well-Rounded medals grow from a simple seal to a crowned five-skill award. */
function wellRoundedBadge(a){
 const tier=a.goal,advanced=tier>=5,master=tier>=25;
 const metal=master?"#ffe395":advanced?"#f2c76e":"#bed8e8";
 const face=master?"#39245b":advanced?"#42321e":"#223e56";
 const ribbon=master?"#9a67cf":advanced?"#bb7d3e":"#5686ab";
 const wreath=advanced?'<path d="M25 73C9 61 10 36 23 23M71 73c16-12 15-37 2-50" fill="none" stroke="'+metal+'" stroke-width="3"/><path d="m17 59-8-3m8-7-7-6m10-4-5-8m64 28 8-3m-8-7 7-6m-10-4 5-8" fill="none" stroke="'+metal+'" stroke-width="3" stroke-linecap="round"/>':'';
 const crown=master?'<path d="m29 21-4-15 14 7 9-11 9 11 14-7-4 15Z" fill="'+metal+'" stroke="#b88b43" stroke-width="2"/><path d="M22 35 2 23l5 23 15 9m52-20 20-12-5 23-15 9" fill="#996cd1" stroke="'+metal+'" stroke-width="2"/>':'';
 const stars=Array.from({length:5},(_,i)=>{const x=28+i*10,y=35-Math.sin(i*Math.PI/4)*7;return '<path d="m'+x+' '+y+' 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4Z" fill="'+metal+'"/>';}).join('');
 return '<span class="achievement-badge milestone-crest '+(a.earned?'':'achievement-badge-locked')+'" aria-hidden="true"><svg viewBox="0 0 96 106" focusable="false"><path d="m30 66-7 32 17-8 8 11 8-11 17 8-7-32" fill="'+ribbon+'" stroke="'+metal+'" stroke-width="2"/>'+crown+wreath+'<circle cx="48" cy="51" r="29" fill="'+face+'" stroke="'+metal+'" stroke-width="'+(master?4:3)+'"/><circle cx="48" cy="51" r="23" fill="none" stroke="'+metal+'" opacity=".5"/>'+stars+'<text x="48" y="60" text-anchor="middle" fill="#fff0ce" font-family="system-ui,sans-serif" font-size="23" font-weight="800">'+tier+'</text><text x="48" y="72" text-anchor="middle" fill="'+metal+'" font-family="system-ui,sans-serif" font-size="8" font-weight="700">'+(tier===1?'DAY':'DAYS')+'</text>'+(master?'<path d="m7 72 2 4 4 2-4 2-2 4-2-4-4-2 4-2m82-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2" fill="'+metal+'"/>':'')+'</svg></span>';
}
/* All-skills awards add a new frame detail at every ten-level milestone. */
function allSkillsBadge(a){
 const n=a.goal;
 const [metal,face]=({10:["#c3d9e8","#233d52"],20:["#f2c66d","#43341f"],30:["#81e1bf","#183e38"],40:["#a8d6ff","#233c64"],50:["#ffe295","#44265c"]})[n];
 const rays=n>=30?Array.from({length:12},(_,i)=>'<path d="M48 13v-7" transform="rotate('+i*30+' 48 48)" stroke="'+metal+'" stroke-width="2" stroke-linecap="round"/>').join(''):'';
 const wings=n>=40?'<path d="M24 38 3 25l5 25 17 11m47-23 21-13-5 25-17 11" fill="'+face+'" stroke="'+metal+'" stroke-width="2"/><path d="m7 36 16 12m66-12L73 48" stroke="'+metal+'" opacity=".6"/>':'';
 const wreath=n>=20?'<path d="M24 72C8 58 12 33 23 24M72 72c16-14 12-39 1-48M17 55l-7-4m9-7-6-7m9-2-4-8m61 28 7-4m-9-7 6-7m-9-2 4-8" fill="none" stroke="'+metal+'" stroke-width="3" stroke-linecap="round"/>':'';
 const crown=n===50?'<path d="m30 22-4-14 13 6 9-12 9 12 13-6-4 14Z" fill="'+metal+'" stroke="#bc8d45" stroke-width="2"/><path d="m5 73 2 4 4 2-4 2-2 4-2-4-4-2 4-2m84-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2" fill="'+metal+'"/>':'';
 const gems=Array.from({length:5},(_,i)=>{const x=28+i*10,y=38-Math.sin(i*Math.PI/4)*8;return '<path d="m'+x+' '+y+' 3 4-3 4-3-4Z" fill="'+metal+'"/>';}).join('');
 return '<span class="achievement-badge milestone-crest '+(a.earned?'':'achievement-badge-locked')+'" aria-hidden="true"><svg viewBox="0 0 96 106" focusable="false"><path d="m31 66-6 31 15-7 8 11 8-11 15 7-6-31" fill="'+face+'" stroke="'+metal+'" stroke-width="2"/>'+rays+wings+wreath+'<path d="M48 20 75 32v21c0 17-14 28-27 33-13-5-27-16-27-33V32Z" fill="'+face+'" stroke="'+metal+'" stroke-width="'+(n===50?4:3)+'"/><path d="m48 27 20 10v16c0 12-10 22-20 26-10-4-20-14-20-26V37Z" fill="none" stroke="'+metal+'" opacity=".45"/>'+gems+'<text x="48" y="64" text-anchor="middle" fill="#fff1d0" font-family="system-ui,sans-serif" font-size="23" font-weight="800">'+n+'</text>'+crown+'</svg></span>';
}
/* The final collection award unites all five writing skills. */
function legendBadge(a){
 const gems=SKILLS.map((s,i)=>{const x=20+i*14,y=39-Math.sin(i*Math.PI/4)*12;return '<path d="m'+x+' '+y+' 4 5-4 5-4-5Z" fill="'+s.color+'" stroke="#ffe5a2" stroke-width="1"/>';}).join('');
 return '<span class="achievement-badge milestone-crest legend-crest '+(a.earned?'legend-crest-earned':'achievement-badge-locked')+'" aria-hidden="true"><svg viewBox="0 0 96 106" focusable="false"><circle cx="48" cy="50" r="35" fill="none" stroke="#ffe3a1" stroke-width="2" opacity=".28"/><circle cx="48" cy="50" r="40" fill="none" stroke="#c399e6" opacity=".2"/><path d="m30 70-7 28 17-7 8 11 8-11 17 7-7-28" fill="#744595" stroke="#eec76e" stroke-width="2"/><path d="M25 42 3 26l4 25 19 15m45-24 22-16-4 25-19 15" fill="#80609c" stroke="#f3cd7c" stroke-width="2"/><path d="m7 37 17 14M9 48l15 10m65-21L72 51m15-3-15 10" fill="none" stroke="#e8d4b2" opacity=".6"/><path d="M48 19 74 31v25c0 16-15 27-26 31-11-4-26-15-26-31V31Z" fill="#302343" stroke="#f9d986" stroke-width="3"/><path d="M48 25 68 35v20c0 12-11 22-20 26-9-4-20-14-20-26V35Z" fill="none" stroke="#c399e6" opacity=".65"/>'+gems+'<path d="M31 48q9-5 17 0 8-5 17 0v20q-9-5-17 0-8-5-17 0Z" fill="#f6e7bf" stroke="#ceac68" stroke-width="1.5"/><path d="M48 48v20m-13-14 9 1m-9 4 9 1m8-5 9-1m-9 6 9-1" fill="none" stroke="#82613f" stroke-width="1.5"/><path d="m44 64 15-24 10-4-2 10-23 18Z" fill="#dfc4ff" stroke="#aa83c9" stroke-width="1"/><path d="m43 67 22-27" stroke="#fce3a2" stroke-width="1.5"/><path d="m31 23-4-15 13 7 8-12 8 12 13-7-4 15Z" fill="#f8d77d" stroke="#b78a43" stroke-width="2"/><path d="m48 11 3 4-3 4-3-4Z" fill="#c399e6"/><path d="m10 72 2 4 4 2-4 2-2 4-2-4-4-2 4-2m76-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2" fill="#f8d77d"/><path d="M38 80h20" stroke="#f8d77d" stroke-width="3" stroke-linecap="round"/></svg></span>';
}
function achievementBadge(a){
 if(a.id==="legend")return legendBadge(a);
 if(/^all-(10|20|30|40|50)$/.test(a.id))return allSkillsBadge(a);
 if(a.id==="five-for-five"||/^five-for-five-(5|25)$/.test(a.id))return wellRoundedBadge(a);
 if(/^any-(10|25|50)$/.test(a.id))return skillMilestoneBadge(a);
 const skill=SKILLS.find(s=>a.id===s.id+'-25'||a.id===s.id+'-50');
 if(skill)return '<span class="achievement-badge achievement-specialism achievement-specialism-'+a.goal+'" style="--specialism-color:'+skill.color+'" aria-hidden="true">'+skillMilestoneBadge(a)+'<span class="specialism-art '+(a.earned?'':'achievement-badge-locked')+'">'+skillIcon(skill)+'</span></span>';
 if(a.category==='Levels'){const key=a.name.toLowerCase();return '<span class="achievement-badge '+(a.earned?'':'achievement-badge-locked')+'" aria-hidden="true"><img src="./assets/achievements/ranks/'+key+'.svg?v=20261026-progression" alt="" width="64" height="64" decoding="async"></span>';}
 let cell=19,tier='';
 if(a.id==='first')cell=0;
 else if(a.id.startsWith('days-'))cell=({3:1,7:2,14:3,30:4,100:5})[a.goal];
 else if(a.id.startsWith('streak-'))cell=({3:6,7:7,14:8,30:9})[a.goal];
 else if(a.id.startsWith('five-for-five'))cell=({1:15,5:16,25:17})[a.goal];
 else if(a.id.startsWith('all-')){cell=18;tier=String(a.goal);}
 else if(a.id.startsWith('any-')){cell=10;tier=String(a.goal);}
 const x=30+(cell%5)*270,y=48+Math.floor(cell/5)*253;
 return '<span class="achievement-badge '+(a.earned?'':'achievement-badge-locked')+'" aria-hidden="true"><svg viewBox="'+x+' '+y+' 260 260" focusable="false"><image href="./assets/achievements/badges.png" width="1402" height="1122"/></svg>'+(tier?'<span class="achievement-badge-tier">'+tier+'</span>':'')+'</span>';
}
function achievements(){
 const items=achievementList(),unseen=new Set(unseenAchievements().map(a=>a.id)),earned=items.filter(a=>a.earned).length;
 const medals=Object.values(state.checkins).filter(r=>SKILLS.every(s=>r[s.id]===5)).length;
 return header()+'<section class="card">'+contentTitle('Achievements')+'<p class="muted">'+earned+' / '+items.length+' unlocked'+(developer?.active?' · Test Mode preview':'')+'</p><progress class="collection-progress" max="'+items.length+'" value="'+earned+'" aria-label="Collection completion"></progress><p class="small">Optional Well-Rounded Days: <strong>'+medals+'</strong></p><p class="small muted">Tap an unlocked achievement to clear its New marker.</p>'+['Consistency','Levels','Skills','Legend'].map(category=>{const group=items.filter(a=>a.category===category),fresh=group.filter(a=>unseen.has(a.id)).length;return '<details class="achievement-group"'+(category==='Consistency'?' open':'')+'><summary>'+category+(fresh?' <span class="achievement-new">'+fresh+' new</span>':'')+' <span class="small muted">'+group.filter(a=>a.earned).length+' / '+group.length+'</span></summary>'+group.map(a=>'<article class="achievement-row '+(a.earned?'achievement-earned':'')+'">'+achievementBadge(a)+'<div>'+(a.earned?'<button class="achievement-view" data-view-achievement="'+a.id+'">'+a.name+'</button>':'<strong>'+a.name+'</strong>')+(unseen.has(a.id)?' <span class="achievement-new">New</span>':'')+'<p class="small muted">'+a.description+'</p><progress max="'+a.goal+'" value="'+a.value+'" aria-label="'+a.name+' progress"></progress><span class="small">'+a.value+' / '+a.goal+(a.earned?' · Unlocked':'')+'</span></div></article>').join('')+'</details>';}).join('')+'</section>';
}
function render(){applyRankBackground();app.innerHTML=page==="home"?home():page==="detail"?detail():page==="checkin"?checkin():page==="settings"?settings():page==="ranks"?rankProgression():page==="journey"?journey():achievements();globalThis.QuestXPAnimation?.animate(app);if(saveNotice){const notice=document.createElement("p");notice.className="notice";notice.setAttribute("role","alert");notice.textContent=saveNotice;app.prepend(notice);}document.getElementById("export-backup")?.addEventListener("click",exportBackup);document.getElementById("import-backup")?.addEventListener("change",importBackup);document.getElementById("choose-backup")?.addEventListener("click",()=>document.getElementById("import-backup").click());document.getElementById("restore-previous")?.addEventListener("click",restorePrevious);document.getElementById("back")?.addEventListener("click",back);document.getElementById("open-settings")?.addEventListener("click",()=>navigate("settings"));document.getElementById("open-ranks")?.addEventListener("click",()=>navigate("ranks"));document.querySelectorAll("[data-skill]").forEach(b=>b.addEventListener("click",()=>openSkill(b.dataset.skill)));document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));document.querySelectorAll("[data-rate]").forEach(b=>b.addEventListener("click",()=>{draftRatings=Object.assign({},editingRatings(),{[b.dataset.rate]:Number(b.dataset.value)});render()}));document.getElementById("save-checkin")?.addEventListener("click",saveCheckin);document.getElementById("reset-progress")?.addEventListener("click",confirmResetProgress);document.getElementById("open-developer")?.addEventListener("click",enterDeveloperMode);document.querySelectorAll("[data-view-achievement]").forEach(b=>b.addEventListener("click",()=>viewAchievement(b.dataset.viewAchievement)));document.getElementById("toggle-sounds")?.addEventListener("click",toggleSounds);document.getElementById("open-tutorial")?.addEventListener("click",openTutorial);syncDeveloperUI()}
/* DAILY SAVE: Recalculate XP from all saved daily ratings to prevent duplicate awards. */
function saveCheckin(){
 globalThis.WriteQuestSounds?.unlock();
 const day=localDay();
 if(draftDay&&draftDay!==day){alert("A new writing day started at 3:30 a.m. Please review your ratings for the new day.");draftRatings=null;draftDay=day;render();return;}
 const earnedBefore=new Set(achievementList().filter(a=>a.earned).map(a=>a.id));
 const levelsBefore=Object.fromEntries(SKILLS.map(s=>[s.id,stats(state.xp[s.id]).level]));
 const next=validateSave(state);next.checkins[day]=Object.assign({},editingRatings());next.xp=developer?.active?developer.baseXP():blank().xp;
 for(const date of Object.keys(next.checkins).sort())for(const s of SKILLS){const n=Number(next.checkins[date]?.[s.id]||0);if(n>0)next.xp[s.id]+=n+BONUS(stats(next.xp[s.id]).level);}
 try{save(next);}catch(error){alert("Progress was not saved. Your ratings are still available to retry. "+error.message);return;}
 const leveled=[];
 for(const s of SKILLS)for(let level=levelsBefore[s.id]+1;level<=stats(state.xp[s.id]).level;level++)leveled.push({name:s.name,level});
 draftRatings=null;draftDay=day;render();const beforeTotal=Object.values(levelsBefore).reduce((sum,n)=>sum+n,0),afterTotal=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0);showSaveDialog(leveled,afterTotal>beforeTotal&&totalRank(afterTotal)!==totalRank(beforeTotal)?totalRank(afterTotal):null,achievementList().filter(a=>a.earned&&!earnedBefore.has(a.id)));
}
function confirmResetProgress(){if(developer?.active){alert("Exit Test Mode to reset normal progress.");return;}const overlay=document.createElement("div");overlay.className="save-overlay";overlay.innerHTML='<div class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-heading" aria-describedby="reset-description"><h2 id="reset-heading">Reset all progress?</h2><p id="reset-description">This will permanently erase your skill XP, levels, and daily check-in history on this device. You cannot undo this action.</p><button class="reset-button" id="confirm-reset">Yes, Reset Everything</button><button class="secondary" id="cancel-reset">Cancel</button></div>';document.body.appendChild(overlay);const cancel=()=>{overlay.remove();document.removeEventListener("keydown",onKey)};const onKey=e=>{if(e.key==="Escape")cancel()};overlay.addEventListener("click",e=>{if(e.target===overlay)cancel()});overlay.querySelector("#cancel-reset").addEventListener("click",cancel);overlay.querySelector("#confirm-reset").addEventListener("click",()=>{try{save(blank())}catch(e){alert("Could not reset progress. "+e.message);return}draftRatings=null;draftDay=null;cancel();page="home";previous="home";render();window.scrollTo(0,0)});document.addEventListener("keydown",onKey);overlay.querySelector("#cancel-reset").focus()}
/* Each newly earned level gets its own celebration, in skill order. */
function showSaveDialog(leveled=[],backgroundRank=null,newAchievements=[]){const queue=[...leveled];if(backgroundRank)queue.push({backgroundRank});queue.push(...newAchievements.map(achievement=>({achievement})));queue.push(null);showNextCelebration(queue)}
function showNextCelebration(queue){const skill=queue.shift();globalThis.WriteQuestSounds?.play(skill?.achievement?"achievement":skill?.backgroundRank?"rank":skill?"level":"checkin");const overlay=document.createElement("div");overlay.className="save-overlay";overlay.innerHTML='<div class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-heading"><div style="font-size:34px" aria-hidden="true">✦</div><h2 id="saved-heading">'+(writingDay().complete?'Writing day complete':'Check-in saved')+'</h2><p>'+(writingDay().complete?'You made time for your writing.':'Your ratings are saved. A positive rating in any one skill completes your writing day.')+'</p><button class="primary" id="saved-done">Done</button><p class="small">Select the button to continue.</p></div>';if(!skill&&writingDay().complete){const focus=document.createElement('p');focus.className='small';focus.textContent=writingDay().count===1?writingDay().positive[0].name+' progress saved. A focused day counts.':writingDay().count+' of 5 skills checked in. Progress saved.';overlay.querySelector('#saved-done').before(focus);}if(skill?.achievement){overlay.querySelector("#saved-heading").textContent="Achievement Unlocked!";overlay.querySelector("p").textContent=skill.achievement.name+" — "+skill.achievement.description;}else if(skill?.backgroundRank){overlay.querySelector("#saved-heading").textContent=skill.backgroundRank+" Unlocked!";overlay.querySelector("p").textContent="New background: "+BACKGROUND_REWARDS[skill.backgroundRank].name+"."; }else if(skill){const dialog=overlay.querySelector(".save-dialog");dialog.classList.add("level-up-dialog");dialog.querySelector("#saved-heading").textContent="Level Up!";dialog.querySelector("p").textContent=skill.name+" reached Level "+skill.level+"!";dialog.querySelector("#saved-done").textContent=queue.length?"Continue →":"Done";const bursts=document.createElement("div");bursts.className="firework-bursts";bursts.setAttribute("aria-hidden","true");const colors=["#f4c76a","#38bdf8","#c084fc","#f472b6","#86efac"];for(let i=0;i<24;i++){const spark=document.createElement("span");spark.className="firework-spark";spark.style.setProperty("--angle",(i*137.5%360)+"deg");spark.style.setProperty("--distance",(65+(i%4)*16)+"px");spark.style.setProperty("--spark-color",colors[i%colors.length]);spark.style.animationDelay=((i%3)*0.1)+"s";bursts.appendChild(spark)}dialog.prepend(bursts)}if(skill){overlay.querySelector("#saved-done").textContent=queue.length?"Continue →":"Done";if(developer?.active)overlay.querySelector(".small").textContent="Test Mode preview · normal progress unchanged.";}document.body.appendChild(overlay);let advanced=false;const advance=()=>{if(advanced)return;advanced=true;overlay.remove();document.removeEventListener("keydown",onKey);if(queue.length)showNextCelebration(queue);else{navigate("home");app.querySelector(".star-checkin")?.focus();}};const onKey=e=>{if(e.key==="Escape"&&!skill)advance()};overlay.addEventListener("click",e=>{if(e.target===overlay&&!skill)advance()});overlay.querySelector("#saved-done").addEventListener("click",advance);document.addEventListener("keydown",onKey);overlay.querySelector("#saved-done").focus()}

/* Test controls live outside the dashboard, so artwork can be viewed on its own. */
function enterDeveloperMode(){
 if(!developer){alert("Test tools have not loaded. Refresh WriteQuest and try again.");return;}
 developer.enter();draftRatings=null;draftDay=null;page="home";previous="home";render();openDeveloperPanel();
}
function exitDeveloperMode(){
 developer?.exit();developerBackgroundOnly=false;draftRatings=null;draftDay=null;page="home";previous="home";
 if(typeof location!=="undefined"&&window.history?.replaceState){
  const url=new URL(location.href);url.searchParams.delete("dev");url.searchParams.delete("test");
  window.history.replaceState(null,"",url);
 }
 render();
}
function syncDeveloperUI(){
 const active=Boolean(developer?.active);
 document.body.classList?.toggle("developer-background-only",active&&developerBackgroundOnly);
 let launcher=document.getElementById("developer-launcher");
 if(!active){launcher?.remove?.();return;}
 if(!launcher){
  launcher=document.createElement("button");launcher.id="developer-launcher";launcher.type="button";
  launcher.addEventListener("click",openDeveloperPanel);document.body.appendChild(launcher);
 }
 launcher.textContent="Test Mode · "+totalRank(SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0));
 launcher.setAttribute("aria-label","Open WriteQuest test tools. Preview progress is not saved.");
 for(const id of ["export-backup","choose-backup","import-backup","restore-previous","reset-progress"]){
  const button=document.getElementById(id);if(button)button.disabled=true;
 }
}
/* Synthetic history exists only in the isolated Test Mode profile. */
function previewAllAchievements(){
 if(!developer?.active)return;
 if(!developer.setTotal(250))return;
 const next=validateSave(state),today=localDay();
 const stamp=Date.parse(today+"T00:00:00Z");
 for(let offset=0;offset<100;offset++){
  const day=new Date(stamp-offset*86400000).toISOString().slice(0,10);
  next.checkins[day]=Object.fromEntries(SKILLS.map(s=>[s.id,5]));
 }
 next.achievementsSeen=[];
 save(next);
 developerBackgroundOnly=false;draftRatings=null;draftDay=null;
 navigate("projects");
 app.querySelectorAll(".achievement-group").forEach(group=>{group.open=true;});
}
function openDeveloperPanel(){
 if(!developer?.active||document.getElementById("developer-panel"))return;
 const overlay=document.createElement("div");overlay.id="developer-panel";overlay.className="save-overlay";
 overlay.innerHTML='<section class="save-dialog developer-dialog" role="dialog" aria-modal="true" aria-labelledby="developer-heading"><h2 id="developer-heading">WriteQuest Test Mode</h2><p class="small">Temporary preview. Your normal progress is protected.</p><div class="developer-ranks">'+TOTAL_RANKS.map(([name,total])=>'<button type="button" data-preview-total="'+total+'">'+name+'<small>Total Level '+total+'</small></button>').join('')+'</div><button type="button" class="secondary" id="developer-all-achievements">Preview All Achievements</button><button type="button" class="secondary" id="developer-background">'+(developerBackgroundOnly?'Show skill cards':'Background only')+'</button><button type="button" class="secondary" id="developer-restore">Restore original preview</button><button type="button" class="primary" id="developer-close">View app</button><button type="button" class="secondary" id="developer-exit">Exit Test Mode</button></section>';
 const close=()=>{overlay.remove();document.removeEventListener("keydown",onKey);document.getElementById("developer-launcher")?.focus();};
 const onKey=event=>{if(event.key==="Escape")close();};
 overlay.addEventListener("click",event=>{
  if(event.target===overlay){close();return;}
  const button=event.target.closest("button");if(!button)return;
  if(button.dataset.previewTotal!==undefined){
   if(developer.setTotal(Number(button.dataset.previewTotal))){draftRatings=null;draftDay=null;page="home";render();close();}
  }else if(button.id==="developer-all-achievements"){close();previewAllAchievements();}
  else if(button.id==="developer-background"){developerBackgroundOnly=!developerBackgroundOnly;render();close();}
  else if(button.id==="developer-restore"){developer.restore();draftRatings=null;draftDay=null;page="home";render();close();}
  else if(button.id==="developer-exit"){close();exitDeveloperMode();}
  else if(button.id==="developer-close")close();
 });
 document.body.appendChild(overlay);document.addEventListener("keydown",onKey);
 overlay.querySelector("#developer-close").focus();
}

if(typeof location!=="undefined"){
 const query=new URLSearchParams(location.search);
 if(query.has("dev")||query.get("test")==="1")developer?.enter();
}
let renderedDay=localDay();
function refreshDay(){const day=localDay();if(day!==renderedDay){renderedDay=day;if(!draftRatings){draftDay=day;render();}}}
window.addEventListener("focus",refreshDay);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshDay();});
setInterval(refreshDay,30000);
if(typeof setTimeout!=="undefined")setTimeout(()=>{if(developer?.active)return;let seen=true;try{seen=localStorage.getItem('writequest-tutorial-seen')==='1';}catch(_){}if(!seen)openTutorial();},0);
render();
