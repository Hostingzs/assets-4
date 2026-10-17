# Phase 1 — flight model

Same build, model toggled at runtime, so both columns come from one session.

| measurement | stock | new | what it means |
| --- | --- | --- | --- |
| top speed | 104.1 | 108.1 | |
| level flight, full thrust | **-30.9** | **+9.9** | stock sinks hands-off; new holds |
| climb, 20° nose up | +111.9 | **+132.8** | |
| glide, idle | -35.3 | **-16.7** | sink rate halved |
| **stall speed** | **none** | **77.3** | stock aircraft cannot stall at all |
| turn @50 → exit speed | 50 → **104.4** | 50 → 71.2 | |
| turn @80 → exit speed | 80 → **104.3** | 80 → 74.8 | |
| turn @110 → exit speed | 110 → **104.4** | 110 → 78.6 | |
| turn radius @50/80/110 | 65 / 74 / 55 | **34 / 43 / 52** | now scales with speed |

## The headline

**Stock turning was free.** Every turn ended at ~104.4 regardless of entry
speed — a 50-knot entry *gained* 54 knots while holding full elevator. Speed was
pinned to terminal by the `2^(speed-100)` drag wall, so there was no cost to
manoeuvring and no reason to manage energy.

New: turns converge to 71–79. Hard turning bleeds speed because induced drag
rises with the square of lift, and slow entries accelerate toward a sustainable
corner speed. Dive to build energy, spend it in the turn, extend to rebuild — the
loop the stock model had no way to express.

**Stock had no stall.** The battery could not provoke one at any speed or
attitude, because "stall" was a dead zone that suppressed lift below 50° AoA
rather than a peak beyond it.

## Three bugs the measurements caught

Worth recording, because each produced confident-looking numbers that were fiction.

1. **Nose points -x at angle 0.** The first battery set velocity to +x, flying
   the aircraft *backwards* at 175° AoA. Speed collapsed 85 → 6 in 0.3 s. Both
   columns were affected, so the comparison looked plausible and was worthless.
   The battery now reads the aircraft's own `forward` vector.
   Convention: `forward = (-cos angle, -sin angle)`; positive angle pitches up.
2. **Attitudes were not controlled.** `place()` *added* pitch to whatever angle
   the aircraft already had, so no two runs started alike. Now absolute.
3. **No lift at zero AoA.** The first lift curve passed through the origin, so
   the wing made nothing flying straight and sank hands-off — measured as a
   negative climb rate. Fixed by adding camber (`CL0 = 0.28`), which is what
   turned level flight from -188.8 to +9.9.

## Tuning

In `df/flight.js`, `DF.flightTuning`, live-editable from the console:

`CL0 0.28 · CL_MAX 1.40 · AOA_STALL 18° · LIFT_K 0.0055 · DRAG_P 0.00140 ·
DRAG_I 0.00165 · POST_STALL 0.45 · TURN_RATE 2.80 · TURN_VREF 45 · STALL_V 36`

Post-stall lift fades to 45% rather than to zero, so a stall mushes and can be
flown out of instead of switching the wing off between frames.
