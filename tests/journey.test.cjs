const {test}=require('node:test');const assert=require('node:assert/strict');
const {summary}=require('../js/journey.js');
test('empty journey has seven Sunday-first days and no streak',()=>{const s=summary({},'2026-10-23');assert.equal(s.week[0].day,'2026-10-18');assert.equal(s.week[6].day,'2026-10-24');assert.equal(s.current,0);assert.equal(s.activeDays,0);});
test('streak bridges yesterday and month boundary, ignores future days, and excludes zero ratings',()=>{const s=summary({'2026-01-30':{drafting:1},'2026-01-31':{editing:1},'2026-02-01':{drafting:0},'2026-02-03':{}},'2026-02-02');assert.equal(s.current,2);assert.equal(s.longest,2);assert.equal(s.activeDays,2);assert.equal(s.weekly,0);assert.equal(s.started,'2026-01-30');});
test('corrections count once and two rest days preserve the current streak',()=>{const c={'2026-10-19':{drafting:5},'2026-10-21':{drafting:2}};let s=summary(c,'2026-10-23');assert.equal(s.current,2);assert.equal(s.weekly,2);c['2026-10-21'].drafting=0;s=summary(c,'2026-10-23');assert.equal(s.weekly,1);assert.equal(s.longest,1);});

test('Sunday starts a new week and Saturday ends it',()=>{for(const today of ['2026-10-18','2026-10-24']){const s=summary({'2026-10-17':{drafting:1},'2026-10-18':{editing:1}},today);assert.equal(s.week[0].day,'2026-10-18');assert.equal(s.weekly,1);}});
