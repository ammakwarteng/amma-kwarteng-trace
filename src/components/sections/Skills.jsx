import { skills } from "../../data/content.js";
import "./sections.css";

// Skills grouped by area, each with where it was used.
export default function Skills() {
  return (
    <div className="skills">
      {skills.map((s) => (
        <section key={s.group} className="skills__group" aria-label={s.group}>
          <div className="skills__head">
            <h3 className="skills__name">{s.group}</h3>
            <p className="skills__proof mono">proof · {s.proof}</p>
          </div>
          <ul className="skills__items">
            {s.items.map((i) => <li key={i} className="mono">{i}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
