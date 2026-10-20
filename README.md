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
Everything for this first version is in **index.html**.

1. Open `index.html` in GitHub.
2. Click the pencil icon (**Edit this file**).
3. Search for **WRITEQUEST DATA** to change skill descriptions or examples.
4. Search for **WRITEQUEST STYLES** to change colors.
5. Search for **PROGRESSION** to change the XP curve.
6. Click **Commit changes** to save. GitHub Pages updates automatically.

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
Start with the single `index.html` file. Once features grow, split it into `styles.css`, `skills.js`, and `app.js` with clear comments. No build tools or installations are required.
