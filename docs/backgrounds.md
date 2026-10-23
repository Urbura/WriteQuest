# Writing nook backgrounds

Each rank now uses a separate 887 × 1774 portrait WebP in `assets/backgrounds/*-portrait-v2.webp`. The approved minimalist writing-room artwork was recreated at full portrait resolution with the built-in image generation tool, then encoded at quality 95 without resizing. File sizes range from approximately 14–32 KB; only the current rank's image loads.

The app uses normal centred `background-size: cover`. It no longer magnifies a small panel of a nine-room contact sheet. `portrait-manifest.json` records the dimensions of each shipped image.

Total Level thresholds, rank names, unlock messages and saved progress are unchanged. Older contact sheets and SVG alternatives remain archived; they are not used at runtime.
