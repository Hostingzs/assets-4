# Bit Planes — how this copy differs, and how to change it

Upstream (`github.com/antonmedv/bit-planes`) is **deleted**. Two repos claim to
be "open-sourced" versions (`Axolotl9009/bitplanes-modded-1`,
`Do-Not-Dusturb/bit-planess`) but both are byte-identical re-uploads of this same
built bundle with a GPL file added by someone who did not write the code. There
is no source anywhere. npm has nothing. What follows is all there is.

## What we changed

1. **Tracker removed.** The author's Yandex Metrika beacon and its `<noscript>`
   pixel are stripped from `index.html`. Only outbound request left is Google
   Fonts. `blocklist.json` lists this game under `noMirror` so re-running
   `build/mirror.mjs` cannot restore the tracker.
2. **`index.js` is beautified.** `index.orig.js` is the untouched original
   (194KB, one line). The shipped `index.js` is the same program reformatted to
   ~1900 lines so it can be read and patched. Verified to play identically.
3. **One hook.** `t.m=M,t.c=j,` gained `window.__BP__={require,modules,cache}`.
   That is the *only* logic change. It exposes webpack's module table so
   enhancements can live outside the bundle instead of being cut into it.

## Module map (discovered at runtime, not guessed)

87 modules. The ones that matter:

| id | what it is | give-away |
| -- | ---------- | --------- |
| 2  | renderable base | `draw`, `drawMiddle` |
| 4  | pilot | `player`, `catapultPilot` |
| 8  | parachute-capable body | `deployParachute`, `updateParachute` |
| 12 | **Player** | `points`, `control`, `hasPlane`, `hasPilot`, `inGame` |
| 13 | entity base | `move`, `getX/getY`, `setTimeout`, `destroy` |
| 17 | **world / spawner** | `newPlane` |
| 21 | entity set | `add`, `has`, `delete` |
| 25–80 | art | each module exports one `data:image/svg+xml` string |

`World.newPlane` reads a plane's stats off the **Player** (`maxAmmo`,
`maxMissiles`) and its life/respawn delay from a constants module. Plane sprites
are the ~66x62–73x59 and 70x40 SVG modules; the small 36x22 is the side view.

## The catch, before you plan a rewrite

Class names are mangled to single letters and **tuning constants are inlined at
their use sites, not collected in a table**. So:

- *Feasible:* swapping or adding art (every sprite is its own module — override
  `__BP__.modules[id]`), and patching behaviour by wrapping prototype methods
  reached through `__BP__.require(id)`.
- *Hard:* a systematic physics retune, because there is no constants table to
  edit — each value must be found individually in mangled code.
- *Not worth it:* new engine subsystems. That is a rewrite, and without source
  you would be rewriting blind.

Verify any change by actually playing it, not by loading the menu.

## Trap: the immutable cache header

`firebase.json` serves `/g/**/!(index.html)` as `max-age=31536000, immutable`,
and `index.html` requests `index.js?<hash>`. That query string is its own cache
key. Replacing `index.js` in place therefore does **nothing** for anyone whose
edge or browser already holds that URL — for a year. Deploying the patched
bundle and loading the page in a clean browser still ran the old code, while a
`curl` of the bare `index.js` (a different key) correctly returned the new one.

**Every time you change `index.js` or `styles.css`, bump the `?` version in
`index.html`.** `index.html` itself is capped at 60s, so the new key propagates
almost immediately.
