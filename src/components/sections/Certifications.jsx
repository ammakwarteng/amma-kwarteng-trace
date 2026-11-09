import { certifications } from "../../data/content.js";
import "./sections.css";

/*
  05 · Certifications as a credential register, grouped by standing.
  Shown publicly: earned certifications, the one being studied and the next goals.
  "planned" ones stay in content.js. Change a status to "earned" only once the exam is passed.
*/
const GROUPS = [
  { status: "earned", label: "earned", note: "verified credentials" },
  { status: "studying", label: "in progress", note: "currently studying" },
  { status: "next", label: "next", note: "next goals" },
];
const STATUS = { earned: "earned", studying: "in progress", next: "next goal" };

export default function Certifications() {
  return (
    <div className="cr">
      {GROUPS.map((g) => {
        const list = certifications.filter((c) => c.status === g.status);
        if (!list.length) return null;
        return (
          <section key={g.status} className={`cr__group is-${g.status}`} aria-labelledby={`cr-${g.status}`}>
            <h3 className="cr__label mono" id={`cr-${g.status}`}>
              <span>{g.label}</span>
              <span className="cr__count">{String(list.length).padStart(2, "0")}</span>
            </h3>
            <ul className="cr__list">
              {list.map((c) => (
                <li key={c.name} className={`cr__row is-${c.status} ${c.status === "earned" ? "tf tf--sm" : ""}`}>
                  <span className="cr__code">{c.code}</span>
                  <span className="cr__name">{c.name}<span className="cr__issuer mono">{c.issuer}</span></span>
                  <span className="cr__status mono"><i aria-hidden="true" />{STATUS[c.status]}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
