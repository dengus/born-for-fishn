(function () {
  "use strict";
  var KEY = "born-for-fishn-v1";
  var SPECIES = {
    spotty: { name: "Spotty", points: 10, price: 4, body: "#ff9f1c", belly: "#ffe08a", spots: true },
    yellowbelly: { name: "Yellowbelly", points: 25, price: 10, body: "#e09f3e", belly: "#ffe66d" },
    barra: { name: "Barramundi", points: 50, price: 22, body: "#d6e4ee", belly: "#f7fbff", tall: true },
    cod: { name: "Murray cod", points: 100, price: 45, body: "#6b8f71", belly: "#d5e2c8", mottled: true }
  };
  var UPGRADES = [
    { id: "pole", name: "Fishing pole", price: 18, effect: "A sturdy teal pole on the bank. Casts already reach every bit of water." },
    { id: "line", name: "Fishing line", price: 26, effect: "Wind in faster. A snag will not snap this line. A snapped line only loses that cast." },
    { id: "bait", name: "Bait", price: 8, effect: "Fish bite more often when the hook passes close. A green ring shows the bigger bite." },
    { id: "berley", name: "Berley", price: 12, effect: "Sprinkle berley. Fish swim over to the cloud." },
    { id: "net", name: "Net", price: 30, effect: "Scoop one nearby fish, once each visit to a spot." },
    { id: "hat", name: "Hat", price: 10, effect: "A lucky hat on your head. The shop pays 25% more." },
    { id: "sunscreen", name: "Sunscreen", price: 14, effect: "Fewer snags grab the line. You get a shiny nose." },
    { id: "clothes", name: "Clothes", price: 22, effect: "A colourful shirt. Every fish sells for $2 more." }
  ];
  var LEVELS = [
    {
      id: "home", name: "Home Pond", sky: "#9ad9ff", waterTop: "#8fd8f2", waterBottom: "#1a8cb5",
      snags: [],
      fish: [
        { sp: "spotty", x: 0.50, y: 0.80, ax: 0.06, ay: 0.03, spd: 1.15, ph: 0.2 },
        { sp: "spotty", x: 0.20, y: 0.62, ax: 0.07, ay: 0.04, spd: 0.95, ph: 1.1 },
        { sp: "spotty", x: 0.82, y: 0.70, ax: 0.06, ay: 0.035, spd: 1.25, ph: 2.2 },
        { sp: "yellowbelly", x: 0.30, y: 0.46, ax: 0.08, ay: 0.04, spd: 0.8, ph: 0.4 },
        { sp: "yellowbelly", x: 0.72, y: 0.50, ax: 0.08, ay: 0.04, spd: 1.0, ph: 1.8 }
      ]
    },
    {
      id: "creek", name: "Snag Creek", sky: "#c6edd6", waterTop: "#8ed6c4", waterBottom: "#1d7a78",
      snags: [
        { kind: "log", x: 0.16, y: 0.62 },
        { kind: "weed", x: 0.84, y: 0.52 },
        { kind: "boot", x: 0.18, y: 0.36 }
      ],
      fish: [
        { sp: "yellowbelly", x: 0.40, y: 0.60, ax: 0.10, ay: 0.06, spd: 0.9, ph: 0.5 },
        { sp: "yellowbelly", x: 0.62, y: 0.52, ax: 0.09, ay: 0.07, spd: 1.05, ph: 1.5 },
        { sp: "barra", x: 0.46, y: 0.42, ax: 0.08, ay: 0.10, spd: 0.72, ph: 2.1 },
        { sp: "barra", x: 0.70, y: 0.48, ax: 0.10, ay: 0.08, spd: 0.88, ph: 0.9 }
      ]
    },
    {
      id: "deep", name: "Deeper Water", sky: "#b9d6ff", waterTop: "#79b7e6", waterBottom: "#2457a6",
      snags: [
        { kind: "weed", x: 0.14, y: 0.46 },
        { kind: "log", x: 0.86, y: 0.40 },
        { kind: "boot", x: 0.80, y: 0.66 },
        { kind: "weed", x: 0.18, y: 0.26 }
      ],
      fish: [
        { sp: "barra", x: 0.34, y: 0.50, ax: 0.08, ay: 0.11, spd: 0.7, ph: 0.3 },
        { sp: "barra", x: 0.58, y: 0.44, ax: 0.10, ay: 0.10, spd: 0.86, ph: 1.2 },
        { sp: "cod", x: 0.48, y: 0.32, ax: 0.07, ay: 0.13, spd: 0.55, ph: 0.7 },
        { sp: "cod", x: 0.70, y: 0.38, ax: 0.09, ay: 0.12, spd: 0.62, ph: 2.3 }
      ]
    }
  ];
  var GEAR_IDS = ["pole", "line", "bait", "berley", "net", "hat", "sunscreen", "clothes"];

  function freshState() {
    var gear = {};
    GEAR_IDS.forEach(function (id) { gear[id] = false; });
    return {
      money: 0, gear: gear, best: null,
      creel: { spotty: 0, yellowbelly: 0, barra: 0, cod: 0 },
      caught: {}, helpSeen: false, sound: true
    };
  }
  function loadState() {
    var base = freshState();
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || typeof raw !== "object") return base;
      if (Number.isFinite(raw.money) && raw.money >= 0) base.money = Math.floor(raw.money);
      GEAR_IDS.forEach(function (id) { base.gear[id] = !!(raw.gear && raw.gear[id]); });
      if (raw.best && raw.best.name && Number.isFinite(raw.best.points)) {
        base.best = { name: String(raw.best.name), points: raw.best.points, sp: raw.best.sp || "" };
      }
      Object.keys(base.creel).forEach(function (sp) {
        var n = raw.creel && raw.creel[sp];
        base.creel[sp] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
      });
      if (raw.caught && typeof raw.caught === "object") base.caught = raw.caught;
      base.helpSeen = !!raw.helpSeen;
      if (typeof raw.sound === "boolean") base.sound = raw.sound;
    } catch (e) {}
    return base;
  }
  var state = loadState();
  var allowSave = true;
  function save() {
    if (!allowSave) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  LEVELS.forEach(function (loc) {
    var prev = Array.isArray(state.caught[loc.id]) ? state.caught[loc.id] : [];
    state.caught[loc.id] = loc.fish.map(function (_, i) { return !!prev[i]; });
  });
  var runtime = LEVELS.map(function (loc) {
    return {
      id: loc.id, name: loc.name, sky: loc.sky, waterTop: loc.waterTop, waterBottom: loc.waterBottom,
      snags: loc.snags.map(function (s, i) {
        return { id: loc.id + "-snag-" + i, kind: s.kind, x: s.x, y: s.y };
      }),
      fish: loc.fish.map(function (f, i) {
        return {
          id: loc.id + "-" + i, locId: loc.id, index: i, sp: f.sp,
          ox: f.x, oy: f.y, x: f.x, y: f.y, ax: f.ax, ay: f.ay, spd: f.spd, ph: f.ph,
          caught: !!state.caught[loc.id][i], flee: 0, fleeX: 0, fleeY: 0, facing: 1, px: null
        };
      })
    };
  });

  var canvas = document.getElementById("pond");
  var ctx = canvas.getContext("2d");
  var W = 400, H = 500, S = 1;
  var water = { x: 0, y: 40, w: 400, h: 400 };
  var angler = { x: 200, y: 480 };
  var bankH = 50, skyH = 40;
  var currentId = "home";
  var phase = "idle";
  var hook = null, castFrom = null, castTo = null, flyT = 0;
  var aim = null, aimed = false;
  var drag = null, dragWind = 0;
  var windingHeld = false, windPulse = 0;
  var checked = new Set(), snagChecked = new Set();
  var currentSnag = null, snagTug = 0, snagPulls = 0, haulId = null;
  var t = 0, berley = null, berleyT = 0, netUsed = false, toastTimer = 0;
  var floaters = [], splashes = [];
  var shopOpen = false, basketOpen = false;
  var rng = Math.random, audioCtx = null, prevW = 0, prevH = 0;

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function currentLoc() { return runtime.filter(function (l) { return l.id === currentId; })[0]; }
  function locById(id) { return runtime.filter(function (l) { return l.id === id; })[0]; }
  function liveCount(loc) { return loc.fish.filter(function (f) { return !f.caught; }).length; }
  function cleared(loc) { return liveCount(loc) === 0; }
  function levelIndex(id) {
    for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) return i;
    return -1;
  }
  function isUnlocked(loc) {
    var i = levelIndex(loc.id);
    if (i <= 0) return true;
    return cleared(locById(LEVELS[i - 1].id));
  }
  function totalCreel() {
    var n = 0;
    Object.keys(state.creel).forEach(function (k) { n += state.creel[k] || 0; });
    return n;
  }
  function waterPad() { return Math.max(12, 16 * Math.max(S, 0.85)); }
  function windSpeed() { return state.gear.line ? 520 : 270; }
  function biteRadius() { return (state.gear.bait ? 58 : 36) * Math.max(S, 0.85); }
  function biteChance() { return state.gear.bait ? 0.9 : 0.6; }
  function snagRadius() {
    var base = 26 * Math.max(S, 0.82);
    return state.gear.sunscreen ? base * 0.7 : base;
  }
  function saleEach(sp) {
    var p = SPECIES[sp].price, notes = [];
    if (state.gear.clothes) { p += 2; notes.push("shirt +$2"); }
    if (state.gear.hat) { p = Math.round(p * 1.25); notes.push("hat +25%"); }
    return { p: p, note: notes.join(", ") };
  }
  function snagPhrase(kind) {
    if (kind === "log") return "a log";
    if (kind === "weed") return "some weed";
    if (kind === "boot") return "an old boot";
    return "something";
  }
  function rodTip() { return { x: angler.x + 78 * S, y: angler.y - 150 * S }; }
  function toPx(nx, ny) { return { x: water.x + nx * water.w, y: water.y + ny * water.h }; }
  function fishXY(f) {
    var nx = f.x + Math.sin(t * f.spd + f.ph) * f.ax + f.fleeX * f.flee;
    var ny = f.y + Math.cos(t * f.spd * 0.73 + f.ph * 1.3) * f.ay + f.fleeY * f.flee;
    return toPx(clamp(nx, 0.06, 0.94), clamp(ny, 0.08, 0.9));
  }
  function layout() {
    S = clamp(Math.min(W, H) / 520, 0.72, 1.45);
    bankH = clamp(H * 0.11, 46, 92);
    skyH = clamp(H * 0.08, 26, 68);
    water = { x: 0, y: skyH, w: W, h: Math.max(20, H - skyH - bankH) };
    angler = { x: W * 0.5, y: H - 8 };
  }
  function resize() {
    var rect = canvas.getBoundingClientRect();
    var nw = rect.width, nh = rect.height;
    if (nw < 2 || nh < 2) return;
    if (prevW > 0 && prevH > 0 && hook) {
      var sx = nw / prevW, sy = nh / prevH;
      hook.x *= sx; hook.y *= sy;
      if (castTo) { castTo.x *= sx; castTo.y *= sy; }
      if (castFrom) { castFrom.x *= sx; castFrom.y *= sy; }
      if (aim) { aim.x *= sx; aim.y *= sy; }
    }
    prevW = nw; prevH = nh; W = nw; H = nh;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layout();
  }
  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    toastTimer = 3.6;
  }
  function floatText(x, y, text, color) {
    floaters.push({ x: x, y: y, text: text, color: color || "#143044", life: 1.35 });
  }
  function sfx(kind) {
    if (!state.sound) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      var o = audioCtx.createOscillator();
      var g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      var now = audioCtx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.07, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      o.type = "sine";
      if (kind === "cast") {
        o.frequency.setValueAtTime(440, now);
        o.frequency.exponentialRampToValueAtTime(180, now + 0.22);
      } else if (kind === "catch" || kind === "win") {
        o.type = "triangle";
        o.frequency.setValueAtTime(523, now);
        o.frequency.setValueAtTime(659, now + 0.09);
        o.frequency.setValueAtTime(784, now + 0.18);
      } else if (kind === "snap") {
        o.type = "triangle";
        o.frequency.setValueAtTime(160, now);
        o.frequency.exponentialRampToValueAtTime(55, now + 0.22);
      } else if (kind === "snag") {
        o.type = "square";
        o.frequency.setValueAtTime(180, now);
      } else {
        o.frequency.setValueAtTime(kind === "coin" ? 880 : 720, now);
      }
      o.start(now); o.stop(now + 0.3);
    } catch (e) {}
  }
  function helpOpen() { return !document.getElementById("help").hidden; }
  function paused() { return shopOpen || basketOpen || helpOpen(); }
  function resetCast() {
    phase = "idle"; hook = null; haulId = null; currentSnag = null;
    checked = new Set(); snagChecked = new Set(); snagTug = 0; snagPulls = 0; dragWind = 0;
  }
  function pickStart() {
    for (var i = 0; i < runtime.length; i++) {
      if (!isUnlocked(runtime[i])) break;
      if (!cleared(runtime[i])) return runtime[i].id;
    }
    return runtime[runtime.length - 1].id;
  }
  currentId = pickStart();
  function renderHud() {
    document.getElementById("money").textContent = "$" + state.money;
    document.getElementById("best").textContent = state.best
      ? ("Best: " + state.best.name + " " + state.best.points + " pts")
      : "Best: none yet";
    document.getElementById("basket-btn").textContent = "Basket " + totalCreel();
    document.getElementById("sound-btn").textContent = state.sound ? "Sound on" : "Sound off";
    var loc = currentLoc();
    var left = liveCount(loc);
    var bits = [loc.name, left === 0 ? "Cleared" : (left + " fish left")];
    if (state.gear.pole) bits.push("Teal pole");
    bits.push(state.gear.line ? "Strong line" : "Soft line");
    if (state.gear.bait) bits.push("Good bait");
    if (state.gear.sunscreen) bits.push("Sunscreen on");
    if (state.gear.berley) bits.push("Berley ready");
    document.getElementById("status").textContent = bits.join(" · ");
    document.body.dataset.fresh = state.best ? "0" : "1";
    document.getElementById("berley-btn").textContent = berleyT > 0 ? "Berley…" : "Berley";
    document.getElementById("net-btn").textContent = netUsed ? "Net used" : "Net";
  }
  function renderLocs() {
    var nav = document.getElementById("locs");
    nav.innerHTML = "";
    runtime.forEach(function (loc) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "locbtn" + (loc.id === currentId ? " on" : "") + (isUnlocked(loc) ? "" : " locked");
      b.dataset.id = loc.id;
      if (loc.id === currentId) b.setAttribute("aria-current", "true");
      var detail;
      if (!isUnlocked(loc)) {
        b.setAttribute("aria-disabled", "true");
        detail = "Locked";
      } else if (cleared(loc)) detail = "Cleared";
      else detail = liveCount(loc) + " left";
      b.innerHTML = loc.name + "<br><small>" + detail + "</small>";
      nav.appendChild(b);
    });
  }
  function goLoc(id) {
    var loc = locById(id);
    if (!loc) return;
    if (!isUnlocked(loc)) { toast("Catch the rest of this spot first."); return; }
    if (id === currentId) return;
    currentId = id;
    netUsed = false;
    resetCast();
    renderLocs();
    renderHud();
    var left = liveCount(loc);
    toast(left === 0 ? (loc.name + " stays clear.") : (loc.name + ". " + left + " fish left."));
  }
  function catchFish(f) {
    if (!f || f.caught) return;
    f.caught = true;
    state.caught[f.locId][f.index] = true;
    state.creel[f.sp] = (state.creel[f.sp] || 0) + 1;
    var spec = SPECIES[f.sp];
    if (!state.best || spec.points > state.best.points) {
      state.best = { name: spec.name, points: spec.points, sp: f.sp };
    }
    save();
    var loc = locById(f.locId);
    var left = liveCount(loc);
    if (left === 0) {
      var next = LEVELS[levelIndex(f.locId) + 1];
      toast(next ? (loc.name + " is clear! " + next.name + " is open.") : "Every spot is clear. You were born for fish'n!");
      sfx("win");
    } else {
      toast("A " + spec.name + " for the basket! " + left + " fish left here.");
      sfx("catch");
    }
    renderHud();
    renderLocs();
  }
  function clampCast(p) {
    var pad = waterPad();
    return {
      x: clamp(p.x, water.x + pad, water.x + water.w - pad),
      y: clamp(p.y, water.y + pad, water.y + water.h - pad)
    };
  }
  function defaultTarget() {
    return clampCast({ x: angler.x, y: water.y + water.h * 0.22 });
  }
  function startCast(target) {
    castFrom = rodTip();
    castTo = { x: target.x, y: target.y };
    hook = { x: castFrom.x, y: castFrom.y };
    flyT = 0;
    phase = "flying";
    checked = new Set();
    snagChecked = new Set();
    currentSnag = null;
    haulId = null;
    sfx("cast");
  }
  function doThrow() {
    if (paused() || !water || water.h < 20) return;
    if (phase !== "idle") { toast("Wind the line in first."); return; }
    if (cleared(currentLoc())) toast("This spot stays clear. Try the next one.");
    startCast(aimed && aim ? aim : defaultTarget());
    aimed = false;
  }
  function checkFish() {
    if (phase !== "winding") return false;
    var loc = currentLoc();
    for (var i = 0; i < loc.fish.length; i++) {
      var f = loc.fish[i];
      if (f.caught || checked.has(f.id)) continue;
      var p = fishXY(f);
      if (dist(p, hook) <= biteRadius()) {
        checked.add(f.id);
        if (rng() < biteChance()) {
          phase = "hauling";
          haulId = f.id;
          floatText(p.x, p.y - 20, "Got one!", "#0b7a3b");
          sfx("catch");
          return true;
        }
        f.flee = 0.14;
        f.fleeX = p.x >= hook.x ? 0.8 : -0.8;
        f.fleeY = -0.25;
        toast("Missed! It swam off.");
        floatText(p.x, p.y - 16, "Miss!", "#9a3412");
      }
    }
    return false;
  }
  function checkSnag() {
    var loc = currentLoc();
    for (var i = 0; i < loc.snags.length; i++) {
      var sn = loc.snags[i];
      if (snagChecked.has(sn.id)) continue;
      if (dist(toPx(sn.x, sn.y), hook) <= snagRadius()) {
        snagChecked.add(sn.id);
        if (state.gear.sunscreen && rng() < 0.5) {
          toast("Slipped past " + snagPhrase(sn.kind) + ". Sunscreen luck!");
          sfx("slip");
          return false;
        }
        currentSnag = sn;
        phase = "snagged";
        snagTug = 0;
        snagPulls = 0;
        toast("Snagged on " + snagPhrase(sn.kind) + "!");
        sfx("snag");
        return true;
      }
    }
    return false;
  }
  function snapLine() {
    phase = "idle"; hook = null; haulId = null; currentSnag = null;
    toast("The line snapped. That cast is gone. Your basket is safe.");
    sfx("snap");
    renderHud();
  }
  function updateSnag(dt, wantReel) {
    var tug = 0;
    if (wantReel) tug += dt;
    if (dragWind > 0) { tug += dragWind / windSpeed(); dragWind = 0; }
    if (tug <= 0) return;
    snagTug += tug;
    if (state.gear.line) {
      if (snagTug >= 0.45) {
        phase = "winding"; snagTug = 0;
        toast("The strong line held. You pulled free.");
        sfx("slip");
      }
      return;
    }
    if (snagTug >= 0.55) {
      snagTug = 0;
      if (rng() < 0.34) snapLine();
      else {
        snagPulls += 1;
        if (snagPulls >= 2) { phase = "winding"; toast("You pulled free."); sfx("slip"); }
        else toast("Still snagged. Wind again, gently.");
      }
    }
  }
  function finishHaul() {
    var f = null;
    runtime.forEach(function (loc) {
      loc.fish.forEach(function (fish) { if (fish.id === haulId) f = fish; });
    });
    haulId = null; phase = "idle"; hook = null;
    if (f) catchFish(f);
  }
  function moveHook(amount) {
    var steps = Math.max(1, Math.ceil(amount / 6));
    var step = amount / steps;
    for (var s = 0; s < steps; s++) {
      if (phase !== "winding" && phase !== "hauling") break;
      var dest = rodTip();
      var d = dist(hook, dest);
      if (d <= step + 0.5) {
        hook.x = dest.x; hook.y = dest.y;
        if (phase === "hauling") finishHaul();
        else { phase = "idle"; hook = null; toast("Missed. Have another go."); }
        break;
      }
      hook.x += (dest.x - hook.x) / d * step;
      hook.y += (dest.y - hook.y) / d * step;
      if (phase === "winding") {
        if (checkFish()) break;
        if (checkSnag()) break;
      }
    }
  }
  function updateFish(dt) {
    var cloud = berleyT > 0 && berley;
    runtime.forEach(function (loc) {
      var here = loc.id === currentId;
      loc.fish.forEach(function (f) {
        if (f.caught) return;
        if (cloud && here) {
          f.x += (berley.x - f.x) * Math.min(1, dt * 0.55);
          f.y += (berley.y - f.y) * Math.min(1, dt * 0.55);
        } else {
          f.x += (f.ox - f.x) * Math.min(1, dt * 0.22);
          f.y += (f.oy - f.y) * Math.min(1, dt * 0.22);
        }
        f.x = clamp(f.x, 0.1, 0.9);
        f.y = clamp(f.y, 0.12, 0.86);
        if (f.flee > 0) f.flee = Math.max(0, f.flee - dt * 0.12);
      });
    });
    if (berleyT > 0) { berleyT -= dt; if (berleyT <= 0) renderHud(); }
  }
  function update(dt) {
    t += dt;
    if (toastTimer > 0) {
      toastTimer -= dt;
      if (toastTimer <= 0) document.getElementById("toast").classList.remove("show");
    }
    for (var i = floaters.length - 1; i >= 0; i--) {
      floaters[i].life -= dt; floaters[i].y -= 28 * dt;
      if (floaters[i].life <= 0) floaters.splice(i, 1);
    }
    for (i = splashes.length - 1; i >= 0; i--) {
      splashes[i].life -= dt; splashes[i].r += 36 * dt;
      if (splashes[i].life <= 0) splashes.splice(i, 1);
    }
    updateFish(dt);
    if (windPulse > 0) windPulse -= dt;
    var wantReel = windingHeld || windPulse > 0;
    if (phase === "flying") {
      flyT += dt;
      var u = Math.min(1, flyT / 0.42);
      var e = 1 - (1 - u) * (1 - u);
      hook.x = castFrom.x + (castTo.x - castFrom.x) * e;
      hook.y = castFrom.y + (castTo.y - castFrom.y) * e - Math.sin(u * Math.PI) * 34 * S;
      if (u >= 1) {
        hook.x = castTo.x; hook.y = castTo.y; phase = "out";
        splashes.push({ x: hook.x, y: hook.y, r: 6, life: 0.55 });
      }
    }
    if (phase === "out" && (wantReel || dragWind > 0)) phase = "winding";
    if (phase === "snagged") updateSnag(dt, wantReel);
    if ((phase === "winding" || phase === "hauling") && hook) {
      var amount = 0;
      if (wantReel || phase === "hauling") amount += windSpeed() * dt;
      if (dragWind > 0) { amount += dragWind; dragWind = 0; }
      if (amount > 0) moveHook(amount);
    }
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  var RAD = { spotty: 16, yellowbelly: 22, barra: 28, cod: 36 };
  function drawFish(x, y, sp, facing, radius) {
    var spec = SPECIES[sp], r = radius;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing || 1, 1);
    ctx.lineWidth = Math.max(2, 3 * S);
    ctx.strokeStyle = "#143044";
    ctx.lineJoin = "round";
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath(); ctx.ellipse(0, r * 0.55, r * 0.7, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = spec.belly;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, 0); ctx.lineTo(-r * 1.35, -r * 0.48); ctx.lineTo(-r * 1.25, r * 0.48);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = spec.body;
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * (spec.tall ? 0.72 : 0.58), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = spec.belly;
    ctx.beginPath(); ctx.ellipse(r * 0.05, r * 0.16, r * 0.62, r * 0.28, 0, 0, Math.PI); ctx.fill();
    if (spec.spots) {
      ctx.fillStyle = "#c46b12";
      [[-0.2, -0.05], [0.15, 0.12], [-0.05, 0.18]].forEach(function (pt) {
        ctx.beginPath(); ctx.arc(pt[0] * r, pt[1] * r, r * 0.12, 0, Math.PI * 2); ctx.fill();
      });
    }
    if (spec.mottled) {
      ctx.fillStyle = "rgba(30,70,40,0.35)";
      [[-0.3, -0.1], [0.05, -0.16], [0.2, 0.08]].forEach(function (pt) {
        ctx.beginPath(); ctx.ellipse(pt[0] * r, pt[1] * r, r * 0.16, r * 0.1, 0.4, 0, Math.PI * 2); ctx.fill();
      });
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(r * 0.42, -r * 0.12, r * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#143044";
    ctx.beginPath(); ctx.arc(r * 0.48, -r * 0.12, r * 0.09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(r * 0.28, r * 0.08, r * 0.18, 0.15, Math.PI - 0.2); ctx.stroke();
    ctx.restore();
  }
  function drawBadge(x, y, sp) {
    var spec = SPECIES[sp];
    var fs = Math.max(18, Math.round(18 * S));
    var small = Math.max(15, fs - 2);
    var t1 = spec.points + " pts", t2 = "$" + spec.price;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "800 " + fs + "px Trebuchet MS, Segoe UI, sans-serif";
    var w = Math.max(ctx.measureText(t1).width, ctx.measureText(t2).width) + 16;
    var h = fs + small + 10, bx = x - w / 2, by = y - h - 6;
    ctx.fillStyle = "rgba(255,253,246,0.95)";
    ctx.strokeStyle = "#143044"; ctx.lineWidth = 3;
    roundRect(bx, by, w, h, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#143044";
    ctx.font = "800 " + fs + "px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(t1, x, by + fs * 0.65);
    ctx.fillStyle = "#0b7a3b";
    ctx.font = "800 " + small + "px Trebuchet MS, Segoe UI, sans-serif";
    ctx.fillText(t2, x, by + h - small * 0.55);
  }
  function drawSnag(sn) {
    var p = toPx(sn.x, sn.y), r = 22 * S;
    ctx.save(); ctx.translate(p.x, p.y);
    ctx.lineWidth = 3; ctx.strokeStyle = "#143044"; ctx.lineCap = "round";
    if (sn.kind === "log") {
      ctx.fillStyle = "#a86b3c";
      roundRect(-r * 1.4, -r * 0.45, r * 2.8, r * 0.9, r * 0.4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#d9a066";
      ctx.beginPath(); ctx.arc(-r * 1.15, 0, r * 0.42, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (sn.kind === "weed") {
      ctx.strokeStyle = "#1b7f4a"; ctx.lineWidth = 4;
      for (var k = -1; k <= 1; k++) {
        ctx.beginPath(); ctx.moveTo(k * 8, r * 0.4); ctx.quadraticCurveTo(k * 16, -r * 0.2, k * 6, -r); ctx.stroke();
      }
    } else {
      ctx.fillStyle = "#6d5a4a";
      roundRect(-r * 0.3, -r * 0.2, r * 1.1, r * 0.7, 6); ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, 0); ctx.lineTo(-r * 0.9, r * 0.15); ctx.lineTo(-r * 0.7, r * 0.55); ctx.lineTo(-r * 0.15, r * 0.35);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = "#143044";
    ctx.font = "800 " + Math.max(12, Math.round(13 * S)) + "px Trebuchet MS, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(sn.kind, p.x, p.y + r + 12);
  }
  function drawAngler() {
    ctx.save(); ctx.translate(angler.x, angler.y); ctx.scale(S, S);
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#143044";
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath(); ctx.ellipse(0, -4, 26, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-8, -36); ctx.lineTo(-14, -8); ctx.moveTo(8, -36); ctx.lineTo(14, -8); ctx.stroke();
    ctx.fillStyle = state.gear.clothes ? "#ef476f" : "#3d5a80";
    roundRect(-16, -54, 32, 22, 6); ctx.fill(); ctx.stroke();
    if (state.gear.clothes) {
      ctx.fillStyle = "#ffd166";
      roundRect(-20, -82, 40, 32, 8); ctx.fill();
      ctx.fillStyle = "#ef476f";
      ctx.fillRect(-16, -76, 32, 4); ctx.fillRect(-16, -68, 32, 4); ctx.fillRect(-16, -60, 32, 4);
      ctx.strokeStyle = "#143044"; roundRect(-20, -82, 40, 32, 8); ctx.stroke();
    } else {
      ctx.fillStyle = "#f4a261";
      roundRect(-20, -82, 40, 32, 8); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = "#ffd7b5";
    ctx.beginPath(); ctx.arc(0, -100, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (state.gear.sunscreen) {
      ctx.strokeStyle = "rgba(255,255,255,0.95)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, -100, 20, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.fillRect(-3, -98, 6, 8);
      ctx.strokeStyle = "#143044";
    }
    ctx.fillStyle = "#143044";
    ctx.beginPath(); ctx.arc(-6, -102, 2.1, 0, 7); ctx.arc(6, -102, 2.1, 0, 7); ctx.fill();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -96, 6, 0.25, Math.PI - 0.25); ctx.stroke();
    if (state.gear.hat) {
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(-18, -118, 36, 8); ctx.strokeRect(-18, -118, 36, 8);
      roundRect(-11, -134, 22, 18, 4); ctx.fill(); ctx.stroke();
    } else {
      ctx.fillStyle = "#6b3e26";
      ctx.beginPath(); ctx.arc(0, -104, 15, Math.PI, 0); ctx.fill();
    }
    ctx.strokeStyle = "#ffd7b5"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(12, -72); ctx.lineTo(36, -96); ctx.stroke();
    ctx.strokeStyle = state.gear.pole ? "#1a9b86" : "#8d5524";
    ctx.lineWidth = state.gear.pole ? 7 : 4;
    ctx.beginPath(); ctx.moveTo(18, -78); ctx.lineTo(78, -150); ctx.stroke();
    if (state.gear.line) {
      ctx.fillStyle = "#4cc9f0";
      ctx.beginPath(); ctx.arc(26, -86, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#143044"; ctx.lineWidth = 2; ctx.stroke();
    }
    if (state.gear.net && !netUsed) {
      ctx.strokeStyle = "#5c6bc0"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(-28, -70, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-28, -58); ctx.lineTo(-28, -40); ctx.stroke();
    }
    ctx.restore();
  }
  function drawHookAt(x, y) {
    ctx.save();
    ctx.lineWidth = 3; ctx.strokeStyle = "#143044"; ctx.fillStyle = "#e63946";
    ctx.beginPath(); ctx.arc(x, y, 8 * S, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.fillRect(x - 8 * S, y - 2 * S, 16 * S, 4 * S);
    ctx.strokeStyle = "#e0b000"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(x + 12 * S, y + 12 * S, 6 * S, Math.PI * 0.95, 0.35); ctx.stroke();
    ctx.restore();
  }
  function draw() {
    var loc = currentLoc();
    ctx.clearRect(0, 0, W, H);
    var sky = ctx.createLinearGradient(0, 0, 0, skyH + 10);
    sky.addColorStop(0, loc.sky); sky.addColorStop(1, "#e9f8ff");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, water.y + 8);
    ctx.fillStyle = "#ffe08a";
    ctx.beginPath(); ctx.arc(W - 46 * S, 28 * S + 8, 18 * S, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath(); ctx.arc(W * 0.18, skyH * 0.45, 14 * S, 0, 7); ctx.arc(W * 0.22, skyH * 0.55, 10 * S, 0, 7); ctx.fill();
    var g = ctx.createLinearGradient(0, water.y, 0, water.y + water.h);
    g.addColorStop(0, loc.waterTop); g.addColorStop(1, loc.waterBottom);
    ctx.fillStyle = g; ctx.fillRect(0, water.y, W, water.h);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, water.y, W, water.h); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 2;
    for (var i = 0; i < 4; i++) {
      ctx.beginPath();
      var yy = water.y + 24 + i * (water.h / 5);
      for (var x = 0; x <= W; x += 10) {
        var y = yy + Math.sin(x * 0.02 + t * 1.4 + i) * 3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    loc.snags.forEach(drawSnag);
    if (berleyT > 0 && berley) {
      var bp = toPx(berley.x, berley.y);
      ctx.fillStyle = "rgba(190, 220, 60, 0.35)";
      ctx.beginPath(); ctx.arc(bp.x, bp.y, 46 * S, 0, 7); ctx.fill();
      ctx.fillStyle = "#d4e157";
      for (var b = 0; b < 7; b++) {
        ctx.beginPath();
        ctx.arc(bp.x + Math.cos(t * 2 + b) * 18 * S, bp.y + Math.sin(t * 2 + b) * 12 * S, 4 * S, 0, 7);
        ctx.fill();
      }
      ctx.fillStyle = "#143044";
      ctx.font = "800 " + Math.max(14, Math.round(16 * S)) + "px Trebuchet MS, Segoe UI, sans-serif";
      ctx.fillText("berley", bp.x, bp.y - 28 * S);
    }
    splashes.forEach(function (sp) {
      ctx.strokeStyle = "rgba(255,255,255," + Math.max(0, sp.life) + ")";
      ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r, 0, 7); ctx.stroke();
    });
    loc.fish.forEach(function (f) {
      if (f.caught || (haulId && f.id === haulId)) return;
      var p = fishXY(f);
      if (f.px != null) f.facing = p.x >= f.px ? 1 : -1;
      f.px = p.x;
      var rad = RAD[f.sp] * S;
      drawFish(p.x, p.y, f.sp, f.facing, rad);
      var side = f.index % 2 === 0 ? -1 : 1;
      drawBadge(p.x + side * 8, p.y - rad * 0.85, f.sp);
    });
    if (phase === "idle" && aimed && aim) { ctx.globalAlpha = 0.45; drawHookAt(aim.x, aim.y); ctx.globalAlpha = 1; }
    if (hook && phase !== "idle") {
      var tip = rodTip();
      ctx.strokeStyle = state.gear.line ? "#dff6ff" : "rgba(255,255,255,0.85)";
      ctx.lineWidth = state.gear.line ? 4 : 2;
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(hook.x, hook.y); ctx.stroke();
      if (state.gear.bait && phase !== "snagged" && phase !== "hauling") {
        ctx.strokeStyle = "rgba(180, 240, 120, 0.95)"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(hook.x, hook.y, biteRadius(), 0, 7); ctx.stroke();
      }
      if (haulId) {
        var hf = null;
        loc.fish.forEach(function (f) { if (f.id === haulId) hf = f; });
        if (hf) drawFish(hook.x - RAD[hf.sp] * S - 18, hook.y, hf.sp, -1, RAD[hf.sp] * S);
      }
      drawHookAt(hook.x, hook.y);
    }
    if (phase === "snagged") {
      var label = state.gear.line ? "Snagged. The strong line can pull free." : "Snagged. Wind gently or the line may snap.";
      ctx.font = "800 16px Trebuchet MS, Segoe UI, sans-serif";
      var tw = Math.min(W - 24, ctx.measureText(label).width + 20);
      ctx.fillStyle = "#fffdf6"; ctx.strokeStyle = "#143044"; ctx.lineWidth = 3;
      roundRect((W - tw) / 2, water.y + 8, tw, 36, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#143044"; ctx.textAlign = "center";
      ctx.fillText(label, W / 2, water.y + 26);
    }
    ctx.restore();
    ctx.fillStyle = "#f0d2a0"; ctx.fillRect(0, H - bankH, W, bankH + 2);
    ctx.fillStyle = "#1f8a4c";
    for (var reed = 0; reed < 5; reed++) ctx.fillRect(18 + reed * 16, H - bankH - 16 - (reed % 3) * 6, 4, 22);
    drawAngler();
    if (!state.best && phase === "idle") {
      ctx.fillStyle = "#143044";
      ctx.font = "800 " + Math.max(16, Math.round(18 * S)) + "px Trebuchet MS, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Throw, then wind past a fish", W / 2, Math.max(18, skyH * 0.72));
    }
    if (cleared(loc)) {
      ctx.fillStyle = "rgba(255,253,246,0.92)"; ctx.strokeStyle = "#143044"; ctx.lineWidth = 3;
      roundRect(W / 2 - 140, water.y + water.h * 0.4, 280, 50, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#143044"; ctx.font = "800 18px Trebuchet MS, Segoe UI, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("This spot stays clear", W / 2, water.y + water.h * 0.4 + 30);
    }
    floaters.forEach(function (f) {
      ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
      ctx.fillStyle = f.color;
      ctx.font = "800 22px Trebuchet MS, Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
      ctx.globalAlpha = 1;
    });
  }
  function renderShop() {
    var html = "<h3>Your basket</h3>", any = false;
    Object.keys(SPECIES).forEach(function (sp) {
      var n = state.creel[sp] || 0;
      if (!n) return;
      any = true;
      var sale = saleEach(sp);
      html += "<div class='card'><p><b>" + SPECIES[sp].name + "</b> × " + n + " · " + SPECIES[sp].points + " pts</p>" +
        "<p class='price'>Sells for $" + sale.p + " each" + (sale.note ? " (" + sale.note + ")" : "") + "</p>" +
        "<button class='mini' type='button' data-sell='" + sp + "'>Sell " + SPECIES[sp].name + " · $" + (sale.p * n) + "</button></div>";
    });
    html += any
      ? "<button class='mini' type='button' data-sell='all'>Sell all fish</button>"
      : "<div class='card'><p>Your basket is empty. Catch some fish first.</p></div>";
    html += "<h3>Gear</h3>";
    UPGRADES.forEach(function (u) {
      var owned = !!state.gear[u.id];
      html += "<div class='card" + (owned ? " owned" : "") + "'><p><b>" + u.name + "</b></p><p>" + u.effect + "</p>";
      if (owned) html += "<p class='price'>Owned</p>";
      else if (state.money < u.price) {
        html += "<p class='need'>Price $" + u.price + "</p><button class='mini' type='button' disabled>Not enough money · need $" + (u.price - state.money) + " more</button>";
      } else html += "<button class='mini' type='button' data-buy='" + u.id + "'>Buy " + u.name + " · $" + u.price + "</button>";
      html += "</div>";
    });
    html += "<button class='mini' type='button' data-reset='1' style='background:#fff'>Start again</button>";
    html += "<p>Money, gear, and your best catch are saved on this device.</p>";
    document.getElementById("shop-body").innerHTML = html;
    document.getElementById("shop-blurb").textContent = "You have $" + state.money + ". " +
      (state.best ? ("Best catch: " + state.best.name + " (" + state.best.points + " pts).") : "No best catch yet.");
  }
  function openShop() {
    shopOpen = true; basketOpen = false;
    document.getElementById("basket").hidden = true;
    document.getElementById("shop").hidden = false;
    renderShop();
  }
  function closeShop() { shopOpen = false; document.getElementById("shop").hidden = true; renderHud(); }
  function renderBasket() {
    var html = "", any = false;
    Object.keys(SPECIES).forEach(function (sp) {
      var n = state.creel[sp] || 0;
      if (!n) return;
      any = true;
      html += "<div class='card'><p><b>" + SPECIES[sp].name + "</b> × " + n + " · " + SPECIES[sp].points + " pts · $" + SPECIES[sp].price + " each before bonuses</p></div>";
    });
    document.getElementById("basket-list").innerHTML = any ? html : "<div class='card'><p>Nothing yet. Catch a fish!</p></div>";
  }
  function buy(id) {
    var u = UPGRADES.filter(function (x) { return x.id === id; })[0];
    if (!u || state.gear[id]) return;
    if (state.money < u.price) { toast("Not enough money."); return; }
    state.money -= u.price; state.gear[id] = true; save(); sfx("coin");
    toast(u.name + " bought!"); renderShop(); renderHud();
  }
  function sell(sp) {
    var list = sp === "all" ? Object.keys(SPECIES) : [sp], total = 0;
    list.forEach(function (id) {
      var n = state.creel[id] || 0;
      if (!n) return;
      total += saleEach(id).p * n;
      state.creel[id] = 0;
    });
    if (!total) return;
    state.money += total; save(); sfx("coin");
    toast("Sold for $" + total + "."); renderShop(); renderHud();
  }
  function sprinkle() {
    if (paused()) return;
    if (!state.gear.berley) { toast("Buy berley at the shop."); return; }
    if (berleyT > 0) { toast("Berley is already in the water."); return; }
    var p = aimed && aim ? aim : defaultTarget();
    berley = {
      x: clamp((p.x - water.x) / water.w, 0.15, 0.85),
      y: clamp((p.y - water.y) / water.h, 0.15, 0.85)
    };
    berleyT = 8;
    toast("Berley in the water. Fish are coming over.");
    sfx("coin"); renderHud();
  }
  function useNet() {
    if (paused()) return;
    if (!state.gear.net) { toast("Buy a net at the shop."); return; }
    if (netUsed) { toast("The net can scoop once each visit."); return; }
    var best = null, bestD = 1e9;
    currentLoc().fish.forEach(function (f) {
      if (f.caught) return;
      var d = dist(fishXY(f), angler);
      if (d < bestD) { bestD = d; best = f; }
    });
    if (!best || bestD > Math.max(130, water.h * 0.38)) { toast("No fish close enough to scoop."); return; }
    netUsed = true;
    floatText(angler.x, angler.y - 80, "Scooped!", "#3d348b");
    catchFish(best); renderHud();
  }

  document.getElementById("locs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (b) goLoc(b.dataset.id);
  });
  document.getElementById("throw").addEventListener("click", doThrow);
  document.getElementById("berley-btn").addEventListener("click", sprinkle);
  document.getElementById("net-btn").addEventListener("click", useNet);
  document.getElementById("shop-btn").addEventListener("click", openShop);
  document.getElementById("shop-back").addEventListener("click", closeShop);
  document.getElementById("basket-btn").addEventListener("click", function () {
    basketOpen = true; shopOpen = false;
    document.getElementById("shop").hidden = true;
    document.getElementById("basket").hidden = false;
    renderBasket();
  });
  document.getElementById("basket-close").addEventListener("click", function () {
    basketOpen = false; document.getElementById("basket").hidden = true;
  });
  document.getElementById("basket-shop").addEventListener("click", function () {
    basketOpen = false; document.getElementById("basket").hidden = true; openShop();
  });
  document.getElementById("sound-btn").addEventListener("click", function () { state.sound = !state.sound; save(); renderHud(); });
  document.getElementById("help-go").addEventListener("click", function () {
    state.helpSeen = true; save();
    document.getElementById("help").hidden = true;
    document.documentElement.classList.add("knows");
  });
  document.getElementById("shop-body").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.buy) buy(b.dataset.buy);
    else if (b.dataset.sell) sell(b.dataset.sell);
    else if (b.dataset.reset && window.confirm("Start again? This forgets your money, gear, and fish.")) {
      try { localStorage.removeItem(KEY); } catch (err) {}
      location.reload();
    }
  });
  var windBtn = document.getElementById("wind");
  windBtn.addEventListener("pointerdown", function (e) {
    if (paused()) return;
    e.preventDefault();
    try { windBtn.setPointerCapture(e.pointerId); } catch (err) {}
    windingHeld = true; windBtn.classList.add("on");
    if (phase === "idle") toast("Throw the line first.");
  });
  function windUp() {
    if (windingHeld) windPulse = Math.max(windPulse, 0.18);
    windingHeld = false; windBtn.classList.remove("on");
  }
  windBtn.addEventListener("pointerup", windUp);
  windBtn.addEventListener("pointercancel", windUp);
  windBtn.addEventListener("lostpointercapture", function () { windingHeld = false; windBtn.classList.remove("on"); });
  canvas.addEventListener("pointerdown", function (e) {
    if (paused()) return;
    var rect = canvas.getBoundingClientRect();
    var p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    drag = { id: e.pointerId, x: p.x, y: p.y, sx: p.x, sy: p.y, mode: phase === "idle" ? "aim" : "wind" };
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!drag || drag.id !== e.pointerId) return;
    var rect = canvas.getBoundingClientRect();
    var p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (drag.mode === "aim" && phase === "idle") { aim = clampCast(p); aimed = true; }
    else if (drag.mode === "wind") {
      var prev = Math.hypot(drag.x - angler.x, drag.y - angler.y);
      var next = Math.hypot(p.x - angler.x, p.y - angler.y);
      if (prev - next > 0) dragWind += prev - next;
      drag.x = p.x; drag.y = p.y;
    }
  });
  canvas.addEventListener("pointerup", function (e) {
    if (!drag || drag.id !== e.pointerId) return;
    var rect = canvas.getBoundingClientRect();
    var p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    var moved = Math.hypot(p.x - drag.sx, p.y - drag.sy);
    var mode = drag.mode;
    drag = null;
    if (mode === "aim" && phase === "idle") {
      if (moved > 8) { aim = clampCast(p); aimed = true; }
      if (moved > 30) doThrow();
    }
  });
  canvas.addEventListener("pointercancel", function () { drag = null; });
  canvas.addEventListener("touchmove", function (e) { e.preventDefault(); }, { passive: false });
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeShop(); basketOpen = false; document.getElementById("basket").hidden = true; return; }
    if (paused() || e.repeat) return;
    if (e.key === "t" || e.key === "T") doThrow();
    if (e.key === "w" || e.key === "W" || e.key === "ArrowDown") { windingHeld = true; windBtn.classList.add("on"); }
    if (e.key === "b" || e.key === "B") sprinkle();
    if (e.key === "n" || e.key === "N") useNet();
  });
  window.addEventListener("keyup", function (e) {
    if (e.key === "w" || e.key === "W" || e.key === "ArrowDown") windUp();
  });
  window.addEventListener("resize", resize);
  window.addEventListener("error", function (e) {
    document.body.dataset.err = e.message || "error";
    toast("Something went odd. Reload the page.");
  });
  var params = new URLSearchParams(location.search);
  if (state.helpSeen || params.has("play") || params.has("selftest")) document.getElementById("help").hidden = true;
  function frame(now) {
    if (!frame.last) frame.last = now;
    var dt = Math.min(0.05, (now - frame.last) / 1000);
    frame.last = now;
    resize();
    if (!paused()) update(dt);
    if (W > 2 && H > 2) draw();
    requestAnimationFrame(frame);
  }
  renderHud(); renderLocs(); resize();
  function runSelfTest() {
    allowSave = false;
    document.getElementById("help").hidden = true;
    var problems = [];
    function check(cond, msg) { if (!cond) problems.push(msg); }
    W = 400; H = 800; prevW = 0; prevH = 0; layout();
    check(document.title.indexOf("Born for fish'n") === 0, "title");
    state.money = 0;
    GEAR_IDS.forEach(function (id) { state.gear[id] = false; });
    state.creel = { spotty: 0, yellowbelly: 0, barra: 0, cod: 0 };
    state.best = null;
    runtime.forEach(function (loc) {
      loc.fish.forEach(function (f) {
        f.caught = false; f.x = f.ox; f.y = f.oy; f.flee = 0; f.ax = f.ax; f.ay = f.ay;
        state.caught[loc.id][f.index] = false;
      });
    });
    currentId = "home";
    check(isUnlocked(locById("home")) && !isUnlocked(locById("creek")) && !isUnlocked(locById("deep")), "start locks");
    locById("home").fish.forEach(catchFish);
    check(cleared(locById("home")) && isUnlocked(locById("creek")) && !isUnlocked(locById("deep")), "home clear opens creek only");
    check(locById("home").fish.every(function (f) { return f.caught; }), "caught stay caught");
    locById("creek").fish.forEach(catchFish);
    check(isUnlocked(locById("deep")), "creek clear opens deep");
    check(cleared(locById("home")), "home stays clear");
    state.gear.hat = false; state.gear.clothes = false;
    check(saleEach("spotty").p === 4, "base price");
    state.gear.clothes = true; check(saleEach("spotty").p === 6, "clothes bonus");
    state.gear.hat = true; check(saleEach("spotty").p === 8, "hat and clothes");
    state.gear.hat = false; state.gear.clothes = false;
    state.money = 5;
    check(state.money < 8, "cannot afford bait");
    state.money = 8; buy("bait");
    check(state.gear.bait === true && state.money === 0, "bought bait");
    buy("bait");
    check(state.money === 0 && state.gear.bait === true, "no double buy");
    state.gear.pole = false;
    var far = clampCast({ x: water.x + water.w - 2, y: water.y + 2 });
    var nearEdge = Math.hypot(far.x - angler.x, far.y - angler.y);
    check(nearEdge > water.h * 0.55, "cast reaches far water without pole");
    check(far.y >= water.y && far.y <= water.y + water.h && far.x >= water.x && far.x <= water.x + water.w, "cast stays in water");
    var bank = clampCast({ x: W / 2, y: H - 2 });
    check(bank.y <= water.y + water.h - 8, "cast not on bank");
    state.gear.pole = true;
    var farPole = clampCast({ x: water.x + 2, y: water.y + 2 });
    check(Math.hypot(farPole.x - angler.x, farPole.y - angler.y) > water.h * 0.55, "cast reaches far water with pole");
    state.gear.pole = false;
    state.gear.line = false; var slow = windSpeed(); state.gear.line = true;
    check(windSpeed() > slow, "line faster"); state.gear.line = false;
    state.gear.bait = false; var smallBite = biteRadius(); state.gear.bait = true;
    check(biteRadius() > smallBite && biteChance() > 0.6, "bait bite"); state.gear.bait = false;
    var home = locById("home");
    home.fish.forEach(function (f) { f.caught = false; state.caught.home[f.index] = false; f.x = f.ox; f.y = f.oy; f.ax = 0; f.ay = 0; f.flee = 0; });
    state.creel = { spotty: 2, yellowbelly: 0, barra: 0, cod: 0 };
    var basketBefore = totalCreel();
    currentId = "home"; phase = "out"; rng = function () { return 0; };
    var fish = home.fish[0];
    hook = fishXY(fish);
    checkFish(); update(0.5);
    check(totalCreel() === basketBefore && !fish.caught, "no catch while sitting");
    phase = "winding"; hook = fishXY(fish); checked = new Set();
    checkFish();
    check(phase === "hauling" && haulId === fish.id, "catch while winding");
    hook = rodTip(); finishHaul();
    check(fish.caught && totalCreel() === basketBefore + 1, "haul keeps fish");
    phase = "snagged"; snagTug = 0; snagPulls = 0; state.gear.line = false; rng = function () { return 0; };
    var creelNow = totalCreel();
    updateSnag(0.6, true);
    check(phase === "idle" && totalCreel() === creelNow, "snap loses cast not basket");
    phase = "snagged"; snagTug = 0; snagPulls = 0; state.gear.line = true;
    updateSnag(0.5, true);
    check(phase === "winding", "strong line frees");
    state.gear.line = false; state.gear.net = true; netUsed = false; currentId = "home";
    home.fish.forEach(function (f) { if (f !== fish) { f.caught = true; state.caught.home[f.index] = true; } });
    var near = home.fish[1];
    near.caught = false; state.caught.home[near.index] = false;
    near.x = 0.5; near.y = 0.84; near.ax = 0; near.ay = 0; near.flee = 0;
    var before = totalCreel();
    useNet();
    check(near.caught && totalCreel() === before + 1 && netUsed, "net scoops once");
    var before2 = totalCreel(); useNet();
    check(totalCreel() === before2, "net once per visit");
    netUsed = false;
    near.caught = false; state.caught.home[near.index] = false;
    home.fish.forEach(function (f) { if (!f.caught) { f.x = 0.5; f.y = 0.12; f.ax = 0; f.ay = 0; f.flee = 0; } });
    var before3 = totalCreel(); useNet();
    check(totalCreel() === before3, "net misses far fish");
    state.gear.berley = true;
    var mover = locById("deep").fish[0];
    mover.caught = false; mover.x = 0.2; mover.y = 0.2;
    currentId = "deep"; berley = { x: 0.8, y: 0.8 }; berleyT = 5;
    updateFish(1);
    check(mover.x > 0.2 && mover.y > 0.2, "berley attracts");
    runtime.forEach(function (loc) { loc.fish.forEach(function (f) { if (!f.caught) catchFish(f); }); });
    check(runtime.every(cleared), "can clear all spots");
    check(locById("home").snags.length === 0 && locById("creek").snags.length > 0 && locById("deep").snags.length > 0, "snags later only");
    try { draw(); } catch (err) { problems.push("draw " + err.message); }
    var out = document.getElementById("selftest");
    out.hidden = false;
    out.textContent = problems.length ? ("FAIL " + problems.join(" | ")) : "PASS";
    if (problems.length) document.title = "FAIL " + problems.join(" | ");
  }
  if (params.has("selftest")) runSelfTest();
  else requestAnimationFrame(frame);
})();
