import { useState } from "react";
import { about, roadmap } from "../../data/content.js";
import "./sections.css";

// 01 · About: the introduction. (The roadmap below is off the page for now; to bring it back,
// render <Roadmap /> after the text.)
export default function About() {
  return (
    <div className="about">
      <AboutText />
    </div>
  );
}

export function AboutText({ from = 0, to }) {
  return (
    <div className={`about__text ${from ? "about__text--rest" : ""}`}>
      {about.slice(from, to).map((p, i) => <p key={i}>{p}</p>)}
    </div>
  );
}

// the career roadmap (not shown at the moment)
export function Roadmap() {
  // the phase Amma is in starts open; the rest start closed
  const [open, setOpen] = useState(() => new Set(roadmap.filter((r) => r.now).map((r) => r.phase)));
  const toggle = (phase) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });

  return (
      <div className="road" aria-label="Career roadmap">
        <p className="road__label mono">roadmap · tap a step to open it</p>
        <ol className="road__list">
          {roadmap.map((r, i) => {
            const isOpen = open.has(r.phase);
            const panelId = `road-panel-${i}`;
            return (
              <li key={r.phase} className={`road__step ${r.now ? "is-now" : ""} ${isOpen ? "is-open" : ""}`}>
                <span className="road__dot" aria-hidden="true" />
                <button
                  type="button"
                  className="road__toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(r.phase)}
                >
                  <span className="road__head">
                    <span className="mono road__no">{String(i + 1).padStart(2, "0")}</span>
                    <span className="road__when mono">{r.now ? "you are here" : r.when}</span>
                  </span>
                  <span className="road__phase">{r.phase}</span>
                  <span className="road__icon" aria-hidden="true" />
                </button>
                <div className="road__panel" id={panelId} role="region" aria-label={r.phase}>
                  <div className="road__panel-inner">
                    <p className="road__goal">{r.goal}</p>
                    <ul className="road__items">
                      {r.items.map((it) => <li key={it}>{it}</li>)}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
  );
}
