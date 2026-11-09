import { volunteering } from "../../data/site.js";
import "./sections.css";

// Volunteer roles: same layout as community. Hidden until "volunteer" is set ready in site.js.
export default function Volunteer() {
  return (
    <div className="community">
      {volunteering.map((v, n) => (
        <section key={v.org + v.role} className="community__row" aria-label={v.org}>
          <div className="community__head">
            <span className="community__badge idl"><b>VOL-{String(n + 1).padStart(2, "0")}</b> · <span className="st">{v.role.toLowerCase()}</span></span>
            <h3 className="community__name">
              {v.url ? <a href={v.url} target="_blank" rel="noopener noreferrer">{v.org.toLowerCase()}</a> : v.org.toLowerCase()}
            </h3>
            {v.when && <p className="community__note mono">{v.when}</p>}
          </div>
          <p className="community__about">{v.what}</p>
        </section>
      ))}
    </div>
  );
}
