import { useRef } from "react";
import { owner, communities } from "../data/site.js";
import ArtifactSlot from "./ArtifactSlot.jsx";
import ThreatHunt from "./hunt/ThreatHunt.jsx";
import MusicPlayer from "./music/MusicPlayer.jsx";
import "./Hero.css";

// Photographic artifacts float around the word. Each is a labelled
// placeholder until Amma supplies the photo.
const artifacts = [
  { id: "a1", label: "access card", className: "art--a1" },
  { id: "a2", label: "laptop detail", className: "art--a2" },
  { id: "a3", label: "cable tangle", className: "art--a3" },
  { id: "a4", label: "usb drive", className: "art--a4" },
];

export default function Hero() {
  const heroRef = useRef(null);

  return (
    <section className="hero" id="top" ref={heroRef} aria-labelledby="hero-title">
      {artifacts.map((a, i) => (
        <ArtifactSlot key={a.id} index={i + 1} label={a.label} className={a.className} />
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
      </div>

      <ThreatHunt surfaceRef={heroRef} />

      <a className="hero__scroll" href="#about" aria-label="Scroll to the portfolio">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
