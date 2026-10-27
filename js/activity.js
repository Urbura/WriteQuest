// One definition of a positive writing day for Journey and achievements.
(function(root) {
  "use strict";

  function positiveDays(checkins, today = null) {
    return Object.keys(checkins)
      .filter(day => (!today || day <= today) && Object.values(checkins[day]).some(rating => rating > 0))
      .sort();
  }

  function longestStreak(days) {
    let longest = 0,
      run = 0,
      prior = null;
    for (const day of days) {
      const stamp = Date.parse(day + "T00:00:00Z");
      run = prior !== null && stamp - prior === 86400000 ? run + 1 : 1;
      longest = Math.max(longest, run);
      prior = stamp;
    }
    return longest;
  }
  root.WriteQuestActivity = {
    positiveDays,
    longestStreak
  };
  if (typeof module !== "undefined") module.exports = root.WriteQuestActivity;
})(globalThis);
