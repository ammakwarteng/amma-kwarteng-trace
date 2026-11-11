import { owner, links } from "../../data/site.js";
import EmailLink from "../EmailLink.jsx";
import Fingerprint from "./Fingerprint.jsx";
import LockWord from "./LockWord.jsx";
import "../Hero.css";
import "./daylight.css";

// Daylight hero: the TRACE wordmark with the crosshair locked on its A, a framed generated
// fingerprint being scanned, and the intro line with links.
export default function HeroDaylight() {
  return (
    <section className="dhero" id="top" aria-labelledby="hero-title">
      <h1 id="hero-title" className="dhero__word">
        <LockWord text="trace" at={2} /><span className="visually-hidden">, the portfolio of {owner.name}</span>
      </h1>
      <figure className="dhero__frame">
        <Fingerprint />
        <figcaption className="mono"><span>fig. 00 · trace</span><span>generated · belongs to no one</span></figcaption>
      </figure>
      <p className="dhero__lede mono">{owner.headline} {owner.subline}</p>
      <ul className="dhero__links mono">
        {links.map((l) => <li key={l.label}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a></li>)}
        <li><EmailLink /></li>
      </ul>
      <a className="hero__scroll" href="#about" aria-label="Scroll to the portfolio"><span aria-hidden="true" /></a>
    </section>
  );
}
