import { useEffect, useRef } from "react";
import { seeded, between } from "../lib/random.js";
import "./TracePoster.css";

/*
  The TRACE poster: a torn, wheat-pasted sheet of paper with the word TRACE
  printed on it. Pixels "drip" out of the letters as a data smear, the trace
  a file leaves behind. Everything is drawn on a canvas from a fixed seed,
  so the composition is identical on every visit.

  The real word is in an <h1> for screen readers and search engines; the
  canvas is decorative.
*/

const WORD = "TRACE";
const PAPER = "#e9e5de";
const INK = "#141414";
const SMEAR = [
  { c: "#141414", w: 3 },
  { c: "#ff5a1f", w: 4 },
  { c: "#e9e5de", w: 2 },
  { c: "#8fd3ff", w: 3 },
  { c: "#c7401a", w: 1 },
  { c: "#5b5752", w: 1 },
];

function pick(rand, list) {
  const total = list.reduce((a, b) => a + b.w, 0);
  let r = rand() * total;
  for (const item of list) {
    if ((r -= item.w) <= 0) return item.c;
  }
  return list[0].c;
}

function noisePattern(ctx, size = 160, seed = 7) {
  const rand = seeded(seed);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 110 + rand() * 145;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return ctx.createPattern(c, "repeat");
}

// Sparse specks where the ink did not take, like a worn screen print.
function wearPattern(ctx, dpr, seed = 3) {
  const rand = seeded(seed);
  const size = Math.round(120 * dpr);
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const img = g.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i + 3] = rand() < 0.022 ? 90 + rand() * 120 : 0;
  }
  g.putImageData(img, 0, 0);
  return ctx.createPattern(c, "repeat");
}

// A rectangle with a hand-torn edge: small jitter everywhere, a few bigger rips.
function tornPath(ctx, x0, y0, x1, y1, rand, step) {
  const pts = [];
  const edge = (ax, ay, bx, by, nx, ny) => {
    const len = Math.hypot(bx - ax, by - ay);
    const n = Math.max(2, Math.round(len / step));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      let j = between(rand, -1, 1) * step * 0.45;
      if (rand() < 0.06) j += between(rand, 0.6, 2.2) * step;
      pts.push([ax + (bx - ax) * t + nx * j, ay + (by - ay) * t + ny * j]);
    }
  };
  edge(x0, y0, x1, y0, 0, 1);
  edge(x1, y0, x1, y1, -1, 0);
  edge(x1, y1, x0, y1, 0, -1);
  edge(x0, y1, x0, y0, 1, 0);
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}


