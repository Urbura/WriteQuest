# WriteQuest

A beginner-friendly, mobile-first fantasy writing progress app.

## Open the app
After enabling GitHub Pages, visit the Pages link shown in **Settings → Pages**.

## Publish with GitHub Pages
1. Open this repository on GitHub.
2. Choose **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **main** and **/(root)**, then click **Save**.
5. Wait a minute or two for GitHub to publish the site.

## Edit WriteQuest without coding experience
WriteQuest uses plain HTML, CSS, and small JavaScript modules. You can edit them directly on GitHub without installing anything.

1. Open `styles.css` to adjust colours, spacing, and mobile layout.
2. Open `app.js` to edit skill descriptions, XP progression, or application behavior.
3. Open `index.html` only when changing how styles and scripts load.
4. Click the pencil icon (**Edit this file**) and make a small change.
5. Click **Commit changes**. GitHub Pages updates automatically.

**Tip:** Search `app.js` for `WRITEQUEST DATA` to find the five skills. Keep existing localStorage keys unchanged so previous check-ins remain readable.

### What works now
- Home page with five writing skills
- Tap any skill for its definition, examples, level, rank, XP bar, and next bonus
- Visible Journey link on the logo, achievements/settings shortcuts, and Home buttons
- Daily 0–5 ratings saved locally on the device
- Skill XP and levels, capped at 50
- Correcting today's check-in recalculates XP rather than awarding it twice
- Daily reset at 3:30 a.m. device local time
- Validated JSON backup export/import in Settings
- Previous valid save retained for recovery, failed-write protection, and stale-tab conflict detection

- Journey with a Sunday–Saturday calendar and flexible streaks
- Forty achievements, writing badges, celebrations, and optional sounds
- Rank backgrounds, background selection, and Level 50 skill effects
- Tutorial and isolated Test Mode for previewing ranks and achievements

### Next priorities
- Projects connecting daily effort to an individual manuscript and milestones
- Personal-best rewards and daily quests, after their rules are defined
- Cloud synchronization

One positive skill completes a writing day. Well-Rounded Day achievements are optional (all five skills at 5/5 on 1, 5, or 25 separate days), with no additional completion XP. Specialist means skill Level 25; Mastery means Level 50.

## Important limitations of this starter
This is a working **prototype**, not the completed WriteQuest app. The check-in day changes at 3:30 a.m. in the device’s local time zone, including daylight saving changes. Data is saved only in the current browser/device; clearing browser data can erase progress. Projects are not implemented yet. At 3/5, skill Level 50 takes 108 active check-ins (about five months at five check-ins per week); at 5/5 it takes 76.

## Keeping the code easy to manage
The files are now separated: `index.html` loads `styles.css` and `app.js`. No build tools or installations are required. As new features are added, they can be moved into small, clearly named JavaScript modules without changing saved-data keys.

## Icon attribution
The settings gear is based on the [Lucide settings icon](https://lucide.dev/icons/settings), used under the ISC License. Copyright (c) 2026 Lucide Icons and Contributors. The ISC license notice is available at https://lucide.dev/license.


## Save protection
The existing `writequest-starter-v1` key is preserved. Validated saves retain the previous valid version under `writequest-starter-v1-backup`. Damaged saves are preserved and automatic writes pause until recovery. A failed write leaves the current state and draft ratings available to retry. Another tab changing the save blocks stale writes; reload after exporting anything needed.

Use Settings → Export Backup to download a JSON copy, and Import Backup to restore it on another device. Import requires confirmation and validation before replacing progress. Restore Previous Save rolls back one saved version. Local copies cannot survive clearing all site data; retain downloaded backups. There is no cloud sync.

A new writing day opens at 3:30 a.m. according to the device clock and time zone. Existing dated history is preserved. Travelling follows the new device time zone; the app uses one record per calendar date. Unsaved ratings spanning a reset require review before saving.

Run all regression checks with `node --test save.test.cjs tests/*.test.cjs tests/maintenance.cjs` and syntax checks with `node --check app.js`. See `CODE_GUIDE.md` for module responsibilities and mobile verification.
