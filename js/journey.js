(function(root) {
  "use strict";

  const dates = root.WriteQuestDates || (typeof require !== "undefined" ? require("./dates.js") : null);
  function summary(checkins, today) {
    const activity = root.WriteQuestActivity || (typeof require !== "undefined" ? require("./activity.js") : null);
    const days = activity.positiveDays(checkins, today),
      set = new Set(days);
    const sunday = dates.startOfWeek(today);
    const week = Array.from({
      length: 7
    }, (_, i) => {
      const day = dates.shiftDay(sunday, i);
      return {
        day,
        checked: set.has(day),
        future: day > today
      };
    });
    const {
      longest,
      current
    } = activity.streakSummary(days, today);
    return {
      activeDays: days.length,
      longest,
      current,
      week,
      weekly: week.filter(d => d.checked).length,
      started: days[0] || null
    };
  }
  root.WriteQuestJourney = {
    summary
  };
  if (typeof module !== 'undefined') module.exports = {
    summary
  };
})(globalThis);
