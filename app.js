"use strict";
/* WRITEQUEST DATA: Edit skill descriptions and examples here. */
const SKILLS = [{
  id: "drafting",
  name: "Drafting",
  color: "#38bdf8",
  description: "Creating new written content for your stories, books, poems, or other writing projects.",
  examples: ["Write a new chapter or scene", "Develop dialogue between characters", "Write a first draft", "Add new material to a manuscript"]
}, {
  id: "editing",
  name: "Editing",
  color: "#c084fc",
  description: "Improving writing you have already created through revision, proofreading, and restructuring.",
  examples: ["Rewrite a paragraph", "Fix grammar and spelling", "Improve dialogue or descriptions", "Reorganize scenes or chapters"]
}, {
  id: "creativity",
  name: "Creativity",
  color: "#f4c430",
  description: "Exploring ideas and creative possibilities for your writing.",
  examples: ["Brainstorm story ideas", "Create characters and settings", "Plan plot twists", "Experiment with story concepts"]
}, {
  id: "learning",
  name: "Learning",
  color: "#34d399",
  description: "Developing your knowledge of writing techniques and storytelling craft.",
  examples: ["Study narrative structure", "Read about writing techniques", "Practise a new literary technique", "Learn how to write stronger dialogue"]
}, {
  id: "research",
  name: "Research",
  color: "#f472b6",
  description: "Gathering information to make your writing more informed and convincing.",
  examples: ["Research historical settings", "Investigate a topic for a manuscript", "Check factual accuracy", "Explore real-world locations for a story"]
}];

/* Approved transparent skill assets; labels remain accessible text. */
function skillIcon(skill) {
  return '<img class="skill-asset" src="./assets/skills/' + skill.id + '.png?v=20261023-approved" alt="" aria-hidden="true" width="64" height="64" decoding="async">';
}

/* PROGRESSION: The curve and milestone bonuses can be tuned later. */
function xpToNextLevel(level) {
  // Balanced for Level 50 after 108 check-ins at 3/5: about five weekday-only months.
  return Math.ceil(5 * Math.pow(1.029, level - 1));
}
// A positive check-in earns a larger bonus after these skill milestones.
function checkinBonus(level) {
  if (level >= 40) return 4;
  if (level >= 30) return 3;
  if (level >= 20) return 2;
  if (level >= 10) return 1;
  return 0;
}
const RANKS = [
  ["Grandmaster", 50],
  ["Master", 45],
  ["Diamond", 40],
  ["Emerald", 35],
  ["Platinum", 30],
  ["Gold", 20],
  ["Silver", 10],
  ["Bronze", 1]
];
const rank = level => RANKS.find(r => level >= r[1])[0];
const BACKGROUND_KEYS = ["auto", "beginner", "bronze", "silver", "gold", "platinum", "emerald", "diamond", "master", "grandmaster"];
const KEY = "writequest-starter-v1";
const blank = () => ({
  xp: Object.fromEntries(SKILLS.map(s => [s.id, 0])),
  checkins: {},
  background: "auto",
  challenges: {}
});
const BACKUP_KEY = KEY + "-backup";
const DAILY_CHALLENGES = [
  {
    "id": "drafting-1",
    "skill": "drafting",
    "title": "The First Sentence",
    "description": "Write an opening sentence for a story."
  },
  {
    "id": "drafting-2",
    "skill": "drafting",
    "title": "Five-Minute Sprint",
    "description": "Write continuously for five minutes."
  },
  {
    "id": "drafting-3",
    "skill": "drafting",
    "title": "A Little Dialogue",
    "description": "Write a short conversation between two characters."
  },
  {
    "id": "drafting-4",
    "skill": "drafting",
    "title": "Set the Scene",
    "description": "Describe a location using three senses."
  },
  {
    "id": "drafting-5",
    "skill": "drafting",
    "title": "The Cliffhanger",
    "description": "Write an ending that creates suspense."
  },
  {
    "id": "drafting-6",
    "skill": "drafting",
    "title": "No Looking Back",
    "description": "Write one paragraph without editing."
  },
  {
    "id": "drafting-7",
    "skill": "drafting",
    "title": "A New Beginning",
    "description": "Draft the opening of a new scene."
  },
  {
    "id": "drafting-8",
    "skill": "drafting",
    "title": "Character Moment",
    "description": "Write about a character’s immediate goal."
  },
  {
    "id": "drafting-9",
    "skill": "drafting",
    "title": "Unexpected Event",
    "description": "Write a moment that surprises a character."
  },
  {
    "id": "drafting-10",
    "skill": "drafting",
    "title": "Keep It Moving",
    "description": "Write a transition between two scenes."
  },
  {
    "id": "editing-1",
    "skill": "editing",
    "title": "Polish the Prose",
    "description": "Revise one paragraph."
  },
  {
    "id": "editing-2",
    "skill": "editing",
    "title": "Stronger Words",
    "description": "Replace three vague words."
  },
  {
    "id": "editing-3",
    "skill": "editing",
    "title": "Read It Aloud",
    "description": "Read a passage aloud and improve its flow."
  },
  {
    "id": "editing-4",
    "skill": "editing",
    "title": "Less Is More",
    "description": "Shorten a sentence without losing meaning."
  },
  {
    "id": "editing-5",
    "skill": "editing",
    "title": "Dialogue Doctor",
    "description": "Improve a conversation between characters."
  },
  {
    "id": "editing-6",
    "skill": "editing",
    "title": "Find the Repetition",
    "description": "Remove unnecessary repetition."
  },
  {
    "id": "editing-7",
    "skill": "editing",
    "title": "Opening Improvement",
    "description": "Strengthen the beginning of a scene."
  },
  {
    "id": "editing-8",
    "skill": "editing",
    "title": "Pacing Check",
    "description": "Improve the pacing of one passage."
  },
  {
    "id": "editing-9",
    "skill": "editing",
    "title": "Proofreader",
    "description": "Check one page for spelling and grammar."
  },
  {
    "id": "editing-10",
    "skill": "editing",
    "title": "Second Attempt",
    "description": "Rewrite a sentence in two different ways."
  },
  {
    "id": "creativity-1",
    "skill": "creativity",
    "title": "Plot Twist",
    "description": "Brainstorm three unexpected plot developments."
  },
  {
    "id": "creativity-2",
    "skill": "creativity",
    "title": "Hidden Secrets",
    "description": "Invent a secret for one character."
  },
  {
    "id": "creativity-3",
    "skill": "creativity",
    "title": "Somewhere New",
    "description": "Imagine an unusual setting."
  },
  {
    "id": "creativity-4",
    "skill": "creativity",
    "title": "What’s in a Name?",
    "description": "Create five possible story titles."
  },
  {
    "id": "creativity-5",
    "skill": "creativity",
    "title": "The Obstacle",
    "description": "Invent a new problem for your protagonist."
  },
  {
    "id": "creativity-6",
    "skill": "creativity",
    "title": "New Arrival",
    "description": "Create a minor character."
  },
  {
    "id": "creativity-7",
    "skill": "creativity",
    "title": "Alternate Endings",
    "description": "Imagine three different endings."
  },
  {
    "id": "creativity-8",
    "skill": "creativity",
    "title": "Unlikely Combination",
    "description": "Combine two unrelated story ideas."
  },
  {
    "id": "creativity-9",
    "skill": "creativity",
    "title": "World Builder",
    "description": "Sketch or describe a fictional location."
  },
  {
    "id": "creativity-10",
    "skill": "creativity",
    "title": "The Difficult Choice",
    "description": "Imagine a moral dilemma for a character."
  },
  {
    "id": "learning-1",
    "skill": "learning",
    "title": "Something New",
    "description": "Learn one new writing technique."
  },
  {
    "id": "learning-2",
    "skill": "learning",
    "title": "Dialogue Study",
    "description": "Examine an example of effective dialogue."
  },
  {
    "id": "learning-3",
    "skill": "learning",
    "title": "Perspective Matters",
    "description": "Learn about narrative point of view."
  },
  {
    "id": "learning-4",
    "skill": "learning",
    "title": "Building Suspense",
    "description": "Study a technique for creating tension."
  },
  {
    "id": "learning-5",
    "skill": "learning",
    "title": "Scene Structure",
    "description": "Learn how effective scenes are organized."
  },
  {
    "id": "learning-6",
    "skill": "learning",
    "title": "The Hook",
    "description": "Study an effective opening paragraph."
  },
  {
    "id": "learning-7",
    "skill": "learning",
    "title": "Pacing Matters",
    "description": "Learn one way to control story pacing."
  },
  {
    "id": "learning-8",
    "skill": "learning",
    "title": "Literary Devices",
    "description": "Find an example of imagery."
  },
  {
    "id": "learning-9",
    "skill": "learning",
    "title": "Character Motivation",
    "description": "Learn how motivation drives a story."
  },
  {
    "id": "learning-10",
    "skill": "learning",
    "title": "Revision Skills",
    "description": "Learn a new approach to editing."
  },
  {
    "id": "research-1",
    "skill": "research",
    "title": "Fact Checker",
    "description": "Verify one detail in your manuscript."
  },
  {
    "id": "research-2",
    "skill": "research",
    "title": "Location Scout",
    "description": "Research a location for a story."
  },
  {
    "id": "research-3",
    "skill": "research",
    "title": "A Moment in History",
    "description": "Investigate a historical detail."
  },
  {
    "id": "research-4",
    "skill": "research",
    "title": "A Day in Their Shoes",
    "description": "Research a character’s occupation."
  },
  {
    "id": "research-5",
    "skill": "research",
    "title": "Authentic Settings",
    "description": "Find one realistic detail about a setting."
  },
  {
    "id": "research-6",
    "skill": "research",
    "title": "Cultural Discovery",
    "description": "Learn about a cultural custom relevant to your story."
  },
  {
    "id": "research-7",
    "skill": "research",
    "title": "Timeline Check",
    "description": "Verify the timing of a story event."
  },
  {
    "id": "research-8",
    "skill": "research",
    "title": "Science of Fiction",
    "description": "Research a scientific concept for your writing."
  },
  {
    "id": "research-9",
    "skill": "research",
    "title": "Explore the World",
    "description": "Investigate a landscape or environment."
  },
  {
    "id": "research-10",
    "skill": "research",
    "title": "The Right Word",
    "description": "Verify terminology used in your manuscript."
  }
];

