import { certifications } from "../../data/content.js";
import "./sections.css";

const LABEL = { studying: "currently studying", next: "next goal", planned: "planned", earned: "earned" };

export default function Certifications() {
  return (
    <ul className="certs">
      {certifications.map((c) => (
        <li key={c.name} className={`certs__row is-${c.status}`}>
          <span className="certs__name">{c.name}</span>
          <span className="certs__issuer mono">{c.issuer}</span>
          <span className="certs__status mono">{LABEL[c.status]}</span>
        </li>
      ))}
    </ul>
  );
}
