import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { owner, links, heroMedia } from "../data/site.js";
import HeroMedia from "./HeroMedia.jsx";
import ArtifactSlot from "./ArtifactSlot.jsx";
import TraceImprint from "./TraceImprint.jsx";
import DoodlePad from "./doodle/DoodlePad.jsx";
import EmailLink from "./EmailLink.jsx";
import { track } from "../track.js";
import { leaveTrace } from "../trace.js";
import "./Hero.css";
import "./HeroEditorial.css";

// Photographic artifacts that float around the word. Empty for now: add
// Amma's own photos here later, e.g.
// { id: "a1", label: "Handwritten password123 sticky note", className: "art--a1",
//   src: "artifacts/sticky-note.webp", width: 600, height: 600 },
// Images go in public/artifacts. Positions are in ArtifactSlot.css (art--a1 to art--a4).
const artifacts = [];

const PIN_KEY = "trace-pinned-doodle";

export default function Hero() {
  const heroRef = useRef(null);
  // A visitor's pinned doodle floats on the page and is remembered on their device.
  const [pinned, setPinned] = useState(null);
  // The pad stays folded into a small button so it stays out of the way.
  // "closing" plays the slide back up before the sheet unmounts.
  const [padOpen, setPadOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const closePad = () => {
    setClosing(true);
    setTimeout(() => { setPadOpen(false); setClosing(false); }, 380);
  };
  useEffect(() => {
    if (!padOpen) return;
    const onKey = (e) => { if (e.key === "Escape") closePad(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [padOpen]);
  useEffect(() => {
    try { setPinned(localStorage.getItem(PIN_KEY)); } catch { /* storage blocked */ }
  }, []);
  const pin = (src) => {
    setPinned(src);
    try { localStorage.setItem(PIN_KEY, src); } catch { /* storage blocked */ }
    track("leave-your-trace-pinned", "Leave your trace: doodle pinned");
    leaveTrace("trace.pinned", "visitor doodle pinned to the page", "recorded");
    setTimeout(closePad, 700); // slide away so the sticker shows
  };
  const unpin = () => {
    setPinned(null);
    try { localStorage.removeItem(PIN_KEY); } catch { /* storage blocked */ }
  };

  return (
    <section className={`hero ${heroMedia.layout === "editorial" ? "hero--editorial" : ""}`} id="top" ref={heroRef} aria-labelledby="hero-title">
      {heroMedia.layout === "editorial" && <HeroMedia />}
      {artifacts.map((a, i) => (
        <ArtifactSlot key={a.id} index={i + 1} {...a} />
      ))}


      {pinned && (
        <figure className="pinned">
          <img src={pinned} alt="Your pinned doodle" />
          <figcaption className="pinned__label">your trace</figcaption>
          <button type="button" className="pinned__remove" onClick={unpin} aria-label="Remove your pinned doodle">×</button>
        </figure>
      )}


      <div className="hero__stack">
      <h1 id="hero-title" className="hero__word">
        <TraceImprint text="trace" /><span className="visually-hidden">, the portfolio of {owner.name}</span>
      </h1>
      <div className="hero__intro">
        <p className="hero__headline">{owner.headline}</p>
        <p className="hero__subline">{owner.subline}</p>
      </div>
      <div className="hero__player" onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" className="hero__pen" onClick={() => { setPadOpen(true); track("leave-your-trace-opened", "Leave your trace: pad opened"); }} aria-expanded={padOpen} aria-haspopup="dialog">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16l1-4 8.5-8.5a2.1 2.1 0 0 1 3 3L8 15l-4 1zM12 5l3 3" /></svg>
          leave your trace
        </button>
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

      {padOpen && createPortal(
        // The pad drops in from the top of the screen like a sheet.
        <div className={`sheet ${closing ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-label="Leave your trace">
          <div className="sheet__backdrop" onClick={closePad} />
          <div className="sheet__card">
            <DoodlePad onPin={pin} onClose={closePad} />
          </div>
        </div>,
        document.body
      )}


      <a className="hero__scroll" href="#about" aria-label="Scroll to the portfolio">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
