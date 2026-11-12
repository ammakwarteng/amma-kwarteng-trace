import { useState } from "react";
import { about, roadmap } from "../../data/content.js";
import "./sections.css";
import { usePointerVerb } from "../../pointer.js";

// the About introduction (all paragraphs, or a range of them): shown beside the portrait at the
// end of the hero transformation (see Hero.jsx)
// The magazine About: the first sentence of the second paragraph as a pull quote, then the
// introduction. Nothing is dropped: the quoted sentence is not repeated, the rest follows.
const [quoteLine, ...restLines] = (about[1] || "").split(/(?<=\.)\s+/);
export function AboutQuote() {
  return <blockquote className="about__quote">“{quoteLine.replace(/\.$/, "")}.”</blockquote>;
}
export function AboutBody() {
  return (
    <div className="about__text">
      <p>{about[0]}</p>
      {restLines.length > 0 && <p>{restLines.join(" ")}</p>}
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

// the career roadmap, which continues the About section below the hero stage
// Certifications in a roadmap step stand out from the topics beside them (a filled tag).
const CERT = /ITIL|Security\+|SC-\d|Okta Certified|CyberArk|CISSP/;

export function Roadmap() {
  const { verb, fine } = usePointerVerb();
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
        <p className="road__label mono">roadmap · {verb} a step to open it</p>
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
                      {r.items.map((it) => <li key={it} className={CERT.test(it) ? "is-cert" : undefined}>{it}</li>)}
                    </ul>
                    <a className="road__more mono" href={`/roadmap/${r.phase.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>open the full {r.phase} roadmap →</a>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
  );
}
