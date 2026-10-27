"use strict";

function celebrateAchievement() {
  if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const effect = document.createElement('div');
  effect.className = 'firework-bursts achievement-fireworks';
  effect.setAttribute('aria-hidden', 'true');
  const colors = ['#f4c76a', '#38bdf8', '#c084fc', '#86efac'];
  for (let i = 0; i < 24; i++) {
    const spark = document.createElement('span');
    spark.className = 'firework-spark';
    spark.style.setProperty('--angle', (i * 15) + 'deg');
    spark.style.setProperty('--distance', (70 + (i % 4) * 20) + 'px');
    spark.style.setProperty('--spark-color', colors[i % colors.length]);
    effect.appendChild(spark);
  }
  document.body.appendChild(effect);
  setTimeout(() => effect.remove(), 1100);
}

/* Each newly earned level gets its own celebration, in skill order. */
function showSaveDialog(leveled = [], backgroundRank = null, newAchievements = []) {
  const queue = [...leveled];
  if (backgroundRank) queue.push({
    backgroundRank
  });
  queue.push(...newAchievements.map(achievement => ({
    achievement
  })));
  queue.push(null);
  showNextCelebration(queue)
}
// Five staggered bursts belong to the Legend dialog and disappear when it closes.
function addLegendFireworks(overlay) {
  const effect = document.createElement("div");
  effect.className = "legend-fireworks";
  effect.setAttribute("aria-hidden", "true");
  const colors = ["#f8d77d", "#dfc4ff", "#86efff", "#fff0ce", "#c399e6"];
  const origins = [
    [20, 28],
    [80, 28],
    [25, 65],
    [75, 65],
    [50, 18]
  ];
  origins.forEach(([left, top], burst) => {
    const origin = document.createElement("div");
    origin.className = "legend-firework-origin";
    origin.style.left = left + "%";
    origin.style.top = top + "%";
    for (let i = 0; i < 32; i++) {
      const spark = document.createElement("span");
      spark.className = "firework-spark";
      spark.style.setProperty("--angle", (i * 360 / 32) + "deg");
      spark.style.setProperty("--distance", (55 + (i % 4) * 18) + "px");
      spark.style.setProperty("--spark-color", colors[(i + burst) % colors.length]);
      spark.style.animationDelay = (burst * .4) + "s";
      origin.appendChild(spark);
    }
    effect.appendChild(origin);
  });
  overlay.classList.add("legend-celebration");
  overlay.appendChild(effect);
}

function showNextCelebration(queue) {
  const skill = queue.shift();
  globalThis.WriteQuestSounds?.play(skill?.achievement ? "achievement" : skill?.backgroundRank ? "rank" : skill ? "level" : "checkin");
  const overlay = document.createElement("div");
  overlay.className = "save-overlay";
  overlay.innerHTML = '<div class="save-dialog" role="dialog" aria-modal="true" aria-labelledby="saved-heading"><div style="font-size:34px" aria-hidden="true">✦</div><h2 id="saved-heading">' + (writingDay().complete ? 'Writing day complete' : 'Check-in saved') + '</h2><p>' + (writingDay().complete ? 'You made time for your writing.' : 'Your ratings are saved. A positive rating in any one skill completes your writing day.') + '</p><button class="primary" id="saved-done">Done</button><p class="small">Select the button to continue.</p></div>';
  if (!skill && writingDay().complete) {
    const focus = document.createElement('p');
    focus.className = 'small';
    focus.textContent = writingDay().count === 1 ? writingDay().positive[0].name + ' progress saved. A focused day counts.' : writingDay().count + ' of 5 skills checked in. Progress saved.';
    overlay.querySelector('#saved-done').before(focus);
  }
  if (skill?.achievement) {
    overlay.querySelector("#saved-heading").textContent = "Achievement Unlocked!";
    overlay.querySelector("p").textContent = skill.achievement.name + " — " + skill.achievement.description;
    if (skill.achievement.id === "legend") {
      overlay.querySelector("#saved-heading").textContent = "WriteQuest Legend!";
      addLegendFireworks(overlay);
    }
  } else if (skill?.backgroundRank) {
    overlay.querySelector("#saved-heading").textContent = skill.backgroundRank + " Unlocked!";
    overlay.querySelector("p").textContent = "New background: " + BACKGROUND_REWARDS[skill.backgroundRank].name + ".";
  } else if (skill) {
    const dialog = overlay.querySelector(".save-dialog");
    dialog.classList.add("level-up-dialog");
    dialog.querySelector("#saved-heading").textContent = "Level Up!";
    dialog.querySelector("p").textContent = skill.name + " reached Level " + skill.level + "!";
    dialog.querySelector("#saved-done").textContent = queue.length ? "Continue →" : "Done";
    const bursts = document.createElement("div");
    bursts.className = "firework-bursts";
    bursts.setAttribute("aria-hidden", "true");
    const colors = ["#f4c76a", "#38bdf8", "#c084fc", "#f472b6", "#86efac"];
    for (let i = 0; i < 24; i++) {
      const spark = document.createElement("span");
      spark.className = "firework-spark";
      spark.style.setProperty("--angle", (i * 137.5 % 360) + "deg");
      spark.style.setProperty("--distance", (65 + (i % 4) * 16) + "px");
      spark.style.setProperty("--spark-color", colors[i % colors.length]);
      spark.style.animationDelay = ((i % 3) * 0.1) + "s";
      bursts.appendChild(spark)
    }
    dialog.prepend(bursts)
  }
  if (skill) {
    overlay.querySelector("#saved-done").textContent = queue.length ? "Continue →" : "Done";
    if (developer?.active) overlay.querySelector(".small").textContent = "Test Mode preview · normal progress unchanged.";
  }
  document.body.appendChild(overlay);
  globalThis.WriteQuestDialogs.contain(overlay);
  let advanced = false;
  const advance = () => {
    if (advanced) return;
    advanced = true;
    globalThis.WriteQuestDialogs.release(overlay);
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    if (queue.length) showNextCelebration(queue);
    else {
      navigate("home");
      app.querySelector(".star-checkin")?.focus();
    }
  };
  const onKey = e => {
    if (e.key === "Escape" && !skill) advance()
  };
  overlay.addEventListener("click", e => {
    if (e.target === overlay && !skill) advance()
  });
  overlay.querySelector("#saved-done").addEventListener("click", advance);
  document.addEventListener("keydown", onKey);
  overlay.querySelector("#saved-done").focus()
}
