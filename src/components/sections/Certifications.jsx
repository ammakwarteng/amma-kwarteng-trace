import { useEffect, useRef } from "react";
import { certifications } from "../../data/content.js";
import "./sections.css";

const LABEL = { studying: "currently studying", next: "next goal", planned: "planned", earned: "earned" };

// Shown publicly: earned certifications plus the one being studied and the
// next goal. "planned" ones stay in content.js. Change a status to "earned"
// only once the exam is passed. The strip always scrolls; with only a few
// cards they are repeated so the loop fills even a wide screen.
const ORDER = { earned: 0, studying: 1, next: 2 };
const shown = certifications
  .filter((c) => c.status in ORDER)
  .sort((a, b) => ORDER[a.status] - ORDER[b.status]);
const LOOP_MIN = 8; // cards per loop, enough to span any screen width
const loop = Array.from({ length: Math.ceil(LOOP_MIN / Math.max(1, shown.length)) }, () => shown).flat();

/*
  A moving strip of certification cards.
  - Drifts on its own in a seamless loop.
  - Mouse: the pointer steers it (right side scrolls that way, left side
    reverses, the middle nearly stops so a card can be read).
  - Touch: swipe to move it.
  - Reduced motion: no drift; the strip just scrolls sideways normally.
  Screen readers get the plain list instead of the moving copy.
*/
export default function Certifications() {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current, track = trackRef.current;
    if (!wrap || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      wrap.classList.add("is-static");
      return;
    }
    let x = 0, speed = -38, target = -38, raf = 0, last = 0, visible = false;
    let dragging = false, dragX = 0, hovering = false;
    const half = () => track.scrollWidth / 2;

    const frame = (t) => {
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016);
      last = t;
      if (!dragging) {
        speed += (target - speed) * Math.min(1, dt * 4);
        x += speed * dt;
      }
      const h = half();
      if (h > 0) { while (x <= -h) x += h; while (x > 0) x -= h; }
      track.style.transform = `translate3d(${x}px,0,0)`;
      raf = visible ? requestAnimationFrame(frame) : 0;
    };
    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && e.boundingClientRect.height > 0; if (visible) start(); });
    io.observe(wrap);

    const onMove = (e) => {
      if (e.pointerType === "mouse" && !dragging) {
        hovering = true;
        const r = wrap.getBoundingClientRect();
        const rel = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
        const dead = Math.abs(rel) < 0.12 ? 0 : rel - Math.sign(rel) * 0.12;
        target = -dead * 900;                                 // steer toward the pointer side
        if (Math.abs(target) < 8) target = -8;
      }
      if (dragging) { x += e.clientX - dragX; dragX = e.clientX; }
    };
    const onLeave = () => { hovering = false; if (!dragging) target = -38; };
    const onDown = (e) => {
      if (e.pointerType === "mouse") return;
      dragging = true; dragX = e.clientX; speed = 0;
    };
    const onUp = () => { if (dragging) { dragging = false; target = hovering ? target : -38; } };

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf); io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const card = (c, key) => (
    <article key={key} className={`cert is-${c.status}`}>
      <div className="cert__top mono">
        <span>{c.issuer}</span>
        <span className="cert__status">{LABEL[c.status]}</span>
      </div>
      <p className="cert__code">{c.code}</p>
      <p className="cert__name">{c.name}</p>
    </article>
  );

  return (
    <div className="certs-wrap">
      <div className="marquee" ref={wrapRef} aria-hidden="true">
        <div className="marquee__track" ref={trackRef}>
          {loop.map((c, i) => card(c, `a-${i}`))}
          {loop.map((c, i) => card(c, `b-${i}`))}
        </div>
      </div>
      <p className="marquee__hint mono" aria-hidden="true">move your mouse over the strip to steer it · swipe on touch</p>

      <ul className="visually-hidden">
        {shown.map((c) => (
          <li key={c.name}>{c.name}, {c.issuer}: {LABEL[c.status]}</li>
        ))}
      </ul>
    </div>
  );
}
