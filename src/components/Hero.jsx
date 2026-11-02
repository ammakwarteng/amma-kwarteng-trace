import { useRef } from "react";
import { owner, communities, links } from "../data/site.js";
import ArtifactSlot from "./ArtifactSlot.jsx";
import ThreatHunt from "./hunt/ThreatHunt.jsx";
import MusicPlayer from "./music/MusicPlayer.jsx";
import StudyBuddy from "./buddy/StudyBuddy.jsx";
import EmailLink from "./EmailLink.jsx";
import "./Hero.css";

// Photographic artifacts that float around the word. Empty for now: add
// Amma's own photos here later, e.g.
// { id: "a1", label: "Handwritten password123 sticky note", className: "art--a1",
//   src: "artifacts/sticky-note.webp", width: 600, height: 600 },
// Images go in public/artifacts. Positions are in ArtifactSlot.css (art--a1 to art--a4).
const artifacts = [];

export default function Hero() {
  const heroRef = useRef(null);

  return (
    <section className="hero" id="top" ref={heroRef} aria-labelledby="hero-title">
      {artifacts.map((a, i) => (
        <ArtifactSlot key={a.id} index={i + 1} {...a} />
      ))}

      <h1 id="hero-title" className="hero__word">
        trace<span className="visually-hidden">, the portfolio of {owner.name}</span>
      </h1>

      <div className="hero__player">
        <MusicPlayer />
      </div>

      <div className="hero__intro">
        <p className="hero__headline">{owner.headline}</p>
        <p className="hero__subline">{owner.subline}</p>
        <ul className="hero__communities">
          {communities.map((c) => (
            <li key={c.short}>
              <span className="hero__badge">{c.role.toLowerCase()}</span>
              <a href={c.url} target="_blank" rel="noopener noreferrer">{c.name.toLowerCase()} ({c.short.toLowerCase()})</a>
            </li>
          ))}
        </ul>
        <ul className="hero__links">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</a>
            </li>
          ))}
          <li><EmailLink /></li>
        </ul>
      </div>

      <ThreatHunt surfaceRef={heroRef} />
      <StudyBuddy />

      <a className="hero__scroll" href="#about" aria-label="Scroll to the portfolio">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
