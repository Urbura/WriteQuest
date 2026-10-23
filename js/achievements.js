/* Achievements are derived from the current profile; no extra save fields. */
(function(root){
 function list({skills,xp,checkins,level,ranks}){
  const levels=skills.map(s=>level(xp[s.id])),total=levels.reduce((a,b)=>a+b,0);
  const days=Object.keys(checkins).sort();
  let longest=0,run=0,prior=null;
  for(const day of days){const stamp=Date.parse(day+'T00:00:00Z');run=prior!==null&&stamp-prior===86400000?run+1:1;longest=Math.max(longest,run);prior=stamp;}
  const perfectDays=Object.values(checkins).filter(r=>skills.every(s=>r[s.id]===5)).length;
  const result=[];
  const add=(id,category,name,description,value,goal)=>result.push({id,category,name,description,value:Math.min(value,goal),goal,earned:value>=goal});
  add('first','Consistency','First Check-In','Save your first daily check-in.',days.length,1);
  for(const n of [3,7,14,30,100])add('days-'+n,'Consistency',n+' Active Days','Check in on '+n+' different days.',days.length,n);
  for(const n of [3,7,14,30])add('streak-'+n,'Consistency',n+'-Day Streak','Check in '+n+' days in a row.',longest,n);
  for(const [name,n] of ranks.filter(([,n])=>n>5))add('total-'+n,'Levels',name,'Reach Total Level '+n+'.',total,n);
  for(const n of [10,25,50])add('any-'+n,'Skills','Skill Level '+n,'Reach Level '+n+' in any skill.',Math.max(...levels),n);
  skills.forEach((s,i)=>{for(const [n,title] of [[25,'Specialist'],[50,'Mastery']])add(s.id+'-'+n,'Skills',s.name+' '+title,'Reach Level '+n+' in '+s.name+'.',levels[i],n);});
  for(const n of [1,5,25])add(n===1?'five-for-five':'five-for-five-'+n,'Skills','Five for Five · '+n+(n===1?' Day':' Days'),'Rate all five skills 5/5 on '+n+(n===1?' day.':' separate days. Consecutive days are not required.'),perfectDays,n);
  for(const n of [10,20,30,40,50])add('all-'+n,'Skills',n===10?'Well Rounded':'All Skills Level '+n,'Reach Level '+n+' in all five skills.',Math.min(...levels),n);
  add('legend','Legend','WriteQuest Legend','Earn every other achievement.',result.filter(a=>a.earned).length,result.length);
  return result;
 }
 root.WriteQuestAchievements={list};
 if(typeof module!=='undefined')module.exports={list};
})(globalThis);