function buildScene(W, H, dpr) {
  const isNarrow = W / dpr < 700;
  const rand = seeded(2026);
  // Size the word to fill the sheet, but keep the sheet inside the top ~70%
  // of the canvas so the smear has room to fall.
  const probe = document.createElement("canvas").getContext("2d");
  const measure = (size) => {
    probe.font = `${size}px Anton`;
    const mm = probe.measureText(WORD);
    const asc = mm.actualBoundingBoxAscent || size * 0.74;
    const des = mm.actualBoundingBoxDescent || 0;
    const lab = Math.max(11 * dpr, size * 0.05);
    const py = Math.max(16 * dpr, size * 0.09);
    return { m: mm, ascent: asc, descent: des, capH: asc + des, labelH: lab, padY: py, sheetH: py * 2 + lab * 3.2 + asc + des };
  };
  const maxW = W * (isNarrow ? 0.96 : 0.91);
  probe.font = "100px Anton";
  let fs = (maxW * 0.9) / probe.measureText(WORD).width * 100;
  let met = measure(fs);
  const maxSheet = H * (isNarrow ? 0.62 : 0.74);
  if (met.sheetH > maxSheet) { fs *= maxSheet / met.sheetH; met = measure(fs); }
  const { m, ascent, descent, capH, labelH, padY } = met;
  const paperW = Math.min(maxW, m.width / 0.9);
  const paper = { x0: (W - paperW) / 2, x1: (W + paperW) / 2, y0: H * 0.03 };
  paper.y1 = paper.y0 + met.sheetH;
  const baseline = paper.y0 + padY + labelH * 1.6 + ascent;
  const textX = (paper.x0 + paper.x1) / 2;

  // ---- Base layer: shadow, torn paper, texture, ink ----
  const base = document.createElement("canvas");
  base.width = W; base.height = H;
  const b = base.getContext("2d");
  const pattern = noisePattern(b);

  b.save();
  tornPath(b, paper.x0, paper.y0, paper.x1, paper.y1, seeded(11), 9 * dpr);
  b.shadowColor = "rgba(0,0,0,0.55)";
  b.shadowBlur = 40 * dpr;
  b.shadowOffsetY = 18 * dpr;
  b.fillStyle = PAPER;
  b.fill();
  b.restore();

  b.save();
  tornPath(b, paper.x0, paper.y0, paper.x1, paper.y1, seeded(11), 9 * dpr);
  b.clip();
  // paper grain
  b.globalCompositeOperation = "multiply";
  b.globalAlpha = 0.16;
  b.fillStyle = pattern;
  b.fillRect(0, 0, W, H);
  b.globalAlpha = 1;
  // wheat-paste creases
  for (let i = 0; i < 7; i++) {
    const y = between(rand, paper.y0, paper.y1);
    const g = b.createLinearGradient(0, y - 6 * dpr, 0, y + 6 * dpr);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.5, `rgba(60,50,40,${between(rand, 0.05, 0.12)})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    b.fillStyle = g;
    b.fillRect(paper.x0, y - 6 * dpr, paperW, 12 * dpr);
  }
  const fx = paper.x0 + paperW * between(rand, 0.55, 0.7);
  const fold = b.createLinearGradient(fx - 14 * dpr, 0, fx + 14 * dpr, 0);
  fold.addColorStop(0, "rgba(0,0,0,0)");
  fold.addColorStop(0.5, "rgba(70,60,50,0.12)");
  fold.addColorStop(1, "rgba(255,255,255,0)");
  b.fillStyle = fold;
  b.fillRect(fx - 14 * dpr, paper.y0, 28 * dpr, paper.y1 - paper.y0);
  b.globalCompositeOperation = "source-over";

  // Ink: the word, printed slightly worn.
  const ink = document.createElement("canvas");
  ink.width = W; ink.height = H;
  const k = ink.getContext("2d");
  k.fillStyle = INK;
  k.font = `${fs}px Anton`;
  k.textAlign = "center";
  k.textBaseline = "alphabetic";
  k.fillText(WORD, textX, baseline);
  k.globalCompositeOperation = "destination-out";
  k.fillStyle = wearPattern(k, dpr);
  k.fillRect(0, 0, W, H);
  k.globalCompositeOperation = "source-over";

  // Small print in the corners of the poster.
  const small = Math.round(labelH);
  b.fillStyle = INK;
  b.font = `500 ${small}px "JetBrains Mono", monospace`;
  b.textBaseline = "top";
  b.textAlign = "left";
  b.fillText("FILE 001 / PERSONAL ARCHIVE", paper.x0 + padY, paper.y0 + padY * 0.7);
  b.textAlign = "right";
  b.fillText(isNarrow ? "AK — 2026" : "AMMA KWARTENG — 2026", paper.x1 - padY, paper.y0 + padY * 0.7);
  b.textBaseline = "bottom";
  b.textAlign = "left";
  b.fillText("CYBERSECURITY · IT · DESIGN", paper.x0 + padY, paper.y1 - padY * 0.6);
  b.textAlign = "right";
  b.fillText(isNarrow ? "NO. 01" : "EXHIBIT NO. 01", paper.x1 - padY, paper.y1 - padY * 0.6);
  b.restore();

  b.drawImage(ink, 0, 0);

  // ---- Data smear: pixel columns that run out of the letters ----
  const inkData = k.getImageData(0, 0, W, H).data;
  const col = Math.max(2, Math.round(3 * dpr));
  const textLeft = textX - m.width / 2;
  const letterW = m.width / WORD.length;
  const heavy = new Set([1, 3]); // R and C bleed the most
  const drips = [];
  const r2 = seeded(42);
  for (let x = Math.floor(textLeft); x < textLeft + m.width; x += col) {
    // lowest inked pixel in this column
    let yb = -1;
    for (let y = Math.min(H - 1, Math.floor(baseline + descent + 2)); y > baseline - capH; y--) {
      if (inkData[(y * W + x) * 4 + 3] > 120) { yb = y; break; }
    }
    if (yb < 0 || yb < baseline - capH * 0.12) continue;
    const letter = Math.min(WORD.length - 1, Math.floor((x - textLeft) / letterW));
    const density = heavy.has(letter) ? 0.8 : 0.22;
    if (r2() > density) continue;
    const room = H - yb;
    const len = room * Math.pow(r2(), heavy.has(letter) ? 1.3 : 2.4) * 0.95;
    const bands = [];
    let acc = 0;
    while (acc < len) {
      const h = between(r2, 4, 34) * dpr;
      bands.push({ h, c: acc === 0 ? INK : pick(r2, SMEAR) });
      acc += h;
    }
    drips.push({ x: x + Math.round(between(r2, -1, 1)) * (r2() < 0.15 ? col : 0), y: yb - capH * 0.04, len, bands, speed: between(r2, 0.6, 1) });
  }

  // A few displaced slices of the letters, like a corrupted scanline.
  const slices = [];
  for (let i = 0; i < 3; i++) {
    const sy = baseline - capH * between(r2, 0.2, 0.8);
    const sx = textLeft + m.width * between(r2, 0.05, 0.6);
    const sw = m.width * between(r2, 0.12, 0.3);
    slices.push({ sx, sw, sy, h: between(r2, 5, 14) * dpr, dx: (r2() < 0.5 ? -1 : 1) * between(r2, 10, 26) * dpr, tint: i === 1 ? "#8fd3ff" : "#ff5a1f" });
  }

  return { base, ink, drips, slices, col, W, H };
}

function drawFrame(ctx, scene, t, pointerX) {
  const { base, ink, drips, slices, col, W, H } = scene;
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(base, 0, 0);

  // glitch slices
  for (const s of slices) {
    // cut a strip of the word, cover the hole with paper, and shift the strip sideways
    ctx.fillStyle = PAPER;
    ctx.fillRect(s.sx, s.sy, s.sw, s.h);
    ctx.drawImage(ink, s.sx, s.sy, s.sw, s.h, s.sx + s.dx * t, s.sy, s.sw, s.h);
    ctx.fillStyle = s.tint;
    ctx.globalAlpha = 0.9 * t;
    ctx.fillRect(s.sx + s.dx * t + (s.dx > 0 ? s.sw : -6 * (s.h / 6)), s.sy, 6 * (s.h / 6), s.h);
    ctx.globalAlpha = 1;
  }

  for (const d of drips) {
    const reach = d.len * Math.min(1, t * (0.6 + d.speed * 0.6));
    let y = d.y;
    const end = d.y + reach;
    // drips lean very slightly toward the pointer (0 when there is none)
    const lean = pointerX == null ? 0 : (pointerX - d.x) / W;
    for (const band of d.bands) {
      if (y >= end) break;
      const h = Math.min(band.h, end - y);
      const progress = (y - d.y) / Math.max(1, d.len);
      ctx.fillStyle = band.c;
      ctx.fillRect(Math.round(d.x + lean * progress * 22), Math.round(y), col, Math.ceil(h));
      y += band.h;
    }
  }
}

export default function TracePoster() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene = null;
    let raf = 0;
    let start = 0;
    let pointerX = null;
    let targetX = null;
    let cancelled = false;

    const render = (now) => {
      if (!scene) return;
      if (!start) start = now;
      const t = reduce ? 1 : Math.min(1, (now - start) / 1600);
      const eased = 1 - Math.pow(1 - t, 3);
      if (targetX != null) pointerX = pointerX == null ? targetX : pointerX + (targetX - pointerX) * 0.08;
      drawFrame(ctx, scene, eased, reduce ? null : pointerX);
      const settling = targetX != null && pointerX != null && Math.abs(targetX - pointerX) > 0.5;
      if (t < 1 || settling) raf = requestAnimationFrame(render);
    };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = wrap.clientWidth;
      const h = Math.round(w < 700 ? w * 1.05 : Math.min(w * 0.56, window.innerHeight * 0.74));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      scene = buildScene(canvas.width, canvas.height, dpr);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };

    const ready = document.fonts?.load
      ? Promise.all([document.fonts.load('100px "Anton"'), document.fonts.load('12px "JetBrains Mono"')]).catch(() => {})
      : Promise.resolve();
    ready.then(() => { if (!cancelled) build(); });

    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { start = performance.now() - 10_000; build(); }, 150);
    });
    ro.observe(wrap);

    const onMove = (e) => {
      if (reduce || !scene) return;
      const r = canvas.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width) * scene.W;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="poster" ref={wrapRef}>
      <canvas ref={canvasRef} className="poster__canvas" aria-hidden="true" />
    </div>
  );
}
