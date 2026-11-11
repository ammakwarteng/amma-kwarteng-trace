import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { owner, links } from "../../data/site.js";
import DoodlePad from "../doodle/DoodlePad.jsx";
import { track } from "../../track.js";
import { leaveTrace } from "../../trace.js";
import EmailLink from "../EmailLink.jsx";
import LockWord from "./LockWord.jsx";
import "../Hero.css";
import "./daylight.css";

// Daylight hero: the TRACE wordmark with the crosshair locked on its A, a framed generated
// fingerprint being scanned, and the intro line with links.
const PIN_KEY = "trace-pinned-doodle";
// Leave your trace is off for now (Amma's call); set to true to bring it back as it was.
const LEAVE_TRACE = false;

export default function HeroDaylight({ onReplay }) {
  // Leave your trace: a visitor's pinned doodle floats on the page and is remembered on their device.
  const [pinned, setPinned] = useState(null);
  // The pad stays folded into a small button; "closing" plays the slide back up before the sheet unmounts.
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
    <section className="dhero" id="top" aria-labelledby="hero-title">
      <h1 id="hero-title" className="dhero__word">
        <LockWord text="trace" at={2} /><span className="visually-hidden">, the portfolio of {owner.name}</span>
      </h1>
      {LEAVE_TRACE && pinned && (
        <figure className="pinned">
          <img src={pinned} alt="Your pinned doodle" />
          <figcaption className="pinned__label">your trace</figcaption>
          <button type="button" className="pinned__remove" onClick={unpin} aria-label="Remove your pinned doodle">×</button>
        </figure>
      )}

      {LEAVE_TRACE && <div className="hero__player" onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" className="hero__pen" onClick={() => { setPadOpen(true); track("leave-your-trace-opened", "Leave your trace: pad opened"); }} aria-expanded={padOpen} aria-haspopup="dialog">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 16l1-4 8.5-8.5a2.1 2.1 0 0 1 3 3L8 15l-4 1zM12 5l3 3" /></svg>
          leave your trace
        </button>
      </div>}

      {LEAVE_TRACE && padOpen && createPortal(
        // The pad drops in from the top of the screen like a sheet.
        <div className={`sheet ${closing ? "is-closing" : ""}`} role="dialog" aria-modal="true" aria-label="Leave your trace">
          <div className="sheet__backdrop" onClick={closePad} />
          <div className="sheet__card">
            <DoodlePad onPin={pin} onClose={closePad} />
          </div>
        </div>,
        document.body
      )}

      <p className="dhero__lede mono">{owner.headline} {owner.subline}</p>
      <ul className="dhero__links mono">
        {links.map((l) => <li key={l.label}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}
        <li><EmailLink /></li>
      </ul>
      {onReplay && <button type="button" className="dhero__replay mono" onClick={onReplay}>replay intro</button>}
      <a className="hero__scroll" href="#about" aria-label="Scroll to the portfolio"><span aria-hidden="true" /></a>
    </section>
  );
}
