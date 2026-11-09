import { useRef } from "react";
import { owner, links, heroMedia } from "../data/site.js";
import HeroMedia from "./HeroMedia.jsx";
import ArtifactSlot from "./ArtifactSlot.jsx";
import TraceImprint from "./TraceImprint.jsx";
import EmailLink from "./EmailLink.jsx";
import "./Hero.css";
import "./HeroEditorial.css";

// Photographic artifacts that float around the word. Empty for now: add
// Amma's own photos here later, e.g.
// { id: "a1", label: "Handwritten password123 sticky note", className: "art--a1",
//   src: "artifacts/sticky-note.webp", width: 600, height: 600 },
// Images go in public/artifacts. Positions are in ArtifactSlot.css (art--a1 to art--a4).
const artifacts = [];


export default function Hero() {
  const heroRef = useRef(null);

  return (
    <section className={`hero ${heroMedia.layout === "editorial" ? "hero--editorial" : ""}`} id="top" ref={heroRef} aria-labelledby="hero-title">
      {heroMedia.layout === "editorial" && <HeroMedia />}
      {artifacts.map((a, i) => (
        <ArtifactSlot key={a.id} index={i + 1} {...a} />
      ))}




      <div className="hero__stack">
      <h1 id="hero-title" className="hero__word">
        <TraceImprint text="trace" /><span className="visually-hidden">, the portfolio of {owner.name}</span>
      </h1>
      <div className="hero__intro">
        <p className="hero__headline">{owner.headline}</p>
        <p className="hero__subline">{owner.subline}</p>
      </div>
      <ul className="hero__links">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
            </li>
          ))}
          <li><EmailLink /></li>
      </ul>
      </div>



      <a className="hero__scroll" href="#about" aria-label="Scroll to the portfolio">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
