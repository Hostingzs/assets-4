/* Dogfight — painterly world  (flag: world)
 *
 * Draws through two hooks the bundle exposes: drawFar (behind the forest bands,
 * ahead of everything else) and drawNear (after the clouds, before entities).
 *
 * What the stock renderer had: a flat sky, and "parallax" consisting of two
 * forest strips at 0.95 and 0.98 scroll factor - i.e. almost none - plus 120
 * cloud sprites moving at exactly camera speed, which reads as wallpaper rather
 * than distance. There was no distant layer at all.
 *
 * Everything static is pre-rendered once into an offscreen canvas and blitted
 * with an offset, because the alternative is re-tracing hundreds of ridge
 * vertices every frame on a Chromebook.
 *
 * Camera: the stock follow is hard-centred with no smoothing, lookahead or
 * shake (it computes the same value in both branches of what looks like a
 * dead-zone test). It is adjusted here at the top of drawFar, before anything
 * is drawn, so every layer and every entity stays consistent with it.
 */
(function () {
  'use strict';
  var DF = window.__DF__;
  if (!DF) return;

  var TIERS = {
    low:    { ridges: 1, clouds: 0, sun: false, rays: false, haze: false, shake: false, grade: false },
    medium: { ridges: 2, clouds: 1, sun: true,  rays: false, haze: true,  shake: true,  grade: true },
    ultra:  { ridges: 3, clouds: 2, sun: true,  rays: true,  haze: true,  shake: true,  grade: true }
  };

  /* Time of day. Chosen once per page load so a match has a consistent mood
     rather than shifting under the player. */
  var SKIES = [
    { id: 'day',   top: '#2f6ea8', mid: '#79bde4', low: '#bfe4f6', sun: '#fff6d8', glow: 'rgba(255,246,216,0.30)', sunX: 0.72, sunY: 0.18, ridge: ['#5d7f97', '#7d9db2', '#a3bccb'] },
    { id: 'dawn',  top: '#37507e', mid: '#c97a86', low: '#f6c9a0', sun: '#ffe9c2', glow: 'rgba(255,196,140,0.34)', sunX: 0.22, sunY: 0.30, ridge: ['#4a4f74', '#6d6d92', '#9a92ad'] },
    { id: 'dusk',  top: '#1f2f56', mid: '#7c4a76', low: '#e8956b', sun: '#ffd9a0', glow: 'rgba(255,160,110,0.34)', sunX: 0.80, sunY: 0.34, ridge: ['#38375c', '#57547a', '#7d7796'] },
    { id: 'storm', top: '#3a4653', mid: '#6b7b88', low: '#a6b2bb', sun: '#c9d3da', glow: 'rgba(200,212,220,0.16)', sunX: 0.50, sunY: 0.20, ridge: ['#3f4a55', '#55616d', '#6e7a86'] }
  ];
  var sky = SKIES[Math.floor(Math.random() * SKIES.length)];
  DF.skies = SKIES;
  /* Exposed as a real accessor, not a copy. An earlier version assigned
     DF.sky = sky once, so setting it from the console or a test changed
     nothing - the renderer kept reading the module-local. That silently
     invalidated a screenshot comparison meant to show dusk. */
  Object.defineProperty(DF, 'sky', {
    get: function () { return sky; },
    set: function (v) {
      if (typeof v === 'string') { var f = SKIES.filter(function (s) { return s.id === v; })[0]; if (f) sky = f; }
      else if (v && v.top) sky = v;
    }
  });

  function tier() { return TIERS[DF.tier()] || TIERS.medium; }

  /* --- pre-rendered ridge bands ---------------------------------------- */
  var RIDGE_W = 1600, RIDGE_H = 320;
  var ridgeCache = {};

  function makeRidge(seedIndex, colour) {
    var c = document.createElement('canvas');
    c.width = RIDGE_W; c.height = RIDGE_H;
    var g = c.getContext('2d');
    // Deterministic pseudo-random so the ridge tiles seamlessly and does not
    // change between frames.
    var rnd = (function (s) {
      return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    })(1234 + seedIndex * 977);
    g.fillStyle = colour;
    g.beginPath();
    g.moveTo(0, RIDGE_H);
    var step = 40, h = RIDGE_H * 0.55;
    for (var x = 0; x <= RIDGE_W; x += step) {
      // Ends are pinned to the same height so the tile joins itself cleanly.
      var edge = (x === 0 || x >= RIDGE_W) ? 0.5 : rnd();
      h = h * 0.62 + (RIDGE_H * (0.30 + edge * 0.55)) * 0.38;
      g.lineTo(x, RIDGE_H - h);
    }
    g.lineTo(RIDGE_W, RIDGE_H);
    g.closePath();
    g.fill();
    return c;
  }

  function ridge(i, colour) {
    var k = i + colour;
    if (!ridgeCache[k]) ridgeCache[k] = makeRidge(i, colour);
    return ridgeCache[k];
  }

  /* --- soft cloud bank, pre-rendered ------------------------------------ */
  var bankCache = {};
  function cloudBank(i) {
    if (bankCache[i]) return bankCache[i];
    var W = 900, H = 260;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var g = c.getContext('2d');
    var rnd = (function (s) {
      return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    })(77 + i * 313);
    // Fewer and much larger, so they read as distant weather rather than a
    // field of grey dots. Flat-bottomed: cloud bases are flat, and drawing
    // them as symmetric blobs is what made the first pass look like smoke.
    /* Puffs are inset from every edge by MARGIN. Drawn edge-to-edge, each
       tile ended mid-cloud and the repeat showed as a hard vertical cut every
       900px. Joining through empty sky hides the seam completely. */
    var MARGIN = 150;
    for (var n = 0; n < 9; n++) {
      var cx = MARGIN + rnd() * (W - MARGIN * 2);
      var base = H * 0.58 + rnd() * H * 0.14;
      var puffs = 4 + Math.floor(rnd() * 4);
      for (var k = 0; k < puffs; k++) {
        var x = cx + (k - puffs / 2) * (32 + rnd() * 22);
        var r = 34 + rnd() * 54;
        var y = base - r * (0.35 + rnd() * 0.45);
        if (x - r < 8 || x + r > W - 8 || y - r < 8) continue;
        var grad = g.createRadialGradient(x, y - r * 0.2, r * 0.1, x, y, r);
        grad.addColorStop(0, 'rgba(255,255,255,0.55)');
        grad.addColorStop(0.6, 'rgba(255,255,255,0.20)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      }
    }
    bankCache[i] = c;
    return c;
  }

  /* --- camera ------------------------------------------------------------ */
  var cam = { x: null, y: null, shake: 0 };
  DF.shake = function (amount) { cam.shake = Math.min(28, cam.shake + amount); };

  function smoothCamera(camera, world) {
    var T = tier();
    if (cam.x === null) { cam.x = camera.offsetX; cam.y = camera.offsetY; }
    // Critically damped-ish follow. Stock snaps the camera dead-centre every
    // frame, which makes fast flying feel rigid.
    var k = 0.16;
    cam.x += (camera.offsetX - cam.x) * k;
    cam.y += (camera.offsetY - cam.y) * k;
    var ox = cam.x, oy = cam.y;
    if (T.shake && cam.shake > 0.2) {
      ox += (Math.random() - 0.5) * cam.shake;
      oy += (Math.random() - 0.5) * cam.shake;
      cam.shake *= 0.88;
    } else cam.shake = 0;
    // Respect the world clamp the stock camera applies, or the sky edge shows.
    camera.offsetX = Math.max(0, Math.min(world.width - camera.width, ox));
    camera.offsetY = Math.max(0, Math.min(world.height - camera.height, oy));
  }

  /* --- layers ------------------------------------------------------------ */
  function paintSky(ctx, camera, world) {
    var T = tier();
    var h = camera.height, w = camera.width;
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, sky.top);
    g.addColorStop(0.55, sky.mid);
    g.addColorStop(1, sky.low);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    if (T.sun) {
      /* Anchored to the SMOOTHED, pre-shake camera. Deriving the sun from
         camera.offsetX made it jump every frame the screen shook, which read
         as a flicker rather than as motion. */
      var sx = w * sky.sunX + (cam.x - camera.offsetX) * 0.02;
      var sy = h * sky.sunY + (cam.y - camera.offsetY) * 0.02;
      if (T.rays) {
        // Cheap god rays: a few wide, very low-alpha wedges from the sun.
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(sx, sy);
        // Few, wide and very faint. Nine tight bright wedges read as hard
        // geometry radiating from a point, not as light through cloud.
        // Static. Rotating wedges under a 'lighter' composite made the sun
        // visibly strobe: any given pixel was swept by a bright edge several
        // times a second. Light through cloud does not spin.
        ctx.globalAlpha = 0.22;
        for (var i = 0; i < 5; i++) {
          var a = 0.4 + i * (Math.PI * 2 / 5);
          ctx.save(); ctx.rotate(a);
          var rg = ctx.createLinearGradient(0, 0, w * 1.3, 0);
          rg.addColorStop(0, sky.glow);
          rg.addColorStop(0.45, 'rgba(255,255,255,0.05)');
          rg.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = rg;
          ctx.beginPath(); ctx.moveTo(0, 0);
          ctx.lineTo(w * 1.3, -h * 0.16); ctx.lineTo(w * 1.3, h * 0.16);
          ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      var sg = ctx.createRadialGradient(sx, sy, 4, sx, sy, Math.min(w, h) * 0.34);
      sg.addColorStop(0, sky.sun);
      sg.addColorStop(0.12, sky.glow);
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function paintRidges(ctx, camera, world) {
    var T = tier();
    var factors = [0.20, 0.38, 0.58];
    var baseY = [0.60, 0.68, 0.76];
    for (var i = 0; i < T.ridges; i++) {
      var img = ridge(i, sky.ridge[i] || sky.ridge[sky.ridge.length - 1]);
      var off = (camera.offsetX * factors[i]) % RIDGE_W;
      var y = world.height - camera.offsetY - RIDGE_H * (1 + baseY[i] * 0.35);
      ctx.save();
      ctx.globalAlpha = 0.55 - i * 0.08;
      for (var x = -off; x < camera.width + RIDGE_W; x += RIDGE_W - 1) {
        ctx.drawImage(img, x, y);
      }
      ctx.restore();
    }
    if (T.haze) {
      var hz = ctx.createLinearGradient(0, camera.height * 0.45, 0, camera.height);
      hz.addColorStop(0, 'rgba(255,255,255,0)');
      hz.addColorStop(1, 'rgba(255,255,255,0.20)');
      ctx.fillStyle = hz;
      ctx.fillRect(0, camera.height * 0.45, camera.width, camera.height * 0.55);
    }
  }

  function paintClouds(ctx, camera, world, layer) {
    var img = cloudBank(layer);
    var factor = layer === 0 ? 0.34 : 0.62;
    var off = (camera.offsetX * factor) % img.width;
    var y = (world.height * (layer === 0 ? 0.18 : 0.30)) - camera.offsetY * factor * 0.5;
    ctx.save();
    ctx.globalAlpha = layer === 0 ? 0.45 : 0.60;
    for (var x = -off; x < camera.width + img.width; x += img.width) {
      ctx.drawImage(img, x, y);
    }
    ctx.restore();
  }

  DF.drawFar = function (ctx, camera, world) {
    if (!DF.flags.world) return;
    /* Time the layer itself. Frame interval is useless as a tier gate here:
       headless rAF runs uncapped at ~180Hz, so every tier reads 5.5ms until the
       work exceeds the interval, and CPU throttling did not move it either.
       What matters is how many milliseconds THIS costs per frame. */
    var _t0 = performance.now();
    smoothCamera(camera, world);
    var T = tier();
    paintSky(ctx, camera, world);
    // Both banks go here, behind the ridges and behind the engine's own crisp
    // cloud sprites. Putting the near bank in drawNear painted soft grey mush
    // OVER those sprites and the two cloud styles visibly fought.
    if (T.clouds > 0) paintClouds(ctx, camera, world, 0);
    if (T.clouds > 1) paintClouds(ctx, camera, world, 1);
    paintRidges(ctx, camera, world);
    DF.tm.mark('farMs', performance.now() - _t0);
    DF.tm.mark('farCalls');
  };

  DF.drawNear = function (ctx, camera, world) {
    var _t1 = performance.now();
    var T = tier();
    if (DF.flags.world && T.grade) {
      // A whisper of colour grade to tie the palette together.
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.10;
      ctx.fillStyle = sky.mid;
      ctx.fillRect(0, 0, camera.width, camera.height);
      ctx.restore();
    }
    // Pickups sit in world space over the terrain; feedback is screen space and
    // goes last so hit markers and toasts read over everything.
    if (DF.drawPickups) DF.drawPickups(ctx, camera);
    if (DF.drawFeedback) DF.drawFeedback(ctx, camera);
    DF.tm.mark('nearMs', performance.now() - _t1);
  };

  /* --- minimap -----------------------------------------------------------
     The stock minimap is an isolated 300ms setInterval that plots only living
     planes as 4x4 rects, with no terrain, no viewport and no aspect
     correction on a 15000x4000 world. Nothing else in the bundle reads it, so
     it is replaced wholesale. */
  var mmTimer = null;
  function startMinimap() {
    if (mmTimer) return;
    mmTimer = setInterval(function () {
      if (!DF.flags.world) return;
      var cv = document.querySelector('.minimap');
      var w = DF._world;
      if (!cv || !w) return;
      var W = cv.width, H = cv.height;
      if (!W || !H) return;
      var g = cv.getContext('2d');
      g.clearRect(0, 0, W, H);
      g.fillStyle = 'rgba(16,26,34,0.55)';
      g.fillRect(0, 0, W, H);
      var sxk = W / w.width, syk = H / w.height;
      // ground line
      g.fillStyle = 'rgba(120,180,120,0.55)';
      g.fillRect(0, w.ground * syk, W, Math.max(1, H - w.ground * syk));
      // barns
      g.fillStyle = 'rgba(200,80,70,0.9)';
      try {
        for (var b of (w.bodies || [])) {
          if (b && b.sprite && b.sprite.width > 100) g.fillRect(b.position.x * sxk - 2, b.position.y * syk - 2, 4, 4);
        }
      } catch (e) {}
      // aircraft
      try {
        for (var p of (w.players || [])) {
          var q = p.hasPlane && p.hasPlane();
          if (!q) continue;
          var x = q.position.x * sxk, y = q.position.y * syk;
          g.fillStyle = p.color || '#fff';
          if (p.isHuman) {
            g.beginPath(); g.arc(x, y, 3.4, 0, Math.PI * 2); g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.2; g.stroke();
          } else g.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      } catch (e) {}
    }, 220);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startMinimap);
  else startMinimap();
}());
