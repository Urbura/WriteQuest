"use strict";

/* Developer Mode panel, launcher and preview actions.
   Loaded before app.js; functions read app state only when called after startup.
   Temporary profiles and their XP baseline remain in developer.js. */
let developerBackgroundOnly = false;

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
  for (const id of ["save-local", "load-local", "reset-progress"]) {
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
