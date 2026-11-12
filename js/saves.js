"use strict";

/* Save storage, validation, recovery, and Save/Load controls.
   Loaded before app.js as a deferred classic script, like celebrations.js.
   App data (SKILLS, DAILY_CHALLENGES, BACKGROUND_KEYS, blank) and UI helpers
   are read only when called, after app.js initializes them. Keep storage keys
   and save formats stable so existing device progress remains compatible. */

const KEY = "writequest-starter-v1";

const BACKUP_KEY = KEY + "-backup";
// A manual checkpoint is separate from both autosave and automatic recovery.
const MANUAL_SAVE_KEY = KEY + "-manual";

let saveNotice = "",
  storageBlocked = false,
  expectedRaw = null;

function validateSave(input) {
  if (!input || typeof input !== "object" || Array.isArray(input) || !input.xp || typeof input.xp !== "object" || Array.isArray(input.xp) || !input.checkins || typeof input.checkins !== "object" || Array.isArray(input.checkins)) throw Error("Invalid WriteQuest save.");
  const clean = blank();
  if (BACKGROUND_KEYS.includes(input.background)) clean.background = input.background;
  if (typeof input.autosavedAt === "string" && Number.isFinite(Date.parse(input.autosavedAt))) {
    clean.autosavedAt = new Date(input.autosavedAt).toISOString();
  }
  if (input.challenges && typeof input.challenges === "object" && !Array.isArray(input.challenges)) {
    for (const [day, entry] of Object.entries(input.challenges)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !entry || typeof entry !== "object") continue;
      if (!DAILY_CHALLENGES.some(c => c.id === entry.id)) continue;
      clean.challenges[day] = {id:entry.id, swaps:Math.min(2,Math.max(0,Number.isInteger(entry.swaps)?entry.swaps:0)), completed:entry.completed===true,everCompleted:entry.everCompleted===true||entry.completed===true};
    }
  }
  if (Array.isArray(input.achievementsSeen)) clean.achievementsSeen = [...new Set(input.achievementsSeen.filter(id => typeof id === "string" && id.length < 80))];
  if (Array.isArray(input.recentAchievements)) clean.recentAchievements = [...new Set(input.recentAchievements.filter(id => typeof id === "string" && /^[a-z0-9-]{1,79}$/.test(id)))].slice(0, 40);
  if (Array.isArray(input.earnedAchievements)) clean.earnedAchievements = [...new Set(input.earnedAchievements.filter(id => typeof id === "string" && /^[a-z0-9-]{1,79}$/.test(id)))];
  if (input.achievementRewards && typeof input.achievementRewards === "object" && !Array.isArray(input.achievementRewards)) {
    clean.achievementRewards = Object.fromEntries(Object.entries(input.achievementRewards).filter(([id, skillId]) => /^[a-z0-9-]{1,79}$/.test(id) && SKILLS.some(skill => skill.id === skillId)));
  }
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
        saveNotice = "The main save is damaged and has been preserved. Open Settings to keep a manual copy, then use Load.";
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup !== null) {
          try {
            const recovered = validateSave(JSON.parse(backup));
            saveNotice = "Showing your previous valid save. Use Save to keep it, then Load your Manual Save to resume saving.";
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
      saveNotice = "The main save is missing. Showing your previous save; use Save to keep it, then Load your Manual Save to resume saving.";
      return validateSave(JSON.parse(previous));
    }
    return blank();
  } catch (error) {
    storageBlocked = true;
    saveNotice = "Browser storage is unavailable. Keep this page open and retry saving before closing.";
    return blank();
  }
}

