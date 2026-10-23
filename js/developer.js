// Isolated preview profiles. This module never reads or writes browser storage.
(function(root){
 "use strict";
 function create({skills,blank,validate,getState,setState,loadNormal,xpToNext}){
  let active=false,original=null,baseline=null;
  function previewOf(profile){const next=validate(profile);next.checkins={};baseline={...next.xp};return next;}
  function enter(){
   if(active)return;
   original=validate(getState());
   setState(previewOf(original));
   active=true;
  }
  function restore(){
   if(!active)return false;
   setState(validate(original));
   return true;
  }
  function setTotal(total){
   if(!active||!Number.isInteger(total)||total<skills.length||total>skills.length*50)return false;
   const next=blank(),base=Math.floor(total/skills.length),extra=total%skills.length;
   skills.forEach((skill,i)=>{
    const target=base+(i<extra?1:0);
    let xp=0;for(let level=1;level<target;level++)xp+=xpToNext(level);
    next.xp[skill.id]=xp;
   });
   baseline={...next.xp};setState(validate(next));
   return true;
  }
  function exit(){
   if(!active)return;
   const normal=loadNormal();
   setState(normal);
   active=false;original=null;baseline=null;
  }
  return {get active(){return active;},baseXP:()=>({...baseline}),enter,restore,setTotal,exit};
 }
 if(typeof module!=="undefined"&&module.exports)module.exports={create};
 root.WriteQuestDeveloper={create};
})(globalThis);
