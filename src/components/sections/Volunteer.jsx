import { volunteering } from "../../data/site.js";
import "./sections.css";

// Volunteer roles, laid out like the community rows: the organization, the role (and its status),
// and what the work is.
export default function Volunteer() {
  return (
    <div className="community">
      {volunteering.map((v) => (
        <section key={v.org + v.role} className="community__row" aria-label={v.org}>
          <div className="community__head">
            <h3 className="community__name">
              {v.url ? <a href={v.url} target="_blank" rel="noopener noreferrer">{v.org}</a> : v.org}
            </h3>
            <p className="community__note mono">{[v.role, v.status].filter(Boolean).join(" · ")}</p>
          </div>
          <p className="community__about">{v.what}</p>
        </section>
      ))}
    </div>
  );
}
