# Phase 3 — aircraft roster

Five aircraft, each with its own art, its own handling, and a picker on the menu.

| | role | lift | drag | thrust | turn | HP | ammo | msl |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Falcon | balanced | 1.00 | 1.00 | 1.00 | 1.00 | 3 | 15 | 2 |
| Wasp | interceptor | 0.90 | 0.85 | 1.30 | **1.35** | 2 | 12 | 1 |
| Comet | jet | 0.80 | **0.78** | **1.50** | 0.95 | 3 | 15 | 3 |
| Vulture | heavy | **1.15** | 1.25 | 0.85 | 0.70 | **5** | 20 | **4** |
| Kestrel | glass cannon | 0.85 | **0.75** | 1.45 | 1.20 | **1** | **25** | 1 |

Handling values are **multipliers on the phase 1 model**, not absolutes, so
retuning the flight model retunes the whole roster coherently instead of
invalidating five hand-balanced stat blocks. Health and magazines are absolute
and written once, when an aircraft is first seen.

Verified in a live match: all five types present (kestrel 3, vulture 2, falcon 2,
wasp 1, comet 1), the human's pick honoured exactly (Kestrel: HP 1, ammo 25,
1 missile), and all 9 aircraft carrying their own 4x-supersampled sprite.

## Two things worth knowing

**Every aircraft shares one sprite object in the stock engine.** `plane.sprite`
is therefore reassigned per aircraft on first sight. New sprite objects are made
by cloning an existing one's prototype — the sprite class is module-private and
cannot be constructed from outside the bundle.

**Saved config pinned old defaults.** The roster shipped switched on, but any
profile written before it existed kept `roster: false` and the whole phase was
invisible. Config now carries `FLAG_VERSION`; when it does not match, flag
defaults are taken fresh while personal choices (quality, aircraft) are
preserved. Bump it whenever a shipped flag default changes — every later phase
depends on this.
