import { useEffect, useRef } from "react";
import "./archive.css";

/*
  The Living Archive: every section below the hero opens the same way, like a page in a
  printed publication: a hairline across the grid, a mono running label
  ("§ 03 — PROJECTS · CASE FILES · 3 ENTRIES") and a measured sans heading.
  The hairline draws across and the contents rise a little the first time the section
  comes into view (once only; reduced motion: everything is simply there).
*/
export default function Section({ id, n, label, kicker, title, className = "", children }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
    }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const no = String(n).padStart(2, "0");
  return (
    <section ref={ref} id={id} className={`sec sec--${id} ${className}`} aria-labelledby={`${id}-title`} data-folio={`${no} / ${label}`}>
      <header className="sec__head">
        <p className="sec__label mono"><span>§ {no} — {label}</span>{kicker && <span className="sec__kicker"> · {kicker}</span>}</p>
        <h2 className="sec__title" id={`${id}-title`}>{title}</h2>
      </header>
      <div className="sec__body">{children}</div>
    </section>
  );
}
