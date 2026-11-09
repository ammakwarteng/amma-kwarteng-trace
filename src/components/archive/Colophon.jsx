import { useEffect, useRef } from "react";
import { links, owner } from "../../data/site.js";
import EmailLink from "../EmailLink.jsx";

/*
  The close of the archive: the contact links, a short colophon, "back to top", and the
  masthead returning as an oversized "trace" cropped by the bottom edge of the page.
  The word drifts a few pixels sideways with the scroll (still with reduced motion).
*/
export function Contact() {
  const toTop = () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    document.querySelector(".header__brand")?.focus({ preventScroll: true });
  };
  return (
    <div className="ct">
      <div className="ct__reach">
        <p className="ct__label mono">write to me</p>
        <p className="ct__email"><EmailLink variant="full" /></p>
        <ul className="ct__links">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label}<span className="ct__arrow" aria-hidden="true">↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
      <dl className="ct__colophon mono">
        <div><dt>colophon</dt><dd>trace · {owner.name.toLowerCase()}</dd></div>
        <div><dt>set in</dt><dd>bodoni moda, inter tight, jetbrains mono</dd></div>
        <div><dt>built with</dt><dd>react and vite</dd></div>
        <div><dt>hosted on</dt><dd>github pages</dd></div>
        <div><dt>portrait</dt><dd>animated with higgsfield</dd></div>
      </dl>
      <button type="button" className="ct__top mono" onClick={toTop}>
        <span aria-hidden="true">↑</span> back to top
      </button>
    </div>
  );
}

export function Colophon() {
  const word = useRef(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = word.current; if (!el) return;
      const r = el.parentElement.getBoundingClientRect();
      const t = Math.min(1, Math.max(0, 1 - r.top / innerHeight));   // 0 as it enters, 1 at the end
      el.style.transform = `translate3d(${(-3 + 3 * t).toFixed(2)}vw, 0, 0)`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, []);
  return (
    <footer className="colo">
      <p className="colo__rights mono">© {new Date().getFullYear()} {owner.name.toLowerCase()}. all rights reserved.</p>
      <div className="colo__mark" aria-hidden="true"><span ref={word}>trace</span></div>
    </footer>
  );
}
