import { useEffect, useState } from "react";
import "./Loader.css";

/*
  Intro screen: a white shape morphs (triangle, square, diamond, circle),
  then becomes the reticle mark, and the screen lifts away to the site.
  Tap or press any key to skip. Reduced motion: a quick fade.
*/
const HOLD = 2300; // ms before the screen lifts
const LIFT = 700;

export default function Loader() {
  const [phase, setPhase] = useState("show"); // show -> lift -> gone

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("is-loading");
    const t = setTimeout(() => setPhase("lift"), reduce ? 400 : HOLD);
    const skip = () => setPhase((p) => (p === "show" ? "lift" : p));
    window.addEventListener("keydown", skip);
    return () => { clearTimeout(t); window.removeEventListener("keydown", skip); };
  }, []);

  useEffect(() => {
    if (phase !== "lift") return;
    document.documentElement.classList.remove("is-loading");
    const t = setTimeout(() => setPhase("gone"), LIFT);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className={`loader ${phase === "lift" ? "is-lifting" : ""}`} onClick={() => setPhase("lift")} aria-hidden="true">
      <div className="loader__stage">
        <span className="loader__shape" />
        <svg className="loader__mark" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="9" />
          <path d="M16 3v7M16 22v7M3 16h7M22 16h7" />
          <path d="M4 9V4h5M23 4h5v5M28 23v5h-5M9 28H4v-5" />
        </svg>
      </div>
      <span className="loader__word">trace</span>
    </div>
  );
}
