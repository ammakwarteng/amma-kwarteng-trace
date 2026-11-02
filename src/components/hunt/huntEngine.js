/*
  Threat hunt engine for the TRACE hero.

  A fragment of malware wanders the hero on a smooth, unpredictable path.
  The visitor's pointer steers a tracking reticle (the hunter), which is
  pulled toward the malware when the pointer is near it. The malware drifts
  away and sometimes dashes sideways to evade. Holding the reticle on it
  triggers detection, then quarantine, then a new signature appears.
  With no input for a few seconds, an autopilot stalks and strikes on its own.

  Plain canvas + requestAnimationFrame, no dependencies. createHunt() returns
  a destroy() function. The engine never touches React state per frame: it
  reports status and the quarantine count through callbacks, only on change.
*/

// Black and white, plus two signal colours: red for the threat (malware,
// detection) and green for the defender (lock-on, quarantined / secured).
// The trace web stays white.
const C = {
  threat: "#ff2b2b",
  secure: "#57e389",
  threatDark: "#7a0000",
  chalk: "#d9d9d9",
  dim: "rgba(255,255,255,0.6)",
  signal: "#ffffff",
  sky: "#9a9a9a",
  ink: "#3a3a3a",
  paper: "#ffffff",
  wall: "#0a0a0a",
  grey: "#6b6b6b",
};
const MONO = '500 11px "JetBrains Mono", ui-monospace, monospace';
const TRACE_MAX = 70;
const SIGNATURES = ["Trojan.Gen.TR4", "Dropper.Win32.k", "PUA.Keylogger.x", "Backdoor.Agent.7", "Worm.Net.Relay", "Spyware.Clip.b"];

// Tuned in the prototype review.
const TUNE = { hunterResponse: 1, malwareSpeed: 1, evasion: 0.55, pull: 0.6 };

const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const len = (x, y) => Math.hypot(x, y) || 1e-6;

function pickColor() {
  const r = Math.random();
  return r < 0.36 ? C.threat : r < 0.56 ? "#ff6b6b" : r < 0.73 ? "#c40000" : r < 0.86 ? "#6e0000" : r < 0.95 ? "#ffb3b3" : "#ffffff";
}

