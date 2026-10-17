# Phase 4 — painterly world

## What the stock renderer had

A flat sky; "parallax" consisting of two forest strips at **0.95 and 0.98**
scroll factor, which is almost none; and 120 cloud sprites moving at exactly
camera speed, which reads as wallpaper rather than distance. No distant layer at
all. The camera was hard-centred with no smoothing, lookahead or shake.

## What it has now

Layered ridges at 0.20 / 0.38 / 0.58 scroll factor with atmospheric haze;
a graded sky with four moods (day, dawn, dusk, storm) chosen per session; a sun
with soft god rays; pre-rendered cloud banks at 0.34 / 0.62 behind the engine's
own crisp sprites; a damped camera with shake; and a rebuilt minimap that shows
terrain, barns, aspect-correct positions and a distinct self-marker.

Everything static is pre-rendered once into an offscreen canvas and blitted with
an offset — the alternative is re-tracing hundreds of ridge vertices per frame.

## Cost, measured per tier

| tier | far layer | near layer | total / frame |
| --- | --- | --- | --- |
| low | 0.045 ms | 0.001 ms | **0.045 ms** |
| medium | 0.062 ms | 0.006 ms | **0.068 ms** |
| ultra | 0.096 ms | 0.003 ms | **0.099 ms** |

Ultra costs about **0.6% of a 16.7 ms frame budget**.

**How not to measure this.** Frame *interval* is useless as a gate here:
headless rAF runs uncapped near 180 Hz, so every tier reads ~5.5 ms until the
work exceeds the interval. `Emulation.setCPUThrottlingRate` at 6x did not move
it either — 1441 frames in 8 s, throttled or not. The only meaningful number is
how long the layer itself takes, timed inside the draw call.

## Two bugs the screenshots caught

1. **Two cloud styles fought.** The near bank was drawn in `drawNear`, which
   runs *after* the engine's own cloud sprites, so soft grey mush painted over
   crisp white clouds. Both banks now draw in `drawFar`, behind everything.
2. **`DF.sky` was a dead copy.** It was assigned once, so setting it from the
   console or a test changed nothing — the renderer kept reading its
   module-local. That silently invalidated a screenshot meant to show dusk. It
   is a real accessor now and takes an id string or an object.

Also softened: nine tight bright wedges read as hard geometry radiating from a
point rather than light. Five wide, faint ones at 0.30 alpha look like sun
through cloud.