function save(next, {
  recover = false
} = {}) {
  const clean = validateSave(next);
  const earned = achievementList(clean).filter(item => item.earned).map(item => item.id);
  // Keep unlocks available after same-day rating edits, but let explicit loads/reset restore their own snapshot.
  if (earned.length || clean.earnedAchievements?.length) clean.earnedAchievements = [...new Set([...(clean.earnedAchievements || []), ...earned])];
  if (developer?.active) {
    state = clean;
    return;
  }
  if (storageBlocked && !recover) throw Error("Saving is paused to protect existing data. Open Settings to Load a manual save.");
  const current = localStorage.getItem(KEY);
  if (current !== expectedRaw) throw Error("Another tab changed your progress. Use Load to review the latest autosave before saving again.");
  if (current !== null) {
    let valid = false;
    try {
      validateSave(JSON.parse(current));
      valid = true;
    } catch (error) {}
    if (valid) localStorage.setItem(BACKUP_KEY, current);
  }
  // Persist the timestamp in the same verified write as the progress itself.
  clean.autosavedAt = new Date().toISOString();
  const raw = JSON.stringify(clean);
  localStorage.setItem(KEY, raw);
  if (localStorage.getItem(KEY) !== raw) throw Error("The browser could not verify the save. Keep this page open and retry.");
  expectedRaw = raw;
  state = clean;
  storageBlocked = false;
  saveNotice = "";
}

function readManualSave() {
  const raw = localStorage.getItem(MANUAL_SAVE_KEY);
  if (raw === null) return null;
  const payload = JSON.parse(raw);
  if (!payload || payload.app !== "WriteQuest" || payload.version !== 1 ||
      typeof payload.savedAt !== "string" || !Number.isFinite(Date.parse(payload.savedAt))) {
    throw Error("The manual save could not be read. Use Load to review the last autosave.");
  }
  return { raw, savedAt: payload.savedAt, data: validateSave(payload.data) };
}

function manualSaveStatus() {
  try {
    const saved = readManualSave();
    return saved
      ? { available: true, text: "Saved on this device: " + new Date(saved.savedAt).toLocaleString() }
      : { available: false, text: "No manual save yet. Select Save to create one." };
  } catch (error) {
    return { available: false, text: "Manual save unavailable. Load the last autosave or Save a new copy." };
  }
}

function saveLocal() {
  if (developer?.active) {
    alert("Exit Test Mode before saving your normal progress.");
    return;
  }
  try {
    const data = validateSave(state);
    if (localStorage.getItem(KEY) !== expectedRaw) {
      throw Error("Another tab changed your progress. Use Load to review the latest autosave before creating a manual save.");
    }
    const previous = localStorage.getItem(MANUAL_SAVE_KEY);
    if (previous !== null && !window.confirm("Replace your manual save with your current progress?")) return;
    const raw = JSON.stringify({ app: "WriteQuest", version: 1, savedAt: new Date().toISOString(), data });
    localStorage.setItem(MANUAL_SAVE_KEY, raw);
    if (localStorage.getItem(MANUAL_SAVE_KEY) !== raw) {
      throw Error("The browser could not verify the save. Keep this page open and try again.");
    }
    render();
    alert("Progress saved in WriteQuest on this device.");
  } catch (error) {
    alert("Manual save was not created. " + error.message);
  }
}

function loadLocal(snapshot = null) {
  if (developer?.active) {
    alert("Exit Test Mode before loading your normal progress.");
    return;
  }
  try {
    const saved = snapshot || readManualSave();
    if (!saved) throw Error("No manual save is available yet. Select Save to create one.");
    const when = new Date(saved.savedAt).toLocaleString();
    if (!window.confirm("Load your manual save from " + when + " and replace your current progress?")) return;
    if (localStorage.getItem(MANUAL_SAVE_KEY) !== saved.raw) {
      throw Error("The manual save changed in another tab. Open Load again to view the latest copy.");
    }
    // Existing save checks protect newer progress in another tab and retain a recovery copy.
    save(saved.data, { recover: true });
    draftRatings = null;
    clearRatingDraft();
    draftDay = null;
    render();
    alert("Manual save loaded successfully.");
  } catch (error) {
    alert("Manual save was not loaded. " + error.message);
  }
}


function readAutosave() {
  const raw = localStorage.getItem(KEY);
  if (raw === null) return null;
  const data = validateSave(JSON.parse(raw));
  return { raw, data, savedAt: data.autosavedAt || null };
}

