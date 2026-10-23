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
let page="home",previous="home",selected="drafting",draftRatings=null,draftDay=null;
const app=document.getElementById("app");
function save(next,{recover=false}={}){
 const clean=validateSave(next);
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
 const payload={app:"WriteQuest",version:1,exportedAt:new Date().toISOString(),data:state};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
 const link=document.createElement("a");link.href=url;link.download="writequest-backup-"+localDay()+".json";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importBackup(event){
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
 try{
  const raw=localStorage.getItem(BACKUP_KEY);if(!raw)throw Error("No previous save is available yet.");
  const next=validateSave(JSON.parse(raw));
  if(!window.confirm("Restore the previous saved version? Export your current progress first if you want to keep it."))return;
  save(next,{recover:true});draftRatings=null;draftDay=null;render();
 }catch(error){alert("Could not restore progress. "+error.message);}
}
function navigate(next){if(next==="checkin"){draftRatings=null;draftDay=localDay();}if(next==="detail"){previous=page}else{previous=page}page=next;render();window.scrollTo(0,0)}
function openSkill(id){selected=id;navigate("detail")}
function back(){page=previous==="detail"?"home":previous;render();window.scrollTo(0,0)}
/* Lucide settings icon (ISC license); attribution in README.md. */
const GEAR_ICON='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06-1.91 1.91-.06-.06A1.65 1.65 0 0 0 16 18.4a1.65 1.65 0 0 0-1 1.52V20h-2.7v-.08A1.65 1.65 0 0 0 11 18.4a1.65 1.65 0 0 0-1.82.33l-.06.06-1.91-1.91.06-.06A1.65 1.65 0 0 0 7.6 15a1.65 1.65 0 0 0-1.52-1H6v-2.7h.08A1.65 1.65 0 0 0 7.6 10a1.65 1.65 0 0 0-.33-1.82l-.06-.06 1.91-1.91.06.06A1.65 1.65 0 0 0 11 6.6a1.65 1.65 0 0 0 1-1.52V5h2.7v.08A1.65 1.65 0 0 0 16 6.6a1.65 1.65 0 0 0 1.82-.33l.06-.06 1.91 1.91-.06.06A1.65 1.65 0 0 0 19.4 10a1.65 1.65 0 0 0 1.52 1H21v2.7h-.08A1.65 1.65 0 0 0 19.4 15Z" transform="translate(-1 -0.5) scale(1.03)"/></svg>';
function header(showBack=false){const total=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0);if(page==="settings")return '<header><span class="brand brand-logo"><img src="./assets/branding/writequest-logo.png?v=20261023-light-logo" alt="WriteQuest" width="2048" height="683" decoding="async"></span><button class="back" id="back">← Back</button></header>';return '<header>'+(showBack?'<button class="back" id="back">← Back</button>':'<span class="brand brand-logo"><img src="./assets/branding/writequest-logo.png?v=20261023-light-logo" alt="WriteQuest" width="2048" height="683" decoding="async"></span>')+'<div class="header-actions"><button class="header-level total-level-button rank-border-'+totalRank(total).toLowerCase().replace(/[^a-z]/g,"")+'" id="open-ranks" aria-label="Total level '+total+'. View rank progression" title="View rank progression">Total Level <strong>'+total+'</strong></button><button class="settings-button" id="open-settings" aria-label="Open settings" title="Settings">'+GEAR_ICON+'</button></div></header>'}
function progress(xp,color){const p=stats(xp);return '<div class="row small"><span>Level '+p.level+' / 50 · '+rank(p.level)+'</span><span>'+(p.level===50?'MAX':p.remaining+' / '+p.need+' XP')+'</span></div><div class="meter"><div class="fill" data-quest-xp="'+selected+'" data-xp-level="'+p.level+'" data-xp-fraction="'+(p.level===50?1:p.remaining/p.need)+'" style="width:'+(p.level===50?100:Math.floor(100*p.remaining/p.need))+'%;background:'+color+'"></div></div>'}
/* Compact dashboard XP bars use the same level calculation as skill details. */
function homeProgress(skill){
 const p=stats(state.xp[skill.id]),maxed=p.level===50;
 const value=maxed?1:p.remaining,need=maxed?1:p.need;
 const label=maxed?skill.name+': maximum level reached':skill.name+': '+p.remaining+' / '+p.need+' XP to Level '+(p.level+1);
 return '<span class="home-progress" role="progressbar" aria-label="'+label+'" aria-valuemin="0" aria-valuemax="'+need+'" aria-valuenow="'+value+'" title="'+label+'"><span class="home-progress-fill" data-quest-xp="'+skill.id+'" data-xp-level="'+p.level+'" data-xp-fraction="'+(value/need)+'" style="width:'+(100*value/need)+'%;background:'+skill.color+'"></span></span>';
}
function home(){const total=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0);const checkedIn=Object.prototype.hasOwnProperty.call(state.checkins,localDay());return header()+'<div class="skill-star"><div class="skill-grid">'+SKILLS.map(s=>'<button class="skill skill-rank-'+rank(stats(state.xp[s.id]).level).toLowerCase().replace(/[^a-z]/g,"")+'" data-skill="'+s.id+'"><span class="symbol" aria-hidden="true">'+skillIcon(s)+'</span><strong>'+s.name+'</strong><span class="small">Level '+stats(state.xp[s.id]).level+' · '+rank(stats(state.xp[s.id]).level)+'</span>'+homeProgress(s)+'</button>').join("")+'</div><button class="star-checkin '+(checkedIn?'star-checkin-done':'star-checkin-pending')+'" data-page="checkin" aria-label="'+(checkedIn?'Checked in today. Tap to edit today’s check-in.':'Daily check-in needed. Tap to check in.')+'"><span class="star-checkin-title">Writing Skills</span><span class="star-checkin-icon" aria-hidden="true">'+(checkedIn?'✓':'✎')+'</span><span class="star-checkin-label">'+(checkedIn?'Checked In':'Check In')+'</span>'+(checkedIn?'':'<span class="star-checkin-alert" aria-hidden="true">!</span>')+'</button></div>'+nav("home")}
function detail(){const s=SKILLS.find(x=>x.id===selected),p=stats(state.xp[s.id]),next=[10,20,30,40].find(n=>n>p.level);return header(true)+'<section class="card skill-detail"><div class="detail-top"><div class="detail-identity"><span class="detail-icon" aria-hidden="true">'+skillIcon(s)+'</span><h1>'+s.name+'</h1></div><div class="detail-standing"><span class="rank">'+rank(p.level)+'</span><strong>Level '+p.level+'</strong></div></div><div class="detail-progress">'+progress(state.xp[s.id],s.color)+'</div><h2>What is '+s.name+'?</h2><p>'+s.description+'</p><h2>Activities that count</h2><ul class="examples">'+s.examples.map(x=>'<li>'+x+'</li>').join("")+'</ul><div class="notice"><strong>XP:</strong> Rate your daily effort 0–5. You can leave a skill at zero.</div><p class="small muted">'+(next?'Next bonus: Level '+next+' (+ '+(next/10)+' XP on positive check-ins).':'All milestone XP bonuses unlocked!')+'</p></section><button class="primary" data-page="checkin">Go to Daily Check-In</button>'+nav("home")}
function todayRatings(){return state.checkins[localDay()]||{}}
function editingRatings(){return draftRatings||todayRatings()}
function checkin(){const today=editingRatings();return header(true)+'<h1>Daily Check-In</h1><p class="muted">How much did you work on each skill today? Select 0–5.</p><section class="card">'+SKILLS.map(s=>'<div class="check-row"><div class="row"><strong>'+skillIcon(s)+' '+s.name+'</strong><span class="small muted" id="value-'+s.id+'">'+(today[s.id]??0)+'/5</span></div><div class="rating">'+[0,1,2,3,4,5].map(n=>'<button data-rate="'+s.id+'" data-value="'+n+'" aria-pressed="'+((today[s.id]??0)===n)+'">'+n+'</button>').join("")+'</div></div>').join("")+'</section><button class="primary" id="save-checkin">Save Today’s Check-In</button><p class="small muted">Resets at 3:30 a.m. your device’s local time. Back up your progress in Settings.</p>'+nav("checkin")}
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
 document.body.style.setProperty("--rank-art",'url("./assets/backgrounds/'+reward.key+'-portrait-v2.webp?v=20261023-sharp-backgrounds")');
}

