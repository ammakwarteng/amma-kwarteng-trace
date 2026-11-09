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
  The full-screen portrait is pinned for a short distance. The first small scroll down plays the
  transformation on its own: the frame is clipped down to the image panel of the About section
  (.stage__slot) and the portrait inside it is re-framed to stay centred on her, while the hero
  type recedes and the About heading and introduction fade in beside the panel. Scrolling back
  to the top plays it in reverse. The page keeps scrolling normally: no scroll lock, no snapping.
  - One video element throughout; only clip-path, transform and opacity change.
  - Phones: their own composition: a narrower panel with the section label beside it like a
    caption, the heading and lead line under it; the rest of the introduction follows below.
  - Reduced motion: no pinning or scaling; the hero and About are laid out as two plain blocks,
    with the still portrait in the About panel.
*/
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const range = (p, a, b) => clamp01((p - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const NARROW = "(max-width: 760px)";
const DURATION = 1400;   // ms for the portrait to glide from the hero into About
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
    // The transformation plays by itself: the first small scroll down starts it, and it glides to
    // the About layout over DURATION ms; scrolling back to the top plays it in reverse. It never
    // holds the page: scrolling stays native the whole time, and a change of direction mid-way
    // simply turns the movement around.
    let q = null, want = 0, last = 0;
    const render = (p) => {
      const e = ease(range(p, 0, 0.86));                   // the portrait: one element, clipped and re-framed
      frame.current.style.clipPath = `inset(${(g.t * e).toFixed(2)}px ${(g.r * e).toFixed(2)}px ${(g.b * e).toFixed(2)}px ${(g.l * e).toFixed(2)}px round ${(2 * e).toFixed(2)}px)`;
      move.current.style.transform = `translate3d(${(g.dx * e).toFixed(2)}px, ${(g.dy * e).toFixed(2)}px, 0) scale(${(1 + (g.k - 1) * e).toFixed(4)})`;
      stage.current.style.setProperty("--e", e.toFixed(4));
      const h = 1 - ease(range(p, 0, 0.38));               // hero type recedes as scrolling begins
      heroLayer.current.style.opacity = h.toFixed(3);
      heroLayer.current.style.transform = `translate3d(0, ${(-36 * (1 - h)).toFixed(1)}px, 0) scale(${(1 - 0.04 * (1 - h)).toFixed(4)})`;
      const off = h < 0.01;
      if (off !== hidden) { hidden = off; heroLayer.current.style.visibility = off ? "hidden" : ""; }   // its links leave the tab order
      const a = ease(range(p, 0.42, 0.96));                // About arrives while the portrait settles
      aboutLayer.current.style.opacity = a.toFixed(3);
      aboutLayer.current.style.setProperty("--a", a.toFixed(3));
    };
    const update = (now) => {
      raf = 0;
      if (!g) measure();
      const y = -stage.current.getBoundingClientRect().top;
      const on = Math.min(40, g.D * 0.1);                  // a small scroll down plays it
      if (y > on) want = 1; else if (y < on / 2) want = 0; // back near the top reverses it
      if (q === null) { q = want; last = 0; render(q); return; }   // first paint (also a reload mid-page): no replay
      const dt = last ? Math.min(64, now - last) : 16.7;
      last = now;
      const step = dt / DURATION;
      q = want > q ? Math.min(want, q + step) : Math.max(want, q - step);
      render(q);
      if (q !== want) raf = requestAnimationFrame(update); else last = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    const onResize = () => { g = null; onScroll(); };
    onScroll();
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
            <p className="stage__label trail__hop mono">01 · about</p>
            <div className="stage__text">
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