let saveNotice = "",
  storageBlocked = false,
  expectedRaw = null;

function validateSave(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) || !input.xp || typeof input.xp !== "object" || Array.isArray(input.xp) || !input.checkins || typeof input.checkins !== "object" || Array.isArray(input.checkins)) throw Error("Invalid WriteQuest save.");
  const clean = blank();
  if (BACKGROUND_KEYS.includes(input.background)) clean.background = input.background;
  if (input.challenges && typeof input.challenges === "object" && !Array.isArray(input.challenges)) {
    for (const [day, entry] of Object.entries(input.challenges)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !entry || typeof entry !== "object") continue;
      if (!DAILY_CHALLENGES.some(c => c.id === entry.id)) continue;
      clean.challenges[day] = {id:entry.id, swaps:Math.min(2,Math.max(0,Number.isInteger(entry.swaps)?entry.swaps:0)), completed:entry.completed===true,everCompleted:entry.everCompleted===true||entry.completed===true};
    }
  }
  if (Array.isArray(input.achievementsSeen)) clean.achievementsSeen = [...new Set(input.achievementsSeen.filter(id => typeof id === "string" && id.length < 80))];
  if (Array.isArray(input.recentAchievements)) clean.recentAchievements = [...new Set(input.recentAchievements.filter(id => typeof id === "string" && /^[a-z0-9-]{1,79}$/.test(id)))].slice(0, 40);
  for (const skill of SKILLS) {
    const n = input.xp[skill.id];
    if (!Number.isSafeInteger(n) || n < 0) throw Error("Invalid skill XP.");
    clean.xp[skill.id] = n;
  }
  for (const [day, ratings] of Object.entries(input.checkins)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day || !ratings || typeof ratings !== "object" || Array.isArray(ratings)) throw Error("Invalid check-in date.");
    clean.checkins[day] = {};
    for (const skill of SKILLS) {
      const n = ratings[skill.id] ?? 0;
      if (!Number.isInteger(n) || n < 0 || n > 5) throw Error("Ratings must be whole numbers from 0 to 5.");
      clean.checkins[day][skill.id] = n;
    }
  }
  return clean;
}

function loadProgress() {
  try {
    expectedRaw = localStorage.getItem(KEY);
    if (expectedRaw !== null) {
      try {
        return validateSave(JSON.parse(expectedRaw));
      } catch (error) {
        storageBlocked = true;
        saveNotice = "The main save is damaged and has been preserved. Export a backup before restoring or importing progress.";
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup !== null) {
          try {
            const recovered = validateSave(JSON.parse(backup));
            saveNotice = "Showing your previous valid save. Export it, then use Restore Previous Save to resume saving.";
            return recovered;
          } catch (error) {
            /* Preserve both copies for recovery. */
          }
        }
        return blank();
      }
    }
    const previous = localStorage.getItem(BACKUP_KEY);
    if (previous !== null) {
      storageBlocked = true;
      saveNotice = "The main save is missing. Showing your previous save; open Settings to restore it before saving.";
      return validateSave(JSON.parse(previous));
    }
    return blank();
  } catch (error) {
    storageBlocked = true;
    saveNotice = "Browser storage is unavailable. Saving is paused; export any progress before closing this page.";
    return blank();
  }
}
let state = loadProgress();
const developer = globalThis.WriteQuestDeveloper?.create({
  skills: SKILLS,
  blank,
  validate: validateSave,
  getState: () => state,
  setState: next => {
    state = next;
  },
  loadNormal: loadProgress,
  xpToNext: xpToNextLevel
});
let developerBackgroundOnly = false;
let page = "home",
  selected = "drafting",
  draftRatings = null,
  draftDay = null;
const app = document.getElementById("app");

function save(next, {
  recover = false
} = {}) {
  const clean = validateSave(next);
  if (developer?.active) {
    state = clean;
    return;
  }
  if (storageBlocked && !recover) throw Error("Saving is paused to protect existing data. Open Settings to export and restore a backup.");
  const current = localStorage.getItem(KEY);
  if (current !== expectedRaw) throw Error("Another tab changed your progress. Export this tab’s progress, then reload before saving.");
  if (current !== null) {
    let valid = false;
    try {
      validateSave(JSON.parse(current));
      valid = true;
    } catch (error) {}
    if (valid) localStorage.setItem(BACKUP_KEY, current);
  }
  const raw = JSON.stringify(clean);
  localStorage.setItem(KEY, raw);
  if (localStorage.getItem(KEY) !== raw) throw Error("The browser could not verify the save. Keep this page open and retry.");
  expectedRaw = raw;
  state = clean;
  storageBlocked = false;
  saveNotice = "";
}

// Convert lifetime XP into a level and progress toward the next level.
function stats(xp) {
  let level = 1;
  let remaining = xp;
  while (level < 50 && remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
  }
  const need = level === 50 ? 0 : xpToNextLevel(level);
  return {
    level,
    remaining,
    need
  };
}

function getTotalLevel() {
  let total = 0;
  for (const skill of SKILLS) {
    total += stats(state.xp[skill.id]).level;
  }
  return total;
}

/* Use local calendar arithmetic so daylight saving days retain a 3:30 a.m. reset. */
function localDay(now = new Date()) {
  const date = new Date(now);
  if (date.getHours() * 60 + date.getMinutes() < 210) date.setDate(date.getDate() - 1);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function exportBackup() {
  if (developer?.active) {
    alert("Exit Test Mode to export your normal progress.");
    return;
  }
  const payload = {
    app: "WriteQuest",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: state
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "writequest-backup-" + localDay() + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function importBackup(event) {
  if (developer?.active) {
    event.target.value = "";
    alert("Exit Test Mode before importing a backup.");
    return;
  }
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 5 * 1024 * 1024) throw Error("Choose a WriteQuest backup smaller than 5 MB.");
    const payload = JSON.parse(await file.text());
    if (payload.app !== "WriteQuest" || payload.version !== 1) throw Error("This is not a supported WriteQuest backup.");
    const next = validateSave(payload.data);
    if (!window.confirm("Replace current progress with this backup? Export your current progress first if you want to keep it.")) return;
    save(next, {
      recover: true
    });
    draftRatings = null;
    clearRatingDraft();
    draftDay = null;
    render();
    alert("Backup restored successfully.");
  } catch (error) {
    alert("Backup was not restored. " + error.message);
  } finally {
    event.target.value = "";
  }
}

function restorePrevious() {
  if (developer?.active) {
    alert("Exit Test Mode before restoring a backup.");
    return;
  }
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) throw Error("No previous save is available yet.");
    const next = validateSave(JSON.parse(raw));
    if (!window.confirm("Restore the previous saved version? Export your current progress first if you want to keep it.")) return;
    save(next, {
      recover: true
    });
    draftRatings = null;
    clearRatingDraft();
    draftDay = null;
    render();
  } catch (error) {
    alert("Could not restore progress. " + error.message);
  }
}

