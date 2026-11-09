import { useEffect, useRef } from "react";
import { leaveTrace } from "../trace.js";
import "./TraceImprint.css";

/*
  TRACE IMPRINT: the "trace" wordmark as a living typographic object.
  - On load it reconstructs from thin horizontal slices (about 1.4 s), then sits perfectly still.
  - Moving across it leaves faint silver outline impressions of the letterforms, behind the white
    type, that drift 4-10 px with the movement and fade within ~900 ms (at most 4 at a time).
  - Clicking or tapping leaves two or three delicate echoes that separate and fade in sequence.
  - Every ~8 s a soft silver highlight passes through the letters, clipped to their shapes.
  The white wordmark itself never moves. Reduced motion: no reconstruction, imprints or scan.
*/
const SLICES = 6;
const MAX_IMPRINTS = 4;

export default function TraceImprint({ text = "trace" }) {
  const wrap = useRef(null);
  const base = useRef(null);
  const slices = useRef(null);

  // reconstruction, once the intro screen has lifted
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = wrap.current;
    if (reduce) { el.classList.add("is-built"); return; }
    let started = false;
    const start = () => {
      if (started) return; started = true;
      el.classList.add("is-building");
      const layers = [...slices.current.children];
      const anims = layers.map((s, i) => {
        const dir = i % 2 ? 1 : -1, dx = dir * (6 + ((i * 7) % 11));   // 6-16 px, alternating sides
        return s.animate(
          [{ transform: `translateX(${dx}px)`, opacity: 0 }, { transform: `translateX(${dx * 0.25}px)`, opacity: 1, offset: 0.55 }, { transform: "translateX(0)", opacity: 1 }],
          { duration: 1400, delay: i * 45, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "both" }
        );
      });
      Promise.all(anims.map((a) => a.finished)).then(() => { el.classList.remove("is-building"); el.classList.add("is-built"); }).catch(() => {});
    };
    if (!document.documentElement.classList.contains("is-loading")) { setTimeout(start, 150); return; }
    const onDone = () => setTimeout(start, 250);
    addEventListener("trace:intro-done", onDone, { once: true });
    const safety = setTimeout(start, 4000);   // never leave it hidden
    return () => { removeEventListener("trace:intro-done", onDone); clearTimeout(safety); };
  }, []);

  // imprints and echoes
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wrap.current;
    let last = 0, lx = null, ly = null, alive = 0, clicked = false;
    const imprint = (dx, dy, delay = 0, strength = 0.8) => {
      if (alive >= MAX_IMPRINTS + 2) return;
      const copy = document.createElement("span");
      copy.className = "imprint__echo"; copy.textContent = text; copy.setAttribute("aria-hidden", "true");
      el.insertBefore(copy, base.current); alive++;
      const a = copy.animate(
        [{ transform: "translate(0,0)", opacity: 0 }, { transform: `translate(${dx * 0.5}px, ${dy * 0.5}px)`, opacity: strength, offset: 0.18 }, { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }],
        { duration: 900, delay, easing: "cubic-bezier(0.25, 0.7, 0.3, 1)", fill: "both" }
      );
      a.finished.finally(() => { copy.remove(); alive--; });
    };
    const onMove = (e) => {
      if (!el.classList.contains("is-built")) return;
      const now = performance.now();
      if (lx === null) { lx = e.clientX; ly = e.clientY; return; }
      const mx = e.clientX - lx, my = e.clientY - ly, d = Math.hypot(mx, my);
      if (now - last < 110 || d < 6 || alive >= MAX_IMPRINTS) return;
      last = now; lx = e.clientX; ly = e.clientY;
      const k = Math.min(10, Math.max(4, d * 0.35)) / d;                       // 4-10 px, in the direction of travel
      imprint(mx * k, my * k);
    };
    const onLeave = () => { lx = ly = null; };
    const onTap = (e) => {
      if (!el.classList.contains("is-built")) return;
      const r = base.current.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const vx = e.clientX - cx, vy = e.clientY - cy, d = Math.hypot(vx, vy) || 1;
      [4, 7, 10].forEach((m, i) => imprint((-vx / d) * m, (-vy / d) * m, i * 110, 0.85 - i * 0.18));
      if (!clicked) { clicked = true; leaveTrace("trace.imprint", "visitor left an imprint on the wordmark", "recorded"); }
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("click", onTap);
    return () => { el.removeEventListener("pointermove", onMove); el.removeEventListener("pointerleave", onLeave); el.removeEventListener("click", onTap); };
  }, [text]);

  return (
    <span className="imprint" ref={wrap}>
      <span className="imprint__slices" ref={slices} aria-hidden="true">
        {Array.from({ length: SLICES }, (_, i) => {
          const top = i === 0 ? -40 : (i * 100) / SLICES, bottom = i === SLICES - 1 ? -40 : 100 - ((i + 1) * 100) / SLICES;
          return <span key={i} className="imprint__slice" style={{ clipPath: `inset(${top}% -20% ${bottom}% -20%)` }}>{text}</span>;
        })}
      </span>
      <span className="imprint__base" ref={base}>{text}</span>
      <span className="imprint__scan" aria-hidden="true">{text}</span>
    </span>
  );
}
