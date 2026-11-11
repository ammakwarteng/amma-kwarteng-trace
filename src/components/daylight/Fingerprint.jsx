import { useEffect, useRef } from "react";

/*
  A generated fingerprint (it belongs to no one: drawn from maths, never from a real finger).
  Ridges are drawn once; a reading band then passes slowly down the print, as if it were being
  scanned, and each pass ends with the ridges lighting up: green (verified) on most passes, red
  (denied) on every third. onResult tells the caption. Reduced motion: a still print.
*/
function rand(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

function drawRidges(ctx, w, h, ink) {
  const r = rand(20261111);
  const cx = w * 0.5, cy = h * 0.52, R = Math.min(w, h) * 0.46;
  ctx.save();
  ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.78, R, 0, 0, Math.PI * 2); ctx.clip();   // fingertip outline
  ctx.strokeStyle = ink; ctx.lineCap = "round";
  const step = Math.max(3.4, R / 30);
  // every ridge follows the same smooth loop shape, scaled outward, so ridges run parallel and
  // never cross; small breaks and a slight drift make it read as a real print
  for (let k = 1; k * step < R * 1.3; k++) {
    const rad = k * step;
    ctx.lineWidth = Math.max(1, step * 0.4);
    let drawing = true, run = 0;
    ctx.beginPath();
    for (let i = 0; i <= 320; i++) {
      const t = (i / 320) * Math.PI * 2;
      const lx = 0.78 + 0.06 * Math.sin(2 * t);
      const ly = 1.06 + 0.12 * Math.max(0, -Math.sin(t));          // the loop rises at the top
      const drift = Math.sin(t * 3 + rad * 0.015) * step * 0.18;   // ridges ripple a little
      const x = cx + Math.cos(t) * (rad * lx + drift) + rad * 0.06;
      const y = cy + Math.sin(t) * (rad * ly + drift) - rad * 0.12;
      if (drawing) { run === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); run++; }
      if (r() < 0.006) { drawing = !drawing; run = 0; }           // ridge endings
    }
    ctx.stroke();
  }
  ctx.restore();
}

export default function Fingerprint({ className = "", onResult }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, ridges = null, W = 0, H = 0, dpr = 1, visible = true;
    const ink = getComputedStyle(canvas).color || "#ffffff";
    const css = getComputedStyle(document.documentElement);
    const GREEN = css.getPropertyValue("--secure").trim() || "#57e389";
    const RED = css.getPropertyValue("--threat").trim() || "#ff2b2b";
    let green = null, red = null, lastPass = -1;
    const setup = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ridges = document.createElement("canvas"); ridges.width = canvas.width; ridges.height = canvas.height;
      const rc = ridges.getContext("2d"); rc.scale(dpr, dpr); drawRidges(rc, W, H, ink);
      const tint = (color) => { const c = document.createElement("canvas"); c.width = canvas.width; c.height = canvas.height; const x = c.getContext("2d"); x.scale(dpr, dpr); drawRidges(x, W, H, color); return c; };
      green = tint(GREEN); red = tint(RED);
    };
    const frame = (now) => {
      raf = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = reduce ? 0.85 : 0.42; ctx.drawImage(ridges, 0, 0);
      if (!reduce) {
        const period = 6400, pass = Math.floor(now / period), p = (now % period) / period;
        const SCAN = 0.68;                                  // scanning, then the result lights up
        if (p < SCAN) {
          const q = p / SCAN, band = canvas.height * 0.16, y = (q * 1.3 - 0.15) * canvas.height;
          ctx.save(); ctx.beginPath(); ctx.rect(0, y - band, canvas.width, band * 2); ctx.clip();
          ctx.globalAlpha = 1; ctx.drawImage(ridges, 0, 0); ctx.restore();
          ctx.globalAlpha = 0.5; ctx.fillStyle = ink; ctx.fillRect(0, y, canvas.width, Math.max(1, dpr));
          if (lastPass !== -2) { lastPass = -2; onResult?.("scanning"); }
        } else {
          const denied = pass % 3 === 2;
          const r = (p - SCAN) / (1 - SCAN);              // 0..1 across the result
          ctx.globalAlpha = Math.sin(Math.PI * Math.min(1, r * 1.15)) * 0.95;
          ctx.drawImage(denied ? red : green, 0, 0);
          if (lastPass !== pass) { lastPass = pass; onResult?.(denied ? "denied" : "verified"); }
        }
        if (visible) raf = requestAnimationFrame(frame);
      }
    };
    setup(); frame(performance.now());
    const ro = new ResizeObserver(() => { setup(); if (!raf) frame(performance.now()); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf && !reduce) raf = requestAnimationFrame(frame); });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);
  return <canvas ref={ref} className={`fingerprint ${className}`} role="img" aria-label="A fingerprint being scanned" />;
}
