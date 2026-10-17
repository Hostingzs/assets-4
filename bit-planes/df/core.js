/* Dogfight — core
 *
 * Loaded BEFORE index.js. Owns configuration, the graphics tier, feature flags,
 * the hook registry the bundle delegates into, and the telemetry probe every
 * later phase is verified with.
 *
 * The bundle calls into this object from ~8 one-line hook points. Each hook
 * returns truthy to mean "handled, skip the original". With every flag off,
 * every hook is absent and the game runs exactly as stock — that is the Phase 0
 * gate and it is worth keeping true forever, because it makes bisecting a
 * regression trivial.
 */
(function () {
  'use strict';

  var KEY = 'dogfight.cfg';

  /* Bump FLAG_VERSION whenever a shipped flag default changes. Saved configs
     pin whatever the defaults were on the day they were written, so without
     this a returning player keeps every new system switched off forever -
     exactly what happened when the roster shipped and existing profiles kept
     roster:false. Personal choices (quality, aircraft) are never reset. */
  var FLAG_VERSION = 6;

  var DEFAULTS = {
    quality: 'auto',        // auto | low | medium | ultra
    plane: 'f22',           // roster pick (phase 3)
    flags: {
      flight: true,         // phase 1 — new flight model
      bots: true,           // phase 2 — new AI
      roster: true,         // phase 3 — aircraft stats
      world: true,          // phase 4 — painterly layers, camera, minimap
      weapons: true,        // phase 5
      feedback: true        // phase 6
    }
  };

  function load() {
    var c;
    try { c = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { c = null; }
    c = c || {};
    var out = { quality: c.quality || DEFAULTS.quality, plane: c.plane || DEFAULTS.plane, flags: {} };
    var stale = c.v !== FLAG_VERSION;
    for (var k in DEFAULTS.flags) {
      out.flags[k] = (!stale && typeof (c.flags || {})[k] === 'boolean')
        ? c.flags[k] : DEFAULTS.flags[k];
    }
    return out;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify({ v: FLAG_VERSION, quality: DF.quality, plane: DF.plane, flags: DF.flags })); }
    catch (e) {}
  }

  /* Quality auto-detect. Deliberately crude and pessimistic: the target machine
     is a school Chromebook, and guessing "ultra" wrong costs a stuttering game
     while guessing "low" wrong costs some prettiness. Cores and memory are the
     only signals available without running a benchmark, and the runtime FPS
     probe below can still demote us later. */
  function detect() {
    var cores = navigator.hardwareConcurrency || 2;
    var mem = navigator.deviceMemory || 2;
    if (cores >= 8 && mem >= 8) return 'ultra';
    if (cores >= 4 && mem >= 4) return 'medium';
    return 'low';
  }

  var cfg = load();

  var DF = {
    name: 'Dogfight',
    quality: cfg.quality,
    plane: cfg.plane,
    flags: cfg.flags,

    /** Resolved tier: never returns 'auto'. */
    tier: function () { return this.quality === 'auto' ? (this._auto || (this._auto = detect())) : this.quality; },

    setQuality: function (q) { this.quality = q; this._auto = null; save(); },
    setPlane: function (p) { this.plane = p; save(); },
    setFlag: function (k, v) { this.flags[k] = !!v; save(); },

    /* Telemetry. Phase gates are measured, not eyeballed, so this has to be
       cheap enough to leave on: a ring buffer of frame times plus counters any
       system can push into. */
    tm: {
      frames: 0, dtSum: 0, worst: 0, ring: new Float32Array(180), i: 0, marks: {},
      reset: function () { this.frames = 0; this.dtSum = 0; this.worst = 0; this.i = 0; this.marks = {}; },
      mark: function (k, v) { this.marks[k] = (this.marks[k] || 0) + (v === undefined ? 1 : v); },
      stats: function () {
        var n = Math.min(this.frames, this.ring.length), s = [];
        for (var i = 0; i < n; i++) s.push(this.ring[i]);
        s.sort(function (a, b) { return a - b; });
        var pct = function (p) { return n ? +s[Math.min(n - 1, Math.floor(n * p))].toFixed(2) : 0; };
        return {
          frames: this.frames,
          fpsMean: this.dtSum ? +(this.frames / this.dtSum).toFixed(1) : 0,
          msMedian: pct(0.5), ms95: pct(0.95), msWorst: +this.worst.toFixed(2),
          marks: this.marks, tier: DF.tier()
        };
      }
    },

    /** Called once per rendered frame from the bundle's loop. */
    frame: function (dt) {
      var t = this.tm, ms = dt * 1000;
      t.frames++; t.dtSum += dt;
      if (ms > t.worst) t.worst = ms;
      t.ring[t.i] = ms; t.i = (t.i + 1) % t.ring.length;
    }
  };

  window.__DF__ = DF;
  window.DF = DF; // console convenience
}());
