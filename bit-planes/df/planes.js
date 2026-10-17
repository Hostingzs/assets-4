/* Dogfight — aircraft roster  (flag: roster)
 *
 * Five aircraft with genuinely different handling, their own art, and a picker
 * on the menu.
 *
 * Stats are MULTIPLIERS on the phase 1 flight model rather than absolute
 * numbers, so retuning the model retunes the whole roster coherently instead of
 * invalidating five hand-balanced stat blocks.
 *
 * Sprites: the bundle gives every aircraft the same shared sprite object, so
 * `plane.sprite` is reassigned per aircraft on first sight. New sprite objects
 * are built by cloning an existing one's prototype - the sprite class itself is
 * module-private and cannot be constructed from out here.
 */
(function () {
  'use strict';
  var DF = window.__DF__;
  if (!DF) return;
  var SS = 4;

  var ROSTER = [
    { id: 'f22', name: 'F-22 Raptor', role: 'Air superiority',
      lift: 0.95, drag: 0.85, thrust: 1.35, turn: 1.25, life: 3, ammo: 16, missiles: 3,
      blurb: 'Thrust vectoring. Points where you ask, fast.' },
    { id: 'f18', name: 'F/A-18 Hornet', role: 'Multirole',
      lift: 1.05, drag: 1.00, thrust: 1.05, turn: 1.00, life: 4, ammo: 18, missiles: 2,
      blurb: 'Forgiving and tough. Good at everything.' },
    { id: 'su57', name: 'Su-57 Felon', role: 'Agile fighter',
      lift: 0.92, drag: 0.88, thrust: 1.30, turn: 1.40, life: 3, ammo: 15, missiles: 3,
      blurb: 'Turns tighter than anything with engines.' },
    { id: 'f47', name: 'F-47', role: 'Sixth generation',
      lift: 0.85, drag: 0.72, thrust: 1.55, turn: 1.10, life: 3, ammo: 14, missiles: 4,
      blurb: 'Tailless and very fast. Thin margins low down.' },
    { id: 'b21', name: 'B-21 Raider', role: 'Stealth bomber',
      lift: 1.25, drag: 1.30, thrust: 0.80, turn: 0.62, life: 6, ammo: 22, missiles: 6,
      blurb: 'A flying wing full of ordnance. Turns like weather.' }
  ];
  DF.roster = ROSTER;
  var byId = {};
  ROSTER.forEach(function (r) { byId[r.id] = r; });
  // A pick saved against an older roster would leave the menu with nothing
  // highlighted and silently fly the first aircraft instead.
  if (!byId[DF.plane]) DF.setPlane(ROSTER[0].id);

  /* --- art -----------------------------------------------------------------
     36x22, nose to the RIGHT, matching the stock silhouette so the engine's
     rotation, muzzle offset and collision circles still line up. Side-view
     interpretations drawn for this build: each is built from its own
     recognisable planform - the Raptor's canted twin tails and diamond wing,
     the Hornet's LERX, the Felon's widely spaced nacelles, the F-47's tailless
     delta with canards, the Raider's blended flying wing. */
  function svg(body) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 22">' +
      '<g stroke="#101720" stroke-width="0.45" stroke-linejoin="round" stroke-linecap="round">' +
      body + '</g></svg>';
  }
  var ART = {
    /* Earlier passes built all three fighters from ONE construction - two fins,
       a wing up, a wing down, a lens fuselage - and varied only the numbers and
       the colour. Predictably they read as one aircraft in three paint schemes.
       Real airframes are told apart by FURNITURE, not proportion, so each one
       here is drawn around the features that actually identify it:

         F-22    rectangular 2D vectoring nozzles, oversized fins at the very
                 tail, hard chine line the length of the nose
         F/A-18  the LEX fillet sweeping up to the canopy, small fins set
                 FORWARD so the round nozzles show behind them
         Su-57   IRST ball ahead of the canopy, dorsal spine, nacelles spaced
                 wide with the tail stinger between them
         F-47    tailless: canards, no vertical surface anywhere
         B-21    flying wing: no fuselage, no fin, sawtooth trailing edge     */

    /* F-22 RAPTOR. Long flat deck, hard chine, fins raked back over the
       tail, and the square 2D vectoring nozzles nothing else here has. */
    f22: svg(
      '<path d="M5.2 10.0 L11.4 9.6 L9.4 3.6 L7.0 4.2 Z" fill="#4b5561"/>' +
      '<path d="M12.0 10.2 L21.6 9.8 L18.2 6.6 L14.6 6.9 Z" fill="#5d6875"/>' +
      '<path d="M6.4 13.4 L12.0 13.2 L9.0 16.4 L5.0 16.0 Z" fill="#59636f"/>' +
      '<path d="M4.4 10.8 L4.6 13.4 L11.5 14.6 L22 14.4 L29.8 13.1 L35.4 11.7 ' +
      'L29.6 10.0 L21 9.1 L12 9.2 Z" fill="#aab6c2"/>' +
      '<path d="M4.4 10.8 L12 9.2 L21 9.1 L29.6 10.0 L35.4 11.7 L28 11.3 L14 11.4 Z" fill="#c9d4de"/>' +
      '<path d="M14 11.55 L29.6 10.35 L35.4 11.7" stroke="#6a7683" stroke-width="0.32" fill="none"/>' +
      '<path d="M12.6 13.8 L21.6 13.6 L17.6 18.2 L13.6 17.8 Z" fill="#8e9aa7"/>' +
      '<path d="M8.4 9.8 L15.0 9.4 L12.8 2.4 L10.2 3.0 Z" fill="#93a0ad"/>' +
      '<path d="M17.4 12.9 L23.2 12.6 L22.4 14.3 L17.2 14.4 Z" fill="#39414a"/>' +
      '<path d="M23.4 8.9 L29.6 8.8 L28.6 6.0 L24.6 6.4 Z" fill="#b8ecff"/>' +
      '<path d="M24.2 8.5 L28.8 8.4 L28.2 6.9 L25.2 7.1 Z" fill="#e2f8ff" stroke="none" opacity="0.65"/>' +
      '<rect x="2.5" y="10.5" width="3.4" height="1.5" fill="#333b44" stroke="none"/>' +
      '<rect x="2.5" y="12.3" width="3.4" height="1.5" fill="#262d35" stroke="none"/>' +
      '<path d="M2.5 10.5 L2.5 13.8" stroke="#161b21" stroke-width="0.45" fill="none"/>'),

    /* F/A-18 SUPER HORNET. Navy. Short and deep, the LEX fillet running up to
       the cockpit, and small fins set forward of round nozzles. */
    f18: svg(
      '<ellipse cx="4.8" cy="11.1" rx="1.9" ry="1.4" fill="#22384f"/>' +
      '<ellipse cx="4.5" cy="12.9" rx="1.9" ry="1.4" fill="#182a3d"/>' +
      '<ellipse cx="3.9" cy="12.9" rx="0.95" ry="0.85" fill="#0d1721" stroke="none"/>' +
      '<path d="M9.0 10.2 L13.6 9.9 L11.8 5.6 L9.8 6.0 Z" fill="#21374d"/>' +
      '<path d="M13.6 10.4 L21.6 10.0 L18.0 7.4 L14.8 7.7 Z" fill="#2a4462"/>' +
      '<path d="M8.6 13.2 L13.8 13.0 L10.8 16.2 L7.0 15.8 Z" fill="#22394f"/>' +
      '<path d="M6.0 11.0 L6.2 13.4 L12 14.6 L23 14.2 L30.4 12.9 L33.4 11.8 ' +
      'L30.2 10.5 L23 9.6 L13 9.7 Z" fill="#3a5b7d"/>' +
      '<path d="M6.0 11.0 L13 9.7 L23 9.6 L30.2 10.5 L33.4 11.8 L26 11.5 L14 11.8 Z" fill="#527a9e"/>' +
      '<path d="M14.0 10.0 L20 9.5 L26.6 9.1 L28.8 9.5 L20 10.5 L15.4 10.7 Z" fill="#7396b3"/>' +
      '<path d="M13.2 13.6 L21.6 13.4 L17.8 17.4 L13.4 17.0 Z" fill="#34567a"/>' +
      '<path d="M16.6 12.4 L22.4 12.1 L22.4 13.9 L16.4 14.0 Z" fill="#14263a"/>' +
      '<path d="M11.6 10.2 L16.2 9.9 L14.6 6.2 L12.6 6.6 Z" fill="#43698f"/>' +
      '<path d="M23.2 9.6 L29.0 9.5 L27.6 6.7 L24.2 7.0 Z" fill="#b8ecff"/>' +
      '<path d="M26.0 9.55 L25.8 6.9" stroke="#1e3348" stroke-width="0.32" fill="none"/>' +
      '<path d="M29.6 9.8 L32.8 10.4 L32.8 10.9 L29.6 10.4 Z" fill="#2c4763" stroke="none"/>' +
      '<path d="M13 12.3 L30.2 11.1" stroke="#f0c04a" stroke-width="0.28" fill="none" opacity="0.5"/>'),

    /* Su-57 FELON. Longest and slimmest. Nacelles spaced wide with the tail
       stinger between them, dorsal spine, IRST ball ahead of the windscreen. */
    su57: svg(
      '<path d="M0.7 11.6 L5.8 11.3 L5.8 12.6 L0.7 12.3 Z" fill="#39434f"/>' +
      '<ellipse cx="3.4" cy="10.3" rx="2.1" ry="1.2" fill="#313a47"/>' +
      '<ellipse cx="3.2" cy="13.7" rx="2.1" ry="1.2" fill="#29313d"/>' +
      '<ellipse cx="2.6" cy="13.7" rx="1.0" ry="0.75" fill="#141920" stroke="none"/>' +
      '<path d="M6.2 10.4 L11.6 10.1 L9.4 5.2 L7.2 5.7 Z" fill="#2b3441"/>' +
      '<path d="M11.4 10.6 L21.8 10.2 L16.4 7.6 L12.2 8.0 Z" fill="#394456"/>' +
      '<path d="M6.8 13.4 L12.2 13.2 L9.2 16.6 L5.4 16.2 Z" fill="#333c49"/>' +
      '<path d="M2.8 10.9 L3.0 13.3 L8 14.3 L20 14.0 L29 12.9 L35.5 11.9 ' +
      'L29.2 10.6 L20 9.9 L9 10.1 Z" fill="#4b576b"/>' +
      '<path d="M2.8 10.9 L9 10.1 L20 9.9 L29.2 10.6 L35.5 11.9 L26 11.4 L11 11.7 Z" fill="#69768f"/>' +
      '<path d="M9 10.4 L17 9.7 L25 9.65 L28 9.85 L17 10.05 Z" fill="#5c6982" stroke="none"/>' +
      '<path d="M6.0 12.2 L14 12.05 L14 12.85 L6.0 13.0 Z" fill="#2d3542" stroke="none" opacity="0.75"/>' +
      '<path d="M10.8 10.5 L15.4 10.2 L13.4 4.9 L11.2 5.4 Z" fill="#59667c"/>' +
      '<path d="M11.6 13.6 L21.4 13.4 L16.2 17.0 L11.8 16.6 Z" fill="#47546b"/>' +
      '<path d="M21.6 10.4 L26.4 10.0 L25.6 9.0 L22.0 9.6 Z" fill="#66738b"/>' +
      '<path d="M25.6 10.1 L31.4 10.0 L30.0 7.4 L26.6 7.7 Z" fill="#b8ecff"/>' +
      '<circle cx="32.2" cy="10.4" r="1.0" fill="#39424f"/>' +
      '<circle cx="32.4" cy="10.25" r="0.42" fill="#9dc4d8" stroke="none"/>' +
      '<circle cx="18.6" cy="11.45" r="0.8" fill="#c0392b" stroke="none"/>'),

    // F-47 - TAILLESS. No vertical surface at all; canards up front instead.
    f47: svg(
      '<path d="M9 11.0 L25 10.4 L17 3.6 L8 4.4 Z" fill="#232a34"/>' +
      '<path d="M8.6 13.4 L24 13.2 L16 20.0 L7.8 19.2 Z" fill="#1c222b"/>' +
      '<path d="M25.6 10.3 L30.4 10.1 L29.2 8.0 L26.4 8.2 Z" fill="#2b323e"/>' +
      '<path d="M25.4 13.2 L30.0 13.2 L28.8 15.2 L26.2 15.1 Z" fill="#242a35"/>' +
      '<path d="M3.6 12.9 L6.4 10.8 L18 10.0 L28 9.9 L34 11.0 L35.6 11.9 L34 12.8 L27 13.6 L9 14.3 Z" fill="#2b323e"/>' +
      '<path d="M6.4 10.8 L18 10.0 L28 9.9 L34 11.0 L27 11.5 L11 11.9 Z" fill="#3c4552"/>' +
      '<path d="M27.4 10.2 L32 10.1 L30.8 8.2 L28.2 8.3 Z" fill="#9fe0ff"/>' +
      '<path d="M12 12.3 L32 11.8" stroke="#1a1f27" stroke-width="0.35" fill="none"/>' +
      '<rect x="2.6" y="11.6" width="2.4" height="1.7" rx="0.7" fill="#141920" stroke="none"/>' +
      '<rect x="2.9" y="11.95" width="1.5" height="1.0" rx="0.5" fill="#7fd4ff" stroke="none"/>'),

    // B-21 - flying wing. No fins, no fuselage, sawtooth trailing edge.
    b21: svg(
      '<path d="M2.2 12.6 L6.6 10.0 L14 8.6 L23 8.4 L30 9.4 L34.8 11.3 L35.6 12.2 ' +
      'L33 13.3 L26 14.5 L16 15.5 L7.6 15.3 Z" fill="#333941"/>' +
      '<path d="M6.6 10.0 L14 8.6 L23 8.4 L30 9.4 L34.8 11.3 L26 11.9 L14 12.4 Z" fill="#464e58"/>' +
      '<path d="M17 8.7 L24 8.5 L22.4 6.6 L18.6 6.7 Z" fill="#3d444e"/>' +
      '<path d="M20.6 8.6 L23.8 8.5 L23 7.1 L21.2 7.2 Z" fill="#8fd6f2"/>' +
      '<path d="M7.6 15.3 L16 15.5 L14 17.1 L12.4 15.6 L10.8 17.3 L9.2 15.4 Z" fill="#272c33"/>' +
      '<path d="M16 15.5 L26 14.5 L24 16.4 L22.4 15.0 L20.6 16.7 L19 15.2 Z" fill="#272c33"/>' +
      '<path d="M9.5 12.7 L31 12.0" stroke="#242930" stroke-width="0.45" fill="none"/>' +
      '<path d="M8.5 13.9 L27 13.1" stroke="#242930" stroke-width="0.35" fill="none"/>' +
      '<rect x="4.6" y="11.4" width="3.6" height="1.0" rx="0.35" fill="#565e69" stroke="none"/>' +
      '<rect x="4.6" y="13.0" width="3.6" height="1.0" rx="0.35" fill="#565e69" stroke="none"/>')
  };

  DF._art = ART;         // exposed so art can be rendered and reviewed
  var sprites = {};      // id -> sprite object usable as plane.sprite
  DF._sprites = sprites;
  var table = null;

  /* The stock plane is 36x22 in world units - barely larger than a cow, and
     small enough that none of the airframe detail reads at all. Everything
     that depends on the size scales with it below. */
  var SIZE = 1.55;

  function cloneSprite(base) {
    var s = Object.create(Object.getPrototypeOf(base));
    s.width = base.width * SIZE; s.height = base.height * SIZE;
    s.scale = base.scale; s.dpr = base.dpr;
    s.canvas = document.createElement('canvas');
    s.canvas.width = base.width * SS;
    s.canvas.height = base.height * SS;
    return s;
  }

  function paint(sprite, svgText) {
    var img = new Image();
    img.onload = function () {
      var c = sprite.canvas.getContext('2d');
      var w = sprite.canvas.width, h = sprite.canvas.height;
      c.clearRect(0, 0, w, h);
      c.imageSmoothingEnabled = true;
      /* MIRRORED. The art is drawn nose-right because that is the natural way
         to draw it, but the engine's forward vector is (-cos a, -sin a): at
         angle 0 an aircraft travels toward -x while its sprite is unrotated,
         so the nose has to sit at canvas LEFT. The stock biplane is drawn that
         way too - propeller at the left edge. Getting this wrong flies every
         aircraft tail-first.
         The collision circles look like they say otherwise: they put a raised
         trio at x -12..-5 and a blob at +14. That trio is the biplane's UPPER
         WING, not its fin. Trust the rendered sprite, not the hitbox. */
      c.save();
      c.translate(w, 0);
      c.scale(-1, 1);
      c.drawImage(img, 0, 0, w, h);
      c.restore();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
  }

  function buildSprites() {
    if (table) return true;
    try { table = window.__BP__.require('2').b; } catch (e) { return false; }
    if (!table || !table.plane1) { table = null; return false; }
    ROSTER.forEach(function (r) {
      var s = cloneSprite(table.plane1);
      paint(s, ART[r.id]);
      sprites[r.id] = s;
    });
    return true;
  }

  /* --- assignment ---------------------------------------------------------
     The human flies their pick; bots are spread across the roster so a match
     shows the whole cast and the stat spread actually matters. Assignment is
     sticky per aircraft instance via a hidden property. */
  var botCursor = 0;

  function entryFor(M) {
    if (M.__dfType) return M.__dfType;
    var pick = null;
    try {
      if (M.player && M.player.isHuman) pick = byId[DF.plane] || ROSTER[0];
    } catch (e) {}
    if (!pick) { pick = ROSTER[botCursor % ROSTER.length]; botCursor++; }
    M.__dfType = pick;

    // Apply the one-shot stats. Health and magazines are absolute, not
    // multipliers, so they are written once when the aircraft is first seen.
    try {
      M.life = pick.life;
      M.maxAmmo = pick.ammo; M.ammo = pick.ammo;
      M.maxMissiles = pick.missiles; M.missiles = pick.missiles;
      if (buildSprites() && sprites[pick.id]) M.sprite = sprites[pick.id];

      /* Grow the hitbox with the sprite. The circles are hardcoded in the
         constructor against the 36x22 art, and the muzzle offset is derived
         from `radius` (bullets spawn at position + forward * (radius + 5)),
         so leaving these alone would put the guns inside the nose and let
         shots pass visibly through the airframe. */
      if (!M.__dfScaled) {
        M.__dfScaled = true;
        if (M.circles) {
          for (var ci = 0; ci < M.circles.length; ci++) {
            var cc = M.circles[ci];
            cc.v.x *= SIZE; cc.v.y *= SIZE; cc.r *= SIZE;
          }
        }
        if (typeof M.radius === 'number') M.radius *= SIZE;
      }
    } catch (e) {}
    return pick;
  }

  /* Resting height of a landed aircraft. The engine hardcodes `ground - 7`,
     a number tuned to the stock 36x22 airframe. Scaling the collision circles
     by SIZE without scaling this made takeoff impossible: above speed 45 the
     plane unsticks, but its now-larger circles still dip below ground at the
     pinned attitude, so the very next step re-lands it. The result was an
     aircraft stuck at altitude 7 flickering between landed and airborne,
     never climbing, at full thrust. */
  DF.groundRest = function (M) {
    return 7 * (M && M.__dfScaled ? SIZE : 1);
  };

  /** Consumed by df/flight.js for the per-aircraft handling multipliers. */
  DF.planeStats = function (M) {
    if (!DF.flags.roster) return null;
    return entryFor(M);
  };

  /* --- menu picker -------------------------------------------------------- */
  function injectPicker() {
    var form = document.querySelector('form#game');
    if (!form || document.querySelector('.df-picker')) return;
    var wrap = document.createElement('div');
    wrap.className = 'df-picker';
    var head = document.createElement('p');
    head.innerHTML = '<strong>Aircraft:</strong>';
    wrap.appendChild(head);
    var row = document.createElement('div');
    row.className = 'df-cards';
    ROSTER.forEach(function (r) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'df-card' + (DF.plane === r.id ? ' on' : '');
      b.dataset.id = r.id;
      var cv = document.createElement('canvas');
      cv.width = 108; cv.height = 66; cv.className = 'df-card-art';
      var im = new Image();
      im.onload = function () {
        var c = cv.getContext('2d');
        c.imageSmoothingEnabled = true;
        c.drawImage(im, 0, 0, cv.width, cv.height);
      };
      im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART[r.id]);
      b.appendChild(cv);
      var nm = document.createElement('b'); nm.textContent = r.name; b.appendChild(nm);
      var ro = document.createElement('i'); ro.textContent = r.role; b.appendChild(ro);
      var st = document.createElement('span');
      st.textContent = 'HP ' + r.life + ' · ammo ' + r.ammo + ' · msl ' + r.missiles;
      b.appendChild(st);
      var bl = document.createElement('em'); bl.textContent = r.blurb; b.appendChild(bl);
      b.addEventListener('click', function () {
        DF.setPlane(r.id);
        [].forEach.call(row.children, function (c) { c.classList.remove('on'); });
        b.classList.add('on');
      });
      row.appendChild(b);
    });
    wrap.appendChild(row);
    var action = form.querySelector('.action');
    if (action) form.insertBefore(wrap, action); else form.appendChild(wrap);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPicker);
  } else injectPicker();
}());
