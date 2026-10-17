/* Bit Planes enhancements — MathTube
 *
 * Loaded AFTER index.js. Touches nothing inside the bundle: it reaches the
 * sprite table through window.__BP__ (module 2, export `b`) and repaints
 * sprites in place.
 *
 * Why repaint in place rather than swap objects: the bundle caches sprite
 * references at construction, so replacing table.plane1 would leave the old
 * object being drawn. Every sprite is an `L` with a `.canvas` that draw()
 * blits, so redrawing THAT canvas updates every holder at once.
 *
 * Free resolution win: draw() blits the canvas down to logical width/height
 * (36x22 for a plane). The stock canvas is exactly 36x22, so the art is drawn
 * 1:1 and looks blocky. Painting a 4x canvas instead lets the browser
 * downsample, which is real antialiasing for no cost in game logic.
 */
(function () {
  'use strict';
  var SS = 4; // supersample factor

  function repaint(sprite, svg, done) {
    if (!sprite || !sprite.canvas) return done && done(false);
    var w = sprite.width, h = sprite.height;
    var img = new Image();
    img.onload = function () {
      sprite.canvas.width = w * SS;
      sprite.canvas.height = h * SS;
      var c = sprite.canvas.getContext('2d');
      c.imageSmoothingEnabled = true;
      c.clearRect(0, 0, w * SS, h * SS);
      c.drawImage(img, 0, 0, w * SS, h * SS);
      done && done(true);
    };
    img.onerror = function () { done && done(false); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---- aircraft (original art, drawn for this build) ----
     36x22 logical, nose to the right, matching the stock silhouette so the
     game's rotation, muzzle offset and hit radius still line up. */

  // Prop fighter: warbird lines, spinner, cockpit glazing, tail fin.
  var PROP = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 22">' +
    '<g stroke="#1b1b1b" stroke-width="0.9" stroke-linejoin="round">' +
    '<path d="M4 12 L7 9 L26 8.5 L32 11 L32 12.6 L26 14 L8 14.4 Z" fill="#c62828"/>' +
    '<path d="M26 8.5 L32 11 L32 12.6 L26 14 Z" fill="#e53935"/>' +
    '<path d="M12 9 L20 9 L18 4 L14 4 Z" fill="#b71c1c"/>' +
    '<path d="M12 13.6 L20 13.6 L18 18 L14 18 Z" fill="#8e1f1f"/>' +
    '<path d="M5 6 L8 12 L5 18 L3.4 18 L3.4 6 Z" fill="#6d4c41"/>' +
    '<path d="M20 9.2 L25 9 L24 6.4 L21.5 6.4 Z" fill="#4fc3f7"/>' +
    '<path d="M8 8.6 L11.5 8.6 L11 6 L9 6 Z" fill="#37474f"/>' +
    '<circle cx="4.2" cy="12" r="1.5" fill="#9e9e9e"/>' +
    '</g></svg>';

  // Jet fighter: swept delta, bubble canopy, twin tails, afterburner glow.
  var JET = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 22">' +
    '<g stroke="#15202b" stroke-width="0.9" stroke-linejoin="round">' +
    '<path d="M2 11.6 L6 10 L27 9.2 L33.5 11 L33.5 12.2 L27 13.6 L6 13.2 Z" fill="#455a64"/>' +
    '<path d="M27 9.2 L33.5 11 L33.5 12.2 L27 13.6 Z" fill="#546e7a"/>' +
    '<path d="M14 10 L24 10 L15 3.5 L11 3.5 Z" fill="#37474f"/>' +
    '<path d="M14 12.8 L24 12.8 L15 19 L11 19 Z" fill="#2b3a42"/>' +
    '<path d="M6 10.2 L11 10.2 L9 5.6 L6.6 5.6 Z" fill="#37474f"/>' +
    '<path d="M22 9.6 L28 9.4 L26.6 6.6 L23.6 6.6 Z" fill="#80d8ff"/>' +
    '<path d="M2 11.6 L6 10 L6 13.2 Z" fill="#ff7043"/>' +
    '<rect x="0.6" y="10.9" width="2.2" height="1.6" rx="0.7" fill="#ffd54f" stroke="none"/>' +
    '</g></svg>';

  function boot(tries) {
    var BP = window.__BP__;
    var table = null;
    if (BP) { try { table = BP.require('2').b; } catch (e) { table = null; } }
    if (!table || !table.plane1) {
      if ((tries || 0) < 100) return setTimeout(function () { boot((tries || 0) + 1); }, 100);
      return;
    }
    var done = 0;
    var tally = function (ok) { if (ok) done++; };
    repaint(table.plane1, PROP, tally);
    repaint(table.plane2, JET, tally);
    // NOTE: an earlier version also re-sampled pilot/missile/barn/cow up to 4x
    // from their own canvases. That was wrong and it showed: upscaling raster
    // art invents no detail, it only blurs, and those sprites came out visibly
    // softer than stock. Supersampling only pays when there is vector art to
    // rasterise at the higher size, so it is applied to the two planes alone.
    window.__BP_MODS__ = { applied: true, planes: done, supersample: SS };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { boot(0); });
  else boot(0);
}());
