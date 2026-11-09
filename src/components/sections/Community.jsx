import { communities } from "../../data/site.js";
import "./sections.css";

// A curated directory: numbered entries with the name, abbreviation, role and what the group does.
// Also used for volunteer roles (see Volunteer.jsx).
export function Directory({ items, prefix = "MBR", label = "Professional communities" }) {
  return (
    <ol className="dir" aria-label={label}>
      {items.map((c, n) => (
        <li key={c.name} className="dir__entry">
          <p className="dir__meta mono">
            <span>{prefix}-{String(n + 1).padStart(2, "0")}</span>
            {c.short && <span>{c.short}</span>}
            <span>{c.role.toLowerCase()}</span>
            {c.when && <span>{c.when}</span>}
          </p>
          <h3 className="dir__name">
            {c.url ? (
              <a href={c.url} target="_blank" rel="noopener noreferrer">
                {c.name.toLowerCase()}<span className="dir__arrow" aria-hidden="true">↗</span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : c.name.toLowerCase()}
          </h3>
          <p className="dir__about">{c.about}</p>
        </li>
      ))}
    </ol>
  );
}

export default function Community() {
  return <Directory items={communities} />;
}
