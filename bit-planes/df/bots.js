/* Dogfight — bot AI  (flag: bots)
 *
 * Replaces the stock bot brain at its attach sites. Signature matches the one
 * it displaces: botAI(world, player) -> teardown function.
 *
 * Why this had to follow the flight model immediately: the stock bots were
 * tuned against handling where turning was free and stalling was impossible.
 * Under real aerodynamics that tuning flies them into the ground.
 *
 * Priorities, highest first. Anything above the dogfighting layer is survival,
 * and survival always wins - a bot that spins into a hill is not a threat.
 *
 *   1. ground avoidance   2. stall recovery   3. evade when hurt   4. attack
 *
 * The aircraft has exactly one control axis (elevator) plus a throttle, so all
 * steering is "rotate until the nose is on the aim point". Convention, measured
 * in phase 1: forward = (-cos angle, -sin angle), and a positive elevator
 * increases angle.
 */
(function () {
  'use strict';
  var DF = window.__DF__;
  if (!DF) return;

  var CFG = {
    tickMs:        80,     // matches the stock cadence
    bulletSpeed:   150,    // for lead; refined against observed muzzle speed
    fireCone:      0.16,   // rad; how closely aligned before squeezing
    fireRange:     900,
    missileRange:  1800,
    missileCone:   0.10,
    groundMargin:  330,   // predictive: pull up if descending below this
    hardFloor:     110,   // absolute: pull up regardless
    stallMargin:   12,     // above STALL_V before we treat it as a stall risk
    evadeLife:     1,      // life at or below which we disengage
    aimDeadband:   0.05,   // rad; stops elevator chatter around the aim point
    leadIterations: 2,
    climbOutSpeed: 70,    // build this much before trading speed for height
    pickupRange: 1500     // detour this far for something worth having
  };
  DF.botTuning = CFG;

  function wrapPi(a) {
    while (a > Math.PI) a -= 2 * Math.PI;
    while (a < -Math.PI) a += 2 * Math.PI;
    return a;
  }
  // Nose direction as an angle, given the engine's convention.
  function headingTo(dx, dy) { return Math.atan2(-dy, -dx); }
  function norm(a) { return a < 0 ? a + 2 * Math.PI : a; }

  DF.botAI = function (world, player) {
    var gun = null, missile = null;
    try { var m14 = window.__BP__.require('14'); gun = m14.d; missile = m14.e; } catch (e) {}

    var reload = 0, missileWait = 0;

    function enemiesOf(me) {
      var out = [];
      var list = world.players || [];
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (p === player) continue;
        if (p.team && player.team && p.team === player.team) continue;
        var pl = p.hasPlane && p.hasPlane();
        if (pl) out.push(pl);
      }
      return out;
    }

    function nearest(me, list) {
      var best = null, bd = Infinity;
      for (var i = 0; i < list.length; i++) {
        var dx = list[i].position.x - me.position.x;
        var dy = list[i].position.y - me.position.y;
        var d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = list[i]; }
      }
      return best ? { plane: best, dist: Math.sqrt(bd) } : null;
    }

    /* Iterated lead: guess a time of flight, advance the target by it, re-solve.
       Two passes is plenty at these speeds and costs nothing. Stock bots aimed
       at where the target WAS, which is why they rarely hit anything moving. */
    function leadPoint(me, tgt) {
      var px = tgt.position.x, py = tgt.position.y;
      for (var i = 0; i < CFG.leadIterations; i++) {
        var dx = px - me.position.x, dy = py - me.position.y;
        var t = Math.hypot(dx, dy) / CFG.bulletSpeed;
        px = tgt.position.x + tgt.velocity.x * t;
        py = tgt.position.y + tgt.velocity.y * t;
      }
      return { x: px, y: py };
    }

    /** Nearest pickup this aircraft has a reason to want, within detour range. */
    function wantedPickup(me) {
      var list = DF.pickups;
      if (!list || !list.length) return null;
      var maxLife = (me.__dfType && me.__dfType.life) || 3;
      var best = null, bd = CFG.pickupRange * CFG.pickupRange;
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p.alive) continue;
        var useful =
          (p.kind === 'repair'  && me.life < maxLife) ||
          (p.kind === 'ammo'    && me.ammo < me.maxAmmo * 0.5) ||
          (p.kind === 'missile' && me.missiles < me.maxMissiles) ||
          (p.kind === 'boost');
        if (!useful) continue;
        var dx = p.x - me.position.x, dy = p.y - me.position.y;
        var d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = p; }
      }
      return best;
    }

    function steerTo(me, x, y) {
      var want = headingTo(x - me.position.x, y - me.position.y);
      var err = wrapPi(norm(want) - me.angle);
      if (Math.abs(err) < CFG.aimDeadband) { me.elevator = 0; return 0; }
      me.elevator = err > 0 ? 1 : -1;
      return err;
    }

    var timer = setInterval(function () {
      var me = player.hasPlane && player.hasPlane();
      if (!me) {
        // On foot or under canopy: walk toward the barn side and pop the chute.
        var pilot = player.hasPilot && player.hasPilot();
        if (pilot) {
          if (pilot.landed) pilot.velocity.x = (pilot.position.x < world.width / 2) ? 10 : -10;
          else if (!pilot.parachute && pilot.deployParachute) {
            try { pilot.deployParachute(world); } catch (e) {}
          }
        }
        return;
      }

      var K = DF.flightTuning || { STALL_V: 36 };
      var speed = Math.hypot(me.velocity.x, me.velocity.y);
      var alt = world.ground - me.position.y;          // +ve = height above ground
      var sinking = me.velocity.y > 0;

      // 0. Takeoff roll. The engine pins attitude while landed and releases the
      //    aircraft above ~45, so the only correct action is full power and
      //    hands off the stick. Without this the stall rule below fired at 42
      //    and steered the nose DOWN into the runway: bots reached 44% airborne
      //    but never climbed past altitude 7.
      if (me.landed) { me.thrust = 17; me.elevator = 0; return; }

      // 0.5 Accelerate before climbing. Straight off the runway the aircraft is
      //     barely above the 45 unstick speed; climbing immediately bleeds that
      //     back and it settles onto the ground again. Measured: bots reached
      //     58% airborne but a maximum altitude of 9, bouncing on and off the
      //     strip. Hold it shallow until there is energy to convert.
      if (alt < 260 && speed < CFG.climbOutSpeed && !sinking) {
        me.thrust = 17;
        steerTo(me, me.position.x + (me.velocity.x >= 0 ? 900 : -900), me.position.y - 70);
        return;
      }

      // 1. Ground. Non-negotiable: nose up, full power, nothing else matters.
      //    Height alone is enough - waiting for a measured sink rate means
      //    reacting after the aircraft is already committed.
      /* Two conditions, and the pair matters. A hard floor catches anyone
         genuinely about to hit terrain; above that it only fires when the
         aircraft is actually DESCENDING. Triggering on height alone made this
         branch swallow every tick - it returns, so nothing below it ever ran
         and the bots simply climbed for the whole match. Widening it further
         is not the answer either: at 170 they fought but flew at 165 and died
         more than the stock AI. */
      if (alt < CFG.hardFloor || (alt < CFG.groundMargin && sinking)) {
        me.thrust = 17;
        steerTo(me, me.position.x + (me.velocity.x >= 0 ? 700 : -700), me.position.y - 900);
        return;
      }

      // 2. Stall. Unstall before doing anything clever - but only with height
      //    to trade, which rule 1 has already guaranteed.
      if (speed < (K.STALL_V || 36) + CFG.stallMargin) {
        me.thrust = 17;
        steerTo(me, me.position.x + (me.velocity.x >= 0 ? 800 : -800), me.position.y + 300);
        return;
      }

      var foes = enemiesOf(me);
      var near = nearest(me, foes);

      // 3. Hurt: extend away and rebuild energy rather than trade badly.
      if (me.life <= CFG.evadeLife && near) {
        me.thrust = 17;
        steerTo(me, me.position.x - (near.plane.position.x - me.position.x),
                    me.position.y - 250);
        return;
      }

      /* 3.5 Collect. Only when it is actually wanted and actually close, so
             this never pulls a bot out of a fight it is winning. Without it
             nothing ever touched a pickup: they were decorative. */
      var want = wantedPickup(me);
      if (want && (!near || near.dist > CFG.fireRange)) {
        me.thrust = 17;
        steerTo(me, want.x, want.y);
        return;
      }

      if (!near) {                                  // nobody to fight: cruise
        me.thrust = 12;
        steerTo(me, me.position.x + 900, world.ground - 900);
        return;
      }

      // 4. Attack. Energy first: if slow, trade a little height for speed.
      var tgt = near.plane;
      var aim = leadPoint(me, tgt);
      if (speed < 70) aim.y += 220;                 // nose down to accelerate
      var err = steerTo(me, aim.x, aim.y);
      me.thrust = 17;

      var aligned = Math.abs(err) < CFG.fireCone;
      if (aligned && near.dist < CFG.fireRange && me.ammo > 0 && gun && --reload <= 0) {
        try { gun(world, me); reload = 1; } catch (e) {}
      }
      if (Math.abs(err) < CFG.missileCone && near.dist > CFG.fireRange &&
          near.dist < CFG.missileRange && me.missiles > 0 && missile && --missileWait <= 0) {
        try { missile(world, me); missileWait = 25; } catch (e) {}
      }
    }, CFG.tickMs);

    return function () { clearInterval(timer); };
  };
}());
