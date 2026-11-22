import { skills } from "../../data/content.js";
import "./sections.css";

// Skills grouped by area: the group name, then its skills as one plain line (no bubbles).
export default function Skills() {
  return (
    <div className="skills">
      {skills.map((s, n) => (
        <section key={s.group} className="skills__group" aria-label={s.group}>
          <h3 className="skills__name">{s.group}</h3>
          <ul className="skills__items mono">
            {s.items.map((i) => <li key={i}>{i}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}
