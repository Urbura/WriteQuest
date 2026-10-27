# WriteQuest code guide

WriteQuest uses plain JavaScript, HTML and CSS. There is no build step.

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

## Progress and Test Mode

The saved profile contains XP, daily ratings and viewed achievement IDs.
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

For layout changes, check a narrow phone, a larger phone and landscape. Preview
all achievements and Grandmaster in Test Mode, then confirm reduced-motion
behaviour. Keep media-query order intact when consolidating CSS: moving a rule
can change which mobile styles win. Update asset version strings in `index.html`
when publishing changed scripts or styles.
