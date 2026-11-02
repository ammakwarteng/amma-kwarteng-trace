import { useEffect, useRef, useState } from "react";
import DecryptText from "./DecryptText.jsx";
import "./Trail.css";

/*
  The trace continues below the hero: a white route draws itself down the
  page as you scroll, hopping from section to section like a traceroute.
  Each section is a node that lights up when the route reaches it.
*/

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Trail({ sections }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const [geo, setGeo] = useState({ d: "", w: 0, h: 0, nodes: [] });
  const [reached, setReached] = useState(-1);

  // Build the route from the node positions; rebuild when the layout changes.
  useEffect(() => {
    const wrap = wrapRef.current;
    const build = () => {
      const box = wrap.getBoundingClientRect();
      const pts = [...wrap.querySelectorAll("[data-node]")].map((n) => {
        const r = n.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      const w = wrap.clientWidth, h = wrap.scrollHeight;
      let x = w / 2, y = 0;
      let d = `M ${x} ${y}`;
      pts.forEach((p) => {
        // orthogonal hop: down, across, down, with small chamfered corners
        const midY = p.y - Math.min(120, (p.y - y) * 0.45);
        const c = 14 * Math.sign(p.x - x || 1);
        d += ` L ${x} ${midY - 14} L ${x + c} ${midY} L ${p.x - c} ${midY} L ${p.x} ${midY + 14} L ${p.x} ${p.y}`;
        x = p.x; y = p.y;
      });
      d += ` L ${x} ${h}`;
      setGeo({ d, w, h, nodes: pts });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(wrap);
    document.fonts?.ready?.then(build);
    return () => ro.disconnect();
  }, [sections.length]);

  // Draw the route up to the reading line (60% down the viewport).
  useEffect(() => {
    const path = pathRef.current;
    if (!path || !geo.d) return;
    const total = path.getTotalLength();
    path.style.strokeDasharray = `${total}`;
    let raf = 0;

    const lengthAtY = (yLimit) => {
      let lo = 0, hi = total;
      for (let i = 0; i < 22; i++) {
        const mid = (lo + hi) / 2;
        if (path.getPointAtLength(mid).y <= yLimit) lo = mid; else hi = mid;
      }
      return lo;
    };

    const update = () => {
      raf = 0;
      const box = wrapRef.current.getBoundingClientRect();
      const lineY = reduceMotion() ? Infinity : window.innerHeight * 0.6 - box.top;
      const L = lineY === Infinity ? total : Math.max(0, lengthAtY(lineY));
      path.style.strokeDashoffset = `${total - L}`;
      const p = path.getPointAtLength(L);
      if (headRef.current) {
        headRef.current.setAttribute("transform", `translate(${p.x} ${p.y})`);
        headRef.current.style.opacity = L > 2 && L < total - 2 ? 1 : 0;
      }
      let last = -1;
      geo.nodes.forEach((n, i) => { if (p.y >= n.y - 1 || lineY === Infinity) last = i; });
      setReached(last);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [geo]);

  return (
    <div className="trail" ref={wrapRef}>
      <svg className="trail__svg" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w || 1} ${geo.h || 1}`} aria-hidden="true">
        <path className="trail__ghost" d={geo.d} />
        <path className="trail__path" ref={pathRef} d={geo.d} />
        <g ref={headRef} className="trail__head">
          <circle r="9" />
          <path d="M -15 0 H -5 M 5 0 H 15 M 0 -15 V -5 M 0 5 V 15" />
        </g>
      </svg>

      {sections.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`trail__sec ${i % 2 ? "is-right" : ""} ${i <= reached ? "is-reached" : ""}`}
          aria-labelledby={`${s.id}-title`}
        >
          <div className="trail__head-row">
            <span className="trail__node" data-node aria-hidden="true" />
            <span className="trail__hop mono">hop {String(i + 1).padStart(2, "0")} · {s.id}</span>
          </div>
          <DecryptText as="h2" id={`${s.id}-title`} className="trail__title" text={s.label} />
          <div className="trail__body">{s.body}</div>
        </section>
      ))}
    </div>
  );
}