function navigate(next) {
  if (next === "checkin") {
    if (!draftRatings) draftDay = localDay();
  }
  page = next;
  render();
  window.scrollTo(0, 0)
}

function openSkill(id) {
  selected = id;
  navigate("detail")
}

function back() {
  navigate("home")
}
/* Shared gear asset keeps the header and Settings heading consistent. */
const GEAR_ICON = '<img class="settings-icon" src="./assets/ui/settings.svg" alt="" aria-hidden="true" width="26" height="26">';

function header() {
  const total = getTotalLevel(),
    current = totalRank(total),
    rankClass = current.toLowerCase();
  const brand = '<button type="button" class="brand brand-logo" data-page="journey" aria-label="WriteQuest — open Journey" title="Journey"><img src="./assets/branding/writequest-logo-white-gold.png?v=20261026-logo-02" alt="WriteQuest" width="2172" height="724" decoding="async"></button>';
  const badge = current === "Beginner" ? '<span class="header-rank-icon header-rank-beginner" aria-hidden="true">◇</span>' : '<img class="header-rank-icon" src="./assets/achievements/ranks/' + rankClass + '.svg?v=20261026-progression" alt="" aria-hidden="true" width="28" height="32" decoding="async">';
  return '<header class="quest-header">' + brand + '<button class="header-level total-level-button rank-border-' + rankClass + '" id="open-ranks" aria-label="' + current + ' rank. Total level ' + total + '. View rank progression" title="' + current + ' — view rank progression">' + badge + '<span class="header-level-label">Total Level <strong>' + total + '</strong></span></button>' + '<div class="header-actions"><button class="settings-button achievements-button" data-page="projects" aria-label="Achievements' + (unseenAchievements().length ? ', ' + unseenAchievements().length + ' new' : '') + '" title="Achievements"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M7 3h10v5c0 4-2 6-5 6S7 12 7 8ZM7 5H3v3c0 3 2 4 5 4m9-7h4v3c0 3-2 4-5 4M12 14v6m-5 1h10"/></svg>' + (unseenAchievements().length ? '<span class="header-new-dot"></span>' : '') + '</button><button class="settings-button" id="open-settings" aria-label="Open settings" title="Settings">' + GEAR_ICON + '</button></div></header>';
}

function contentBack() {
  return '<button class="back content-back" id="back" aria-label="Go Back to Home">← Home</button>';
}

function contentTitle(title, actions = '') {
  return '<div class="page-title-row">' + contentBack() + '<h1>' + title + '</h1>' + actions + '</div>';
}

function progress(xp, color) {
  const p = stats(xp);
  return '<div class="row small"><span>Level ' + p.level + ' / 50 · ' + rank(p.level) + '</span><span>' + (p.level === 50 ? 'MAX' : p.remaining + ' / ' + p.need + ' XP') + '</span></div><div class="meter"><div class="fill" data-quest-xp="' + selected + '" data-xp-level="' + p.level + '" data-xp-fraction="' + (p.level === 50 ? 1 : p.remaining / p.need) + '" style="width:' + (p.level === 50 ? 100 : Math.floor(100 * p.remaining / p.need)) + '%;background:' + color + '"></div></div>'
}
/* Compact dashboard XP bars use the same level calculation as skill details. */
function homeProgress(skill) {
  const p = stats(state.xp[skill.id]),
    maxed = p.level === 50;
  const value = maxed ? 1 : p.remaining,
    need = maxed ? 1 : p.need;
  const label = maxed ? skill.name + ': maximum level reached' : skill.name + ': ' + p.remaining + ' / ' + p.need + ' XP to Level ' + (p.level + 1);
  return '<span class="home-progress" role="progressbar" aria-label="' + label + '" aria-valuemin="0" aria-valuemax="' + need + '" aria-valuenow="' + value + '" title="' + label + '"><span class="home-progress-fill" data-quest-xp="' + skill.id + '" data-xp-level="' + p.level + '" data-xp-fraction="' + (value / need) + '" style="width:' + (100 * value / need) + '%;background:' + skill.color + '"></span></span>';
}

function writingDay(ratings = todayRatings()) {
  const positive = SKILLS.filter(s => Number(ratings[s.id] || 0) > 0);
  return {
    positive,
    complete: positive.length > 0,
    count: positive.length
  };
}

// Each helper builds one small piece of Home. join("") combines the pieces.
function homeSkillCard(skill, index) {
  const level = stats(state.xp[skill.id]).level;
  const rankName = rank(level);
  const rankClass = rankName.toLowerCase().replace(/[^a-z]/g, "");
  const masteryClass = level === 50 ? " skill-mastery" : "";
  const animationDelay = -index * 1.7;
  return [
    `<button class="skill skill-rank-${rankClass}${masteryClass}" style="--mastery-color:${skill.color};--mastery-delay:${animationDelay}s" data-skill="${skill.id}">`,
    `<span class="symbol" aria-hidden="true">${skillIcon(skill)}</span>`,
    `<strong>${skill.name}</strong>`,
    `<span class="small">Level ${level} · ${rankName}</span>`,
    homeProgress(skill),
    '</button>'
  ].join("");
}

function homeCheckinButton(day) {
  const statusClass = day.complete ? "star-checkin-done" : "star-checkin-pending";
  const accessibleLabel = day.complete ?
    `Writing day complete. You made time for your writing. ${day.count} of 5 skills checked in. Tap to edit.` :
    'Tap to record today’s writing. One skill is enough.';
  return [
    `<button class="star-checkin ${statusClass}" data-page="checkin" aria-label="${accessibleLabel}">`,
    day.complete ? '<span class="star-checkin-title">Writing day</span>' : '',
    day.complete ? '<span class="star-checkin-icon" aria-hidden="true">✓</span>' : '',
    `<span class="star-checkin-label">${day.complete ? 'Complete' : 'Check In'}</span>`,
    day.complete ? `<span class="star-checkin-count">${day.count} of 5 skills</span>` : '<span class="star-checkin-dot" aria-hidden="true"></span>',
    '</button>'
  ].join("");
}


