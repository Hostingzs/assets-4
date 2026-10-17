# Phase 2 — bots

All figures under the phase 1 flight model, 8 bots, 40 s, no human input.

| metric | stock AI | new AI |
| --- | --- | --- |
| deaths / min | 25.4 | **12.0** |
| airborne | 85.1% | 86.3% |
| mean altitude | 388 | 327 |
| max altitude | 1376 | 978 |
| mean speed | 58.7 | 51.0 |

For scale: the *original* game (stock flight + stock bots) ran at 22.7
deaths/min. Putting the stock AI under real aerodynamics pushed it to 25.4 —
the coupling the plan predicted. The new AI more than halves that while still
engaging, so the drop is survival, not passivity.

## Three bugs the measurements caught

Each produced a run that looked plausible and was wrong.

1. **Zero-speed early-out killed thrust.** The flight model returned gravity
   alone below 0.001 speed to avoid dividing by zero when normalising velocity.
   That also dropped thrust, so a parked aircraft could never begin its takeoff
   roll. Every bot sat at speed 0 forever, and both A/B arms read identically
   because nothing was flying in either.
2. **Ground roll was being flown as a 23-degree stall.** While `landed` the
   engine pins attitude to ~23 degrees. Treating that as a real angle of attack
   put the wing past the stall, and the induced drag exactly cancelled thrust:
   every aircraft sat in equilibrium at **41.4**, just under the 45 needed to
   unstick. The force vector gave it away - `fx: 0` with full thrust applied.
   Stock never hit this because its drag was ~0 below speed 90. Aircraft on
   wheels now get rolling resistance instead of lift and induced drag.
3. **Climbing straight off the runway.** With takeoff fixed, bots reached 58%
   airborne but a maximum altitude of **9** - unsticking at 45, immediately
   trading that speed for height, sinking back on. They now hold a shallow
   attitude until 70 before converting.

Also worth recording: the A/B was invalid for two runs because flags were set on
the live object and did not survive the page reload, so both arms ran the same
brain. `setFlag` persists; plain assignment does not.

## Priorities

Survival outranks fighting, because a bot that spins in is not a threat:

`takeoff roll -> climb-out -> ground avoidance -> stall recovery -> evade when
hurt -> attack`

Attack uses two-pass iterated lead (guess time of flight, advance the target,
re-solve). Stock aimed where the target *was*, which is why it rarely hit
anything moving. Tuning lives in `DF.botTuning`.
