/* Dogfight — flight model  (flag: flight)
 *
 * Replaces the stock plane aerodynamics and pitch response.
 *
 * What the stock model did, and why each piece is changing:
 *
 *   lift = normal * speed * deadband(AoA, 50deg)
 *     Linear in speed, and the deadband means lift is EXACTLY ZERO until 50
 *     degrees AoA and then jumps. That is backwards: it is a dead zone, not a
 *     stall. Real lift rises with AoA, peaks, then falls away. Replaced with a
 *     proper lift curve that peaks near 18 degrees and decays past it, and with
 *     v-squared instead of v so that speed genuinely buys lift.
 *
 *   drag = 2^(speed - 100)
 *     A wall, not a curve: nothing below ~90, then unclimbable. It exists only
 *     to cap top speed. Replaced with parasitic (v^2) plus induced (CL^2 * v^2)
 *     drag, which is what makes energy management real - a hard turn scrubs
 *     speed because induced drag rises with the square of lift.
 *
 *   turn authority = 1 - speed/150, floored at 1/3
 *     Maximum at ZERO airspeed and falling from there - exactly inverted from
 *     reality, where a stalled wing has no authority at all. Now authority
 *     climbs with airspeed, saturates, and collapses below stall speed.
 *
 * Everything is expressed against the bundle's own vector helpers and constants
 * so a retune of module 1 still propagates.
 */