function pickDailyChallenge(progress, day, excluded = []) {
  const entries = Object.entries(progress.challenges || {}).filter(([date]) => date < day).sort((a,b)=>b[0].localeCompare(a[0]));
  const recent = entries.slice(0,10).map(([,v])=>v.id);
  const pool = DAILY_CHALLENGES.filter(c=>!excluded.includes(c.id));
  const fresh = pool.filter(c=>!recent.includes(c.id));
  const candidates = fresh.length ? fresh : pool;
  const skillIds = [...new Set(candidates.map(c=>c.skill))];
  const skill = skillIds[Math.floor(Math.random()*skillIds.length)];
  const options = candidates.filter(c=>c.skill===skill);
  return options[Math.floor(Math.random()*options.length)];
}
function ensureDailyChallenge() {
  const day=localDay();
  if(state.challenges?.[day]) return state.challenges[day];
  const next=validateSave(state), chosen=pickDailyChallenge(next,day);
  next.challenges[day]={id:chosen.id,swaps:0,completed:false,everCompleted:false};
  try {save(next)} catch(error) {return next.challenges[day]}
  return state.challenges[day];
}
function safeDailyChallengeHTML() {
  try { return dailyChallengeHTML(); }
  catch (error) {
    console.error("Daily Challenge could not load:", error);
    return '<section class="card" aria-label="Daily Challenge"><strong>Daily Challenge</strong><p class="small">Challenge temporarily unavailable. Your writing progress is safe.</p></section>';
  }
}
function dailyChallengeHTML() {
  const entry=ensureDailyChallenge(), challenge=DAILY_CHALLENGES.find(c=>c.id===entry.id);
  const skill=SKILLS.find(s=>s.id===challenge.skill);
  return '<section class="daily-quest daily-challenge-card" aria-label="Daily Quest">'+
    '<div class="daily-quest-heading"><strong>Daily Quest</strong><small>+2 XP · '+skill.name+'</small></div>'+
    '<label class="daily-quest-task"><input type="checkbox" id="daily-quest-check" '+(entry.completed?'checked ':'')+'><span><strong>'+challenge.title+'</strong><span>'+challenge.description+'</span></span></label>'+
    (entry.everCompleted?'':'<button type="button" id="swap-challenge" '+(entry.swaps>=2?'disabled':'')+'>Swap · '+(2-entry.swaps)+' left</button>')+
    '</section>';
}
function requestDailyQuestSubmission(completed) {
  const entry = state.challenges?.[localDay()];
  const checkbox = document.getElementById("daily-quest-check");
  if (checkbox) checkbox.checked = Boolean(entry?.completed);
  if (!entry || entry.completed === completed) return;
  if (!completed) { changeDailyChallenge(false, false); return; }
  if (document.getElementById("daily-quest-confirm")) return;
  const day = localDay(), questId = entry.id;
  const overlay = document.createElement("div");
  overlay.id = "daily-quest-confirm";
  overlay.className = "save-overlay";
  overlay.innerHTML = '<section class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="daily-quest-confirm-heading"><h2 id="daily-quest-confirm-heading">Daily Quest</h2><p>Are you sure you want to submit this task for your Daily Quest?</p><button type="button" class="primary" id="daily-quest-yes">Yes</button><button type="button" class="secondary" id="daily-quest-no">No</button></section>';
  const close = () => {
    globalThis.WriteQuestDialogs?.release(overlay);
    overlay.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = event => { if (event.key === "Escape") close(); };
  overlay.querySelector("#daily-quest-no").addEventListener("click", () => {
    close();
    // Cancelling submission never completes the quest or spends a swap.
    render();
    const current = state.challenges?.[localDay()];
    const remaining = current && !current.everCompleted ? Math.max(0, 2 - current.swaps) : 0;
    const quest = document.querySelector?.(".daily-quest");
    if (quest) {
      const notice = document.createElement("p");
      notice.className = "small muted";
      notice.setAttribute("role", "status");
      notice.textContent = remaining
        ? "Task not submitted. You can still swap your Daily Quest · " + remaining + " left."
        : "Task not submitted.";
      quest.appendChild(notice);
    }
    if (remaining) document.getElementById("swap-challenge")?.focus();
  });
  overlay.querySelector("#daily-quest-yes").addEventListener("click", () => {
    close();
    if (day !== localDay() || state.challenges?.[day]?.id !== questId) {
      alert("Your Daily Quest changed. Review the current task before submitting.");
      render();
      return;
    }
    changeDailyChallenge(false, true);
  });
  overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
  document.body.appendChild(overlay);
  globalThis.WriteQuestDialogs?.contain(overlay);
  document.addEventListener("keydown", onKey);
  overlay.querySelector("#daily-quest-no").focus();
}

function showDailyQuestReward(skillId) {
  const skill = SKILLS.find(item => item.id === skillId);
  const card = document.querySelector('[data-skill="' + skillId + '"]');
  if (!skill || !card) return;
  const reward = document.createElement("span");
  reward.className = "daily-quest-xp-reward";
  reward.setAttribute("role", "status");
  reward.setAttribute("aria-label", "+2 XP to " + skill.name);
  reward.textContent = "+2 XP";
  card.appendChild(reward);
  setTimeout(() => reward.remove(), 2200);
}

function changeDailyChallenge(swap, completed) {
  const day=localDay(), next=validateSave(state), entry=next.challenges[day];
  if(!entry)return;
  const rewardedSkill = !swap && completed === true && !entry.completed
    ? DAILY_CHALLENGES.find(item => item.id === entry.id)?.skill : null;
  if(swap){
    if(entry.everCompleted||entry.completed||entry.swaps>=2)return;
    const chosen=pickDailyChallenge(next,day,[entry.id]);entry.id=chosen.id;entry.swaps++;
  } else {
    if(typeof completed!=="boolean"||entry.completed===completed)return;
    entry.completed=completed;
    if(completed)entry.everCompleted=true;
  }
  next.xp=calculateCheckinXP(next.checkins,developer?.active?developer.baseXP():blank().xp,next.challenges);
  try {
    save(next);
  } catch (error) {
    alert("Quest was not saved: " + error.message);
    render();
    return;
  }
  globalThis.WriteQuestSounds?.unlock();
  render(); // The existing XP animator fills the awarded skill’s bar.
  if (rewardedSkill) showDailyQuestReward(rewardedSkill);
}

function home() {
  return [
    header(),
    '<div class="skill-star"><div class="skill-grid">',
    SKILLS.map(homeSkillCard).join(""),
    '</div>',
    homeCheckinButton(writingDay()),
    '</div>',
    safeDailyChallengeHTML()
  ].join("");
}

function detail() {
  const s = SKILLS.find(x => x.id === selected),
    p = stats(state.xp[s.id]),
    next = [10, 20, 30, 40].find(n => n > p.level);
  return header() + '<section class="card skill-detail">' + contentBack() + '<div class="detail-top"><div class="detail-identity"><span class="detail-icon" aria-hidden="true">' + skillIcon(s) + '</span><h1>' + s.name + '</h1></div><div class="detail-standing"><span class="rank">' + rank(p.level) + '</span><strong>Level ' + p.level + '</strong></div></div><div class="detail-progress">' + progress(state.xp[s.id], s.color) + '</div><h2>What is ' + s.name + '?</h2><p>' + s.description + '</p><h2>Activities that count</h2><ul class="examples">' + s.examples.map(x => '<li>' + x + '</li>').join("") + '</ul><div class="notice"><strong>XP:</strong> Rate your daily effort 0–5. You can leave a skill at zero.</div><p class="small muted">' + (next ? 'Next bonus: Level ' + next + ' (+ ' + (next / 10) + ' XP on positive check-ins).' : 'All milestone XP bonuses unlocked!') + '</p></section><button class="primary" data-page="checkin">Go to Daily Check-In</button>'
}

function todayRatings() {
  return state.checkins[localDay()] || {}
}

function editingRatings() {
  return draftRatings || todayRatings()
}

function checkinSkillRow(skill, ratings) {
  const rating = ratings[skill.id] ?? 0;
  const buttons = [];
  for (let score = 0; score <= 5; score += 1) {
    const label = score === 0 ? "Not Practiced Today" : String(score);
    buttons.push(`<button class="${score === 0 ? 'rating-rest' : ''}" aria-label="${skill.name}: ${score === 0 ? label : score + ' out of 5'}" data-rate="${skill.id}" data-value="${score}" aria-pressed="${rating === score}">${label}</button>`);
  }
  return [
    '<div class="check-row"><div class="row">',
    `<strong>${skillIcon(skill)} ${skill.name}</strong>`,
    `<span class="small muted" id="value-${skill.id}">${rating === 0 ? "Not Practiced Today" : rating + "/5"}</span>`,
    '</div><div class="rating">',
    buttons.join(""),
    '</div></div>'
  ].join("");
}

function checkin() {
  const ratings = editingRatings();
  return [
    header(),
    '<div class="checkin-heading">',
    contentBack(),
    '<h1>Daily Check-In</h1>',
    '<p class="muted checkin-intro">Rate progress toward your own goal: 1–5. One skill is enough; choose “Not Practiced Today” for the others.</p>',
    '</div><section class="card checkin-card">',
    SKILLS.map(skill => checkinSkillRow(skill, ratings)).join(""),
    '</section>',
    '<button class="primary" id="save-checkin">Save Today’s Check-In</button>',
    '<p class="small muted checkin-footer">Resets at 3:30 a.m. local time · <button class="text-button" data-page="settings">Back up progress</button></p>'
  ].join("");
}

/* Total Level ranks use the sum of all five skill levels (5–250). */
const TOTAL_RANKS = [
  ["Beginner", 5],
  ["Bronze", 10],
  ["Silver", 25],
  ["Gold", 50],
  ["Platinum", 75],
  ["Emerald", 100],
  ["Diamond", 150],
  ["Master", 200],
  ["Grandmaster", 250]
];
/* Background rewards follow existing Total Level ranks; no new save fields. */
const BACKGROUND_REWARDS = {
  Beginner: {
    key: "beginner",
    name: "Quiet Desk"
  },
  Bronze: {
    key: "bronze",
    name: "Candlelit Study"
  },
  Silver: {
    key: "silver",
    name: "Moonlit Reading Room"
  },
  Gold: {
    key: "gold",
    name: "Golden Library"
  },
  Platinum: {
    key: "platinum",
    name: "Skyward Archive"
  },
  Emerald: {
    key: "emerald",
    name: "Garden Library"
  },
  Diamond: {
    key: "diamond",
    name: "Starlit Athenaeum"
  },
  Master: {
    key: "master",
    name: "Author’s Observatory"
  },
  Grandmaster: {
    key: "grandmaster",
    name: "Grand Author’s Hall"
  }
};

function backgroundForTotal(total) {
  const unlocked = TOTAL_RANKS.find(([name, min]) =>
    BACKGROUND_REWARDS[name].key === state.background && total >= min);
  return BACKGROUND_REWARDS[unlocked ? unlocked[0] : totalRank(total)];
}

function chooseBackground(key) {
  const total = getTotalLevel();
  const unlocked = key === "auto" || TOTAL_RANKS.some(([name, min]) =>
    BACKGROUND_REWARDS[name].key === key && total >= min);
  if (!unlocked || !BACKGROUND_KEYS.includes(key)) return;
  const next = validateSave(state);
  next.background = key;
  try {
    save(next);
  } catch (error) {
    alert("Background was not changed. " + error.message);
    return;
  }
  render();
  document.getElementById("background-select")?.focus({
    preventScroll: true
  });
}

function applyRankBackground() {
  const total = getTotalLevel(),
    reward = backgroundForTotal(total);
  document.body.dataset.rankBackground = reward.key;
  const file = reward.key + "-portrait-v" + (["beginner", "emerald"].includes(reward.key) ? 4 : 3) + ".webp";
  document.body.style.setProperty("--rank-art", 'url("./assets/backgrounds/' + file + '?v=20261027-beginner-attic")');
}

function totalRank(total) {
  return [...TOTAL_RANKS].reverse().find(([name, min]) => total >= min)[0]
}

function rankProgression() {
  const total = getTotalLevel();
  const current = totalRank(total),
    reward = backgroundForTotal(total);
  const auto = !state.background || state.background === "auto";
  const options = TOTAL_RANKS.map(([name, min]) => {
    const background = BACKGROUND_REWARDS[name],
      unlocked = total >= min;
    const selected = !auto && state.background === background.key && unlocked;
    return '<option value="' + background.key + '"' + (selected ? ' selected' : '') +
      (unlocked ? '' : ' disabled') + '>' + background.name +
      ' · Total Level ' + min + '</option>';
  }).join('');
  return header() + '<section class="card">' + contentTitle('Total Level Ranks') +
    '<p class="muted">Your Total Level is the sum of your five writing skills. Each rank unlocks a new writing background.</p>' +
    '<div class="rank-summary rank-summary-' + current.toLowerCase() + '"><strong>' + current +
    '</strong><span>Total Level ' + total + ' / 250</span></div>' +
    '<h2>Your background</h2>' +
    (developer?.active ? '<p class="small muted">Test Mode preview only.</p>' : '') +
    '<label class="background-select-label" for="background-select">Change Background</label>' +
    '<select id="background-select" class="background-select" aria-describedby="background-select-help">' +
    '<option value="auto"' + (auto ? ' selected' : '') + '>Auto: ' + BACKGROUND_REWARDS[current].name + ' · Total Level ' + TOTAL_RANKS.find(([name]) => name === current)[1] + '</option>' +
    options + '</select>' +
    '<p id="background-select-help" class="small muted">Each background shows its required Total Level. Choose an unlocked background, or Auto to follow your progress.</p></section>';
}

function settings() {
  return header() + '<section class="card settings-card">' + contentTitle(GEAR_ICON + '<span>Settings</span>') + '<h2>Your progress</h2><p class="notice">Progress is saved on this device, with a previous-save recovery copy. Download a backup before clearing browser data or changing devices. Backups are not cloud synced.</p><h2>Back up and restore</h2><p class="small muted">Export a file to keep a copy. To move devices, export here, transfer the file, then import it in WriteQuest on the other device.</p><button class="primary" id="export-backup">Export Backup</button><details class="backup-options"><summary class="secondary">Restore Backup</summary><div class="backup-options-actions"><button class="secondary" id="choose-backup" type="button">Import Backup File</button><input id="import-backup" type="file" accept="application/json,.json" hidden><button class="secondary" id="restore-previous">Restore Previous Save</button></div></details><h2>App updates</h2><p class="small muted">Version 2026.10.29.6 · Progress stays on this device when updating.</p><button class="secondary" id="check-updates">Check for Updates</button><p id="update-status" class="small" role="status"></p><h2>Daily reset</h2><p class="muted">3:30 a.m. your device’s local time, including daylight saving changes. A reset opens a new check-in day; your XP and history stay saved.</p><h2>Sounds & help</h2><button class="secondary" id="toggle-sounds" aria-pressed="' + (globalThis.WriteQuestSounds?.isEnabled() !== false) + '">Sounds: ' + (globalThis.WriteQuestSounds?.isEnabled() === false ? 'Off' : 'On') + '</button><button class="secondary" id="open-tutorial">View Tutorial</button><h2>Developer Mode</h2><p class="small muted">Preview every rank and background using a separate temporary profile.</p><button class="secondary" id="open-developer">Open Test Mode</button><h2>Reset progress</h2><p class="small muted">Erase all saved skill XP and daily check-ins on this device. This cannot be undone.</p><button class="reset-button" id="reset-progress">Reset Progress</button></section>'
}
/* One attainable goal keeps Journey useful for focused writing days. */
function nextMilestone(items) {
  return items.filter(a => !a.earned && (a.id === "first" || /^(days-|total-|any-)/.test(a.id) || SKILLS.some(s => a.id === s.id + "-25" || a.id === s.id + "-50")))
    .sort((a, b) => b.value / b.goal - a.value / a.goal || a.goal - a.value - (b.goal - b.value) || a.id.localeCompare(b.id))[0] || null;
}

function journeyMilestone() {
  const item = nextMilestone(achievementList());
  if (!item) return '<h2>Your next milestone</h2><p class="muted">Every focused writing day adds to your journey.</p>';
  const remaining = item.goal - item.value;
  let label, unit;
  if (item.id === "first" || item.id.startsWith("days-")) {
    label = "active days";
    unit = remaining === 1 ? "active day" : "active days";
  } else if (item.id.startsWith("total-")) {
    label = "total levels";
    unit = remaining === 1 ? "total level" : "total levels";
  } else {
    label = "skill levels";
    unit = remaining === 1 ? "skill level" : "skill levels";
  }
  return '<h2>Your next milestone</h2><p><strong>' + item.name + '</strong></p><p class="small muted">' + item.description + '</p><progress class="collection-progress" max="' + item.goal + '" value="' + item.value + '" aria-label="' + item.name + ': ' + item.value + ' of ' + item.goal + ' ' + label + '"></progress><p class="small">' + item.value + ' / ' + item.goal + ' ' + label + ' · ' + remaining + ' more ' + unit + ' to go</p><button class="secondary" data-page="projects">View Achievements</button>';
}

function journey() {
  const data = globalThis.WriteQuestJourney.summary(state.checkins, localDay());
  return header() + '<section class="card">' + contentTitle('Journey') + '' + (developer?.active ? '<p class="small muted">Test Mode preview</p>' : '') + '<h2>This week</h2><p>' + data.weekly + ' / 7 days checked in</p><div class="journey-week">' + data.week.map((d, i) => '<div class="journey-day ' + (d.checked ? 'journey-checked' : '') + '" aria-label="' + d.day + ': ' + (d.checked ? 'Checked in' : d.future ? 'Upcoming' : 'No check-in') + '"><span>' + ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i] + '</span><strong aria-hidden="true">' + (d.checked ? '✓' : d.future ? '·' : '—') + '</strong></div>').join('') + '</div><div class="journey-stats"><div><strong>' + data.activeDays + '</strong><span>Active days</span></div><div><strong>' + data.current + '</strong><span>Current streak</span></div><div><strong>' + data.longest + '</strong><span>Longest streak</span></div></div><p class="muted">' + (data.started ? 'Your writing journey began ' + data.started + '.' : 'Your first positive check-in starts your journey. One skill is enough.') + '</p><p class="small muted">Any skill rated 1–5 counts toward your streak. Two missed days per Sunday–Saturday week are allowed. A third miss that week, or three in a row, resets the current streak. Rest days add no points. Today stays open until 3:30 a.m. local time.</p>' + journeyMilestone() + '<h2>About WriteQuest</h2><p class="muted">Track writing effort across Drafting, Editing, Creativity, Learning, and Research.</p></section>';
}

