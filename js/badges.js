"use strict";
// Achievement artwork renderers. Called after the app data has initialized.
/* Shared writing crest gains richer framing at each skill milestone. */
function skillMilestoneBadge(a) {
  const tier = a.goal,
    master = tier === 50,
    advanced = tier >= 25;
  const metal = master ? "#f8d780" : advanced ? "#eec16b" : "#b9d6e7";
  const dark = master ? "#382453" : advanced ? "#3e3022" : "#213b50";
  const ribbon = master ? "#9562cf" : advanced ? "#af713f" : "#507f9f";
  const ornament = master ? '<path d="M22 42 3 24l4 24 17 12M74 42l19-18-4 24-17 12" fill="#8a65bc" stroke="' + metal + '" stroke-width="2"/><path d="m30 18 7-10 11 7L59 8l7 10" fill="' + metal + '"/>' : '';
  const wreath = advanced ? '<path d="M28 65C12 51 16 32 25 23M68 65c16-14 12-33 3-42" fill="none" stroke="' + metal + '" stroke-width="3"/><path d="m21 48-7-5m8-3-6-7m9-1-3-8m53 24 7-5m-8-3 6-7m-9-1 3-8" stroke="' + metal + '" stroke-width="3" stroke-linecap="round"/>' : '';
  return '<span class="achievement-badge milestone-crest ' + (a.earned ? '' : 'achievement-badge-locked') + '" aria-hidden="true"><svg viewBox="0 0 96 106" focusable="false">' + ornament + '<path d="m30 62-7 36 17-8 8 11 8-11 17 8-7-36" fill="' + ribbon + '" stroke="' + metal + '" stroke-width="2"/>' + wreath + '<path d="M48 17 72 27v22c0 17-13 26-24 31-11-5-24-14-24-31V27Z" fill="' + dark + '" stroke="' + metal + '" stroke-width="' + (master ? 4 : 3) + '"/><path d="M48 24 65 31v18c0 12-9 20-17 24-8-4-17-12-17-24V31Z" fill="none" stroke="' + metal + '" opacity=".45"/><path d="M34 41q7-4 14 0 7-4 14 0v15q-7-4-14 0-7-4-14 0ZM48 41v15" fill="none" stroke="#fff0ce" stroke-width="2" stroke-linejoin="round"/><path d="m47 47 11-17 4-1-1 5-14 13" fill="' + metal + '"/>' + (master ? '<path d="m48 2 2 4 5 1-4 3 1 5-4-2-4 2 1-5-4-3 5-1Z" fill="' + metal + '"/><path d="m8 67 2 4 4 2-4 2-2 4-2-4-4-2 4-2m82-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2" fill="' + metal + '"/>' : '') + '<rect x="33" y="63" width="30" height="20" rx="7" fill="' + dark + '" stroke="' + metal + '" stroke-width="2"/><text x="48" y="78" text-anchor="middle" fill="#fff0ce" font-family="system-ui,sans-serif" font-size="15" font-weight="800">' + tier + '</text></svg></span>';
}
/* Well-Rounded medals grow from a simple seal to a crowned five-skill award. */
function wellRoundedBadge(a) {
  const tier = a.goal,
    advanced = tier >= 5,
    master = tier >= 25;
  const metal = master ? "#ffe395" : advanced ? "#f2c76e" : "#bed8e8";
  const face = master ? "#39245b" : advanced ? "#42321e" : "#223e56";
  const ribbon = master ? "#9a67cf" : advanced ? "#bb7d3e" : "#5686ab";
  const wreath = advanced ? '<path d="M25 73C9 61 10 36 23 23M71 73c16-12 15-37 2-50" fill="none" stroke="' + metal + '" stroke-width="3"/><path d="m17 59-8-3m8-7-7-6m10-4-5-8m64 28 8-3m-8-7 7-6m-10-4 5-8" fill="none" stroke="' + metal + '" stroke-width="3" stroke-linecap="round"/>' : '';
  const crown = master ? '<path d="m29 21-4-15 14 7 9-11 9 11 14-7-4 15Z" fill="' + metal + '" stroke="#b88b43" stroke-width="2"/><path d="M22 35 2 23l5 23 15 9m52-20 20-12-5 23-15 9" fill="#996cd1" stroke="' + metal + '" stroke-width="2"/>' : '';
  const stars = Array.from({
    length: 5
  }, (_, i) => {
    const x = 28 + i * 10,
      y = 35 - Math.sin(i * Math.PI / 4) * 7;
    return '<path d="m' + x + ' ' + y + ' 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4Z" fill="' + metal + '"/>';
  }).join('');
  return '<span class="achievement-badge milestone-crest ' + (a.earned ? '' : 'achievement-badge-locked') + '" aria-hidden="true"><svg viewBox="0 0 96 106" focusable="false"><path d="m30 66-7 32 17-8 8 11 8-11 17 8-7-32" fill="' + ribbon + '" stroke="' + metal + '" stroke-width="2"/>' + crown + wreath + '<circle cx="48" cy="51" r="29" fill="' + face + '" stroke="' + metal + '" stroke-width="' + (master ? 4 : 3) + '"/><circle cx="48" cy="51" r="23" fill="none" stroke="' + metal + '" opacity=".5"/>' + stars + '<text x="48" y="60" text-anchor="middle" fill="#fff0ce" font-family="system-ui,sans-serif" font-size="23" font-weight="800">' + tier + '</text><text x="48" y="72" text-anchor="middle" fill="' + metal + '" font-family="system-ui,sans-serif" font-size="8" font-weight="700">' + (tier === 1 ? 'DAY' : 'DAYS') + '</text>' + (master ? '<path d="m7 72 2 4 4 2-4 2-2 4-2-4-4-2 4-2m82-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2" fill="' + metal + '"/>' : '') + '</svg></span>';
}
/* All-skills awards add a new frame detail at every ten-level milestone. */
function allSkillsBadge(a) {
  const n = a.goal;
  const [metal, face] = ({
    10: ["#c3d9e8", "#233d52"],
    20: ["#f2c66d", "#43341f"],
    30: ["#81e1bf", "#183e38"],
    40: ["#a8d6ff", "#233c64"],
    50: ["#ffe295", "#44265c"]
  })[n];
  const rays = n >= 30 ? Array.from({
    length: 12
  }, (_, i) => '<path d="M48 13v-7" transform="rotate(' + i * 30 + ' 48 48)" stroke="' + metal + '" stroke-width="2" stroke-linecap="round"/>').join('') : '';
  const wings = n >= 40 ? '<path d="M24 38 3 25l5 25 17 11m47-23 21-13-5 25-17 11" fill="' + face + '" stroke="' + metal + '" stroke-width="2"/><path d="m7 36 16 12m66-12L73 48" stroke="' + metal + '" opacity=".6"/>' : '';
  const wreath = n >= 20 ? '<path d="M24 72C8 58 12 33 23 24M72 72c16-14 12-39 1-48M17 55l-7-4m9-7-6-7m9-2-4-8m61 28 7-4m-9-7 6-7m-9-2 4-8" fill="none" stroke="' + metal + '" stroke-width="3" stroke-linecap="round"/>' : '';
  const crown = n === 50 ? '<path d="m30 22-4-14 13 6 9-12 9 12 13-6-4 14Z" fill="' + metal + '" stroke="#bc8d45" stroke-width="2"/><path d="m5 73 2 4 4 2-4 2-2 4-2-4-4-2 4-2m84-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2" fill="' + metal + '"/>' : '';
  const gems = Array.from({
    length: 5
  }, (_, i) => {
    const x = 28 + i * 10,
      y = 38 - Math.sin(i * Math.PI / 4) * 8;
    return '<path d="m' + x + ' ' + y + ' 3 4-3 4-3-4Z" fill="' + metal + '"/>';
  }).join('');
  return '<span class="achievement-badge milestone-crest ' + (a.earned ? '' : 'achievement-badge-locked') + '" aria-hidden="true"><svg viewBox="0 0 96 106" focusable="false"><path d="m31 66-6 31 15-7 8 11 8-11 15 7-6-31" fill="' + face + '" stroke="' + metal + '" stroke-width="2"/>' + rays + wings + wreath + '<path d="M48 20 75 32v21c0 17-14 28-27 33-13-5-27-16-27-33V32Z" fill="' + face + '" stroke="' + metal + '" stroke-width="' + (n === 50 ? 4 : 3) + '"/><path d="m48 27 20 10v16c0 12-10 22-20 26-10-4-20-14-20-26V37Z" fill="none" stroke="' + metal + '" opacity=".45"/>' + gems + '<text x="48" y="64" text-anchor="middle" fill="#fff1d0" font-family="system-ui,sans-serif" font-size="23" font-weight="800">' + n + '</text>' + crown + '</svg></span>';
}
/* The final collection award unites all five writing skills. */
function legendBadge(a) {
  const gems = SKILLS.map((s, i) => {
    const x = 20 + i * 14,
      y = 39 - Math.sin(i * Math.PI / 4) * 12;
    return '<path d="m' + x + ' ' + y + ' 4 5-4 5-4-5Z" fill="' + s.color + '" stroke="#ffe5a2" stroke-width="1"/>';
  }).join('');
  return '<span class="achievement-badge milestone-crest legend-crest ' + (a.earned ? 'legend-crest-earned' : 'achievement-badge-locked') + '" aria-hidden="true"><svg viewBox="0 0 96 106" focusable="false"><circle cx="48" cy="50" r="35" fill="none" stroke="#ffe3a1" stroke-width="2" opacity=".28"/><circle cx="48" cy="50" r="40" fill="none" stroke="#c399e6" opacity=".2"/><path d="m30 70-7 28 17-7 8 11 8-11 17 7-7-28" fill="#744595" stroke="#eec76e" stroke-width="2"/><path d="M25 42 3 26l4 25 19 15m45-24 22-16-4 25-19 15" fill="#80609c" stroke="#f3cd7c" stroke-width="2"/><path d="m7 37 17 14M9 48l15 10m65-21L72 51m15-3-15 10" fill="none" stroke="#e8d4b2" opacity=".6"/><path d="M48 19 74 31v25c0 16-15 27-26 31-11-4-26-15-26-31V31Z" fill="#302343" stroke="#f9d986" stroke-width="3"/><path d="M48 25 68 35v20c0 12-11 22-20 26-9-4-20-14-20-26V35Z" fill="none" stroke="#c399e6" opacity=".65"/>' + gems + '<path d="M31 48q9-5 17 0 8-5 17 0v20q-9-5-17 0-8-5-17 0Z" fill="#f6e7bf" stroke="#ceac68" stroke-width="1.5"/><path d="M48 48v20m-13-14 9 1m-9 4 9 1m8-5 9-1m-9 6 9-1" fill="none" stroke="#82613f" stroke-width="1.5"/><path d="m44 64 15-24 10-4-2 10-23 18Z" fill="#dfc4ff" stroke="#aa83c9" stroke-width="1"/><path d="m43 67 22-27" stroke="#fce3a2" stroke-width="1.5"/><path d="m31 23-4-15 13 7 8-12 8 12 13-7-4 15Z" fill="#f8d77d" stroke="#b78a43" stroke-width="2"/><path d="m48 11 3 4-3 4-3-4Z" fill="#c399e6"/><path d="m10 72 2 4 4 2-4 2-2 4-2-4-4-2 4-2m76-4 2 4 4 2-4 2-2 4-2-4-4-2 4-2" fill="#f8d77d"/><path d="M38 80h20" stroke="#f8d77d" stroke-width="3" stroke-linecap="round"/></svg></span>';
}
// Only earned final-tier achievements receive the holographic finish.
function achievementBadge(a) {
  const maxed = a.earned && (a.id === 'legend' || a.id === 'days-100' || a.id === 'streak-30' || a.id === 'total-250' || a.id === 'five-for-five-25' || a.id === 'all-50' || a.id === 'any-50' || SKILLS.some(s => a.id === s.id + '-50'));
  const badge = achievementBadgeArtwork(a);
  return maxed ? '<span class="achievement-badge achievement-holographic" aria-hidden="true">' + badge + '</span>' : badge;
}

