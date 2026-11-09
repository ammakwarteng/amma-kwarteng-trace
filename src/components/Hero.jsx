import { useEffect, useRef, useState } from "react";
import { owner, links, heroMedia } from "../data/site.js";
import HeroMedia from "./HeroMedia.jsx";
import TraceImprint from "./TraceImprint.jsx";
import EmailLink from "./EmailLink.jsx";
import { AboutText, Roadmap } from "./sections/About.jsx";
import "./Hero.css";
import "./HeroEditorial.css";
import "./HeroStage.css";

/*
  The hero stage: the signature interaction of TRACE.
  The full-screen portrait is pinned while the visitor scrolls a short distance. Over that
  distance the frame is clipped down to the image panel of the About section (.stage__slot)
  and the portrait inside it is re-framed to stay centred on her, while the hero type fades
  out and the About heading and introduction fade in beside the panel. After that the page
  scrolls on normally: no scroll lock, no snapping.
  - Native scrolling only; the effect just reads the scroll position (one rAF per frame).
  - Phones: the same idea stacked vertically (panel on top, heading and lead line under it);
    the rest of the introduction follows below the stage.
  - Reduced motion: no pinning or scaling; the hero and About are laid out as two plain blocks,
    with the still portrait in the About panel.
*/
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const range = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const NARROW = "(max-width: 760px)";
// where her face sits on the full-screen hero (x, y as fractions of the screen)
const FOCUS = { wide: [0.6, 0.4], narrow: [0.56, 0.42] };

export default function Hero() {
  const stage = useRef(null);
  const pin = useRef(null);
  const frame = useRef(null);
  const move = useRef(null);
  const slot = useRef(null);
  const heroLayer = useRef(null);
  const aboutLayer = useRef(null);
  const [narrow, setNarrow] = useState(() => matchMedia(NARROW).matches);
  const [still] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const m = matchMedia(NARROW);
    const on = () => setNarrow(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (still) return;
    let g = null, raf = 0, hidden = null;
    // geometry of the end state: where the panel sits inside the pinned screen
    const measure = () => {
      const P = pin.current.getBoundingClientRect(), S = slot.current.getBoundingClientRect();
      const t = S.top - P.top, l = S.left - P.left;
      g = {
        t, l, r: P.width - l - S.width, b: P.height - t - S.height,
        k: Math.max(S.width / P.width, S.height / P.height) * (narrow ? 1.08 : 1.2),
        D: Math.max(1, stage.current.offsetHeight - P.height),
      };
      // her face (FOCUS, as a fraction of the screen at the start) lands in the middle of the panel
      const [fx, fy] = narrow ? FOCUS.narrow : FOCUS.wide;
      g.dx = l + S.width / 2 - P.width / 2 - (fx - 0.5) * P.width * g.k;
      g.dy = t + S.height / 2 - P.height / 2 - (fy - 0.5) * P.height * g.k;
    };
    const update = () => {
      raf = 0;
      if (!g) measure();
      const p = clamp01(-stage.current.getBoundingClientRect().top / g.D);
      const e = ease(range(p, 0.06, 0.8));                 // the portrait's transformation
      frame.current.style.clipPath = `inset(${g.t * e}px ${g.r * e}px ${g.b * e}px ${g.l * e}px round ${2 * e}px)`;
      move.current.style.transform = `translate3d(${g.dx * e}px, ${g.dy * e}px, 0) scale(${1 + (g.k - 1) * e})`;
      stage.current.style.setProperty("--e", e.toFixed(4));
      const h = 1 - range(p, 0, 0.3);                     // hero type leaves first
      heroLayer.current.style.opacity = h.toFixed(3);
      heroLayer.current.style.transform = `translate3d(0, ${(-40 * (1 - h)).toFixed(1)}px, 0)`;
      const off = h === 0;
      if (off !== hidden) { hidden = off; heroLayer.current.style.visibility = off ? "hidden" : ""; }   // its links leave the tab order
      const a = ease(range(p, 0.5, 0.92));                 // then About arrives beside the panel
      aboutLayer.current.style.opacity = a.toFixed(3);
      aboutLayer.current.style.setProperty("--a", a.toFixed(3));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => { g = null; onScroll(); };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(slot.current);
    ro.observe(stage.current);
    document.fonts?.ready?.then(onResize);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [narrow, still]);

  return (
    <>
      <section className={`stage ${still ? "is-still" : ""}`} id="top" ref={stage} aria-labelledby="hero-title">
        <div className="stage__pin" ref={pin}>
          {heroMedia.layout === "editorial" && <HeroMedia frameRef={frame} moveRef={move} />}

          <div className="hero hero--editorial" ref={heroLayer}>
            <div className="hero__stack">
              <h1 id="hero-title" className="hero__word">
                <TraceImprint text="trace" /><span className="visually-hidden">, the portfolio of {owner.name}</span>
              </h1>
              <div className="hero__intro">
                <p className="hero__headline">{owner.headline}</p>
                <p className="hero__subline">{owner.subline}</p>
              </div>
              <ul className="hero__links">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
                  </li>
                ))}
                <li><EmailLink /></li>
              </ul>
            </div>
          </div>

          <section className="stage__about" ref={aboutLayer} aria-labelledby="about-title">
            <div className="stage__text">
              <p className="trail__hop mono">01 · about</p>
              <h2 className="stage__h" id="about-title">about</h2>
              <AboutText to={narrow ? 1 : undefined} />
            </div>
            <div className="stage__slot" ref={slot} aria-hidden="true">
              {still && <img src={heroMedia.poster || heroMedia.image} alt="" decoding="async" />}
            </div>
          </section>
        </div>
        {/* menu links and "skip to content" land here, with About fully in place */}
        <span className="stage__anchor" id="about" aria-hidden="true" />
      </section>

      <div className="about-more">
        {narrow && <AboutText from={1} />}
        <Roadmap />
      </div>
    </>
  );
}
