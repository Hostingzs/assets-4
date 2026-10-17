/* Dogfight — weapons and powerups  (flag: weapons)
 *
 * Two systems.
 *
 * POWERUPS are entirely ours: spawned along the ground strip, drawn in the
 * drawNear slot, and collected by proximity inside the per-plane force hook,
 * which already runs for every aircraft every step. Nothing is added to the
 * engine's entity list, so nothing can desync its collision or scoring.
 *
 * WEAPON PROFILES give each aircraft a different gun without inventing a new
 * projectile class. The engine's own gun function is reused, called extra times
 * with the aircraft's angle briefly perturbed - so a burst or a spread is real
 * bullets from the real code path, with real collision.
 *
 * Firing is detected by watching `ammo` fall. The gun function is a
 * module-private webpack export and cannot be wrapped: its exports are
 * non-configurable getters. Watching the magazine is the reliable signal, and
 * it works identically for the human and for bots.
 */
(function () {
  'use strict';
  var DF = window.__DF__;
  if (!DF) return;

  var KINDS = {
    repair:  { colour: '#4caf50', ring: '#a5d6a7', label: '+' },
    ammo:    { colour: '#d39a3c', ring: '#ffd88a', label: '|' },
    missile: { colour: '#c0392b', ring: '#ef9a9a', label: '^' },
    boost:   { colour: '#2196f3', ring: '#90caf9', label: '>' }
  };
  var ORDER = ['repair', 'ammo', 'missile', 'boost'];

  var CFG = {
    count: 22,          // live pickups
    spreadX: 3400,      // half-width of the band they spawn in, around centre
    radius: 70,         // collection distance; generous, aircraft move fast
    respawnMs: 12000,
    boostMs: 5000,
    boostThrust: 1.45
  };
  DF.weaponTuning = CFG;

  /* Per-aircraft gun character. `extra` rounds are fired alongside the engine's
     own shot, spread by `spreadDeg`. */
  var GUNS = {
    f22:  { extra: 1, spreadDeg: 1.6 },   // M61 burst, tight
    f18:  { extra: 1, spreadDeg: 2.4 },
    su57: { extra: 1, spreadDeg: 1.2 },   // single fast cannon
    f47:  { extra: 2, spreadDeg: 1.8 },
    b21:  { extra: 3, spreadDeg: 5.5 }    // defensive spread, wide
  };
  DF.guns = GUNS;

  var pickups = [];
  DF.pickups = pickups;   // read by the bots, which steer toward useful ones
  var seeded = false;
  var gunFn = null;

  function gun() {
    if (gunFn) return gunFn;
    try { gunFn = window.__BP__.require('14').d; } catch (e) { gunFn = null; }
    return gunFn;
  }

  function seed(world) {
    if (seeded || !world || !world.width) return;
    seeded = true;
    for (var i = 0; i < CFG.count; i++) {
      /* Airborne, spread through the altitude band aircraft actually use.
         Spawned on the ground strip they were never once collected in 14s of
         play - bots cruise above 300 and the pickup radius is 26. */
      /* Clustered around the middle of the map, where the fight actually
         happens. Spread evenly across all 15000 units, 14 pickups were never
         collected once in 20s: aircraft operate in a band a fifth that wide,
         so almost every pickup sat somewhere nobody flies. */
      var mid = world.width / 2;
      pickups.push({
        kind: ORDER[i % ORDER.length],
        x: mid + (Math.random() * 2 - 1) * CFG.spreadX,
        y: world.ground - (240 + Math.random() * 820),
        alive: true, at: 0
      });
    }
  }

  function apply(kind, plane) {
    switch (kind) {
      case 'repair':
        var maxLife = (plane.__dfType && plane.__dfType.life) || 3;
        plane.life = Math.min(maxLife, (plane.life || 1) + 1);
        return true;
      case 'ammo':
        plane.ammo = plane.maxAmmo;
        return true;
      case 'missile':
        plane.missiles = Math.min(plane.maxMissiles, (plane.missiles || 0) + 1);
        return true;
      case 'boost':
        plane.__dfBoost = performance.now() + CFG.boostMs;
        return true;
    }
    return false;
  }

  /** Called from the flight hook for every aircraft, every step. */
  DF.weaponsTick = function (plane, world) {
    if (!DF.flags.weapons) return;
    seed(world);
    var now = performance.now();

    // collection
    for (var i = 0; i < pickups.length; i++) {
      var p = pickups[i];
      if (!p.alive) { if (now - p.at > CFG.respawnMs) { p.alive = true; } continue; }
      var dx = plane.position.x - p.x, dy = plane.position.y - p.y;
      if (dx * dx + dy * dy < CFG.radius * CFG.radius) {
        if (apply(p.kind, plane)) {
          p.alive = false; p.at = now;
          DF.tm.mark('pickup_' + p.kind);
          if (DF.onPickup) DF.onPickup(p.kind, plane);
        }
      }
    }

    // spread / burst, triggered by the magazine falling
    var prev = plane.__dfAmmo;
    plane.__dfAmmo = plane.ammo;
    if (prev !== undefined && plane.ammo < prev && plane.ammo >= 0) {
      var id = plane.__dfType && plane.__dfType.id;
      var g = GUNS[id];
      var fire = gun();
      if (g && g.extra > 0 && fire) {
        var base = plane.angle;
        for (var k = 1; k <= g.extra; k++) {
          var sign = (k % 2 === 0) ? 1 : -1;
          var step = Math.ceil(k / 2) * g.spreadDeg * Math.PI / 180;
          plane.angle = base + sign * step;
          try { fire(world, plane); } catch (e) {}
        }
        plane.angle = base;
        // The engine bills each shot to the magazine; refund the extras so a
        // spread costs one round, not one per barrel.
        plane.ammo = Math.max(0, prev - 1);
        plane.__dfAmmo = plane.ammo;
      }
    }
  };

  /** Thrust multiplier from an active boost, consumed by the flight model. */
  DF.boostFactor = function (plane) {
    if (!DF.flags.weapons) return 1;
    return (plane.__dfBoost && performance.now() < plane.__dfBoost) ? CFG.boostThrust : 1;
  };

  /** Drawn in the near slot, in world space offset by the camera. */
  DF.drawPickups = function (ctx, camera) {
    if (!DF.flags.weapons || !pickups.length) return;
    var t = performance.now() * 0.004;
    ctx.save();
    for (var i = 0; i < pickups.length; i++) {
      var p = pickups[i];
      if (!p.alive) continue;
      var x = p.x - camera.offsetX, y = p.y - camera.offsetY;
      if (x < -60 || x > camera.width + 60) continue;
      var k = KINDS[p.kind];
      var bob = Math.sin(t + i) * 4;
      ctx.save();
      ctx.translate(x, y + bob);
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fillStyle = k.colour; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = k.ring; ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(k.label, 0, 1);
      ctx.restore();
    }
    ctx.restore();
  };
}());
