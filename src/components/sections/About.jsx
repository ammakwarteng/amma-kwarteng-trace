import { about, roadmap } from "../../data/content.js";
import "./sections.css";

export default function About() {
  return (
    <div className="about">
      <div className="about__text">
        {about.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="road" aria-label="Career roadmap">
        <p className="road__label mono">roadmap</p>
        <ol className="road__list">
          {roadmap.map((r, i) => (
            <li key={r.phase} className={`road__step ${r.now ? "is-now" : ""}`}>
              <span className="road__dot" aria-hidden="true" />
              <div className="road__head">
                <span className="mono road__no">{String(i + 1).padStart(2, "0")}</span>
                <span className="road__when mono">{r.now ? "you are here" : r.when}</span>
              </div>
              <h3 className="road__phase">{r.phase}</h3>
              <p className="road__goal">{r.goal}</p>
              <ul className="road__items">
                {r.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
