/* Achievements are derived from the current profile; no extra save fields. */
(function(root) {
  function list({
    skills,
    xp,
    checkins,
    level,
    ranks,
    today = null
  }) {
    const levels = skills.map(s => level(xp[s.id])),
      total = levels.reduce((a, b) => a + b, 0);
    const activity = root.WriteQuestActivity || (typeof require !== "undefined" ? require("./activity.js") : null);
    const days = activity.positiveDays(checkins, today),
      longest = activity.longestStreak(days);
    const perfectDays = Object.values(checkins).filter(r => skills.every(s => r[s.id] === 5)).length;
    const result = [];
    const add = (id, category, name, description, value, goal) => result.push({
      id,
      category,
      name,
      description,
      value: Math.min(value, goal),
      goal,
      earned: value >= goal
    });
    add('first', 'Consistency', 'First Check-In', 'Rate at least one skill 1–5 on your first writing day.', days.length, 1);
    for (const n of [3, 7, 14, 30, 100]) add('days-' + n, 'Consistency', n + ' Active Days', 'Check in on ' + n + ' different days with a rating of 1–5 in any skill.', days.length, n);
    for (const n of [3, 7, 14, 30]) add('streak-' + n, 'Consistency', n + '-Day Streak', 'Reach ' + n + ' positive check-in days in one streak. Two missed days per Sunday–Saturday week are allowed; a third missed day in the week or in a row breaks the streak.', longest, n);
    for (const [name, n] of ranks.filter(([, n]) => n > 5)) add('total-' + n, 'Levels', name, 'Reach Total Level ' + n + '.', total, n);
    for (const n of [10, 25, 50]) add('any-' + n, 'Skills', 'Skill Level ' + n, 'Reach Level ' + n + ' in any skill.', Math.max(...levels), n);
    skills.forEach((s, i) => {
      for (const [n, title] of [
          [25, 'Specialist'],
          [50, 'Mastery']
        ]) add(s.id + '-' + n, 'Skills', s.name + ' ' + title, title + ': reach Level ' + n + ' in ' + s.name + (n === 50 ? ', the maximum skill level.' : '. Keep progressing toward Mastery at Level 50.'), levels[i], n);
    });
    for (const n of [1, 5, 25]) add(n === 1 ? 'five-for-five' : 'five-for-five-' + n, 'Skills', 'Well-Rounded Day · ' + n + (n === 1 ? ' Day' : ' Days'), 'Optional: rate all five skills 5/5 on ' + n + (n === 1 ? ' day.' : ' separate days. Consecutive days are not required.'), perfectDays, n);
    for (const n of [10, 20, 30, 40, 50]) add('all-' + n, 'Skills', 'All Skills Level ' + n, 'Reach Level ' + n + ' in all five skills.', Math.min(...levels), n);
    add('legend', 'Legend', 'WriteQuest Legend', 'Earn every other achievement.', result.filter(a => a.earned).length, result.length);
    return result;
  }
  root.WriteQuestAchievements = {
    list
  };
  if (typeof module !== 'undefined') module.exports = {
    list
  };
})(globalThis);
