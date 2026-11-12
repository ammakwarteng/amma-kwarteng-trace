import { leaveTrace } from "../../trace.js";
import { useEffect, useRef, useState } from "react";
import LockWord from "../daylight/LockWord.jsx";
import "./Trail.css";
import { usePointerVerb } from "../../pointer.js";

/*
  The trace continues below the hero: a white route draws itself down the
  page as you scroll, hopping from section to section like a traceroute.
  Each section is a node that lights up when the route reaches it.
*/

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Trail({ sections, start = 1 }) {
  const { verb } = usePointerVerb();
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const headRef = useRef(null);
  const introDone = useRef(false);   // the load-in draw plays once, not again on every layout change
  const [geo, setGeo] = useState({ d: "", w: 0, h: 0, nodes: [] });
  const [reached, setReached] = useState(-1);
  // Every section starts closed; the visitor opens what they want to read.
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else { next.add(id); leaveTrace("access.read", id, "allow", "section"); }
      return next;
    });

  // Jumping to a section (menu links, scroll arrow, a shared #link) opens it, except About,
  // which stays closed until its own title is tapped.
  useEffect(() => {
    const autoOpens = (id) => id !== "about" && sections.some((s) => s.id === id);
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (autoOpens(id)) { leaveTrace("access.read", id, "allow", "section"); setOpen((prev) => new Set(prev).add(id)); }
    };
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      if (autoOpens(id)) { leaveTrace("access.read", id, "allow", "section"); setOpen((prev) => new Set(prev).add(id)); }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", onClick);
    };
  }, [sections]);

  // Build the route from the node positions; rebuild when the layout changes.
  useEffect(() => {
    const wrap = wrapRef.current;
    const build = () => {
      const box = wrap.getBoundingClientRect();
      const secs = [...wrap.querySelectorAll(".trail__sec")];
      const pts = secs.map((sec, i) => {
        const r = sec.querySelector("[data-node]").getBoundingClientRect();
        // bottom of the previous section's visible content, so the crossing
        // line can run in the clear space between sections
        const prev = secs[i - 1];
        const prevBottom = prev
          ? Math.max(...[...prev.children].map((c) => c.getBoundingClientRect().bottom)) - box.top
          : null;
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, prevBottom };
      });
      const w = wrap.clientWidth, h = wrap.scrollHeight;
      // the line starts just under "replay intro" in the hero (centred), so it fills the space
      // between the hero and the first section; without that link, at the top of the trail
      const replay = document.querySelector(".dhero__replay");
      const startY = replay ? replay.getBoundingClientRect().bottom - box.top + 22 : 0;
      let x = w / 2, y = Math.min(startY, (pts[0]?.y ?? 0) - 40);
      let d = `M ${x} ${y}`;
      pts.forEach((p) => {
        // orthogonal hop: down, across, down, with small chamfered corners.
        // The across line sits between the previous content and this node.
        let midY = p.y - Math.min(64, (p.y - y) * 0.3);
        if (p.prevBottom != null) {
          const lo = p.prevBottom + 22, hi = p.y - 30;
          midY = lo <= hi ? (lo + hi) / 2 : hi;
        }
        if (Math.abs(p.x - x) < 1) { d += ` L ${p.x} ${p.y}`; x = p.x; y = p.y; return; }   // same column: straight down
        const c = 14 * Math.sign(p.x - x || 1);
        d += ` L ${x} ${midY - 14} L ${x + c} ${midY} L ${p.x - c} ${midY} L ${p.x} ${midY + 14} L ${p.x} ${p.y}`;
        x = p.x; y = p.y;
      });
      // the line carries on past the last section's heading (and its content, when open), ending
      // just below it rather than at the marker
      const lastSec = secs[secs.length - 1];
      if (lastSec) {
        const lastBottom = Math.max(...[...lastSec.children].map((c) => c.getBoundingClientRect().bottom)) - box.top;
        if (lastBottom + 28 > y) { d += ` L ${x} ${lastBottom + 28}`; y = lastBottom + 28; }
      }
      setGeo({ d, w, h, nodes: pts.map(({ x, y }) => ({ x, y })), first: pts[0]?.y ?? 0 });
    };
    // Rebuild whenever the page or anything inside a section changes size
    // (a section or a roadmap step opening grows its content without
    // necessarily changing the page height).
    let queued = 0;
    const schedule = () => { if (!queued) queued = requestAnimationFrame(() => { queued = 0; build(); }); };
    build();
    const ro = new ResizeObserver(schedule);
    ro.observe(wrap);
    wrap.querySelectorAll(".trail__sec, .trail__panel-inner").forEach((el) => ro.observe(el));
    document.fonts?.ready?.then(build);
    return () => { ro.disconnect(); cancelAnimationFrame(queued); };
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

    // As the page loads, the line draws itself from under "replay intro" down to About's marker
    // (once the intro film, if any, has finished). After that, scrolling takes over.
    const firstLen = lengthAtY(geo.first);
    let introT = null, introL = reduceMotion() || introDone.current ? firstLen : 0, stopped = false;
    const INTRO_MS = 1600;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tickIntro = (now) => {
      if (stopped) return;
      if (document.documentElement.classList.contains("intro-playing")) { introT = null; requestAnimationFrame(tickIntro); return; }
      if (introT === null) introT = now + 250;
      const k = Math.min(1, Math.max(0, (now - introT) / INTRO_MS));
      introL = firstLen * ease(k);
      update();
      if (k < 1) requestAnimationFrame(tickIntro); else introDone.current = true;
    };
    if (!reduceMotion() && !introDone.current) requestAnimationFrame(tickIntro);

    // Once the line has reached its end under Contact, it stays there (ball included) until the
    // visitor deliberately scrolls back up; small bounces and Safari's toolbar don't pull it back.
    let endY = null;
    const update = () => {
      raf = 0;
      const box = wrapRef.current.getBoundingClientRect();
      // at the bottom of the page the last sections can never reach the reading line, so the
      // whole route is drawn and every section counts as reached
      // (with some slack: on iPhone, Safari's toolbar can keep the very last pixels out of reach)
      const nearEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      if (nearEnd) endY = Math.max(endY ?? 0, window.scrollY);
      else if (endY !== null && window.scrollY < endY - 140) endY = null;   // scrolled back up on purpose
      const atEnd = endY !== null;
      const lineY = reduceMotion() || atEnd ? Infinity : window.innerHeight * 0.6 - box.top;
      const L = lineY === Infinity ? total : Math.max(introL, lengthAtY(lineY));
      path.style.strokeDashoffset = `${total - L}`;
      const p = path.getPointAtLength(L);
      if (headRef.current) {
        headRef.current.setAttribute("transform", `translate(${p.x} ${p.y})`);
        headRef.current.style.opacity = L > 2 ? 1 : 0;   // it stays on at the end, marking where the line finishes
      }
      let last = -1;
      geo.nodes.forEach((n, i) => { if ((L > 2 && p.y >= n.y - 1) || lineY === Infinity) last = i; });   // a section is reached once the line has actually arrived
      setReached(last);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      stopped = true;
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

      {sections.map((s, i) => {
        const isOpen = open.has(s.id);
        const panelId = `${s.id}-panel`;
        return (
          <section
            key={s.id}
            id={s.id}
            className={`trail__sec ${(i + start - 1) % 2 ? "is-right" : ""} ${i <= reached ? "is-reached" : ""} ${isOpen ? "is-open" : ""}`}
            aria-labelledby={`${s.id}-title`}
          >
            <div className="trail__head-row">
              <span className="trail__node" data-node aria-hidden="true" />
              <span className="trail__hop mono">{String(i + start).padStart(2, "0")} · {s.kicker || s.label}</span>
            </div>
            <h2 className="trail__h" id={`${s.id}-title`}>
              <button
                type="button"
                className="trail__toggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={s.label}
                onClick={() => toggle(s.id)}
              >
                <span className="trail__title"><LockWord text={s.label} /></span>
                <span className="trail__icon" aria-hidden="true" />
              </button>
            </h2>
            {i === 0 && <p className="trail__hint mono" aria-hidden="true">{isOpen ? `${verb} the title to close` : `${verb} to open`}</p>}
            <div className="trail__panel" id={panelId} {...(isOpen ? {} : { inert: "" })}>
              <div className="trail__panel-inner">
                <div className="trail__body">{s.body}</div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
