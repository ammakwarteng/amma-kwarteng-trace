import { skills } from "../../data/content.js";
import "./sections.css";

// 04 · Skills as a typographic index: one row per category, the skills set inline,
// and the proof for them as a footnote.
export default function Skills() {
  return (
    <dl className="sk">
      {skills.map((s, n) => (
        <div key={s.group} className="sk__row">
          <dt className="sk__group">
            <span className="sk__no mono">SKL-{String(n + 1).padStart(2, "0")}</span>
            <span className="sk__name">{s.group}</span>
          </dt>
          <dd className="sk__items">
            <ul>
              {s.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <p className="sk__proof mono">proof · {s.proof}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