export function createHunt({ canvas, surface, getBounds, onStatus, onCount, reducedMotion }) {
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, S = 1, bounds = { top: 80, bottom: 0, left: 0, right: 0 };
  const pointer = { x: 0, y: 0, active: false, last: -1e9 };
  const hunter = { x: 0, y: 0, vx: 0, vy: 0, lock: 0, spin: 0 };
  const mal = { x: 0, y: 0, vx: 0, vy: 0, seed: Math.random() * 100, evadeT: 0, cool: 0, frags: [], glitchT: 0, scale: 1, sig: SIGNATURES[0] };
  const ghosts = [];
  const thread = { x: 0 };
  let nodes = [], edges = [], lastNodeT = 0;
  let phase = "hunt", phaseT = 0, huntT = 0, lockT = 0, count = 0, ghostT = 0, now = 0;
  let status = "";
  let raf = 0, running = false, visible = true, lastTs = 0;

  // tone: "threat" (red), "secure" (green) or null (white)
  const setStatus = (text, alert = null) => {
    if (text === status) return;
    status = text;
    onStatus?.(text, alert);
  };

  function makeFrags() {
    const n = Math.round(30 * S);
    const frags = [];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.7) * 22 * S;
      const big = Math.random() < 0.18;
      frags.push({
        dx: Math.cos(a) * r, dy: Math.sin(a) * r * 0.8,
        w: (big ? rnd(8, 16) : rnd(2, 7)) * S, h: (big ? rnd(2, 5) : rnd(2, 7)) * S,
        c: pickColor(),
        qx: ((i % 6) - 2.5) * 4 * S, qy: (Math.floor(i / 6) - 2) * 4 * S,
      });
    }
    return frags;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = clamp(W / 820, 1, 1.75);
    const b = getBounds?.() || {};
    bounds = { top: b.top ?? 90, bottom: b.bottom ?? H - 120, left: 40, right: W - 40 };
    if (mal.frags.length === 0) {
      hunter.x = W * 0.42; hunter.y = bounds.top + 60; thread.x = hunter.x;
      spawn();
    } else {
      mal.x = clamp(mal.x, bounds.left, bounds.right);
      mal.y = clamp(mal.y, bounds.top, bounds.bottom);
    }
    if (!running) drawStill();
  }

  function spawn() {
    let best = null, bestD = -1;
    for (let i = 0; i < 8; i++) {
      const x = rnd(W * 0.15, W * 0.85), y = rnd(bounds.top + 20, bounds.bottom - 20);
      const d = len(x - hunter.x, y - hunter.y);
      if (d > bestD) { bestD = d; best = { x, y }; }
    }
    Object.assign(mal, best);
    mal.vx = rnd(-40, 40); mal.vy = rnd(-40, 40);
    mal.frags = makeFrags(); mal.cool = 0.35; mal.evadeT = 0; mal.seed = Math.random() * 100;
    mal.sig = SIGNATURES[Math.floor(Math.random() * SIGNATURES.length)];
  }

  function addGhost(burst) {
    const f = mal.frags[Math.floor(Math.random() * mal.frags.length)];
    ghosts.push({
      x: mal.x + f.dx + (burst ? rnd(-14, 14) : 0), y: mal.y + f.dy + (burst ? rnd(-10, 10) : 0),
      w: f.w, h: Math.max(2, f.h), c: f.c, life: burst ? rnd(0.5, 1) : 1.1, max: burst ? 1 : 1.1,
    });
  }

  function wanderTarget(t) {
    const s = mal.seed;
    const nx = 0.55 * Math.sin(t * 0.23 + s) + 0.3 * Math.sin(t * 0.57 + s * 1.7) + 0.15 * Math.sin(t * 1.31 + s * 0.3);
    const ny = 0.55 * Math.sin(t * 0.19 + s * 2.1) + 0.3 * Math.sin(t * 0.61 + s * 0.9) + 0.15 * Math.sin(t * 1.13 + s * 2.7);
    const cy = (bounds.top + bounds.bottom) / 2, ry = (bounds.bottom - bounds.top) / 2;
    return { x: W / 2 + nx * W * 0.4, y: cy + ny * ry * 0.9 };
  }

  function step(dt) {
    now += dt;
    const idle = !pointer.active || now - pointer.last > 3;

    // ---- hunter ----
    let ax, ay, k, c;
    if (phase === "hunt" || phase === "respawn") {
      if (idle) {
        const orbit = 170 * S * clamp(1 - (huntT - 6) / 6, 0, 1);
        ax = mal.x + Math.cos(now * 0.8) * orbit; ay = mal.y + Math.sin(now * 1.05) * orbit * 0.7;
        k = huntT > 11 ? 14 : 4; c = huntT > 11 ? 6 : 3.6;
      } else {
        const dc = len(pointer.x - mal.x, pointer.y - mal.y);
        const influence = clamp(1 - dc / 300, 0, 1) * TUNE.pull;
        ax = lerp(pointer.x, mal.x, influence); ay = lerp(pointer.y, mal.y, influence);
        k = 34 * TUNE.hunterResponse ** 2; c = 10 * TUNE.hunterResponse;
      }
    } else {
      ax = mal.x; ay = mal.y; k = 90; c = 18;
    }
    hunter.vx += ((ax - hunter.x) * k - hunter.vx * c) * dt;
    hunter.vy += ((ay - hunter.y) * k - hunter.vy * c) * dt;
    const hs = len(hunter.vx, hunter.vy), maxH = 1500 * TUNE.hunterResponse;
    if (hs > maxH) { hunter.vx *= maxH / hs; hunter.vy *= maxH / hs; }
    hunter.x += hunter.vx * dt; hunter.y += hunter.vy * dt;
    hunter.spin += dt * (phase === "hunt" ? 0.6 : 3);

    thread.x = lerp(thread.x || hunter.x, hunter.x, 1 - Math.pow(0.04, dt));
    recordTrace();

    const dx = mal.x - hunter.x, dy = mal.y - hunter.y, d = len(dx, dy);
    hunter.lock = lerp(hunter.lock, phase !== "hunt" && phase !== "respawn" ? 1 : clamp(1 - (d - 30) / 120, 0, 1), 1 - Math.pow(0.001, dt));

    if (phase === "hunt") {
      huntT += dt;
      // ---- malware ----
      const tgt = wanderTarget(now * TUNE.malwareSpeed);
      const speed = 150 * TUNE.malwareSpeed;
      let desX = tgt.x - mal.x, desY = tgt.y - mal.y;
      const dl = len(desX, desY);
      desX = (desX / dl) * speed; desY = (desY / dl) * speed;
      const fear = clamp(1 - d / 220, 0, 1);
      desX += (-dx / d) * fear * speed * 1.1; desY += (-dy / d) * fear * speed * 1.1;
      const m = 60;
      if (mal.x < bounds.left + m) desX += (bounds.left + m - mal.x) * 4;
      if (mal.x > bounds.right - m) desX -= (mal.x - (bounds.right - m)) * 4;
      if (mal.y < bounds.top + m) desY += (bounds.top + m - mal.y) * 4;
      if (mal.y > bounds.bottom - m) desY -= (mal.y - (bounds.bottom - m)) * 4;

      mal.cool -= dt;
      const near = d < 120 + 30 * S;
      if (near && mal.cool <= 0 && mal.evadeT <= 0 && Math.random() < dt * TUNE.evasion * 3.2) {
        const side = Math.random() < 0.5 ? 1 : -1;
        const ex = -dx / d + (-dy / d) * side * 0.9, ey = -dy / d + (dx / d) * side * 0.9, el = len(ex, ey);
        mal.vx = (ex / el) * speed * 5.2; mal.vy = (ey / el) * speed * 5.2;
        mal.evadeT = 0.32; mal.cool = 1.6; mal.glitchT = 0.3;
        setStatus("Evasion detected", "threat");
        for (let i = 0; i < 10; i++) addGhost(true);
      }
      if (mal.evadeT > 0) mal.evadeT -= dt;
      else {
        mal.vx += (desX - mal.vx) * 2.6 * dt; mal.vy += (desY - mal.vy) * 2.6 * dt;
        if (status === "Evasion detected" && mal.cool < 1.1) setStatus("Hunting");
      }
      mal.x = clamp(mal.x + mal.vx * dt, bounds.left, bounds.right);
      mal.y = clamp(mal.y + mal.vy * dt, bounds.top, bounds.bottom);

      mal.glitchT -= dt;
      if (Math.random() < dt * 9) {
        const f = mal.frags[Math.floor(Math.random() * mal.frags.length)];
        f.c = pickColor();
        f.dx = clamp(f.dx + rnd(-3, 3), -24 * S, 24 * S);
        f.dy = clamp(f.dy + rnd(-2, 2), -20 * S, 20 * S);
      }
      ghostT -= dt;
      if (ghostT <= 0 && len(mal.vx, mal.vy) > 30) { addGhost(false); ghostT = 0.045; }

      // lock-on: the reticle has to hold on the target briefly
      if (d < 26 * S && (!idle || huntT > 10)) lockT += dt;
      else lockT = Math.max(0, lockT - dt * 2);
      if (lockT > 0.22) {
        lockT = 0; huntT = 0; phase = "detect"; phaseT = 0; mal.vx = mal.vy = 0;
        addNode(mal.x, mal.y, true);
        setStatus("Threat detected", "threat");
      }
    } else {
      phaseT += dt;
      if (phase === "detect" && phaseT > 0.55) { phase = "quarantine"; phaseT = 0; setStatus("Quarantined", "secure"); }
      else if (phase === "quarantine" && phaseT > 1.1) {
        count++; onCount?.(count);
        phase = "respawn"; phaseT = 0; spawn(); mal.scale = 0; setStatus("New signature");
      } else if (phase === "respawn") {
        mal.scale = Math.min(1, phaseT / 0.5);
        if (phaseT > 0.7) { phase = "hunt"; huntT = 0; setStatus("Hunting"); }
      }
    }

    for (let i = ghosts.length - 1; i >= 0; i--) {
      ghosts[i].life -= dt;
      if (ghosts[i].life <= 0) ghosts.splice(i, 1);
    }
  }

  // ---------- drawing ----------
  function drawMalware(animated) {
    const s = mal.scale;
    if (s <= 0) return;
    const q = phase === "quarantine" ? clamp(phaseT / 0.5, 0, 1) : 0;
    const fade = phase === "quarantine" ? 1 - clamp((phaseT - 0.6) / 0.5, 0, 1) : 1;
    const mvx = mal.vx * 0.012, mvy = mal.vy * 0.012;
    const split = animated ? (mal.glitchT > 0 ? 5 : 1.6) : 1.6;
    const passes = [[-split, C.threatDark, 0.6], [split, C.threat, 0.45], [0, null, 1]];
    for (const [ox, tint, alpha] of passes) {
      ctx.globalAlpha = alpha * fade;
      mal.frags.forEach((f, i) => {
        const smear = (i % 5) / 5;
        const fx = lerp(f.dx - mvx * smear * 6, f.qx, q) * s, fy = lerp(f.dy - mvy * smear * 6, f.qy, q) * s;
        const w = lerp(f.w, 3, q) * s, h = lerp(f.h, 3, q) * s;
        ctx.fillStyle = tint || (q > 0.6 ? C.secure : f.c);
        ctx.fillRect(Math.round(mal.x + fx + ox - w / 2), Math.round(mal.y + fy - h / 2), Math.ceil(w), Math.ceil(h));
      });
    }
    ctx.globalAlpha = 1;
  }

  function drawGhosts() {
    for (const g of ghosts) {
      ctx.globalAlpha = clamp(g.life / g.max, 0, 1) * 0.7;
      ctx.fillStyle = g.c;
      ctx.fillRect(Math.round(g.x), Math.round(g.y), Math.ceil(g.w * 0.6), Math.ceil(g.h * 0.6));
    }
    ctx.globalAlpha = 1;
  }

  // ---------- the trace: a web of thin lines the hunter leaves behind ----------
  function addNode(x, y, isCatch = false) {
    const node = { x, y, isCatch };
    const prev = nodes[nodes.length - 1];
    if (prev) edges.push([prev, node]);
    // sometimes tie back to a nearby older node, which builds a web
    let best = null, bestD = 160 * S;
    for (let i = 0; i < nodes.length - 2; i++) {
      const d = len(nodes[i].x - x, nodes[i].y - y);
      if (d < bestD) { bestD = d; best = nodes[i]; }
    }
    if (best && Math.random() < 0.55) edges.push([best, node]);
    nodes.push(node);
    if (nodes.length > TRACE_MAX) {
      const gone = nodes.shift();
      edges = edges.filter(([a, b]) => a !== gone && b !== gone);
    }
  }
  function recordTrace() {
    if (phase !== "hunt") return;
    const last = nodes[nodes.length - 1];
    if (now - lastNodeT < 0.22) return;
    if (last && len(last.x - hunter.x, last.y - hunter.y) < 70 * S) return;
    lastNodeT = now;
    addNode(hunter.x, hunter.y);
  }
  function clearTrace() { nodes = []; edges = []; }

  function drawTrace() {
    if (!edges.length && !nodes.length) return;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const [a, b] of edges) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); }
    ctx.stroke();
    for (const n of nodes) {
      if (n.isCatch) {
        ctx.fillStyle = C.secure;
        ctx.fillRect(n.x - 3.5, n.y - 3.5, 7, 7);
      } else {
        ctx.fillStyle = C.wall;
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath(); ctx.arc(n.x, n.y, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // The hunter hangs from a thread anchored at the top of the hero.
  function drawThread() {
    const r = lerp(34, 20, hunter.lock) * Math.sqrt(S);
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(thread.x, 0);
    ctx.quadraticCurveTo((thread.x + hunter.x) / 2 + (hunter.vx * 0.02), hunter.y * 0.5, hunter.x, hunter.y - r - 10);
    ctx.stroke();
    ctx.restore();
  }

  function drawHunter() {
    const { x, y, lock } = hunter;
    const col = lock > 0.55 ? C.secure : C.chalk;
    const r = lerp(34, 20, lock) * Math.sqrt(S);
    const reticle = (stroke, extra, alphaScale) => {
      ctx.strokeStyle = stroke; ctx.fillStyle = stroke;
      ctx.lineWidth = 1.2 + extra;
      ctx.globalAlpha = 0.9 * alphaScale;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 0.5 * alphaScale;
      ctx.beginPath(); ctx.arc(0, 0, r + 9, hunter.spin, hunter.spin + Math.PI * 0.55); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, r + 9, hunter.spin + Math.PI, hunter.spin + Math.PI * 1.2); ctx.stroke();
      ctx.globalAlpha = 0.9 * alphaScale;
      const g = 6, t = r + 4;
      ctx.beginPath();
      ctx.moveTo(-t, 0); ctx.lineTo(-g, 0); ctx.moveTo(g, 0); ctx.lineTo(t, 0);
      ctx.moveTo(0, -t); ctx.lineTo(0, -g); ctx.moveTo(0, g); ctx.lineTo(0, t);
      ctx.stroke();
      const b = lerp(r + 16, r + 4, lock), bl = 8;
      ctx.lineWidth = 1.6 + extra;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        ctx.beginPath(); ctx.moveTo(sx * b, sy * (b - bl)); ctx.lineTo(sx * b, sy * b); ctx.lineTo(sx * (b - bl), sy * b); ctx.stroke();
      }
      ctx.fillRect(-1 - extra / 2, -1 - extra / 2, 2 + extra, 2 + extra);
    };
    ctx.save();
    ctx.translate(x, y);
    ctx.lineCap = "square";
    reticle("rgba(0,0,0,0.6)", 2.4, 0.9); // dark outline so it reads over the white word
    reticle(col, lock > 0.55 ? 0.8 : 0, 1);
    ctx.restore();
    ctx.globalAlpha = 1;

    const d = Math.round(len(mal.x - x, mal.y - y));
    ctx.font = MONO; ctx.textBaseline = "top";
    const right = x + r + 22 + 130 < W;
    const tx = right ? x + r + 22 : x - r - 22, ty = y - r - 4;
    ctx.textAlign = right ? "left" : "right";
    const label = phase === "hunt" ? (lock > 0.55 ? "LOCKING" : "TRACKING")
      : phase === "detect" ? "DETECTED" : phase === "quarantine" ? "ISOLATING" : "SCANNING";
    const sub = phase === "hunt" ? `DIST ${String(d).padStart(4, "0")}PX` : mal.sig.toUpperCase();
    const bw = Math.max(ctx.measureText(label).width, ctx.measureText(sub).width) + 12;
    ctx.fillStyle = "rgba(10,10,10,0.75)";
    ctx.fillRect(right ? tx - 6 : tx - bw + 6, ty - 4, bw, 34);
    ctx.fillStyle = col; ctx.fillText(label, tx, ty);
    ctx.fillStyle = C.dim;
    ctx.fillText(sub, tx, ty + 15);
    ctx.textAlign = "left";
  }

  function drawQuarantine() {
    if (phase !== "detect" && phase !== "quarantine") return;
    const p = phase === "detect" ? clamp(phaseT / 0.3, 0, 1) : 1;
    const size = (phase === "quarantine" ? lerp(46, 18, clamp(phaseT / 0.6, 0, 1)) : lerp(80, 46, p)) * S;
    const fade = phase === "quarantine" ? 1 - clamp((phaseT - 0.8) / 0.3, 0, 1) : 1;
    const { x, y } = mal;
    ctx.save();
    // red while the threat is live; white once it is contained
    const tone = phase === "detect" ? C.threat : C.secure;
    ctx.strokeStyle = tone; ctx.lineWidth = 1.2;
    ctx.globalAlpha = phase === "detect" ? (Math.floor(phaseT * 14) % 2 ? 1 : 0.55) : fade;
    ctx.strokeRect(Math.round(x - size / 2) + 0.5, Math.round(y - size / 2) + 0.5, Math.round(size), Math.round(size));
    if (phase === "quarantine") {
      ctx.beginPath();
      for (let i = -size; i < size; i += 5) {
        ctx.moveTo(x - size / 2 + Math.max(0, i), y - size / 2 + Math.max(0, -i));
        ctx.lineTo(x - size / 2 + Math.min(size, i + size), y - size / 2 + Math.min(size, size - i));
      }
      ctx.globalAlpha *= 0.35; ctx.stroke();
    }
    ctx.restore();

    ctx.font = MONO; ctx.textBaseline = "top";
    const text = phase === "detect" ? "THREAT DETECTED" : "QUARANTINED · 1 FILE ISOLATED";
    const tw = ctx.measureText(text).width + 14;
    const lx = clamp(x - tw / 2, 8, W - tw - 8), ly = y + 48 * S;
    ctx.globalAlpha = fade;
    ctx.fillStyle = phase === "detect" ? C.threat : C.secure; ctx.fillRect(lx, ly, tw, 20);
    ctx.fillStyle = phase === "detect" ? "#ffffff" : "#0a0a0a"; ctx.fillText(text, lx + 7, ly + 5);
    ctx.globalAlpha = 1;
  }

  function draw(animated) {
    ctx.clearRect(0, 0, W, H);
    drawTrace();
    drawThread();
    drawGhosts();
    drawMalware(animated);
    drawQuarantine();
    drawHunter();
  }

  // Reduced motion: a still composition, reticle parked beside the target.
  function drawStill() {
    if (!reducedMotion) return;
    mal.x = W * 0.68; mal.y = (bounds.top + bounds.bottom) / 2 + 40;
    hunter.x = mal.x - 90 * S; hunter.y = mal.y + 30 * S; hunter.lock = 0.2;
    draw(false);
  }

  function frame(ts) {
    const t = ts / 1000;
    const dt = Math.min(0.033, lastTs ? t - lastTs : 0.016);
    lastTs = t;
    step(dt);
    draw(true);
    if (running) raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reducedMotion || !visible || document.hidden) return;
    running = true; lastTs = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  // ---------- input (listened on the hero, so the canvas never blocks clicks or scrolling) ----------
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    pointer.active = true; pointer.last = now;
  };
  const onLeave = () => { pointer.active = false; };
  // Double-click: the hunter lunges at the target.
  const onDouble = () => {
    if (phase !== "hunt") return;
    const dx = mal.x - hunter.x, dy = mal.y - hunter.y, d = len(dx, dy);
    hunter.vx += (dx / d) * 1700 * S; hunter.vy += (dy / d) * 1700 * S;
  };
  // Delete / Backspace: clear the trace (ignored while typing in a field).
  const onKey = (e) => {
    if (e.key !== "Delete" && e.key !== "Backspace") return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (!visible) return;
    clearTrace();
  };
  surface.addEventListener("pointermove", onMove, { passive: true });
  surface.addEventListener("pointerdown", onMove, { passive: true });
  surface.addEventListener("pointerleave", onLeave);
  surface.addEventListener("dblclick", onDouble);
  document.addEventListener("keydown", onKey);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    visible ? start() : stop();
  });
  io.observe(surface);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  setStatus("Hunting");
  start();

  return function destroy() {
    stop();
    ro.disconnect(); io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    surface.removeEventListener("pointermove", onMove);
    surface.removeEventListener("pointerdown", onMove);
    surface.removeEventListener("pointerleave", onLeave);
    surface.removeEventListener("dblclick", onDouble);
    document.removeEventListener("keydown", onKey);
  };
}
