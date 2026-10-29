# Illustrated Windu web pack

Exported from the approved pack installed with COS Control 0.5.353. State map
SHA-256: `2ba8634a87ccbc0ec37bb10a383e4ffd76aba30122a31df120516f70513c39d1`.
Includes the illustrated combat drawings, Ambient V2 and the Session 1 cadence fix.

| Pose | Frames | Interval | Casts | Handoff (one-based) |
| --- | ---: | ---: | ---: | ---: |
| working | 184 | .02 s | 4 | 145 |
| duel | 148 | .02 s | 3 | 109 |
| trio | 172 | .02 s | 3 | 121 |
| swarm | 256 | .02 s | 3 | 217 |
| idle | 82 | .04 s | 1 | |
| waiting | 76 | .04 s | 1 | |
| patrol | 8 | .14 s | 1 | |

Done retains the app's existing 14-frame, .14-second strip. The page's interactive
session deck and the showcase share the same player and manifest.

Lossless WebP preserves source color and alpha. Each row stays within 8192 pixels
and 2.5 megapixels. Assets are fetched as their state becomes visible and their
frames approach, rather than downloading the whole pack on page load. Decoded
rows are released when no longer needed. The 1x and 2x versions retain the app's
cell geometry. Incoming entries draw behind the current body at the exact app
handoff, then become the current cast on wrap. Rotation uses a shuffled bag with
no immediate repeats. Reduced motion holds frame zero of the first cast.

`manifest.json` records source PNG hashes and every exported asset's hash/size.
The previous `windu-v15` directory remains available for rollback. To change art,
export to another versioned directory and bump the player URL and cache key.

Build and independently verify with Node and sharp:

```sh
node scripts/build-windu-illustrated-atlases.mjs --src APP_PACK --out control/assets/session-command/windu-illustrated-v1 --control-version 0.5.353
node scripts/verify-windu-illustrated-atlases.mjs --src APP_PACK --out control/assets/session-command/windu-illustrated-v1
node --test tests/pet-cast.test.cjs
```

Independent verification checked the first, middle and last cells of every row
against the source PNG segments: 1431 sampled frames, exact visible pixels and
alpha, across both resolutions and all layers. Browser checks covered every pose,
all three Session 4 casts over four wraps, pause/resume, reduced motion, the Waiting
session deck and a 390-pixel mobile viewport. Observed combat playback was 49.5 fps
over 22 seconds on a 60 Hz browser clock.