function achievementBadgeArtwork(a) {
  if (a.id === "legend") return legendBadge(a);
  if (/^all-(10|20|30|40|50)$/.test(a.id)) return allSkillsBadge(a);
  if (a.id === "five-for-five" || /^five-for-five-(5|25)$/.test(a.id)) return wellRoundedBadge(a);
  if (/^any-(10|25|50)$/.test(a.id)) return skillMilestoneBadge(a);
  const skill = SKILLS.find(s => a.id === s.id + '-25' || a.id === s.id + '-50');
  if (skill) return '<span class="achievement-badge achievement-specialism achievement-specialism-' + a.goal + '" style="--specialism-color:' + skill.color + '" aria-hidden="true">' + skillMilestoneBadge(a) + '<span class="specialism-art ' + (a.earned ? '' : 'achievement-badge-locked') + '">' + skillIcon(skill) + '</span></span>';
  if (a.category === 'Levels') {
    const key = a.name.toLowerCase();
    return '<span class="achievement-badge ' + (a.earned ? '' : 'achievement-badge-locked') + '" aria-hidden="true"><img src="./assets/achievements/ranks/' + key + '.svg?v=20261026-progression" alt="" width="64" height="64" decoding="async"></span>';
  }
  let cell = 19;
  if (a.id === 'first') cell = 0;
  else if (a.id.startsWith('days-')) cell = ({
    3: 1,
    7: 2,
    14: 3,
    30: 4,
    100: 5
  })[a.goal];
  else if (a.id.startsWith('streak-')) cell = ({
    3: 6,
    7: 7,
    14: 8,
    30: 9
  })[a.goal];
  const x = 30 + (cell % 5) * 270,
    y = 48 + Math.floor(cell / 5) * 253;
  return '<span class="achievement-badge ' + (a.earned ? '' : 'achievement-badge-locked') + '" aria-hidden="true"><svg viewBox="' + x + ' ' + y + ' 260 260" focusable="false"><image href="./assets/achievements/badges.png" width="1402" height="1122"/></svg>' + '</span>';
}