(function () {
  'use strict';
  var DF = window.__DF__;
  if (!DF) return;

  var T = {
    CL0:         0.28,   // lift at zero AoA - camber. Without this the wing
                         // makes no lift flying straight and the aircraft sinks
                         // hands-off, which measured as a NEGATIVE climb rate.
    CL_MAX:      1.40,   // peak lift coefficient
    AOA_STALL:   18,     // degrees; where the lift curve peaks
    LIFT_K:      0.0055, // lift = LIFT_K * v^2 * CL  (level flight ~ v 40)
    DRAG_P:      0.00140,// parasitic: always there, sets top speed
    DRAG_I:      0.00165,// induced: proportional to CL^2, the cost of turning
    POST_STALL:  0.45,   // fraction of lift still available deep in a stall
    TURN_RATE:   2.80,   // rad/s at full authority
    TURN_VREF:   45,     // airspeed at which authority saturates
    TURN_HEAVY:  95,     // above this, control forces bleed authority again
    STALL_V:     36,     // below this the wing cannot hold level flight
    CEIL_SOFT:   0.55,   // lift/thrust retained at the stratosphere boundary
    ROLL_DRAG:   0.020   // wheels on turf; linear, not the airborne v^2
  };
  DF.flightTuning = T;

  var DEG = Math.PI / 180;

  /* Lift coefficient vs angle of attack. Linear to the stall peak, then a
     decaying shoulder instead of the stock cliff, so a stall mushes and can be
     flown out of rather than dropping lift to zero between one frame and the
     next. */
  function liftCoeff(aoa) {
    var stall = T.AOA_STALL * DEG;
    var slope = (T.CL_MAX - T.CL0) / stall;
    // Cambered linear region: lift at zero AoA, rising to CL_MAX at the stall
    // angle. Stays signed through negative AoA so inverted flight works.
    var cl = T.CL0 + slope * aoa;
    var a = Math.abs(aoa);
    if (a > stall) {
      // Past the peak, fade toward POST_STALL rather than dropping to nothing:
      // a stall should mush and be recoverable, not switch the wing off.
      var over = (a - stall) / (Math.PI / 2 - stall);
      if (over > 1) over = 1;
      cl *= 1 - over * (1 - T.POST_STALL);
    }
    return cl;
  }

  /** Plane force integrator. Returns true to replace the stock one. */
  DF.planeForce = function (M, world, g, D, K) {
    DF._world = world;   // handle for probes and for the bots' target search
    DF._last = M;
    try { if (M.player && M.player.isHuman) DF._me = M; } catch (e) {}
    if (!DF.flags.flight) return false;

    var v = M.velocity;
    var speed = Object(g.h)(v);
    var gravity = Object(g.s)(0, M.mass * K.a);

    // Per-aircraft multipliers arrive in phase 3; absent, they are all 1.
    var st = (DF.planeStats && DF.planeStats(M)) || null;
    var kLift = st ? st.lift : 1, kDrag = st ? st.drag : 1, kThrust = st ? st.thrust : 1;
    // Systems that need to see every aircraft every step ride along here rather
    // than opening their own loops: pickups, gun profiles, damage detection.
    if (DF.weaponsTick) DF.weaponsTick(M, world);
    if (DF.feedbackTick) DF.feedbackTick(M);
    if (DF.boostFactor) kThrust *= DF.boostFactor(M);

    // Stationary: lift and drag both need a velocity direction and would
    // divide by zero, but THRUST must still apply or a parked aircraft can
    // never begin its takeoff roll. An earlier version returned gravity alone
    // here and every bot sat on the runway at speed 0 forever.
    if (speed < 0.001) {
      M.force = Object(g.a)(gravity, Object(g.e)(M.forward, M.thrust * kThrust));
      return true;
    }

    /* Ground roll. While `landed` the engine PINS the attitude to ~23 degrees
       and zeroes vertical velocity. Treating that pinned attitude as a real
       angle of attack put the wing past the stall, and the resulting induced
       drag exactly balanced thrust: every aircraft sat in equilibrium at 41.4,
       just under the 45 needed to unstick, and no bot ever got airborne. The
       stock model never hit this because its drag was ~0 below speed 90.
       On wheels there is rolling resistance, not lift and induced drag. */
    if (M.landed) {
      var roll = Object(g.e)(Object(g.i)(Object(g.f)(v)), T.ROLL_DRAG * speed);
      M.force = Object(g.a)(gravity, Object(g.e)(M.forward, M.thrust * kThrust), roll);
      M.dfSpeed = speed; M.dfAoA = 0; M.dfStalled = false;
      return true;
    }

    var aoa = Object(g.b)(M.forward, v);
    var cl = liftCoeff(aoa);

    var q = speed * speed;
    var liftMag = T.LIFT_K * q * cl * kLift;
    var dragMag = (T.DRAG_P + T.DRAG_I * cl * cl) * q * kDrag;

    // Thin air near the ceiling: fade rather than the stock hard cutoff, which
    // switched thrust, lift AND drag off in a single frame.
    if (M.position.y < world.stratosphere) {
      var fade = T.CEIL_SOFT;
      liftMag *= fade; dragMag *= fade;
    }

    var lift   = Object(g.e)(M.normal, liftMag);
    var thrust = Object(g.e)(M.forward, M.thrust * kThrust);
    var drag   = Object(g.e)(Object(g.i)(Object(g.f)(v)), dragMag);

    M.force = Object(g.a)(gravity, thrust, lift, drag);

    // Published for the HUD and for the bots, which need to know they are
    // approaching a stall to avoid flying into one.
    // Handle for the test harness and, later, the HUD. Cheap: one assignment
    // on a function that already runs per plane per step.
    DF._last = M;
    try { if (M.player && M.player.isHuman) DF._me = M; } catch (e) {}
    M.dfSpeed = speed;
    M.dfAoA = aoa;
    M.dfStalled = Math.abs(aoa) > T.AOA_STALL * DEG || speed < T.STALL_V;
    return true;
  };

  /** Pitch integrator: authority now rises with airspeed instead of falling. */
  DF.planeAngle = function (M, dt, g, K) {
    if (!DF.flags.flight) return false;

    var speed = Object(g.h)(M.velocity);
    var auth = speed / T.TURN_VREF;
    if (auth > 1) auth = 1;
    if (speed > T.TURN_HEAVY) auth *= T.TURN_HEAVY / speed;   // heavy at speed
    if (speed < T.STALL_V) auth *= 0.30 + 0.70 * (speed / T.STALL_V); // mushy
    if (M.landed) auth = 1;                                    // steering on the ground

    var st = (DF.planeStats && DF.planeStats(M)) || null;
    var rate = T.TURN_RATE * (st ? st.turn : 1);

    M.angle += auth * rate * M.elevator * dt;
    if (M.angle < 0) M.angle += 2 * Math.PI;
    if (M.angle > 2 * Math.PI) M.angle -= 2 * Math.PI;
    M.dfAuthority = auth;
    return true;
  };
}());