function totalRank(total){return [...TOTAL_RANKS].reverse().find(([name,min])=>total>=min)[0]}
function rankProgression(){
 const total=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0),current=totalRank(total);
 return header(true)+'<section class="card"><h1>Total Level Ranks</h1><p class="muted">Your Total Level is the sum of your five writing skills. Each rank unlocks a new writing background.</p><div class="rank-summary rank-summary-'+current.toLowerCase()+'"><strong>'+current+'</strong><span>Total Level '+total+' / 250</span></div><h2>Rank Progression</h2><div class="rank-list">'+TOTAL_RANKS.map(([name,min])=>'<div class="rank-row '+(name===current?'rank-current':'')+'"><span class="rank-symbol">'+(total>=min?'✦':'◇')+'</span><span class="rank-name">'+name+(name===current?' <span class="small muted">(Current)</span>':'')+'<small class="rank-background-name">'+BACKGROUND_REWARDS[name].name+'</small></span><span class="small">'+min+'</span></div>').join('')+'</div></section>'+nav("home");
}
function settings(){return header(true)+'<section class="card"><h1>⚙ Settings</h1><h2>About WriteQuest</h2><p class="muted">Track writing effort across Drafting, Editing, Creativity, Learning, and Research.</p><h2>Your progress</h2><p class="notice">Progress is saved on this device, with a previous-save recovery copy. Download a backup before clearing browser data or changing devices. Backups are not cloud synced.</p><h2>Daily reset</h2><p class="muted">3:30 a.m. your device’s local time, including daylight saving changes. A reset opens a new check-in day; your XP and history stay saved.</p><h2>Back up and restore</h2><button class="primary" id="export-backup">Export Backup</button><label class="secondary" for="import-backup">Import Backup</label><input id="import-backup" type="file" accept="application/json,.json"><button class="secondary" id="restore-previous">Restore Previous Save</button><h2>Reset progress</h2><p class="small muted">Erase all saved skill XP and daily check-ins on this device. This cannot be undone.</p><button class="reset-button" id="reset-progress">Reset Progress</button></section>'+nav("home")}
function placeholder(){return header(true)+'<section class="card"><h1>Projects & Achievements</h1><p class="muted">Coming in the next development stage. We’ll add custom project images, Level 1–50 progression, rank borders, and achievements here.</p></section>'+nav("projects")}
function nav(active){return '<nav class="nav" aria-label="Main navigation"><button data-page="home" '+(active==="home"?'aria-current="page"':'')+'>⌂ Home</button><button data-page="checkin" '+(active==="checkin"?'aria-current="page"':'')+'>✓ Check-In</button><button data-page="projects" '+(active==="projects"?'aria-current="page"':'')+'>▣ Projects</button></nav>'}
function render(){applyRankBackground();app.innerHTML=page==="home"?home():page==="detail"?detail():page==="checkin"?checkin():page==="settings"?settings():page==="ranks"?rankProgression():placeholder();globalThis.QuestXPAnimation?.animate(app);if(saveNotice){const notice=document.createElement("p");notice.className="notice";notice.setAttribute("role","alert");notice.textContent=saveNotice;app.prepend(notice);}document.getElementById("export-backup")?.addEventListener("click",exportBackup);document.getElementById("import-backup")?.addEventListener("change",importBackup);document.getElementById("restore-previous")?.addEventListener("click",restorePrevious);document.getElementById("back")?.addEventListener("click",back);document.getElementById("open-settings")?.addEventListener("click",()=>navigate("settings"));document.getElementById("open-ranks")?.addEventListener("click",()=>navigate("ranks"));document.querySelectorAll("[data-skill]").forEach(b=>b.addEventListener("click",()=>openSkill(b.dataset.skill)));document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));document.querySelectorAll("[data-rate]").forEach(b=>b.addEventListener("click",()=>{draftRatings=Object.assign({},editingRatings(),{[b.dataset.rate]:Number(b.dataset.value)});render()}));document.getElementById("save-checkin")?.addEventListener("click",saveCheckin);document.getElementById("reset-progress")?.addEventListener("click",confirmResetProgress)}
/* DAILY SAVE: Recalculate XP from all saved daily ratings to prevent duplicate awards. */
function saveCheckin(){
 const day=localDay();
 if(draftDay&&draftDay!==day){alert("A new writing day started at 3:30 a.m. Please review your ratings for the new day.");draftRatings=null;draftDay=day;render();return;}
 const levelsBefore=Object.fromEntries(SKILLS.map(s=>[s.id,stats(state.xp[s.id]).level]));
 const next=validateSave(state);next.checkins[day]=Object.assign({},editingRatings());next.xp=blank().xp;
 for(const date of Object.keys(next.checkins).sort())for(const s of SKILLS){const n=Number(next.checkins[date]?.[s.id]||0);if(n>0)next.xp[s.id]+=n+BONUS(stats(next.xp[s.id]).level);}
 try{save(next);}catch(error){alert("Progress was not saved. Your ratings are still available to retry. "+error.message);return;}
 const leveled=SKILLS.filter(s=>stats(state.xp[s.id]).level>levelsBefore[s.id]).map(s=>({name:s.name,level:stats(state.xp[s.id]).level}));
 draftRatings=null;draftDay=day;render();const beforeTotal=Object.values(levelsBefore).reduce((sum,n)=>sum+n,0),afterTotal=SKILLS.reduce((sum,s)=>sum+stats(state.xp[s.id]).level,0);showSaveDialog(leveled,afterTotal>beforeTotal&&totalRank(afterTotal)!==totalRank(beforeTotal)?totalRank(afterTotal):null);
}
function confirmResetProgress(){const overlay=document.createElement("div");overlay.className="save-overlay";overlay.innerHTML='<div class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-heading" aria-describedby="reset-description"><h2 id="reset-heading">Reset all progress?</h2><p id="reset-description">This will permanently erase your skill XP, levels, and daily check-in history on this device. You cannot undo this action.</p><button class="reset-button" id="confirm-reset">Yes, Reset Everything</button><button class="secondary" id="cancel-reset">Cancel</button></div>';document.body.appendChild(overlay);const cancel=()=>{overlay.remove();document.removeEventListener("keydown",onKey)};const onKey=e=>{if(e.key==="Escape")cancel()};overlay.addEventListener("click",e=>{if(e.target===overlay)cancel()});overlay.querySelector("#cancel-reset").addEventListener("click",cancel);overlay.querySelector("#confirm-reset").addEventListener("click",()=>{try{save(blank())}catch(e){alert("Could not reset progress. "+e.message);return}draftRatings=null;draftDay=null;cancel();page="home";previous="home";render();window.scrollTo(0,0)});document.addEventListener("keydown",onKey);overlay.querySelector("#cancel-reset").focus()}
/* Each newly earned level gets its own celebration, in skill order. */
function showSaveDialog(leveled=[],backgroundRank=null){const queue=[...leveled];if(backgroundRank)queue.push({backgroundRank});showNextCelebration(queue)}
function showNextCelebration(queue){const skill=queue.shift();const overlay=document.createElement("div");overlay.className="save-overlay";overlay.innerHTML='<div class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-heading"><div style="font-size:34px" aria-hidden="true">✦</div><h2 id="saved-heading">Saved! Your skill(s) have been updated.</h2><p>Your writing progress is saved on this device.</p><button class="primary" id="saved-done">Done</button><p class="small">Tap outside this box to close.</p></div>';if(skill?.backgroundRank){overlay.querySelector("#saved-heading").textContent=skill.backgroundRank+" Unlocked!";overlay.querySelector("p").textContent="New background: "+BACKGROUND_REWARDS[skill.backgroundRank].name+"."; }else if(skill){const dialog=overlay.querySelector(".save-dialog");dialog.classList.add("level-up-dialog");dialog.querySelector("#saved-heading").textContent="Level Up!";dialog.querySelector("p").textContent=skill.name+" reached Level "+skill.level+"!";dialog.querySelector("#saved-done").textContent=queue.length?"Next Level Up →":"Done";const bursts=document.createElement("div");bursts.className="firework-bursts";bursts.setAttribute("aria-hidden","true");const colors=["#f4c76a","#38bdf8","#c084fc","#f472b6","#86efac"];for(let i=0;i<24;i++){const spark=document.createElement("span");spark.className="firework-spark";spark.style.setProperty("--angle",(i*137.5%360)+"deg");spark.style.setProperty("--distance",(65+(i%4)*16)+"px");spark.style.setProperty("--spark-color",colors[i%colors.length]);spark.style.animationDelay=((i%3)*0.1)+"s";bursts.appendChild(spark)}dialog.prepend(bursts)}document.body.appendChild(overlay);const advance=()=>{overlay.remove();document.removeEventListener("keydown",onKey);if(queue.length)showNextCelebration(queue)};const onKey=e=>{if(e.key==="Escape")advance()};overlay.addEventListener("click",e=>{if(e.target===overlay)advance()});overlay.querySelector("#saved-done").addEventListener("click",advance);document.addEventListener("keydown",onKey);overlay.querySelector("#saved-done").focus()}

let renderedDay=localDay();
function refreshDay(){const day=localDay();if(day!==renderedDay){renderedDay=day;if(!draftRatings){draftDay=day;render();}}}
window.addEventListener("focus",refreshDay);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshDay();});
setInterval(refreshDay,30000);
render();