function openTutorial() {
  const steps = [
    ['Welcome to WriteQuest', 'Build your writing habits across Drafting, Editing, Creativity, Learning, and Research.'],
    ['Check in once a day', 'Tap the centre Check In button. Rate progress toward your own goal from 0–5, then save. A rating of 1–5 in one skill completes your writing day and counts toward your streak. Choose “Not Practiced Today” for other skills; you can edit today’s ratings. Two missed days per Sunday–Saturday week preserve your streak. A third missed day that week, or three missed days in a row, ends it. Your day resets at 3:30 a.m. local time.'],
    ['Watch your progress grow', 'Earn XP, gain levels, and unlock cozy backgrounds. Achievements track your milestones; Journey shows your weekly activity. Back up your progress in Settings.']
  ];
  let step = 0;
  const overlay = document.createElement('div');
  overlay.className = 'save-overlay';
  const close = () => {
    globalThis.WriteQuestDialogs.release(overlay);
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    if (!developer?.active) try {
      localStorage.setItem('writequest-tutorial-seen', '1');
    } catch (_) {}
    document.querySelector('[data-page="checkin"], [data-page="home"]')?.focus();
  };
  const onKey = e => {
    if (e.key === 'Escape') close();
  };
  const draw = () => {
    overlay.innerHTML = '<section class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorial-heading"><p class="small">' + (step + 1) + ' / ' + steps.length + '</p><h2 id="tutorial-heading">' + steps[step][0] + '</h2><p>' + steps[step][1] + '</p><button class="primary" id="tutorial-next">' + (step === 2 ? 'Start writing' : 'Next') + '</button><button class="secondary" id="tutorial-skip">Skip tutorial</button></section>';
    overlay.querySelector('#tutorial-next').addEventListener('click', () => {
      if (step === 2) close();
      else {
        step++;
        draw();
      }
    });
    overlay.querySelector('#tutorial-skip').addEventListener('click', close);
    overlay.querySelector('#tutorial-next').focus();
  };
  document.body.appendChild(overlay);
  globalThis.WriteQuestDialogs.contain(overlay);
  document.addEventListener('keydown', onKey);
  draw();
}

