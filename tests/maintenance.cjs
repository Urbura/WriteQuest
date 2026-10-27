// Run with: node --test tests/maintenance.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const copy = value => JSON.parse(JSON.stringify(value));

function appContext() {
  const storage = new Map();
  const app = { innerHTML: '', querySelectorAll: () => [], querySelector: () => null, prepend() {} };
  const launcher = { remove() {}, setAttribute() {}, focus() {} };
  const context = {
    console, Date, URLSearchParams,
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    document: {
      getElementById: id => id === 'app' ? app : id === 'developer-launcher' ? launcher : null,
      querySelectorAll: () => [], addEventListener() {}, removeEventListener() {},
      body: { dataset: {}, style: { setProperty() {} }, classList: { toggle() {} } }
    },
    window: { addEventListener() {}, scrollTo() {} },
    setInterval() {}, setTimeout() {}, alert(message) { throw Error(message); }
  };
  vm.createContext(context);
  for (const file of ['js/activity.js', 'js/dialogs.js', 'js/badges.js', 'js/celebrations.js', 'js/journey.js', 'js/achievements.js', 'js/developer.js', 'app.js']) {
    vm.runInContext(read(file), context, { filename: file });
  }
  return { context, storage, run: source => vm.runInContext(source, context) };
}

test('all deferred scripts parse and initialize in their document order', () => {
  const { run } = appContext();
  assert.match(run('home()'), /skill-star/);
  assert.match(run('achievements()'), /Achievements/);
  assert.doesNotMatch(run('achievements()'), /class="achievement-group" open/);
});

test('Test Mode restore resets both baseline and preview history; normal save stays intact', () => {
  const { run, storage } = appContext();
  run(`const initial = blank(); initial.xp.drafting = 23; initial.checkins[localDay()] = {drafting: 5}; save(initial);`);
  const before = new Map(storage);
  run('developer.enter(); developer.setTotal(250); developer.restore();');
  assert.equal(run('state.xp.drafting'), 23);
  assert.equal(run('developer.baseXP().drafting'), 23);
  assert.equal(run('Object.keys(state.checkins).length'), 0);
  run(`showSaveDialog = () => {}; draftRatings = {drafting: 1}; saveCheckin();`);
  assert.equal(run('state.xp.drafting'), 24);
  assert.deepEqual(storage, before);
  run('developer.exit();');
  assert.equal(run('state.xp.drafting'), 23);
  assert.equal(run('state.checkins[localDay()].drafting'), 5);
});

test('same-day edits replace XP and all-zero days do not count as active', () => {
  const { run } = appContext();
  run(`showSaveDialog = () => {}; draftRatings = {drafting: 5}; saveCheckin(); draftRatings = {drafting: 2}; saveCheckin();`);
  assert.equal(run('state.xp.drafting'), 2);
  run('draftRatings = {drafting: 0}; saveCheckin();');
  assert.equal(run('state.xp.drafting'), 0);
  assert.equal(run('writingDay().complete'), false);
  assert.equal(run('WriteQuestJourney.summary(state.checkins,localDay()).activeDays'), 0);
  assert.equal(run('achievementList().find(a=>a.id==="first").earned'), false);
});

test('save validation rejects invalid XP, dates and ratings', () => {
  const { run } = appContext();
  assert.throws(() => run('const badXP = blank(); badXP.xp.drafting = -1; validateSave(badXP);'), /Invalid skill XP/);
  assert.throws(() => run('const badDate = blank(); badDate.checkins["2026-02-30"] = {}; validateSave(badDate);'), /Invalid check-in date/);
  assert.throws(() => run('const badRating = blank(); badRating.checkins[localDay()] = {drafting:6}; validateSave(badRating);'), /Ratings/);
});

test('a competing tab cannot silently overwrite the saved profile', () => {
  const { run, storage } = appContext();
  run('save(blank());');
  const key = run('KEY');
  const competingSave = run('const competing = blank(); competing.xp.drafting=17; JSON.stringify(competing)');
  storage.set(key, competingSave);
  assert.throws(() => run('save(blank());'), /Another tab/);
  assert.equal(storage.get(key), competingSave);
});

test('Journey and achievement consistency totals agree across gaps and zero days', () => {
  const { run } = appContext();
  run(`state.checkins = {'2026-10-23':{drafting:2},'2026-10-24':{editing:1},'2026-10-25':{learning:0},'2026-10-26':{research:3}};`);
  const data = copy(run(`WriteQuestJourney.summary(state.checkins,'2026-10-27')`));
  assert.equal(data.activeDays, 3);
  assert.equal(data.longest, 2);
  assert.equal(data.current, 1);
  assert.equal(run(`achievementList().find(a=>a.id==='days-7').value`), data.activeDays);
  assert.equal(run(`achievementList().find(a=>a.id==='streak-3').value`), data.longest);
});

test('all-achievements preview unlocks Legend without touching device storage', () => {
  const { run, storage } = appContext();
  const before = new Map(storage);
  run('developer.enter(); previewAllAchievements();');
  assert.equal(run('achievementList().every(a=>a.earned)'), true);
  assert.equal(run('achievementList().find(a=>a.id==="legend").earned'), true);
  assert.equal(run('Object.keys(state.checkins).length'), 100);
  assert.deepEqual(storage, before);
});

test('every badge renders in both states, with holographic finish only when earned', () => {
  const { run } = appContext();
  const badges = copy(run(`achievementList().map(a=>({id:a.id,locked:achievementBadge({...a,earned:false}),earned:achievementBadge({...a,earned:true})}))`));
  for (const badge of badges) {
    assert.match(badge.locked, /achievement-badge-locked/, badge.id);
    assert.doesNotMatch(badge.locked, /achievement-holographic/, badge.id);
    assert.match(badge.earned, /achievement-badge/, badge.id);
  }
});

test('dialog focus wraps, supports nested popups and cleans up on release', () => {
  const listeners = new Set();
  const document = { activeElement: null, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
  function control() { return { isConnected: true, getClientRects: () => [{}], closest: () => null, focus() { document.activeElement = this; } }; }
  const opener = control(), first = control(), last = control(), nested = control();
  opener.focus();
  const overlay = { querySelectorAll: () => [first, last], contains: value => [first, last].includes(value) };
  const child = { querySelectorAll: () => [nested], contains: value => value === nested };
  const context = { document }; vm.createContext(context); vm.runInContext(read('js/dialogs.js'), context);
  const { contain, release } = context.WriteQuestDialogs;
  const press = shiftKey => { let prevented = false; for (const fn of listeners) fn({ key: 'Tab', shiftKey, preventDefault() { prevented = true; } }); assert(prevented); };
  contain(overlay); last.focus(); press(false); assert.equal(document.activeElement, first);
  press(true); assert.equal(document.activeElement, last);
  contain(child); nested.focus(); press(false); assert.equal(document.activeElement, nested);
  release(child); assert.equal(document.activeElement, last);
  release(overlay); assert.equal(document.activeElement, opener);
  assert.equal(listeners.size, 0);
});
