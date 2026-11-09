import { leaveTrace } from "../../trace.js";
import { useEffect, useRef, useState } from "react";
import DecryptText from "./DecryptText.jsx";
import "./Trail.css";

/*
  The numbered portfolio sections below the hero stage. Each one opens and closes from its
  title; menu links and shared #links open the section they point to.
*/

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Trail({ sections, start = 1 }) {
  const wrapRef = useRef(null);
  const [reached, setReached] = useState(-1);
  // Every section starts closed; the visitor opens what they want to read.
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else { next.add(id); leaveTrace("access.read", id, "allow", "section"); }
      return next;
    });

  // Jumping to a section (menu links, scroll arrow, a shared #link) opens it.
  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (sections.some((s) => s.id === id)) { leaveTrace("access.read", id, "allow", "section"); setOpen((prev) => new Set(prev).add(id)); }
    };
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      if (sections.some((s) => s.id === id)) { leaveTrace("access.read", id, "allow", "section"); setOpen((prev) => new Set(prev).add(id)); }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", onClick);
    };
  }, [sections]);

  // A section counts as reached (its number reads "verified" and its title brightens) once
  // its top passes 60% of the screen height. Reduced motion: everything starts reached.
  useEffect(() => {
    const wrap = wrapRef.current;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (reduceMotion()) { setReached(sections.length - 1); return; }
      const line = window.innerHeight * 0.6;
      let last = -1;
      wrap.querySelectorAll(".trail__sec").forEach((sec, i) => { if (sec.getBoundingClientRect().top <= line) last = i; });
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
  }, [sections.length]);

  return (
    <div className="trail" ref={wrapRef}>
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
              <span className="trail__hop mono">{String(i + start).padStart(2, "0")} · {s.label}{i <= reached && <span className="st"> · verified</span>}</span>
            </div>
            <h2 className="trail__h tf tf-lock" id={`${s.id}-title`}>
              <button
                type="button"
                className="trail__toggle"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={s.label}
                onClick={() => toggle(s.id)}
              >
                <DecryptText className="trail__title" text={s.label} />
                <span className="trail__icon" aria-hidden="true" />
              </button>
            </h2>
            {i === 0 && <p className="trail__hint mono" aria-hidden="true">{isOpen ? "tap the title to close" : "tap to open"}</p>}
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