function toggleSounds() {
  const audio = globalThis.WriteQuestSounds;
  if (!audio) return;
  audio.setEnabled(!audio.isEnabled());
  audio.unlock();
  audio.play('checkin');
  render();
}

function achievementList(profile = state) {
  return globalThis.WriteQuestAchievements?.list({
    skills: SKILLS,
    xp: profile.xp,
    checkins: profile.checkins,
    level: xp => stats(xp).level,
    ranks: TOTAL_RANKS,
    today: localDay()
  }) || []
}

// Latest recorded unlock first; older saves can still display an earned badge.
function recentAchievement() {
  const earned = achievementList().filter(item => item.earned);
  for (const id of state.recentAchievements || []) {
    const item = earned.find(item => item.id === id);
    if (item) return { item, tracked: true };
  }
  const item = earned[earned.length - 1];
  return item ? { item, tracked: false } : null;
}

function recentAchievementCard() {
  const recent = recentAchievement();
  if (!recent) return "";
  const { item, tracked } = recent;
  return '<button type="button" class="recent-achievement achievement-highlight" id="open-recent-achievement" aria-label="View achievement: ' + item.name + '">' +
    achievementBadge(item) + '<span class="recent-achievement-copy"><span class="small muted">' +
    (tracked ? 'Most recent unlock' : 'Unlocked achievement') + '</span><strong>' + item.name +
    '</strong><span class="small muted">' + item.description + '</span>' + '</span><span aria-hidden="true">›</span></button>';
}

function openRecentAchievement() {
  const recent = recentAchievement();
  if (!recent) return;
  navigate("projects");
  const target = document.getElementById("achievement-" + recent.item.id);
  if (!target) return;
  const group = target.closest("details");
  if (group) group.open = true;
  target.scrollIntoView({ block: "center" });
  target.focus({ preventScroll: true });
}

function unseenAchievements() {
  return achievementList().filter(a => a.earned && !(state.achievementsSeen || []).includes(a.id))
}

function viewAchievement(id) {
  const item = achievementList().find(a => a.id === id && a.earned);
  if (!item || (state.achievementsSeen || []).includes(id)) return;
  const expanded = Array.from(app.querySelectorAll?.('.achievement-group') || [], group => group.open);
  const next = validateSave(state);
  next.achievementsSeen = [...new Set([...(next.achievementsSeen || []), id])];
  try {
    save(next);
  } catch (error) {
    alert("Could not mark achievement viewed. " + error.message);
    return;
  }
  render();
  Array.from(app.querySelectorAll?.('.achievement-group') || []).forEach((group, i) => {
    group.open = expanded[i] ?? group.open;
  });
  celebrateAchievement();
}
// Acknowledge only earned notifications, then celebrate after a successful save.
function clearAchievementNotifications() {
  const pending = unseenAchievements();
  if (!pending.length) return;
  const expanded = Array.from(app.querySelectorAll?.('.achievement-group') || [], group => group.open);
  const next = validateSave(state);
  next.achievementsSeen = [...new Set([...(next.achievementsSeen || []), ...pending.map(a => a.id)])];
  try {
    save(next);
  } catch (error) {
    alert("Could not clear achievement notifications. " + error.message);
    return;
  }
  render();
  Array.from(app.querySelectorAll?.('.achievement-group') || []).forEach((group, i) => {
    group.open = expanded[i] ?? group.open;
  });
  document.getElementById("achievement-notifications-status")?.focus();
  celebrateAchievement();
}

function achievements() {
  const items = achievementList(),
    unseen = new Set(unseenAchievements().map(a => a.id)),
    earned = items.filter(a => a.earned).length;
  const medals = Object.values(state.checkins).filter(r => SKILLS.every(s => r[s.id] === 5)).length;
  return header() + '<section class="card achievements-card">' + contentTitle('Achievements', '<button type="button" class="secondary achievement-clear-button" id="clear-achievement-notifications" aria-label="Clear all achievement notifications (' + unseen.size + ')" title="Clear all notifications"' + (unseen.size ? '' : ' disabled') + '>Clear all</button>') + recentAchievementCard() + '<p class="muted">' + earned + ' / ' + items.length + ' unlocked' + (developer?.active ? ' · Test Mode preview' : '') + '</p><progress class="collection-progress" max="' + items.length + '" value="' + earned + '" aria-label="Collection completion"></progress><p class="small">Optional Well-Rounded Days: <strong>' + medals + '</strong></p><p class="small muted">Tap an unlocked achievement to clear its New marker.</p>' + (!unseen.size ? '<p class="small muted" id="achievement-notifications-status" tabindex="-1" role="status">All notifications cleared.</p>' : '') + ['Consistency', 'Levels', 'Skills', 'Legend'].map(category => {
    const group = items.filter(a => a.category === category),
      fresh = group.filter(a => unseen.has(a.id)).length;
    return '<details class="achievement-group"><summary>' + category + (fresh ? ' <span class="achievement-new">' + fresh + ' new</span>' : '') + ' <span class="small muted">' + group.filter(a => a.earned).length + ' / ' + group.length + '</span></summary>' + group.map(a => '<article id="achievement-' + a.id + '" tabindex="-1" class="achievement-row ' + (a.earned ? 'achievement-earned' : '') + '">' + achievementBadge(a) + '<div>' + (a.earned ? '<button class="achievement-view" data-view-achievement="' + a.id + '">' + a.name + '</button>' : '<strong>' + a.name + '</strong>') + (unseen.has(a.id) ? ' <span class="achievement-new">New</span>' : '') + '<p class="small muted">' + a.description + '</p><progress max="' + a.goal + '" value="' + a.value + '" aria-label="' + a.name + ' progress"></progress><span class="small">' + a.value + ' / ' + a.goal + (a.earned ? ' · Unlocked' : '') + '</span></div></article>').join('') + '</details>';
  }).join('') + '</section>';
}

// Choose a page, draw it, then connect its controls.
function currentPageHTML() {
  switch (page) {
    case "home":
      return home();
    case "detail":
      return detail();
    case "checkin":
      return checkin();
    case "settings":
      return settings();
    case "ranks":
      return rankProgression();
    case "journey":
      return journey();
    default:
      return achievements();
  }
}

