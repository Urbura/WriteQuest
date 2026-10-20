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
WriteQuest is organized into three simple files. You can edit them directly on GitHub without installing anything.

1. Open `styles.css` to adjust colours, spacing, and mobile layout.
2. Open `app.js` to edit skill descriptions, XP progression, or application behavior.
3. Open `index.html` only when changing how styles and scripts load.
4. Click the pencil icon (**Edit this file**) and make a small change.
5. Click **Commit changes**. GitHub Pages updates automatically.

**Tip:** Search `app.js` for `WRITEQUEST DATA` to find the five skills. Keep existing localStorage keys unchanged so previous check-ins remain readable.

### What works now
- Home page with five writing skills
- Tap any skill for its definition, examples, level, rank, XP bar, and next bonus
- Back arrow and bottom navigation
- Daily 0–5 ratings saved locally on the device
- Skill XP and levels, capped at 50
- Correcting today's check-in recalculates XP rather than awarding it twice

### Planned next
- Projects with custom uploaded images, rank borders, and their own XP
- Daily quests, achievements, sounds, and polished fantasy artwork
- Data export/import, better backup options, and 3:30 a.m. configurable reset

## Important limitations of this starter
This is a working **prototype**, not the completed WriteQuest app. The check-in date currently changes at local midnight rather than 3:30 a.m. Data is saved only in the current browser/device; clearing browser data can erase progress. Project and achievement screens are placeholders. The XP curve has not yet been fully calibrated to the six-month target.

## Keeping the code easy to manage
The files are now separated: `index.html` loads `styles.css` and `app.js`. No build tools or installations are required. As new features are added, they can be moved into small, clearly named JavaScript modules without changing saved-data keys.

## Icon attribution
The settings gear is based on the [Lucide settings icon](https://lucide.dev/icons/settings), used under the ISC License. Copyright (c) 2026 Lucide Icons and Contributors. The ISC license notice is available at https://lucide.dev/license.
