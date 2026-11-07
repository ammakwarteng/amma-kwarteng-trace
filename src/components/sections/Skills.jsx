import { skills } from "../../data/content.js";
import "./sections.css";

// Skills grouped by area, each with where it was used.
export default function Skills() {
  return (
    <div className="skills">
      {skills.map((s, n) => (
        <section key={s.group} className="skills__group" aria-label={s.group}>
          <div className="skills__head">
            <span className="idl"><b>SKL-{String(n + 1).padStart(2, "0")}</b> · <span className="st">proven</span></span>
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