function loadAutosave(snapshot = null) {
  if (developer?.active) {
    alert("Exit Test Mode before loading your normal progress.");
    return;
  }
  try {
    const saved = snapshot || readAutosave();
    if (!saved) throw Error("No autosave is available yet. Complete a check-in to create one.");
    if (!window.confirm("Load the last autosave on this device? Any unfinished ratings will be discarded.")) return;
    if (localStorage.getItem(KEY) !== saved.raw) {
      throw Error("The autosave changed in another tab. Open Load again to select the latest copy.");
    }
    // Explicitly loading the current autosave refreshes this tab without rewriting it.
    state = saved.data;
    expectedRaw = saved.raw;
    storageBlocked = false;
    saveNotice = "";
    draftRatings = null;
    clearRatingDraft();
    draftDay = null;
    render();
    alert("Last autosave loaded successfully.");
  } catch (error) {
    alert("Autosave was not loaded. " + error.message);
  }
}


function loadSlotHTML(id, title, snapshot) {
  if (!snapshot) return '<button type="button" class="load-slot" id="' + id + '" disabled><strong>' + title + '</strong><span class="load-slot-date">No save available</span></button>';
  const total = SKILLS.reduce((sum, skill) => sum + stats(snapshot.data.xp[skill.id]).level, 0);
  const lastDay = Object.keys(snapshot.data.checkins).sort().pop();
  const date = snapshot.savedAt
    ? "Saved " + new Date(snapshot.savedAt).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })
    : lastDay ? "Last check-in " + new Date(lastDay + "T12:00:00").toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "Latest on this device";
  return '<button type="button" class="load-slot" id="' + id + '">' +
    '<span class="load-slot-heading"><strong>' + title + '</strong><span class="load-slot-total">Total Level ' + total + '</span></span>' +
    '<span class="load-slot-rank">' + totalRank(total) + '</span>' +
    '<span class="load-slot-skills">' + SKILLS.map(skill =>
      '<span class="load-slot-skill"><span class="load-slot-icon" aria-hidden="true">' + skillIcon(skill) + '</span>' +
      '<span class="load-slot-name">' + skill.name + '</span><strong>Lv ' + stats(snapshot.data.xp[skill.id]).level + '</strong></span>'
    ).join("") + '</span><span class="load-slot-date">' + date + '</span></button>';
}

function openLoadMenu() {
  if (developer?.active) {
    alert("Exit Test Mode before loading your normal progress.");
    return;
  }
  let manual = null, autosave = null;
  try { manual = readManualSave(); } catch (error) { /* Keep damaged saves unavailable. */ }
  try { autosave = readAutosave(); } catch (error) { /* Recovery Options remain available. */ }
  const overlay = document.createElement("div");
  overlay.className = "save-overlay";
  overlay.innerHTML = '<section class="save-dialog load-dialog" role="dialog" aria-modal="true" aria-labelledby="load-menu-heading">' +
    '<h2 id="load-menu-heading">Load Progress</h2><p>Choose a save to load.</p>' +
    loadSlotHTML("load-autosave", "Last Autosave", autosave) +
    loadSlotHTML("load-manual", "Manual Save", manual) +
    '<button type="button" class="secondary" id="cancel-load">Cancel</button></section>';
  document.body.appendChild(overlay);
  globalThis.WriteQuestDialogs?.contain(overlay);
  const close = () => {
    globalThis.WriteQuestDialogs?.release(overlay);
    overlay.remove();
  };
  overlay.querySelector("#load-autosave").addEventListener("click", () => { close(); loadAutosave(autosave); });
  overlay.querySelector("#load-manual").addEventListener("click", () => { close(); loadLocal(manual); });
  overlay.querySelector("#cancel-load").addEventListener("click", close);
  overlay.addEventListener("keydown", event => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
  });
  overlay.addEventListener("click", event => { if (event.target === overlay) close(); });
  overlay.querySelector("button:not(:disabled)")?.focus();
}
