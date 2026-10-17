# Drive Mad — Offline Build

Drive Mad tests your driving skills in this physics-based puzzle game! Navigate
tricky obstacle courses with blocky monster trucks. Master loops and avoid
crashes. Play skillfully!

This is a **100% offline, self-contained** build of the game as published on
Poki (original game by [Fancade / Martin Magni](https://www.fancade.com/)). No
ads, no analytics, no external requests: everything (engine, textures, levels,
audio) is packed locally.

## Play

```bash
./serve.sh            # or: python3 -m http.server 8080
# open http://localhost:8080
```

> `file://` will **not** work — the WebAssembly engine needs HTTP to fetch its
> data package. Any static file server is fine.

## Controls

| Device | Action |
|---|---|
| Smartphone / tablet | Tap & hold left / right half of the screen |
| Desktop (mouse) | Left-click & hold on the left / right side |
| Trackpad | Single click & hold left / right side |
| Keyboard | Not required (arrow keys also work where supported) |

## What was modified for offline play

- **Poki SDK removed** — replaced by a neutral local driver
  (`webapp/game-driver.js`) implementing the same API surface
  (`init`, `commercialBreak`, `rewardedBreak`, `gameplayStart/Stop`,
  `gameLoading*`, …). Interstitials resolve instantly; rewarded ads
  auto-grant; scores submitted to the platform are kept in `localStorage`.
- **Sitelock stripped** — an obfuscated domain whitelist that redirected
  players hosted outside `poki.com` to a "sitelock" page was removed.
- **Telemetry removed** — the `leveldata.poki.io` beacon is neutralized.
- **External references removed** — no fonts, images, scripts, or requests
  leave `localhost` (verified by an application-level firewall test).

## Verify the offline build yourself

The validation suite (Playwright + network firewall) lives outside this
folder; it boots the game with all non-localhost requests blocked and asserts
zero page errors, zero external requests, and a living render loop.

## Files

```
index.html              entry point
serve.sh                local server launcher
webapp/
  game-driver.js        neutral offline Poki SDK replacement (loads first)
  source_min.js         game bootstrap (patched: sitelock/telemetry removed)
  index.js              Emscripten runtime
  index.wasm            WebAssembly engine
  index.data            packaged assets (textures, levels, audio)
  fancade.css           styles
  cover.jpg             loading screen cover
```
