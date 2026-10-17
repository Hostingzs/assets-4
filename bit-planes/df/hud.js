/* Dogfight — combat feedback  (flag: feedback)
 *
 * Hit markers, damage flash, kill streaks, pickup toasts and screen shake.
 *
 * All of it is inferred rather than hooked, because the engine's scoring and
 * damage functions are module-private webpack exports with non-configurable
 * getters and cannot be wrapped. Two signals carry everything:
 *
 *   - a plane's `life` falling  -> it took a hit
 *   - a kill-feed row appearing -> somebody died
 *
 * Both are polled cheaply from the per-plane force hook and a MutationObserver,
 * which is exactly how the phase 2 telemetry measured bots. Reusing a proven
 * observation route beats inventing a fragile one.
 */
(function () {
  'use strict';
  var DF = window.__DF__;
  if (!DF) return;

  var CFG = {
    markerMs: 420,
    toastMs: 1600,
    flashMs: 320,
    streakWindowMs: 9000,
    shakeOnHit: 5,
    shakeOnKill: 12,
    shakeOnDeath: 22
  };
  DF.hudTuning = CFG;

  var markers = [];      // {x, y, at} in world space
  var toasts = [];       // {text, at, colour}
  var flashAt = 0;
  var streak = { n: 0, at: 0 };

  function toast(text, colour) {
    toasts.push({ text: text, at: performance.now(), colour: colour || '#ffd54f' });
    if (toasts.length > 4) toasts.shift();
  }
  DF.toast = toast;

  DF.onPickup = function (kind, plane) {
    if (!DF.flags.feedback) return;
    try { if (!(plane.player && plane.player.isHuman)) return; } catch (e) { return; }
    var names = { repair: 'Repaired', ammo: 'Ammo full', missile: '+1 missile', boost: 'Boost' };
    toast(names[kind] || kind, '#90caf9');
  };

  /** Per-aircraft, per-step. Detects damage by watching life fall. */
  DF.feedbackTick = function (plane) {
    if (!DF.flags.feedback) return;
    var prev = plane.__dfLife;
    plane.__dfLife = plane.life;
    if (prev === undefined || plane.life >= prev) return;

    markers.push({ x: plane.position.x, y: plane.position.y, at: performance.now() });
    if (markers.length > 24) markers.shift();

    var mine = false;
    try { mine = !!(plane.player && plane.player.isHuman); } catch (e) {}
    if (mine) {
      flashAt = performance.now();
      if (DF.shake) DF.shake(CFG.shakeOnDeath * 0.4);
    } else if (DF.shake) DF.shake(CFG.shakeOnHit);
  };

  /* Kill feed -> streaks. Rows are bare names; two names means a kill, one
     means a solo death. That cannot be split by counting words, because
     several bot names are two words themselves ("Jack Power", "Beach Head"),
     so streaks count feed rows that mention the player, not word counts. */
  function watchFeed() {
    var log = document.querySelector('.log');
    if (!log) { setTimeout(watchFeed, 500); return; }
    new MutationObserver(function (muts) {
      if (!DF.flags.feedback) return;
      for (var i = 0; i < muts.length; i++) {
        for (var j = 0; j < muts[i].addedNodes.length; j++) {
          var n = muts[i].addedNodes[j];
          var txt = (n.textContent || '').trim();
          if (!txt) continue;
          var now = performance.now();
          // A row naming YOU first is the player scoring.
          if (/^YOU\b/.test(txt)) {
            if (now - streak.at > CFG.streakWindowMs) streak.n = 0;
            streak.n++; streak.at = now;
            if (DF.shake) DF.shake(CFG.shakeOnKill);
            var words = ['', 'Kill', 'Double', 'Triple', 'Rampage', 'Unstoppable'];
            toast(streak.n > 1 ? (words[Math.min(streak.n, 5)] + ' x' + streak.n) : 'Kill',
                  streak.n > 2 ? '#ff8a65' : '#ffd54f');
          } else if (/\bYOU\b/.test(txt)) {
            streak.n = 0;
            flashAt = now;
            if (DF.shake) DF.shake(CFG.shakeOnDeath);
          }
        }
      }
    }).observe(log, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchFeed);
  else watchFeed();

  /** Drawn last in the near slot, over the world but under the engine's HUD. */
  DF.drawFeedback = function (ctx, camera) {
    if (!DF.flags.feedback) return;
    var now = performance.now();

    for (var i = markers.length - 1; i >= 0; i--) {
      var m = markers[i];
      var age = (now - m.at) / CFG.markerMs;
      if (age >= 1) { markers.splice(i, 1); continue; }
      var x = m.x - camera.offsetX, y = m.y - camera.offsetY;
      if (x < -40 || x > camera.width + 40) continue;
      var r = 8 + age * 16;
      ctx.save();
      ctx.globalAlpha = (1 - age) * 0.9;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (var k = 0; k < 4; k++) {
        var a = Math.PI / 4 + k * Math.PI / 2;
        ctx.moveTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55);
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
      }
      ctx.stroke();
      ctx.restore();
    }

    var fAge = (now - flashAt) / CFG.flashMs;
    if (fAge < 1) {
      ctx.save();
      ctx.globalAlpha = (1 - fAge) * 0.32;
      ctx.fillStyle = '#c62828';
      ctx.fillRect(0, 0, camera.width, camera.height);
      ctx.restore();
    }

    for (var t = 0; t < toasts.length; t++) {
      var to = toasts[t];
      var tAge = (now - to.at) / CFG.toastMs;
      if (tAge >= 1) continue;
      ctx.save();
      ctx.globalAlpha = tAge < 0.15 ? tAge / 0.15 : (1 - tAge) / 0.85;
      ctx.font = 'bold 26px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = to.colour;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.lineWidth = 3;
      var ty = camera.height * 0.28 + t * 32 - tAge * 14;
      ctx.strokeText(to.text, camera.width / 2, ty);
      ctx.fillText(to.text, camera.width / 2, ty);
      ctx.restore();
    }
    toasts = toasts.filter(function (x) { return (now - x.at) / CFG.toastMs < 1; });
  };
}());
