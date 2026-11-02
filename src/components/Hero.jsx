import { useRef } from "react";
import { owner } from "../data/site.js";
import Wall from "./Wall.jsx";
import TracePoster from "./TracePoster.jsx";
import ArtifactSlot from "./ArtifactSlot.jsx";
import ThreatHunt from "./hunt/ThreatHunt.jsx";
import MusicPlayer from "./music/MusicPlayer.jsx";
import "./Hero.css";

// Where the photographic artifacts will sit around the poster.
// Each slot is a labelled placeholder until Amma supplies the photo.
const slots = [
  { id: "a1", label: "Access card", className: "slot--a1" },
  { id: "a2", label: "USB drive", className: "slot--a2" },
  { id: "a3", label: "Ethernet cable", className: "slot--a3" },
  { id: "a4", label: "Network diagram print", className: "slot--a4" },
];

export default function Hero() {
  const heroRef = useRef(null);
  const footRef = useRef(null);

  return (
    <section className="hero" id="top" ref={heroRef} aria-labelledby="hero-title">
      <Wall />

      <div className="hero__stage">
        <h1 id="hero-title" className="visually-hidden">TRACE, the portfolio of {owner.name}</h1>
        <TracePoster />
        {slots.map((s, i) => (
          <ArtifactSlot key={s.id} index={i + 1} label={s.label} className={s.className} />
        ))}
      </div>

      <ThreatHunt surfaceRef={heroRef} footRef={footRef} />

      <div className="hero__foot" ref={footRef}>
        <div className="hero__intro">
          <p className="mono hero__kicker">© 2026 {owner.brand} — {owner.focus}</p>
          <p className="hero__lede">{owner.tagline}</p>
        </div>

        <MusicPlayer />

        <a className="hero__scroll mono" href="#about">
          <span>Scroll to explore</span>
          <span className="hero__scroll-line" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
