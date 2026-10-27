// One definition of a positive writing day for Journey and achievements.
(function(root) {
  "use strict";

  function positiveDays(checkins, today = null) {
    return Object.keys(checkins)
      .filter(day => (!today || day <= today) && Object.values(checkins[day]).some(rating => rating > 0))
      .sort();
  }

  // Calendar arithmetic uses UTC for date-only values, avoiding DST hour changes.
  function shiftDay(day, offset) {
    return new Date(Date.parse(day + "T00:00:00Z") + offset * 86400000)
      .toISOString().slice(0, 10);
  }

  function streakSummary(days, today = null) {
    const activeDays = [...new Set(days)].filter(day => !today || day <= today).sort();
    if (!activeDays.length) return {
      current: 0,
      longest: 0
    };
    const checked = new Set(activeDays);
    const lastDay = today || activeDays[activeDays.length - 1];
    let current = 0;
    let longest = 0;
    let week = null;
    let missedThisWeek = 0;
    let consecutiveMisses = 0;

    // Reconstruct skipped days even when the app was never opened on those days.
    for (let day = activeDays[0]; day <= lastDay; day = shiftDay(day, 1)) {
      const weekday = new Date(day + "T00:00:00Z").getUTCDay();
      const sunday = shiftDay(day, -weekday);
      if (sunday !== week) {
        week = sunday;
        missedThisWeek = 0;
      }
      if (checked.has(day)) {
        current += 1;
        consecutiveMisses = 0;
        longest = Math.max(longest, current);
      } else if (day !== today) {
        // Today is still open until the app's existing 3:30 a.m. reset.
        missedThisWeek += 1;
        consecutiveMisses += 1;
        if (missedThisWeek >= 3 || consecutiveMisses >= 3) current = 0;
      }
    }
    return {
      current,
      longest
    };
  }

  function longestStreak(days) {
    return streakSummary(days).longest;
  }
  root.WriteQuestActivity = {
    positiveDays,
    longestStreak,
    streakSummary
  };
  if (typeof module !== "undefined") module.exports = root.WriteQuestActivity;
})(globalThis);