function render() {
  applyRankBackground();
  app.innerHTML = currentPageHTML();
  globalThis.QuestXPAnimation?.animate(app);
  if (saveNotice) {
    const notice = document.createElement("p");
    notice.className = "notice";
    notice.setAttribute("role", "alert");
    notice.textContent = saveNotice;
    app.prepend(notice);
  }
  connectPageControls();
  syncDeveloperUI();
  renderUpdateNotice();
}

// A page only contains some of these buttons. Skip buttons that are absent.
function connectButton(id, action) {
  const button = document.getElementById(id);
  if (button) button.addEventListener("click", action);
}

function updateDraftRating(skillId, rating) {
  // Copy the ratings first: tapping a score must not change the saved profile.
  draftRatings = {
    ...editingRatings()
  };
  draftRatings[skillId] = rating;
  retainRatingDraft();
  render();
}

function connectPageControls() {
  connectButton("check-updates", () => checkForUpdates(true));
  connectButton("apply-update", applyUpdate);
  connectButton("export-backup", exportBackup);
  const importInput = document.getElementById("import-backup");
  if (importInput) importInput.addEventListener("change", importBackup);
  connectButton("choose-backup", () => document.getElementById("import-backup").click());
  connectButton("restore-previous", restorePrevious);
  connectButton("back", back);
  connectButton("open-settings", () => navigate("settings"));
  connectButton("open-ranks", () => navigate("ranks"));
  connectButton("save-checkin", saveCheckin);
  document.getElementById("daily-quest-check")?.addEventListener("change",event=>requestDailyQuestSubmission(event.target.checked));
  connectButton("swap-challenge",()=>changeDailyChallenge(true));
  connectButton("reset-progress", confirmResetProgress);
  connectButton("open-developer", enterDeveloperMode);
  connectButton("clear-achievement-notifications", clearAchievementNotifications);
  connectButton("open-recent-achievement", openRecentAchievement);
  connectButton("toggle-sounds", toggleSounds);
  connectButton("open-tutorial", openTutorial);

  // data-* attributes identify which skill, page or reward a button represents.
  for (const button of document.querySelectorAll("[data-skill]")) {
    button.addEventListener("click", () => openSkill(button.dataset.skill));
  }
  for (const button of document.querySelectorAll("[data-page]")) {
    button.addEventListener("click", () => navigate(button.dataset.page));
  }
  for (const button of document.querySelectorAll("[data-rate]")) {
    button.addEventListener("click", () => updateDraftRating(button.dataset.rate, Number(button.dataset.value)));
  }
  for (const button of document.querySelectorAll("[data-view-achievement]")) {
    button.addEventListener("click", () => viewAchievement(button.dataset.viewAchievement));
  }
  document.getElementById("background-select")?.addEventListener("change", event => chooseBackground(event.target.value));
}

// Replay days in date order so each rating receives the bonus for that day's level.
function calculateCheckinXP(checkins, startingXP, challenges = {}) {
  const xp = {
    ...startingXP
  };
  const days = Object.keys(checkins).sort();
  for (const day of days) {
    for (const skill of SKILLS) {
      const rating = Number(checkins[day][skill.id] || 0);
      if (rating > 0) {
        const level = stats(xp[skill.id]).level;
        xp[skill.id] += rating + checkinBonus(level);
      }
    }
  }
  for(const entry of Object.values(challenges)) {
    if(entry.completed){const challenge=DAILY_CHALLENGES.find(c=>c.id===entry.id);if(challenge)xp[challenge.skill]+=2;}
  }
  return xp;
}

/* DAILY SAVE: Recalculate XP from all saved daily ratings to prevent duplicate awards. */
function saveCheckin() {
  globalThis.WriteQuestSounds?.unlock();
  const day = localDay();
  if (draftDay && draftDay !== day) {
    clearRatingDraft();
    alert("A new writing day started at 3:30 a.m. Please review your ratings for the new day.");
    draftRatings = null;
    draftDay = day;
    render();
    return;
  }
  const earnedBefore = new Set(achievementList().filter(a => a.earned).map(a => a.id));
  const levelsBefore = Object.fromEntries(SKILLS.map(s => [s.id, stats(state.xp[s.id]).level]));
  const next = validateSave(state);
  next.checkins[day] = Object.assign({}, editingRatings());
  const startingXP = developer?.active ? developer.baseXP() : blank().xp;
  next.xp = calculateCheckinXP(next.checkins, startingXP, next.challenges);
  const newAchievements = achievementList(next).filter(item => item.earned && !earnedBefore.has(item.id));
  if (newAchievements.length) next.recentAchievements = [...new Set([
    ...newAchievements.map(item => item.id).reverse(), ...(next.recentAchievements || [])
  ])].slice(0, 40);
  try {
    save(next);
  } catch (error) {
    alert("Progress was not saved. Your ratings are still available to retry. " + error.message);
    return;
  }
  const leveled = [];
  for (const skill of SKILLS) {
    const oldLevel = levelsBefore[skill.id];
    const newLevel = stats(state.xp[skill.id]).level;
    for (let level = oldLevel + 1; level <= newLevel; level += 1) {
      leveled.push({
        name: skill.name,
        level
      });
    }
  }
  draftRatings = null;
  clearRatingDraft();
  draftDay = day;
  render();

  const beforeTotal = Object.values(levelsBefore).reduce((sum, level) => sum + level, 0);
  const afterTotal = getTotalLevel();
  const oldRank = totalRank(beforeTotal);
  const newRank = totalRank(afterTotal);
  let unlockedRank = null;
  if (afterTotal > beforeTotal && newRank !== oldRank) unlockedRank = newRank;
  showSaveDialog(leveled, unlockedRank, newAchievements);
}

function confirmResetProgress() {
  if (developer?.active) {
    alert("Exit Test Mode to reset normal progress.");
    return;
  }
  const overlay = document.createElement("div");
  overlay.className = "save-overlay";
  overlay.innerHTML = '<div class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-heading" aria-describedby="reset-description"><h2 id="reset-heading">Reset all progress?</h2><p id="reset-description">This will permanently erase your skill XP, levels, and daily check-in history on this device. You cannot undo this action.</p><button class="reset-button" id="confirm-reset">Yes, Reset Everything</button><button class="secondary" id="cancel-reset">Cancel</button></div>';
  document.body.appendChild(overlay);
  globalThis.WriteQuestDialogs.contain(overlay);
  const cancel = () => {
    globalThis.WriteQuestDialogs.release(overlay);
    overlay.remove();
    document.removeEventListener("keydown", onKey)
  };
  const onKey = e => {
    if (e.key === "Escape") cancel()
  };
  overlay.addEventListener("click", e => {
    if (e.target === overlay) cancel()
  });
  overlay.querySelector("#cancel-reset").addEventListener("click", cancel);
  overlay.querySelector("#confirm-reset").addEventListener("click", () => {
    try {
      save(blank())
    } catch (e) {
      alert("Could not reset progress. " + e.message);
      return
    }
    draftRatings = null;
    clearRatingDraft();
    draftDay = null;
    cancel();
    page = "home";

    render();
    window.scrollTo(0, 0)
  });
  document.addEventListener("keydown", onKey);
  overlay.querySelector("#cancel-reset").focus()
}
/* Test controls live outside the dashboard, so artwork can be viewed on its own. */
function enterDeveloperMode() {
  if (!developer) {
    alert("Test tools have not loaded. Refresh WriteQuest and try again.");
    return;
  }
  developer.enter();
  draftRatings = null;
  draftDay = null;
  page = "home";

  render();
  openDeveloperPanel();
}

function exitDeveloperMode() {
  developer?.exit();
  developerBackgroundOnly = false;
  draftRatings = null;
  draftDay = null;
  page = "home";

  if (typeof location !== "undefined" && window.history?.replaceState) {
    const url = new URL(location.href);
    url.searchParams.delete("dev");
    url.searchParams.delete("test");
    window.history.replaceState(null, "", url);
  }
  render();
}

