(function(root){
 function summary(checkins,today){
  const days=Object.keys(checkins).filter(d=>d<=today).sort(),set=new Set(days);
  const shift=(d,n)=>new Date(Date.parse(d+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
  const weekday=new Date(today+'T00:00:00Z').getUTCDay(),sunday=shift(today,-weekday);
  const week=Array.from({length:7},(_,i)=>{const day=shift(sunday,i);return {day,checked:set.has(day),future:day>today};});
  let longest=0,run=0,prior=null;
  for(const day of days){run=prior&&shift(prior,1)===day?run+1:1;longest=Math.max(longest,run);prior=day;}
  let current=0;for(let d=set.has(today)?today:shift(today,-1);set.has(d);d=shift(d,-1))current++;
  return {activeDays:days.length,longest,current,week,weekly:week.filter(d=>d.checked).length,started:days[0]||null};
 }
 root.WriteQuestJourney={summary};if(typeof module!=='undefined')module.exports={summary};
})(globalThis);
