# WriteQuest code guide

WriteQuest uses plain JavaScript, HTML and CSS. There is no build step.

## Start here

You do not need to understand every file to make a small change. Start with
`app.js`, which reads from top to bottom as skill settings, progress and saves,
page layouts, button actions, daily saving, and Test Mode.

| If you want to change… | Look for… |
| --- | --- |
| A skill's description or activity examples | `SKILLS` at the top of `app.js` |
| XP needed for the next level | `xpToNextLevel(level)` |
| The extra XP earned at skill milestones | `checkinBonus(level)` |
| One skill card on Home | `homeSkillCard(skill, index)` |
| The centre check-in button | `homeCheckinButton(day)` |
| One row of daily rating buttons | `checkinSkillRow(skill, ratings)` |
| Rank unlock levels | `TOTAL_RANKS` |
| Background names | `BACKGROUND_REWARDS` |
| What a button does | `connectPageControls()` |

For example, change a sentence in a skill's `description` to change its detail
page. Keep its `id` unchanged: existing saves use that ID to find its progress.

## How a check-in works

1. `navigate("checkin")` opens the check-in page.
2. `render()` chooses the page with `currentPageHTML()` and connects its buttons.
3. Tapping a rating calls `updateDraftRating()`. This changes a temporary copy.
4. Save calls `saveCheckin()`, which uses `calculateCheckinXP()` to replay history
   in date order, then calls `save()` to write the validated profile.
5. Celebration dialogs finish by returning to Home.

The names `state`, `draftRatings`, and `page` mean saved progress in memory,
unsaved rating changes, and the screen currently being displayed. `getTotalLevel()`
adds the five skill levels together.

Small HTML pieces use template strings: `${skill.name}` inserts a value into
text. An array of HTML pieces ends with `.join("")` to combine them into one
page. Attributes such as `data-skill="drafting"` tell the button handler which
skill it belongs to. Read layout functions for appearance and control functions
for behaviour; avoid mixing the two.

## Where to make changes

| File | Responsibility |
| --- | --- |
| `app.js` | Skill definitions, XP calculation, save validation and recovery, navigation, page rendering and Test Mode controls |
| `js/activity.js` | Positive writing days and longest-streak calculation shared by Journey and achievements |
| `js/achievements.js` | Achievement names, requirements and unlock calculations |
| `js/badges.js` | Achievement badge artwork and earned holographic styling hooks |
| `js/celebrations.js` | Save celebration queue, level-up effects and Legend fireworks |
| `js/dialogs.js` | Keyboard focus containment and focus restoration for popups |
| `js/developer.js` | Temporary preview profiles and their XP baseline; never writes device storage |
| `js/journey.js` | Weekly calendar and activity summary |
| `js/sounds.js` | Audio feedback |
| `js/xp-animation.js` | XP bar animation |
| `styles.css` | Layout, responsive rules, badge effects and reduced-motion alternatives |

## Loading and dependencies

`index.html` loads classic scripts with `defer`. Keep `activity.js` before
`journey.js` and `achievements.js`, and keep `app.js` last. Badge and celebration
functions read app data when called, after initialization. Keep their global
function names unique. This preserves static hosting without a bundler.

## Flexible streaks

A streak counts positive check-in days. Up to two missed days in each
Sunday–Saturday week preserve its score; rest days add neither streak points
nor XP. A third missed day in that week resets the current score. Three missed
days in a row also reset it across a week boundary. The current writing day is
not missed until the existing 3:30 a.m. reset. The rule is reconstructed from
history, so the app does not have to be opened on rest days. Weeks before the
first check-in do not count. Your longest streak and earned achievements remain
when the current streak ends. Journey and achievements both use activity.js.

## XP balance

Level 2 requires 5 XP. Requirements then grow by 2.9% per level, rounded up.
The existing +1/+2/+3/+4 check-in bonuses begin at skill levels 10/20/30/40.
From a new profile, 3/5 ratings reach Level 50 after 108 check-ins; 5/5
ratings reach it after 76. At five check-ins per week, 108 check-ins take
21.6 weeks, roughly five months. Skipping weekends does not award XP or change
this calculation. Weekend check-ins are still allowed. These are active check-in
days, not calendar days.
Changing the curve keeps stored XP and history, but changes the levels derived
from that XP. The next check-in also replays history using the current bonuses.

## Progress and Test Mode

The saved profile contains XP, daily ratings, viewed achievement IDs and the
background preference. Older profiles default to following the current rank.
Achievements are calculated from that profile. Keep existing skill and
achievement IDs stable when changing their visible names or artwork.

Normal check-ins recalculate XP from history, so editing a day replaces its
earlier award. Test Mode starts with a temporary XP baseline and empty history.
Restoring the original preview resets both together. Preview All Achievements
adds synthetic history only to the temporary profile. Exiting Test Mode reloads
normal progress from device storage.

Use the shared dialog focus helper whenever adding a popup: call
`WriteQuestDialogs.contain(overlay)` after attaching it, and
`WriteQuestDialogs.release(overlay)` before removing it. Keep existing Escape
and dismissal handlers in the popup itself.

## Checks

Run from the repository root:

```sh
node --test tests/maintenance.cjs
```

These dependency-free checks cover script initialization, save validation,
same-day XP replacement, multi-tab protection, Test Mode restoration and
isolation, achievement previews, activity consistency, badge states and keyboard
focus. They use a small DOM substitute; they do not replace visual browser tests.
They also check background selection, unsaved rating changes and milestone XP.

For layout changes, check a narrow phone, a larger phone and landscape. Preview
all achievements and Grandmaster in Test Mode, then confirm reduced-motion
behaviour. Keep media-query order intact when consolidating CSS: moving a rule
can change which mobile styles win. Update asset version strings in `index.html`
when publishing changed scripts or styles.

