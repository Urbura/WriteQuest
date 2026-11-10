// Shared calendar helpers for writing days, streaks and weekly progress.
(function(root) {
  "use strict";

  // Date-only history uses UTC arithmetic, avoiding daylight saving hour shifts.
  function shiftDay(day, offset) {
    return new Date(Date.parse(day + "T00:00:00Z") + offset * 86400000)
      .toISOString().slice(0, 10);
  }

  function startOfWeek(day) {
    const weekday = new Date(day + "T00:00:00Z").getUTCDay();
    return shiftDay(day, -weekday);
  }

  // The writing day follows the device's local calendar, resetting at 3:30 a.m.
  function localDay(now = new Date()) {
    const date = new Date(now);
    if (date.getHours() * 60 + date.getMinutes() < 210) date.setDate(date.getDate() - 1);
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }

  root.WriteQuestDates = { shiftDay, startOfWeek, localDay };
  if (typeof module !== "undefined") module.exports = root.WriteQuestDates;
})(globalThis);