function syncDeveloperUI() {
  const active = Boolean(developer?.active);
  document.body.classList?.toggle("developer-mode", active);
  document.body.classList?.toggle("developer-background-only", active && developerBackgroundOnly);
  let launcher = document.getElementById("developer-launcher");
  if (!active) {
    launcher?.remove?.();
    return;
  }
  if (!launcher) {
    launcher = document.createElement("button");
    launcher.id = "developer-launcher";
    launcher.type = "button";
    launcher.addEventListener("click", openDeveloperPanel);
    document.body.appendChild(launcher);
  }
  launcher.textContent = "Test Mode · " + totalRank(getTotalLevel());
  launcher.setAttribute("aria-label", "Open WriteQuest test tools. Preview progress is not saved.");
  for (const id of ["export-backup", "choose-backup", "import-backup", "restore-previous", "reset-progress"]) {
    const button = document.getElementById(id);
    if (button) button.disabled = true;
  }
}
/* Synthetic history exists only in the isolated Test Mode profile. */
function previewAllAchievements() {
  if (!developer?.active) return;
  if (!developer.setTotal(250)) return;
  const next = validateSave(state),
    today = localDay();
  const stamp = Date.parse(today + "T00:00:00Z");
  for (let offset = 0; offset < 100; offset++) {
    const day = new Date(stamp - offset * 86400000).toISOString().slice(0, 10);
    next.checkins[day] = Object.fromEntries(SKILLS.map(s => [s.id, 5]));
  }
  next.achievementsSeen = [];
  save(next);
  developerBackgroundOnly = false;
  draftRatings = null;
  draftDay = null;
  navigate("projects");

}

function openDeveloperPanel() {
  if (!developer?.active || document.getElementById("developer-panel")) return;
  const overlay = document.createElement("div");
  overlay.id = "developer-panel";
  overlay.className = "save-overlay";
  overlay.innerHTML = '<section class="save-dialog developer-dialog" role="dialog" aria-modal="true" aria-labelledby="developer-heading"><h2 id="developer-heading">WriteQuest Test Mode</h2><p class="small">Temporary preview. Your normal progress is protected.</p><div class="developer-ranks">' + TOTAL_RANKS.map(([name, total]) => '<button type="button" data-preview-total="' + total + '">' + name + '<small>Total Level ' + total + '</small></button>').join('') + '</div><button type="button" class="secondary" id="developer-all-achievements">Preview All Achievements</button><button type="button" class="secondary" id="developer-background">' + (developerBackgroundOnly ? 'Show skill cards' : 'Background only') + '</button><button type="button" class="secondary" id="developer-restore">Restore original preview</button><button type="button" class="primary" id="developer-close">View app</button><button type="button" class="secondary" id="developer-exit">Exit Test Mode</button></section>';
  const close = () => {
    globalThis.WriteQuestDialogs.release(overlay);
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    document.getElementById("developer-launcher")?.focus();
  };
  const onKey = event => {
    if (event.key === "Escape") close();
  };
  overlay.addEventListener("click", event => {
    if (event.target === overlay) {
      close();
      return;
    }
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.previewTotal !== undefined) {
      if (developer.setTotal(Number(button.dataset.previewTotal))) {
        draftRatings = null;
        draftDay = null;
        page = "home";
        render();
        close();
      }
    } else if (button.id === "developer-all-achievements") {
      close();
      previewAllAchievements();
    } else if (button.id === "developer-background") {
      developerBackgroundOnly = !developerBackgroundOnly;
      render();
      close();
    } else if (button.id === "developer-restore") {
      developer.restore();
      draftRatings = null;
      draftDay = null;
      page = "home";
      render();
      close();
    } else if (button.id === "developer-exit") {
      close();
      exitDeveloperMode();
    } else if (button.id === "developer-close") close();
  });
  document.body.appendChild(overlay);
  globalThis.WriteQuestDialogs.contain(overlay);
  document.addEventListener("keydown", onKey);
  overlay.querySelector("#developer-close").focus();
}

/* Unfinished ratings survive a reload in this tab. This is not a saved check-in. */
const RATING_DRAFT_KEY = "writequest-rating-draft-v1";
function retainRatingDraft() {
  if (developer?.active || !draftRatings) return;
  try {
    sessionStorage.setItem(RATING_DRAFT_KEY, JSON.stringify({day: draftDay, base: expectedRaw, ratings: draftRatings}));
  } catch (_) { /* A draft cache is optional; the explicit save still reports failures. */ }
}
function clearRatingDraft() {
  if (developer?.active) return;
  try { sessionStorage.removeItem(RATING_DRAFT_KEY); } catch (_) {}
}
function recoverRatingDraft() {
  if (developer?.active || storageBlocked) return;
  try {
    const draft = JSON.parse(sessionStorage.getItem(RATING_DRAFT_KEY));
    if (!draft) return;
    if (draft.day !== localDay() || draft.base !== expectedRaw) { clearRatingDraft(); return; }
    const validated = validateSave({...blank(), checkins: {[draft.day]: draft.ratings}});
    draftRatings = validated.checkins[draft.day];
    draftDay = draft.day;
    page = "checkin";
    saveNotice = "Your unfinished ratings were recovered. Review them and tap Save Today’s Check-In.";
  } catch (_) { clearRatingDraft(); }
}

/* Check HTML without cache; only a user action reloads the app. No service worker. */
const APP_BUILD = "20261029-reliable-6";
let availableBuild = "", updateCheckRunning = false, lastUpdateCheck = 0;
function renderUpdateNotice() {
  if (!availableBuild || typeof document.createElement !== "function") return;
  const notice = document.createElement("div");
  notice.className = "notice app-update-notice";
  notice.setAttribute("role", "status");
  notice.innerHTML = '<span>A WriteQuest update is ready.</span><button class="secondary" id="apply-update">Update App</button>';
  app.appendChild(notice);
  connectButton("apply-update", applyUpdate);
}
async function checkForUpdates(manual = false) {
  if (typeof fetch !== "function" || typeof location === "undefined" || updateCheckRunning) return;
  if (!manual && Date.now() - lastUpdateCheck < 60000) return;
  updateCheckRunning = true;
  lastUpdateCheck = Date.now();
  const status = document.getElementById("update-status");
  if (status) status.textContent = "Checking for updates…";
  try {
    const response = await fetch("./index.html?update-check=" + Date.now(), {cache:"no-store", ...(typeof AbortSignal !== "undefined" && AbortSignal.timeout ? {signal:AbortSignal.timeout(10000)} : {})});
    if (!response.ok) throw Error("Update check unavailable");
    const html = await response.text();
    const build = html.match(/<meta name="writequest-build" content="([a-zA-Z0-9.-]+)">/)?.[1];
    if (!build) throw Error("Update information unavailable");
    if (build !== APP_BUILD) {
      const firstNotice = !availableBuild;
      availableBuild = build;
      if (firstNotice) renderUpdateNotice();
      if (status) status.textContent = "An update is ready. Save any ratings, then tap Update App.";
    } else if (status) status.textContent = "WriteQuest is up to date.";
  } catch (_) {
    if (status) status.textContent = "Could not check for updates. Check your connection and try again.";
  } finally { updateCheckRunning = false; }
}
function applyUpdate() {
  if (draftRatings) {
    alert("Save your ratings before updating. Your unfinished ratings are still available in Daily Check-In.");
    return;
  }
  if (developer?.active) { alert("Exit Test Mode before updating."); return; }
  const url = new URL(location.href);
  url.searchParams.set("v", availableBuild || APP_BUILD);
  location.replace(url.href);
}
function checkOtherTabProgress() {
  if (developer?.active || storageBlocked) return;
  try {
    if (localStorage.getItem(KEY) !== expectedRaw) {
      saveNotice = "Progress changed in another tab. Export anything needed here, then reload before saving.";
      render();
    }
  } catch (_) {
    saveNotice = "Browser storage is unavailable. Keep this page open and export your progress.";
    render();
  }
}
window.addEventListener("storage", event => { if (event.key === KEY || event.key === null) checkOtherTabProgress(); });
window.addEventListener("pageshow", () => { checkOtherTabProgress(); checkForUpdates(); });
window.addEventListener("beforeunload", event => {
  if (draftRatings && !developer?.active) { event.preventDefault(); event.returnValue = ""; }
});

// Developer Mode starts only through Settings, never from a saved URL.
recoverRatingDraft();
let renderedDay = localDay();

function refreshDay() {
  const day = localDay();
  if (day !== renderedDay) {
    renderedDay = day;
    if (!draftRatings) {
      draftDay = day;
      render();
    }
  }
}
window.addEventListener("focus", refreshDay);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) { refreshDay(); checkOtherTabProgress(); checkForUpdates(); }
});
setInterval(refreshDay, 30000);
if (typeof setTimeout !== "undefined") setTimeout(() => {
  if (developer?.active) return;
  let seen = true;
  try {
    seen = localStorage.getItem('writequest-tutorial-seen') === '1';
  } catch (_) {}
  if (!seen) openTutorial();
}, 0);
render();
