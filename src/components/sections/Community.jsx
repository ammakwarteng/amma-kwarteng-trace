import { communities } from "../../data/site.js";
import "./sections.css";

// Professional communities: one row each, with the role and what the group does.
export default function Community() {
  return (
    <div className="community">
      {communities.map((c, n) => (
        <section key={c.name} className="community__row" aria-label={c.name}>
          <div className="community__head">
            <span className="community__badge idl"><b>MBR-{String(n + 1).padStart(2, "0")}</b> · <span className="st">{c.role.toLowerCase()}</span></span>
            <h3 className="community__name">
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                {c.name.toLowerCase()}{c.short ? ` (${c.short.toLowerCase()})` : ""}
              </a>
            </h3>
            {c.note && <p className="community__note mono">{c.note}</p>}
          </div>
          <p className="community__about">{c.about}</p>
        </section>
      ))}
    </div>
  );
}
